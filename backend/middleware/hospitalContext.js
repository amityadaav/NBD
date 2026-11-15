const Hospital = require("../models/Hospital");

// Loads the logged-in hospital admin's verified, active hospital into req.hospital
const loadHospital = async (req, res, next) => {
  try {
    const hospitalId = req.user?.hospitalId;

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
    }).select("_id hospitalName");

    if (!hospital) {
      return res.status(403).json({
        success: false,
        message: "Hospital not found or inactive.",
      });
    }

    req.hospital = hospital;
    return next();
  } catch (error) {
    console.error("loadHospital error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify hospital access.",
    });
  }
};

module.exports = { loadHospital };