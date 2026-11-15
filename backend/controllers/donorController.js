// controllers/donorController.js
const mongoose = require("mongoose");
const Donor = require("../models/Donor");
const Donation = require("../models/Donation");

/* ---------- Helpers ---------- */
const isEligible = (lastDonated) => {
  if (!lastDonated) return true;
  return (Date.now() - new Date(lastDonated).getTime()) / 86_400_000 >= 90;
};

const normalizeLocation = (lng, lat) =>
  lng != null && lat != null
    ? { type: "Point", coordinates: [Number(lng), Number(lat)] }
    : undefined;

const isValidObjectId = (id) =>
  mongoose.Types.ObjectId.isValid(id);

/* ------------------------------------------------------------------ */
/*  POST /api/donors/register    (auth required)                       */
/* ------------------------------------------------------------------ */
exports.registerDonor = async (req, res) => {
  try {
    const existing = await Donor.findOne({ user: req.user.id });
    if (existing) {
      return res.status(400).json({ message: "Donor profile already exists" });
    }

    const {
      bloodGroup, phone, email, city, area,
      dateOfBirth, gender, weight,
      emergencyContact, lng, lat,
    } = req.body;

    if (!bloodGroup || !phone || !email || !city) {
      return res.status(400).json({
        message: "bloodGroup, phone, email and city are required",
      });
    }

    const donor = await Donor.create({
      user: req.user.id,
      bloodGroup, phone, email, city, area,
      dateOfBirth, gender, weight,
      emergencyContact,
      location: normalizeLocation(lng, lat),
    });

    res.status(201).json({ message: "Donor registered", donor });
  } catch (err) {
    console.error("registerDonor:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/* ------------------------------------------------------------------ */
/*  GET /api/donors/me/profile                                         */
/* ------------------------------------------------------------------ */
exports.getMyDonorProfile = async (req, res) => {
  try {
    const donor = await Donor.findOne({ user: req.user.id }).populate(
      "user",
      "fullname email"
    );
    if (!donor) return res.status(404).json({ message: "Donor profile not found" });
    res.json({ donor, isEligible: isEligible(donor.lastDonated) });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/* ------------------------------------------------------------------ */
/*  PUT /api/donors/me/profile                                         */
/* ------------------------------------------------------------------ */
exports.updateMyDonorProfile = async (req, res) => {
  try {
    const allowed = [
      "bloodGroup", "phone", "email", "city", "area",
      "dateOfBirth", "gender", "weight",
      "available", "emergencyContact", "medicalNotes",
    ];
    const update = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    }

    if (req.body.lng != null && req.body.lat != null) {
      update.location = normalizeLocation(req.body.lng, req.body.lat);
    }

    const donor = await Donor.findOneAndUpdate(
      { user: req.user.id },
      { $set: update },
      { new: true, runValidators: true }
    );
    if (!donor) return res.status(404).json({ message: "Donor profile not found" });

    res.json({ message: "Profile updated", donor });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/* ------------------------------------------------------------------ */
/*  PUT /api/donors/me/availability                                    */
/* ------------------------------------------------------------------ */
exports.toggleAvailability = async (req, res) => {
  try {
    const donor = await Donor.findOne({ user: req.user.id });
    if (!donor) return res.status(404).json({ message: "Donor profile not found" });

    donor.available = Boolean(req.body.available);
    await donor.save();
    res.json({ message: "Availability updated", available: donor.available });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/* ------------------------------------------------------------------ */
/*  GET /api/donors/search                                             */
/* ------------------------------------------------------------------ */
exports.searchDonors = async (req, res) => {
  try {
    const {
      bloodGroup, city, area, q,
      availableOnly = "true",
      page = 1,
      limit = 20,
      lng, lat, maxDistanceKm,
    } = req.query;

    const filter = {};
    if (bloodGroup) filter.bloodGroup = bloodGroup;
    if (city && city !== "All cities") filter.city = city;
    if (area) filter.area = new RegExp(area, "i");
    if (availableOnly === "true") filter.available = true;

    if (q) {
      filter.$or = [
        { city: new RegExp(q, "i") },
        { area: new RegExp(q, "i") },
        { phone: new RegExp(q, "i") },
      ];
    }

    if (lng != null && lat != null && maxDistanceKm) {
      filter.location = {
        $near: {
          $geometry: { type: "Point", coordinates: [Number(lng), Number(lat)] },
          $maxDistance: Number(maxDistanceKm) * 1000,
        },
      };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [donors, total] = await Promise.all([
      Donor.find(filter)
        .populate("user", "fullname")
        .skip(skip)
        .limit(Number(limit))
        .sort({ verified: -1, totalDonations: -1, createdAt: -1 })
        .lean(),
      Donor.countDocuments(filter),
    ]);

    const results = donors.map((d) => ({
      id: d._id,
      name: d.user?.fullname || "Donor",
      group: d.bloodGroup,
      city: d.city,
      area: d.area,
      phone: d.phone,
      email: d.email,
      lastDonated: d.lastDonated,
      available: d.available,
      verified: d.verified,
      rating: d.rating,
      donations: d.totalDonations,
      eligible: isEligible(d.lastDonated),
    }));

    res.json({ results, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error("searchDonors:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/* ------------------------------------------------------------------ */
/*  GET /api/donors/:id                                                */
/* ------------------------------------------------------------------ */
exports.getDonorById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid donor id" });
    }

    const donor = await Donor.findById(req.params.id).populate("user", "fullname");
    if (!donor) return res.status(404).json({ message: "Donor not found" });

    res.json({ donor, eligible: isEligible(donor.lastDonated) });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/* ------------------------------------------------------------------ */
/*  POST /api/donors/:id/contact    (auth required)                    */
/* ------------------------------------------------------------------ */
exports.contactDonor = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid donor id" });
    }

    const donor = await Donor.findById(req.params.id);
    if (!donor) return res.status(404).json({ message: "Donor not found" });
    if (!donor.available) {
      return res.status(400).json({ message: "Donor is currently unavailable" });
    }

    // TODO: send email/SMS/push to donor here

    res.json({
      message: "Donor notified",
      contact: { phone: donor.phone, email: donor.email },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/* ------------------------------------------------------------------ */
/*  POST /api/donors/me/donations    (record a donation)               */
/* ------------------------------------------------------------------ */
exports.recordDonation = async (req, res) => {
  try {
    const donor = await Donor.findOne({ user: req.user.id });
    if (!donor) return res.status(404).json({ message: "Donor profile not found" });

    if (!isEligible(donor.lastDonated)) {
      return res.status(400).json({ message: "90-day cooldown not complete" });
    }

    const { hospitalId, bloodRequestId, units = 1, notes } = req.body;

    if (hospitalId && !isValidObjectId(hospitalId)) {
      return res.status(400).json({ message: "Invalid hospitalId" });
    }
    if (bloodRequestId && !isValidObjectId(bloodRequestId)) {
      return res.status(400).json({ message: "Invalid bloodRequestId" });
    }

    const donation = await Donation.create({
      donor: donor._id,
      hospital: hospitalId || null,
      bloodRequest: bloodRequestId || null,
      bloodGroup: donor.bloodGroup,
      units,
      notes,
    });

    donor.lastDonated = donation.donatedAt;
    donor.totalDonations += 1;
    donor.available = false;
    await donor.save();

    res.status(201).json({ message: "Donation recorded", donation, donor });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/* ------------------------------------------------------------------ */
/*  GET /api/donors/me/donations                                       */
/* ------------------------------------------------------------------ */
exports.getMyDonations = async (req, res) => {
  try {
    const donor = await Donor.findOne({ user: req.user.id });
    if (!donor) return res.status(404).json({ message: "Donor profile not found" });

    const donations = await Donation.find({ donor: donor._id })
      .populate("hospital", "hospitalName address.city")
      .sort({ donatedAt: -1 })
      .lean();

    const results = donations.map((d) => ({
      id: d._id,
      bloodGroup: d.bloodGroup,
      units: d.units,
      donatedAt: d.donatedAt,
      notes: d.notes,
      certificateUrl: d.certificateUrl,
      hospital: d.hospital
        ? {
            id: d.hospital._id,
            name: d.hospital.hospitalName,
            city: d.hospital.address?.city || "",
          }
        : null,
    }));

    res.json({ donations: results, total: donor.totalDonations });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};