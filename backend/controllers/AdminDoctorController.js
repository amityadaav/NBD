
const Doctor = require("../models/Doctor");
const Hospital = require("../models/Hospital");

exports.getPendingDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({
      verificationStatus: "Pending",
    })
      .populate("hospitalId", "hospitalName email address")
      .populate("createdBy", "fullname email")
      .sort({ createdAt: 1 });

    return res.json({
      success: true,
      doctors,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to fetch pending doctors.",
    });
  }
};

exports.reviewDoctor = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor verification status.",
      });
    }

    if (
      status === "Rejected" &&
      (!rejectionReason || !rejectionReason.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required.",
      });
    }

    const doctor = await Doctor.findOne({
      _id: req.params.id,
      verificationStatus: "Pending",
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Pending doctor not found.",
      });
    }

    const hospital = await Hospital.findOne({
      _id: doctor.hospitalId,
      verificationStatus: "Verified",
      isActive: true,
    });

    if (!hospital) {
      return res.status(409).json({
        success: false,
        message: "Doctor's hospital is not approved and active.",
      });
    }

    doctor.verificationStatus = status;
    doctor.rejectionReason =
      status === "Rejected" ? rejectionReason.trim() : "";
    doctor.reviewedBy = req.user.id;
    doctor.reviewedAt = new Date();

    await doctor.save();

    return res.json({
      success: true,
      message: `Doctor ${status.toLowerCase()} successfully.`,
      doctor,
    });
  } catch (error) {
    console.error("Doctor review error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to review doctor.",
    });
  }
};
