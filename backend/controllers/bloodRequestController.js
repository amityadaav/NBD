// controllers/bloodRequestController.js
const mongoose = require("mongoose");
const BloodRequest = require("../models/BloodRequest");
const Donor = require("../models/Donor");

/* ---------- Helpers ---------- */
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const URGENCIES = ["normal", "urgent", "critical"];
const STATUSES = ["open", "fulfilled", "cancelled", "expired"];

const clampInt = (value, fallback, min, max) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(Math.trunc(n), min), max);
};

/* ------------------------------------------------------------------ */
/*  POST /api/blood-requests                                           */
/* ------------------------------------------------------------------ */
exports.createRequest = async (req, res) => {
  try {
    const {
      patientName, bloodGroup, unitsNeeded, urgency = "urgent",
      hospital, contactName, contactPhone, neededBy, notes = "",
    } = req.body;

    if (
      !patientName || !bloodGroup || !unitsNeeded ||
      !hospital?.name || !hospital?.city ||
      !contactPhone || !neededBy
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!BLOOD_GROUPS.includes(bloodGroup)) {
      return res.status(400).json({ message: "Invalid blood group" });
    }

    if (!URGENCIES.includes(urgency)) {
      return res.status(400).json({ message: "Invalid urgency" });
    }

    const units = Number(unitsNeeded);
    if (!Number.isFinite(units) || units < 1) {
      return res.status(400).json({ message: "unitsNeeded must be a positive number" });
    }

    const neededByDate = new Date(neededBy);
    if (Number.isNaN(neededByDate.getTime())) {
      return res.status(400).json({ message: "Invalid neededBy date" });
    }

    const request = await BloodRequest.create({
      requester: req.user.id,
      patientName: String(patientName).trim(),
      bloodGroup,
      unitsNeeded: units,
      urgency,
      hospital: {
        name: String(hospital.name).trim(),
        city: String(hospital.city).trim(),
        area: hospital.area ? String(hospital.area).trim() : "",
        address: hospital.address ? String(hospital.address).trim() : "",
      },
      contactName: contactName ? String(contactName).trim() : "—",
      contactPhone: String(contactPhone).trim(),
      neededBy: neededByDate,
      notes: String(notes || "").trim(),
    });

    res.status(201).json({ message: "Blood request created", request });
  } catch (err) {
    console.error("createRequest:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/* ------------------------------------------------------------------ */
/*  GET /api/blood-requests                                            */
/* ------------------------------------------------------------------ */
exports.listRequests = async (req, res) => {
  try {
    const {
      status = "open",
      bloodGroup,
      city,
      urgency,
      page = 1,
      limit = 20,
    } = req.query;

    if (status && !STATUSES.includes(status)) {
      return res.status(400).json({ message: "Invalid status filter" });
    }
    if (bloodGroup && !BLOOD_GROUPS.includes(bloodGroup)) {
      return res.status(400).json({ message: "Invalid bloodGroup filter" });
    }
    if (urgency && !URGENCIES.includes(urgency)) {
      return res.status(400).json({ message: "Invalid urgency filter" });
    }

    const filter = {};
    if (status) filter.status = status;
    if (bloodGroup) filter.bloodGroup = bloodGroup;
    if (city && city !== "All cities") filter["hospital.city"] = city;
    if (urgency) filter.urgency = urgency;

    const pageNum = clampInt(page, 1, 1, 10_000);
    const limitNum = clampInt(limit, 20, 1, 100);
    const skip = (pageNum - 1) * limitNum;

    const [requests, total] = await Promise.all([
      BloodRequest.find(filter)
        .sort({ urgency: -1, neededBy: 1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      BloodRequest.countDocuments(filter),
    ]);

    res.json({ requests, total, page: pageNum, limit: limitNum });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/* ------------------------------------------------------------------ */
/*  GET /api/blood-requests/urgent                                     */
/* ------------------------------------------------------------------ */
exports.getUrgentRequests = async (req, res) => {
  try {
    const requests = await BloodRequest.find({
      status: "open",
      urgency: { $in: ["urgent", "critical"] },
      neededBy: { $gte: new Date() },
    })
      .sort({ urgency: -1, neededBy: 1 })
      .limit(10)
      .select("bloodGroup hospital.city unitsNeeded neededBy urgency")
      .lean();

    const results = requests.map((r) => ({
      id: r._id,
      group: r.bloodGroup,
      city: r.hospital?.city || "",
      need: `${r.unitsNeeded} unit${r.unitsNeeded > 1 ? "s" : ""}`,
      eta: r.neededBy,
      urgency: r.urgency,
    }));

    res.json({ results });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/* ------------------------------------------------------------------ */
/*  GET /api/blood-requests/:id                                        */
/* ------------------------------------------------------------------ */
exports.getRequestById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid request id" });
    }

    const request = await BloodRequest.findById(req.params.id)
      .populate("requester", "fullname email")
      .populate("respondedDonors.donor", "bloodGroup city area phone verified rating totalDonations");

    if (!request) return res.status(404).json({ message: "Request not found" });

    res.json({ request });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/* ------------------------------------------------------------------ */
/*  POST /api/blood-requests/:id/respond                               */
/* ------------------------------------------------------------------ */
exports.respondToRequest = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid request id" });
    }

    const donor = await Donor.findOne({ user: req.user.id });
    if (!donor) {
      return res.status(400).json({ message: "Register as a donor first" });
    }

    const request = await BloodRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });
    if (request.status !== "open") {
      return res.status(400).json({ message: "Request is no longer open" });
    }

    const allowedResponse = ["interested", "accepted", "declined"];
    const status = allowedResponse.includes(req.body?.status)
      ? req.body.status
      : "interested";

    const existing = request.respondedDonors.find(
      (r) => r.donor?.toString() === donor._id.toString()
    );

    if (existing) {
      // allow updating the existing response
      existing.status = status;
      existing.respondedAt = new Date();
    } else {
      request.respondedDonors.push({
        donor: donor._id,
        status,
        respondedAt: new Date(),
      });
    }

    await request.save();
    res.json({ message: "Response recorded", request });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/* ------------------------------------------------------------------ */
/*  PUT /api/blood-requests/:id/status                                 */
/* ------------------------------------------------------------------ */
exports.updateRequestStatus = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid request id" });
    }

    const { status } = req.body;
    if (!STATUSES.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const request = await BloodRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    const requesterId = request.requester?.toString();
    const isRequester = requesterId && requesterId === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isRequester && !isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    request.status = status;
    await request.save();
    res.json({ message: "Status updated", request });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/* ------------------------------------------------------------------ */
/*  GET /api/blood-requests/my                                         */
/* ------------------------------------------------------------------ */
exports.getMyRequests = async (req, res) => {
  try {
    const requests = await BloodRequest.find({ requester: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    const results = requests.map((r) => ({
      id: r._id,
      patientName: r.patientName,
      group: r.bloodGroup,
      unitsNeeded: r.unitsNeeded,
      urgency: r.urgency,
      hospital: r.hospital,
      contactName: r.contactName,
      contactPhone: r.contactPhone,
      neededBy: r.neededBy,
      notes: r.notes,
      status: r.status,
      respondedCount: Array.isArray(r.respondedDonors)
        ? r.respondedDonors.length
        : 0,
      createdAt: r.createdAt,
    }));

    res.json({ requests: results });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};