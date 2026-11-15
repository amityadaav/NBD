const mongoose = require("mongoose");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");

const isValidId = (id) => mongoose.isValidObjectId(id);

// Matches Appointment model enum
const STATUSES = ["Pending", "Confirmed", "Cancelled", "Completed"];

// Allowed status transitions
const TRANSITIONS = {
  Pending: ["Confirmed", "Cancelled"],
  Confirmed: ["Completed", "Cancelled"],
  Completed: [],
  Cancelled: [],
};

// GET /api/hospital-admin/appointments?status=&doctorId=&date=YYYY-MM-DD&page=&limit=
exports.listAppointments = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);

    const filter = { hospitalId: req.hospital._id };

    if (STATUSES.includes(req.query.status)) {
      filter.status = req.query.status;
    }

    if (req.query.doctorId) {
      if (!mongoose.isValidObjectId(req.query.doctorId)) {
        return res.status(400).json({ success: false, message: "Invalid doctor ID." });
      }

      const doctorExists = await Doctor.exists({
        _id: req.query.doctorId,
        hospitalId: req.hospital._id,
      });

      if (!doctorExists) {
        return res.status(404).json({ success: false, message: "Doctor not found." });
      }

      filter.doctorId = req.query.doctorId;
    }

    if (req.query.date) {
      const start = new Date(req.query.date);
      if (Number.isNaN(start.getTime())) {
        return res.status(400).json({ success: false, message: "Invalid date." });
      }
      start.setUTCHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setUTCDate(end.getUTCDate() + 1);
      filter.appointmentDate = { $gte: start, $lt: end };
    }

    const [appointments, total] = await Promise.all([
      Appointment.find(filter)
        .populate("doctorId", "name specialty")
        .sort({ appointmentDate: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Appointment.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      count: appointments.length,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      appointments,
    });
  } catch (error) {
    console.error("List hospital appointments error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch appointments." });
  }
};

// PATCH /api/hospital-admin/appointments/:id/status   body: { "status": "Confirmed" }
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};

    if (!isValidId(id)) {
      return res.status(400).json({ success: false, message: "Invalid appointment ID." });
    }

    if (!STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${STATUSES.join(", ")}.`,
      });
    }

    const appointment = await Appointment.findOne({
      _id: id,
      hospitalId: req.hospital._id,
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found." });
    }

    const allowedNext = TRANSITIONS[appointment.status] || [];

    if (!allowedNext.includes(status)) {
      return res.status(409).json({
        success: false,
        message: `Cannot change status from ${appointment.status} to ${status}.`,
      });
    }

    appointment.status = status;
    await appointment.save();

    return res.status(200).json({
      success: true,
      message: `Appointment marked as ${status}.`,
      appointment,
    });
  } catch (error) {
    console.error("Update appointment status error:", error);
    return res.status(500).json({ success: false, message: "Failed to update appointment." });
  }
};