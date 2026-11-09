
const Hospital = require("../models/Hospital");
const Doctor = require("../models/Doctor");
const User = require("../models/User");
const Appointment = require("../models/Appointment");

exports.getDashboard = async (req, res) => {
  try {
    const [
      totalHospitals,
      pendingHospitals,
      totalDoctors,
      pendingDoctors,
      totalPatients,
      totalAppointments,
    ] = await Promise.all([
      Hospital.countDocuments(),
      Hospital.countDocuments({
        verificationStatus: {
          $in: ["Pending", "Under Review"],
        },
      }),
      Doctor.countDocuments(),
      Doctor.countDocuments({
        verificationStatus: "Pending",
      }),
      User.countDocuments({ role: "patient" }),
      Appointment.countDocuments(),
    ]);

    return res.json({
      success: true,
      dashboard: {
        totalHospitals,
        pendingHospitals,
        totalDoctors,
        pendingDoctors,
        totalPatients,
        totalAppointments,
      },
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load dashboard.",
    });
  }
};
