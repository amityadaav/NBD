const mongoose = require("mongoose");
const Appointment = require("../models/Appointment");
const Prescription = require("../models/Prescription");
const Doctor = require("../models/Doctor");
const User = require("../models/User");

// GET /api/hospital-admin/prescriptions/eligible-appointments
exports.getEligibleAppointments = async (req, res) => {
  try {
    if (
      req.user.role !== "hospital_admin" ||
      !req.user.hospitalId ||
      !mongoose.isValidObjectId(req.user.hospitalId)
    ) {
      return res.status(403).json({
        success: false,
        message: "Hospital admin access required.",
      });
    }

    const appointments = await Appointment.find({
      hospitalId: req.user.hospitalId,
    })
      .populate("doctorId", "name specialty")
      .sort({ appointmentDate: -1 })
      .lean();

    const emails = [...new Set(appointments.map((a) => a.patientEmail))];
    const patients = await User.find({ email: { $in: emails } })
      .select("_id fullname email phone")
      .lean();
    const patientMap = Object.fromEntries(
      patients.map((p) => [p.email, p])
    );

    const formatted = appointments.map((a) => {
      const patient = patientMap[a.patientEmail];
      return {
        _id: a._id,
        patientId: patient?._id || null,
        patientName: patient?.fullname || a.patientName,
        patientEmail: a.patientEmail,
        patientPhone: a.patientPhone,
        doctorId: a.doctorId?._id || null,
        doctorName: a.doctorId?.name || "Unknown Doctor",
        doctorSpecialty: a.doctorId?.specialty || "General",
        date: a.appointmentDate,
        time: a.appointmentTime,
        status: a.status,
        reason: a.reason,
      };
    });

    return res.status(200).json({
      success: true,
      appointments: formatted,
    });
  } catch (error) {
    console.error("Get eligible appointments error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch appointments.",
    });
  }
};

// POST /api/hospital-admin/prescriptions
exports.createPrescription = async (req, res) => {
  try {
    if (req.user.role !== "hospital_admin") {
      return res.status(403).json({
        success: false,
        message: "Hospital admin access required.",
      });
    }

    const {
      appointmentId,
      patientId,
      diagnosis,
      medicines,
      notes,
      followUpDate,
      status,
    } = req.body;

    if (!appointmentId || !mongoose.isValidObjectId(appointmentId)) {
      return res
        .status(400)
        .json({ success: false, message: "Valid appointment is required." });
    }

    if (!patientId || !mongoose.isValidObjectId(patientId)) {
      return res
        .status(400)
        .json({ success: false, message: "Valid patient is required." });
    }

    if (!Array.isArray(medicines) || medicines.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one medicine is required.",
      });
    }

    if (medicines.some((m) => !m.name?.trim())) {
      return res.status(400).json({
        success: false,
        message: "Every medicine must have a name.",
      });
    }

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      hospitalId: req.user.hospitalId,
    }).select("doctorId patientEmail");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found at this hospital.",
      });
    }

    const prescription = await Prescription.create({
      patientId,
      doctorId: appointment.doctorId,
      appointmentId: appointment._id,
      diagnosis: diagnosis?.trim() || "",
      medicines: medicines.map((m) => ({
        name: m.name.trim(),
        dosage: m.dosage?.trim() || "",
        frequency: m.frequency?.trim() || "",
        duration: m.duration?.trim() || "",
        instructions: m.instructions?.trim() || "",
      })),
      notes: notes?.trim() || "",
      followUpDate: followUpDate ? new Date(followUpDate) : null,
      status: status || "Active",
    });

    return res.status(201).json({
      success: true,
      message: "Prescription issued successfully.",
      prescription,
    });
  } catch (error) {
    console.error("Create prescription (admin) error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to create prescription.",
    });
  }
};

// GET /api/hospital-admin/prescriptions
exports.getHospitalPrescriptions = async (req, res) => {
  try {
    if (req.user.role !== "hospital_admin") {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized." });
    }

    const doctors = await Doctor.find({
      hospitalId: req.user.hospitalId,
    })
      .select("_id name specialty")
      .lean();

    const doctorIds = doctors.map((d) => d._id);
    const doctorMap = Object.fromEntries(
      doctors.map((d) => [String(d._id), d])
    );

    const prescriptions = await Prescription.find({
      doctorId: { $in: doctorIds },
    })
      .populate("patientId", "fullname email phone")
      .sort({ issuedDate: -1 })
      .lean();

    const formatted = prescriptions.map((p) => ({
      _id: p._id,
      patientName: p.patientId?.fullname || "Unknown",
      patientEmail: p.patientId?.email || "",
      doctorName: doctorMap[String(p.doctorId)]?.name || "Unknown Doctor",
      doctorSpecialty:
        doctorMap[String(p.doctorId)]?.specialty || "General",
      diagnosis: p.diagnosis,
      medicineCount: p.medicines?.length || 0,
      issuedDate: p.issuedDate,
      status: p.status,
    }));

    return res.status(200).json({
      success: true,
      prescriptions: formatted,
    });
  } catch (error) {
    console.error("Get hospital prescriptions error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch prescriptions.",
    });
  }
};