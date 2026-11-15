
// const Hospital = require("../models/Hospital");
// const Doctor = require("../models/Doctor");
// const User = require("../models/User");
// const Appointment = require("../models/Appointment");

// exports.getDashboard = async (req, res) => {
//   try {
//     const [
//       totalHospitals,
//       pendingHospitals,
//       totalDoctors,
//       pendingDoctors,
//       totalPatients,
//       totalAppointments,
//     ] = await Promise.all([
//       Hospital.countDocuments(),
//       Hospital.countDocuments({
//         verificationStatus: {
//           $in: ["Pending", "Under Review"],
//         },
//       }),
//       Doctor.countDocuments(),
//       Doctor.countDocuments({
//         verificationStatus: "Pending",
//       }),
//       User.countDocuments({ role: "patient" }),
//       Appointment.countDocuments(),
//     ]);

//     return res.json({
//       success: true,
//       dashboard: {
//         totalHospitals,
//         pendingHospitals,
//         totalDoctors,
//         pendingDoctors,
//         totalPatients,
//         totalAppointments,
//       },
//     });
//   } catch (error) {
//     console.error("Admin dashboard error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Unable to load dashboard.",
//     });
//   }
// };
const Hospital = require("../models/Hospital");
const Doctor = require("../models/Doctor");
const User = require("../models/User");
const Appointment = require("../models/Appointment");

exports.getDashboard = async (req, res) => {
  try {
    const [
      totalHospitals,
      pendingHospitals,
      verifiedHospitals,
      rejectedHospitals,

      totalDoctors,
      pendingDoctors,
      verifiedDoctors,
      rejectedDoctors,

      totalPatients,
      activeUsers,
      inactiveUsers,

      totalAppointments,
      pendingAppointments,
      confirmedAppointments,
      completedAppointments,
      cancelledAppointments,
      rejectedAppointments,

      recentHospitals,
      recentDoctors,
      recentPatients,
    ] = await Promise.all([
      // HOSPITAL STATS
      Hospital.countDocuments(),
      Hospital.countDocuments({
        verificationStatus: { $in: ["Pending", "Under Review"] },
      }),
      Hospital.countDocuments({ verificationStatus: "Verified" }),
      Hospital.countDocuments({ verificationStatus: "Rejected" }),

      // DOCTOR STATS
      Doctor.countDocuments(),
      Doctor.countDocuments({ verificationStatus: "Pending" }),
      Doctor.countDocuments({ verificationStatus: "Verified" }),
      Doctor.countDocuments({ verificationStatus: "Rejected" }),

      // USER STATS
      User.countDocuments({ role: "patient" }),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: false }),

      // APPOINTMENT STATS
      Appointment.countDocuments(), // <-- was missing (total)
      Appointment.countDocuments({ status: "Pending" }),
      Appointment.countDocuments({ status: "Confirmed" }),
      Appointment.countDocuments({ status: "Completed" }),
      Appointment.countDocuments({ status: "Cancelled" }),
      Appointment.countDocuments({ status: "Rejected" }), // <-- was missing

      // RECENT HOSPITALS
      Hospital.find()
        .select("hospitalName verificationStatus createdAt")
        .sort({ createdAt: -1, _id: -1 })
        .limit(5)
        .lean(),

      // RECENT DOCTORS
      Doctor.find()
        .select("fullname name specialization verificationStatus createdAt")
        .sort({ createdAt: -1, _id: -1 })
        .limit(5)
        .lean(),

      // RECENT PATIENTS
      User.find({ role: "patient" })
        .select("fullname createdAt")
        .sort({ createdAt: -1, _id: -1 })
        .limit(5)
        .lean(),
    ]);

    // Merge recent registrations
    const recentRegistrations = [
      ...recentHospitals.map((item) => ({
        type: "hospital",
        id: item._id,
        name: item.hospitalName,
        status: item.verificationStatus,
        createdAt: item.createdAt,
      })),

      ...recentDoctors.map((item) => ({
        type: "doctor",
        id: item._id,
        name: item.fullname || item.name || "Doctor",
        specialization: item.specialization,
        status: item.verificationStatus,
        createdAt: item.createdAt,
      })),

      ...recentPatients.map((item) => ({
        type: "patient",
        id: item._id,
        name: item.fullname,
        createdAt: item.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 10);

    return res.status(200).json({
      success: true,
      dashboard: {
        // Existing fields preserved
        totalHospitals,
        pendingHospitals,
        totalDoctors,
        pendingDoctors,
        totalPatients,
        totalAppointments,

        // Hospital breakdown
        verifiedHospitals,
        rejectedHospitals,

        // Doctor breakdown
        verifiedDoctors,
        rejectedDoctors,

        // User breakdown
        activeUsers,
        inactiveUsers,

        // Appointment breakdown
        appointmentStats: {
          pending: pendingAppointments,
          confirmed: confirmedAppointments,
          completed: completedAppointments,
          cancelled: cancelledAppointments,
          rejected: rejectedAppointments,
        },

        // Recent registrations
        recentRegistrations,
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