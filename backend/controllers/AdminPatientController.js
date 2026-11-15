const mongoose = require("mongoose");
const User = require("../models/User");
const Appointment = require("../models/Appointment");

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// GET /api/admin/patients?status=Active|Inactive&search=&page=&limit=
exports.getPatients = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const filter = { role: "patient" };

    if (status === "Active") filter.isActive = true;
    else if (status === "Inactive") filter.isActive = false;

    if (search?.trim()) {
      const regex = new RegExp(escapeRegex(search.trim()), "i");
      filter.$or = [{ fullname: regex }, { email: regex }, { phone: regex }];
    }

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

    const [patients, total, all, active] = await Promise.all([
      User.find(filter)
        .select("fullname email phone isActive createdAt")
        .sort({ createdAt: -1 })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      User.countDocuments(filter),
      User.countDocuments({ role: "patient" }),
      User.countDocuments({ role: "patient", isActive: true }),
    ]);

    // Appointments store patientEmail (no patient ID), so count by email
    const emails = patients.map((p) => (p.email || "").toLowerCase());
    const counts = await Appointment.aggregate([
      { $match: { patientEmail: { $in: emails } } },
      { $group: { _id: "$patientEmail", count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(counts.map((c) => [c._id, c.count]));
    patients.forEach((p) => {
      p.appointments = countMap[(p.email || "").toLowerCase()] || 0;
    });

    return res.status(200).json({
      success: true,
      patients,
      statistics: { total: all, active, inactive: all - active },
      pagination: { total, page: pageNumber, limit: pageSize, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (error) {
    console.error("Get patients error:", error);
    return res.status(500).json({ success: false, message: "Unable to fetch patients." });
  }
};

// PATCH /api/admin/patients/:id/status   body: { isActive: true|false }
exports.setPatientStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid patient ID." });
    }
    if (typeof isActive !== "boolean") {
      return res.status(400).json({ success: false, message: "isActive must be true or false." });
    }

    const patient = await User.findOneAndUpdate(
      { _id: id, role: "patient" },
      { $set: { isActive } },
      { new: true }
    ).select("fullname email phone isActive createdAt");

    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient not found." });
    }

    return res.status(200).json({
      success: true,
      message: `Patient ${isActive ? "activated" : "deactivated"} successfully.`,
      patient,
    });
  } catch (error) {
    console.error("Set patient status error:", error);
    return res.status(500).json({ success: false, message: "Unable to update patient." });
  }
};