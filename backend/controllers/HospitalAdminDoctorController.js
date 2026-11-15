const mongoose = require("mongoose");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");

const isValidId = (id) => mongoose.isValidObjectId(id);
const isNonEmptyString = (v) => typeof v === "string" && v.trim().length > 0;
const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const ALLOWED_DAYS = [
  "Monday", "Tuesday", "Wednesday", "Thursday",
  "Friday", "Saturday", "Sunday",
];

// Matches Doctor model enum
const DOCTOR_STATUSES = ["Pending", "Approved", "Rejected"];

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const parseDays = (value) => {
  let days = value ?? [];
  if (typeof days === "string") {
    try { days = JSON.parse(days); } catch { days = [days]; }
  }
  if (!Array.isArray(days) || days.length === 0 || days.some((d) => !ALLOWED_DAYS.includes(d))) {
    return null;
  }
  return [...new Set(days)];
};

// GET /api/hospital-admin/doctors?status=&search=&page=&limit=
exports.listDoctors = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);

    const filter = { hospitalId: req.hospital._id };

    if (DOCTOR_STATUSES.includes(req.query.status)) {
      filter.verificationStatus = req.query.status;
    }

    if (isNonEmptyString(req.query.search)) {
      const rx = new RegExp(escapeRegex(req.query.search.trim()), "i");
      filter.$or = [{ name: rx }, { specialty: rx }];
    }

    const [doctors, total] = await Promise.all([
      Doctor.find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Doctor.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      count: doctors.length,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      doctors,
    });
  } catch (error) {
    console.error("List doctors error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch doctors." });
  }
};

// GET /api/hospital-admin/doctors/:id
exports.getDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ success: false, message: "Invalid doctor ID." });
    }

    const doctor = await Doctor.findOne({ _id: id, hospitalId: req.hospital._id }).lean();

    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found." });
    }

    return res.status(200).json({ success: true, doctor });
  } catch (error) {
    console.error("Get doctor error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch doctor." });
  }
};

// POST /api/hospital-admin/doctors
// New doctors start as Pending/inactive until the super admin approves them.
exports.addDoctor = async (req, res) => {
  try {
    const d = req.body || {};

    const missing = ["name", "specialty", "qualification", "medicalRegistrationNumber"]
      .filter((f) => !isNonEmptyString(d[f]));

    if (missing.length) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(", ")}`,
        missingFields: missing,
      });
    }

    const experience = Number(d.experience ?? 0);
    const consultationFee = Number(d.consultationFee);

    if (!Number.isFinite(experience) || experience < 0) {
      return res.status(400).json({ success: false, message: "Invalid experience." });
    }

    if (!Number.isFinite(consultationFee) || consultationFee < 0) {
      return res.status(400).json({ success: false, message: "Invalid consultation fee." });
    }

    const availableDays = parseDays(d.availableDays);
    if (!availableDays) {
      return res.status(400).json({ success: false, message: "Invalid availableDays." });
    }

    const registrationNumber = d.medicalRegistrationNumber.trim();

    const duplicate = await Doctor.findOne({ medicalRegistrationNumber: registrationNumber });
    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "A doctor with this medical registration number already exists.",
      });
    }

    const doctor = await Doctor.create({
      name: d.name.trim(),
      email: normalizeEmail(d.email) || undefined,
      phone: d.phone ? String(d.phone).trim() : undefined,
      specialty: d.specialty.trim(),
      qualification: d.qualification.trim(),
      experience,
      consultationFee,
      availableDays,
      medicalRegistrationNumber: registrationNumber,

      hospitalId: req.hospital._id,
      profileImage: "",
      verificationStatus: "Pending",
      rejectionReason: "",
      isActive: false,
      createdBy: req.user.id,
      reviewedBy: null,
      reviewedAt: null,
    });

    return res.status(201).json({
      success: true,
      message: "Doctor added successfully. Awaiting Main Admin approval.",
      doctor,
    });
  } catch (error) {
    console.error("Add doctor error:", error);

    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ success: false, message: error.message });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A doctor with duplicate unique data already exists.",
      });
    }

    return res.status(500).json({ success: false, message: "Failed to add doctor." });
  }
};

// PATCH /api/hospital-admin/doctors/:id
// Verification status, hospital link and registration number cannot be changed here.
exports.updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ success: false, message: "Invalid doctor ID." });
    }

    const doctor = await Doctor.findOne({ _id: id, hospitalId: req.hospital._id });

    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found." });
    }

    const body = req.body || {};
    const has = (f) => Object.prototype.hasOwnProperty.call(body, f);

    for (const field of ["name", "specialty", "qualification"]) {
      if (has(field)) {
        if (!isNonEmptyString(body[field])) {
          return res.status(400).json({ success: false, message: `Invalid ${field}.` });
        }
        doctor.set(field, body[field].trim());
      }
    }

    if (has("email")) doctor.set("email", normalizeEmail(body.email) || undefined);
    if (has("phone")) doctor.set("phone", body.phone ? String(body.phone).trim() : undefined);

    if (has("experience")) {
      const n = Number(body.experience);
      if (!Number.isFinite(n) || n < 0) {
        return res.status(400).json({ success: false, message: "Invalid experience." });
      }
      doctor.set("experience", n);
    }

    if (has("consultationFee")) {
      const n = Number(body.consultationFee);
      if (!Number.isFinite(n) || n < 0) {
        return res.status(400).json({ success: false, message: "Invalid consultation fee." });
      }
      doctor.set("consultationFee", n);
    }

    if (has("availableDays")) {
      const days = parseDays(body.availableDays);
      if (!days) {
        return res.status(400).json({ success: false, message: "Invalid availableDays." });
      }
      doctor.set("availableDays", days);
    }

    await doctor.save();

    return res.status(200).json({
      success: true,
      message: "Doctor updated successfully.",
      doctor,
    });
  } catch (error) {
    console.error("Update doctor error:", error);

    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ success: false, message: error.message });
    }

    return res.status(500).json({ success: false, message: "Failed to update doctor." });
  }
};

// PATCH /api/hospital-admin/doctors/:id/status   body: { "isActive": true | false }
// Only an Approved doctor can be made active.
exports.setDoctorActive = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body || {};

    if (!isValidId(id)) {
      return res.status(400).json({ success: false, message: "Invalid doctor ID." });
    }

    if (typeof isActive !== "boolean") {
      return res.status(400).json({ success: false, message: "isActive must be true or false." });
    }

    const doctor = await Doctor.findOne({ _id: id, hospitalId: req.hospital._id });

    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found." });
    }

    if (isActive && doctor.verificationStatus !== "Approved") {
      return res.status(409).json({
        success: false,
        message: "Only approved doctors can be activated.",
      });
    }

    doctor.isActive = isActive;
    await doctor.save();

    return res.status(200).json({
      success: true,
      message: isActive ? "Doctor activated." : "Doctor deactivated.",
      doctor,
    });
  } catch (error) {
    console.error("Set doctor status error:", error);
    return res.status(500).json({ success: false, message: "Failed to update doctor status." });
  }
};

// DELETE /api/hospital-admin/doctors/:id
// Blocked while the doctor still has Pending/Confirmed appointments.
exports.deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ success: false, message: "Invalid doctor ID." });
    }

    const doctor = await Doctor.findOne({ _id: id, hospitalId: req.hospital._id });

    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found." });
    }

    const openAppointments = await Appointment.countDocuments({
      doctorId: doctor._id,
      status: { $in: ["Pending", "Confirmed"] },
    });

    if (openAppointments > 0) {
      return res.status(409).json({
        success: false,
        message: `This doctor has ${openAppointments} open appointment(s). Resolve them or deactivate the doctor instead.`,
      });
    }

    await Doctor.deleteOne({ _id: doctor._id });

    return res.status(200).json({ success: true, message: "Doctor removed successfully." });
  } catch (error) {
    console.error("Delete doctor error:", error);
    return res.status(500).json({ success: false, message: "Failed to remove doctor." });
  }
};