const User = require("../models/User");
const Appointment = require("../models/Appointment");
const Prescription = require("../models/Prescription");
exports.getDashboardData = async (req, res) => {
  try {
    // req.user.id is set by authenticate middleware
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const allAppointments = await Appointment.find({ patientEmail: user.email })
      .populate("doctorId", "fullname specialty")
      .sort({ appointmentDate: 1 });

    const now = new Date();

    const upcoming = allAppointments.filter(
      (a) => new Date(a.appointmentDate) >= now && a.status !== "Cancelled"
    );

    const completed = allAppointments.filter(
      (a) => a.status === "Completed"
    );

    const appointments = upcoming.slice(0, 3).map((a) => ({
      _id: a._id,
      doctorName: a.doctorId?.fullname || "Unknown Doctor",
      specialty: a.doctorId?.specialty || "General",
      date: a.appointmentDate,
      time: a.appointmentTime,
      status: a.status,
    }));

    return res.status(200).json({
      success: true,
      stats: {
        upcoming: upcoming.length,
        completed: completed.length,
        records: 0,
      },
      appointments,
    });
  } catch (error) {
    console.error("Dashboard fetch error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch dashboard data.",
    });
  }
};



// GET /api/user/appointments
exports.getMyAppointments = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const appointments = await Appointment.find({ patientEmail: user.email })
      .populate("doctorId", "fullname specialty profileImage")
      .populate("hospitalId", "name city address")
      .sort({ appointmentDate: -1 }); // newest first

    const formatted = appointments.map((a) => ({
      _id: a._id,
      doctorName: a.doctorId?.fullname || "Unknown Doctor",
      specialty: a.doctorId?.specialty || "General",
      doctorImage: a.doctorId?.profileImage || "",
      hospitalName: a.hospitalId?.name || "",
      hospitalCity: a.hospitalId?.city || "",
      date: a.appointmentDate,
      time: a.appointmentTime,
      type: a.appointmentType,
      reason: a.reason,
      fee: a.consultationFee,
      status: a.status,
      createdAt: a.createdAt,
    }));

    return res.status(200).json({
      success: true,
      appointments: formatted,
    });
  } catch (error) {
    console.error("Get appointments error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch appointments.",
    });
  }
};


// GET /api/user/prescriptions
exports.getMyPrescriptions = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const prescriptions = await Prescription.find({ patientId: user._id })
      .populate("doctorId", "fullname specialty profileImage")
      .sort({ issuedDate: -1 });

    const formatted = prescriptions.map((p) => ({
      _id: p._id,
      doctorName: p.doctorId?.fullname || "Unknown Doctor",
      specialty: p.doctorId?.specialty || "General",
      doctorImage: p.doctorId?.profileImage || "",
      diagnosis: p.diagnosis,
      medicines: p.medicines,
      notes: p.notes,
      followUpDate: p.followUpDate,
      issuedDate: p.issuedDate,
      status: p.status,
    }));

    return res.status(200).json({
      success: true,
      prescriptions: formatted,
    });
  } catch (error) {
    console.error("Get prescriptions error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch prescriptions.",
    });
  }
};