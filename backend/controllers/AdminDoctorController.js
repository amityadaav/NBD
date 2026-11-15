
// const mongoose = require("mongoose");
// const Doctor = require("../models/Doctor");
// const Hospital = require("../models/Hospital");

// // HOSPITAL ADMIN: GET OWN HOSPITAL PENDING DOCTORS
// exports.getPendingDoctors = async (req, res) => {
//   try {
//     const hospital = await Hospital.findOne({
//       _id: req.user.hospitalId,
//       admin: req.user.id,
//       verificationStatus: "Verified",
//       isActive: true,
//     });

//     if (!hospital) {
//       return res.status(403).json({
//         success: false,
//         message: "Hospital access is not available.",
//       });
//     }

//     const doctors = await Doctor.find({
//       hospitalId: hospital._id,
//       verificationStatus: "Pending",
//     })
//       .populate("createdBy", "fullname email")
//       .sort({ createdAt: -1 });

//     return res.status(200).json({
//       success: true,
//       count: doctors.length,
//       doctors,
//     });
//   } catch (error) {
//     console.error("Pending doctors error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Unable to fetch pending doctors.",
//     });
//   }
// };

// // HOSPITAL ADMIN: APPROVE OR REJECT OWN HOSPITAL DOCTOR
// exports.reviewDoctor = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status, rejectionReason } = req.body;

//     if (!mongoose.isValidObjectId(id)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid doctor ID.",
//       });
//     }

//     if (!["Approved", "Rejected"].includes(status)) {
//       return res.status(400).json({
//         success: false,
//         message: "Status must be Approved or Rejected.",
//       });
//     }

//     if (
//       status === "Rejected" &&
//       (typeof rejectionReason !== "string" ||
//         !rejectionReason.trim())
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Rejection reason is required.",
//       });
//     }

//     // Verify logged-in Hospital Admin owns this hospital.
//     const hospital = await Hospital.findOne({
//       _id: req.user.hospitalId,
//       admin: req.user.id,
//       verificationStatus: "Verified",
//       isActive: true,
//     });

//     if (!hospital) {
//       return res.status(403).json({
//         success: false,
//         message: "Hospital access is not available.",
//       });
//     }

//     // Only doctors belonging to this hospital can be reviewed.
//     const doctor = await Doctor.findOne({
//       _id: id,
//       hospitalId: hospital._id,
//       verificationStatus: "Pending",
//     });

//     if (!doctor) {
//       return res.status(404).json({
//         success: false,
//         message:
//           "Pending doctor not found in your hospital.",
//       });
//     }

//     doctor.verificationStatus = status;
//     doctor.rejectionReason =
//       status === "Rejected" ? rejectionReason.trim() : "";

//     doctor.reviewedBy = req.user.id;
//     doctor.reviewedAt = new Date();

//     await doctor.save();

//     return res.status(200).json({
//       success: true,
//       message: `Doctor ${status.toLowerCase()} successfully.`,
//       doctor,
//     });
//   } catch (error) {
//     console.error("Doctor review error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Unable to review doctor.",
//     });
//   }
// };
// const Doctor = require("../models/Doctor");

// exports.getAllDoctors = async (req, res) => {
//   try {
//     const doctors = await Doctor.find({})
//       .populate("hospitalId", "hospitalName address")
//       .sort({ createdAt: -1 })
//       .lean();

//     return res.status(200).json({
//       success: true,
//       count: doctors.length,
//       doctors,
//     });
//   } catch (error) {
//     console.error("Get all doctors:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Unable to fetch doctors.",
//     });
//   }
// };
const mongoose = require("mongoose");
const Doctor = require("../models/Doctor");
const Hospital = require("../models/Hospital");

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Returns { hospitalId } for hospital_admin, {} for super_admin,
// or null after sending an error response.
const getScope = async (req, res) => {
  if (req.user.role !== "hospital_admin") return {};

  if (!req.user.hospitalId) {
    res.status(403).json({ success: false, message: "Hospital is not assigned to this account." });
    return null;
  }

  const hospital = await Hospital.findOne({
    _id: req.user.hospitalId,
    admin: req.user.id,
    verificationStatus: "Verified",
    isActive: true,
  }).select("_id");

  if (!hospital) {
    res.status(403).json({ success: false, message: "Hospital access denied or inactive." });
    return null;
  }

  return { hospitalId: hospital._id };
};

// GET /api/admin/doctors
exports.getDoctors = async (req, res) => {
  try {
    const scope = await getScope(req, res);
    if (!scope) return;

    const filter = { ...scope };
    const { search, status, page = 1, limit = 20 } = req.query;

    if (status && status !== "All") {
      if (!["Pending", "Approved", "Rejected"].includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid verification status." });
      }
      filter.verificationStatus = status;
    }

    if (search?.trim()) {
      const regex = new RegExp(escapeRegex(search.trim()), "i");
      filter.$or = [
        { name: regex },
        { email: regex },
        { specialty: regex },
        { qualification: regex },
        { medicalRegistrationNumber: regex },
      ];
    }

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

    const [doctors, total, pending, approved, rejected] = await Promise.all([
      Doctor.find(filter)
        .populate("hospitalId", "hospitalName address.city")
        .populate("createdBy", "fullname email")
        .populate("reviewedBy", "fullname email")
        .sort({ createdAt: -1 })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      Doctor.countDocuments(filter),
      Doctor.countDocuments({ ...filter, verificationStatus: "Pending" }),
      Doctor.countDocuments({ ...filter, verificationStatus: "Approved" }),
      Doctor.countDocuments({ ...filter, verificationStatus: "Rejected" }),
    ]);

    return res.status(200).json({
      success: true,
      doctors,
      statistics: { total, pending, approved, rejected },
      pagination: { total, page: pageNumber, limit: pageSize, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (error) {
    console.error("getDoctors error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch doctors." });
  }
};

// GET /api/admin/doctors/pending
exports.getPendingDoctors = async (req, res) => {
  try {
    const scope = await getScope(req, res);
    if (!scope) return;

    const doctors = await Doctor.find({ ...scope, verificationStatus: "Pending" })
      .populate("hospitalId", "hospitalName address.city")
      .populate("createdBy", "fullname email")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ success: true, count: doctors.length, doctors });
  } catch (error) {
    console.error("getPendingDoctors error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch pending doctors." });
  }
};

// PATCH /api/admin/doctors/:id/review   body: { status: "Approved"|"Rejected", rejectionReason? }
exports.reviewDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid doctor ID." });
    }

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be Approved or Rejected." });
    }

    if (status === "Rejected" && (typeof rejectionReason !== "string" || !rejectionReason.trim())) {
      return res.status(400).json({ success: false, message: "Rejection reason is required." });
    }

    const scope = await getScope(req, res);
    if (!scope) return;

    const doctor = await Doctor.findOne({ _id: id, ...scope });

    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found or access denied." });
    }

    if (doctor.verificationStatus !== "Pending") {
      return res.status(409).json({ success: false, message: "Doctor is not awaiting review." });
    }

    const hospital = await Hospital.findById(doctor.hospitalId).select("verificationStatus isActive");

    if (!hospital || hospital.verificationStatus !== "Verified" || !hospital.isActive) {
      return res.status(409).json({ success: false, message: "Doctor's hospital is not verified or active." });
    }

    // Conditional update prevents duplicate concurrent reviews
    const updatedDoctor = await Doctor.findOneAndUpdate(
      { _id: doctor._id, verificationStatus: "Pending", ...scope },
      {
        $set: {
          verificationStatus: status,
          isActive: status === "Approved", // makes approved doctors visible publicly
          rejectionReason: status === "Rejected" ? rejectionReason.trim() : "",
          reviewedBy: req.user.id,
          reviewedAt: new Date(),
        },
      },
      { new: true, runValidators: true }
    )
      .populate("hospitalId", "hospitalName")
      .populate("reviewedBy", "fullname email");

    if (!updatedDoctor) {
      return res.status(409).json({ success: false, message: "Doctor has already been reviewed." });
    }

    return res.status(200).json({
      success: true,
      message: status === "Approved" ? "Doctor approved successfully." : "Doctor rejected successfully.",
      doctor: updatedDoctor,
    });
  } catch (error) {
    console.error("reviewDoctor error:", error);
    return res.status(500).json({ success: false, message: "Failed to review doctor." });
  }
};