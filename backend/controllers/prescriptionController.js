const mongoose = require("mongoose");
const Appointment = require("../models/Appointment");
const Prescription = require("../models/Prescription");
const Doctor = require("../models/Doctor");
const User = require("../models/User");

// ============ GET doctor's own appointments ============
// GET /api/doctor-panel/appointments
exports.getMyAppointments = async (req, res) => {
  try {
    const doctorUserId = req.user.id;

    const me = await User.findById(doctorUserId)
      .select("doctorId role fullname")
      .lean();

    if (!me || me.role !== "doctor" || !me.doctorId) {
      return res.status(403).json({
        success: false,
        message:
          "This account is not linked to a doctor profile. Contact your hospital admin.",
      });
    }

    const doctor = await Doctor.findById(me.doctorId).select(
      "name specialty"
    );
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found.",
      });
    }

    const appointments = await Appointment.find({ doctorId: doctor._id })
      .populate("hospitalId", "hospitalName city")
      .sort({ appointmentDate: -1 })
      .lean();

    // Lookup patient User docs by email to get _id
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
        hospitalName: a.hospitalId?.hospitalName || "",
        date: a.appointmentDate,
        time: a.appointmentTime,
        status: a.status,
        reason: a.reason,
      };
    });

    return res.status(200).json({
      success: true,
      doctor: { name: doctor.name, specialty: doctor.specialty },
      appointments: formatted,
    });
  } catch (error) {
    console.error("Get my appointments error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch appointments.",
    });
  }
};

// ============ POST create prescription ============
// POST /api/doctor-panel/prescriptions
exports.createPrescription = async (req, res) => {
  try {
    const {
      appointmentId,
      patientId,
      diagnosis,
      medicines,
      notes,
      followUpDate,
      status,
    } = req.body;

    const me = await User.findById(req.user.id)
      .select("doctorId role")
      .lean();

    if (!me || me.role !== "doctor" || !me.doctorId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized as a doctor.",
      });
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

    const prescription = await Prescription.create({
      patientId,
      doctorId: me.doctorId,       // ref to Doctor profile
      appointmentId: appointmentId || null,
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
    console.error("Create prescription error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to create prescription.",
    });
  }
};

// ============ GET my written prescriptions (optional) ============
// GET /api/doctor-panel/prescriptions
exports.getMyWrittenPrescriptions = async (req, res) => {
  try {
    const me = await User.findById(req.user.id)
      .select("doctorId role")
      .lean();

    if (!me || me.role !== "doctor" || !me.doctorId) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized." });
    }

    const prescriptions = await Prescription.find({ doctorId: me.doctorId })
      .populate("patientId", "fullname email")
      .sort({ issuedDate: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      prescriptions,
    });
  } catch (error) {
    console.error("Get written prescriptions error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch prescriptions.",
    });
  }
};