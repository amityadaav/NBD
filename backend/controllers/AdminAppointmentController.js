const mongoose = require("mongoose");
const Appointment = require("../models/Appointment");
const Hospital = require("../models/Hospital");

const STATUSES = ["Pending", "Confirmed", "Completed", "Cancelled"];

// Allowed status changes
const TRANSITIONS = {
  Pending: ["Confirmed", "Cancelled"],
  Confirmed: ["Completed", "Cancelled"],
  Completed: [],
  Cancelled: [],
};

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Returns the base filter for the logged-in role, or null after sending an error.
const getScope = async (req, res) => {
  if (req.user.role === "super_admin") return {};

  if (req.user.role === "hospital_admin") {
    if (!req.user.hospitalId) {
      res.status(403).json({ success: false, message: "Hospital is not assigned to this account." });
      return null;
    }

    const hospital = await Hospital.findOne({
      _id: req.user.hospitalId,
      admin: req.user.id,
      verificationStatus: "Verified",
      isActive: true,
    }).select("_id");

    if (!hospital) {
      res.status(403).json({ success: false, message: "Hospital access denied or inactive." });
      return null;
    }

    return { hospitalId: hospital._id };
  }

  res.status(403).json({ success: false, message: "Access denied." });
  return null;
};

const populateAll = (query) =>
  query
    .populate("doctorId", "name specialty")
    .populate("hospitalId", "hospitalName address.city");

// GET /api/admin/appointments?status=&search=&from=&to=&page=&limit=
exports.getAllAppointments = async (req, res) => {
  try {
    const scope = await getScope(req, res);
    if (!scope) return;

    const { status, search, from, to, page = 1, limit = 20 } = req.query;
    const filter = { ...scope };

    if (status && status !== "All") {
      if (!STATUSES.includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid status filter." });
      }
      filter.status = status;
    }

    if (search?.trim()) {
      const regex = new RegExp(escapeRegex(search.trim()), "i");
      filter.$or = [{ patientName: regex }, { patientEmail: regex }, { patientPhone: regex }];
    }

    if (from || to) {
      filter.appointmentDate = {};
      if (from) filter.appointmentDate.$gte = new Date(from);
      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        filter.appointmentDate.$lte = end;
      }
      if (Object.values(filter.appointmentDate).some((d) => Number.isNaN(d.getTime()))) {
        return res.status(400).json({ success: false, message: "Invalid date filter." });
      }
    }

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

    const [appointments, total, ...counts] = await Promise.all([
      populateAll(
        Appointment.find(filter)
          .sort({ appointmentDate: -1, createdAt: -1 })
          .skip((pageNumber - 1) * pageSize)
          .limit(pageSize)
      ).lean(),
      Appointment.countDocuments(filter),
      Appointment.countDocuments(scope),
      ...STATUSES.map((s) => Appointment.countDocuments({ ...scope, status: s })),
    ]);

    const [all, pending, confirmed, completed, cancelled] = counts;

    return res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
      statistics: { total: all, pending, confirmed, completed, cancelled },
      pagination: { total, page: pageNumber, limit: pageSize, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (error) {
    console.error("Get all appointments error:", error);
    return res.status(500).json({ success: false, message: "Unable to fetch appointments." });
  }
};

// GET /api/admin/appointments/:id
exports.getAppointmentById = async (req, res) => {
  try {
    const scope = await getScope(req, res);
    if (!scope) return;

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid appointment ID." });
    }

    const appointment = await populateAll(
      Appointment.findOne({ _id: req.params.id, ...scope })
    ).lean();

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found." });
    }

    return res.status(200).json({ success: true, appointment });
  } catch (error) {
    console.error("Get appointment by ID error:", error);
    return res.status(500).json({ success: false, message: "Unable to fetch appointment." });
  }
};

const changeStatus = async (req, res, nextStatus) => {
  const scope = await getScope(req, res);
  if (!scope) return;

  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid appointment ID." });
  }

  if (!STATUSES.includes(nextStatus)) {
    return res.status(400).json({
      success: false,
      message: `Status must be one of: ${STATUSES.join(", ")}.`,
    });
  }

  const current = await Appointment.findOne({ _id: req.params.id, ...scope }).select("status");

  if (!current) {
    return res.status(404).json({ success: false, message: "Appointment not found." });
  }

  if (!TRANSITIONS[current.status].includes(nextStatus)) {
    return res.status(409).json({
      success: false,
      message: `A ${current.status.toLowerCase()} appointment cannot be changed to ${nextStatus.toLowerCase()}.`,
    });
  }

  // Conditional update prevents two admins racing each other
  const updated = await populateAll(
    Appointment.findOneAndUpdate(
      { _id: current._id, status: current.status },
      { $set: { status: nextStatus } },
      { new: true }
    )
  );

  if (!updated) {
    return res.status(409).json({ success: false, message: "Appointment was changed by someone else. Refresh and retry." });
  }

  return res.status(200).json({
    success: true,
    message: `Appointment ${nextStatus.toLowerCase()} successfully.`,
    appointment: updated,
  });
};

// PATCH /api/admin/appointments/:id/status   body: { status }
exports.updateAppointmentStatus = async (req, res) => {
  try {
    return await changeStatus(req, res, req.body?.status);
  } catch (error) {
    console.error("Update appointment status error:", error);
    return res.status(500).json({ success: false, message: "Unable to update appointment status." });
  }
};

// PATCH /api/admin/appointments/:id/cancel
exports.cancelAppointment = async (req, res) => {
  try {
    return await changeStatus(req, res, "Cancelled");
  } catch (error) {
    console.error("Cancel appointment error:", error);
    return res.status(500).json({ success: false, message: "Unable to cancel appointment." });
  }
};