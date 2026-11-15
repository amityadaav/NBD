const Hospital = require("../models/Hospital");
const Doctor = require("../models/Doctor");

exports.getHospitalDashboard = async (req, res) => {
  try {
    const hospitalId = req.user.hospitalId;

    if (!hospitalId) {
      return res.status(403).json({
        success: false,
        message: "Your account is not linked to a hospital.",
      });
    }

    const hospital = await Hospital.findOne({
      _id: hospitalId,
      admin: req.user.id,
      verificationStatus: "Verified",
      isActive: true,
    })
      .select("hospitalName address.city")
      .lean();

    if (!hospital) {
      return res.status(403).json({
        success: false,
        message: "Hospital not found or inactive.",
      });
    }

    const [
      totalDoctors,
      activeDoctors,
      pendingDoctors,
    ] = await Promise.all([
      Doctor.countDocuments({ hospitalId }),

      Doctor.countDocuments({
        hospitalId,
        isActive: true,
        verificationStatus: "Verified",
      }),

      Doctor.countDocuments({
        hospitalId,
        verificationStatus: "Pending",
      }),
    ]);

    return res.status(200).json({
      success: true,
      hospital,
      stats: {
        totalDoctors,
        activeDoctors,
        pendingDoctors,
      },
    });
  } catch (error) {
    console.error("Hospital dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load hospital dashboard.",
    });
  }
};