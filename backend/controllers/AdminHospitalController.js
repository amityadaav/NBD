
const Hospital = require("../models/Hospital");
const User = require("../models/User");

exports.getPendingHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find({
      verificationStatus: {
        $in: ["Pending", "Under Review"],
      },
    })
      .populate("admin", "fullname email phone")
      .sort({ createdAt: 1 });

    return res.json({
      success: true,
      hospitals,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to fetch hospitals.",
    });
  }
};

exports.reviewHospital = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    if (!["Verified", "Rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification status.",
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

    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found.",
      });
    }

    if (
      !["Pending", "Under Review"].includes(
        hospital.verificationStatus
      )
    ) {
      return res.status(409).json({
        success: false,
        message: "Hospital is not awaiting review.",
      });
    }

    hospital.verificationStatus = status;
    hospital.isActive = status === "Verified";
    hospital.rejectionReason =
      status === "Rejected" ? rejectionReason.trim() : "";
    hospital.reviewedBy = req.user.id;
    hospital.reviewedAt = new Date();

    await hospital.save();

    // Hospital Admin account is activated only after approval.
    if (hospital.admin) {
      await User.updateOne(
        { _id: hospital.admin },
        {
          $set: {
            role: "hospital_admin",
            hospitalId: hospital._id,
            isActive: status === "Verified",
          },
        }
      );
    }

    return res.json({
      success: true,
      message: `Hospital ${status.toLowerCase()} successfully.`,
      hospital,
    });
  } catch (error) {
    console.error("Hospital review error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to review hospital.",
    });
  }
};
