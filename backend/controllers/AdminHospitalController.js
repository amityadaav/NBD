
// const mongoose = require("mongoose");
// const Hospital = require("../models/Hospital");
// const User = require("../models/User");


// exports.getPendingHospitals = async (req, res) => {
//   try {
//     const hospitals = await Hospital.find({
//       verificationStatus: {
//         $in: ["Pending", "Under Review"],
//       },
//     })
//       .populate("admin", "fullname email phone")
//       .sort({ createdAt: 1 })
//       .lean();

//     return res.status(200).json({
//       success: true,
//       count: hospitals.length,
//       hospitals,
//     });
//   } catch (error) {
//     console.error("Get Pending Hospitals Error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Unable to fetch hospitals.",
//       error: error.message,
//     });
//   }
// };



// // exports.reviewHospital = async (req, res) => {
// //   try {
// //     const { status, rejectionReason } = req.body;
// //     const { id } = req.params;

// //     if (!["Verified", "Rejected"].includes(status)) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Invalid verification status.",
// //       });
// //     }

// //     if (
// //       status === "Rejected" &&
// //       (typeof rejectionReason !== "string" ||
// //         !rejectionReason.trim())
// //     ) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Rejection reason is required.",
// //       });
// //     }

// //     const hospital = await Hospital.findById(id);

// //     if (!hospital) {
// //       return res.status(404).json({
// //         success: false,
// //         message: "Hospital not found.",
// //       });
// //     }

// //     if (
// //       !["Pending", "Under Review"].includes(
// //         hospital.verificationStatus
// //       )
// //     ) {
// //       return res.status(409).json({
// //         success: false,
// //         message: "Hospital is not awaiting review.",
// //       });
// //     }

// //     // Confirm applicant exists before approval.
// //     let applicant = null;

// //     if (status === "Verified") {
// //       applicant = await User.findById(hospital.admin);

// //       if (!applicant) {
// //         return res.status(409).json({
// //           success: false,
// //           message: "Hospital applicant account not found.",
// //         });
// //       }

// //       // Avoid taking over another hospital's admin account.
// //       if (
// //         applicant.hospitalId &&
// //         applicant.hospitalId.toString() !==
// //           hospital._id.toString()
// //       ) {
// //         return res.status(409).json({
// //           success: false,
// //           message: "Applicant is linked to another hospital.",
// //         });
// //       }
// //     }

// //     hospital.verificationStatus = status;
// //     hospital.isActive = status === "Verified";
// //     hospital.rejectionReason =
// //       status === "Rejected"
// //         ? rejectionReason.trim()
// //         : "";
// //     hospital.reviewedBy = req.user.id;
// //     hospital.reviewedAt = new Date();

// //     await hospital.save();

// //     if (status === "Verified") {
// //       await User.updateOne(
// //         { _id: applicant._id },
// //         {
// //           $set: {
// //             role: "hospital_admin",
// //             hospitalId: hospital._id,
// //             isActive: true,
// //           },
// //         }
// //       );
// //     }

// //     return res.status(200).json({
// //       success: true,
// //       message: `Hospital ${status.toLowerCase()} successfully.`,
// //       hospital,
// //     });
// //   } catch (error) {
// //     console.error("Hospital review error:", error);

// //     return res.status(500).json({
// //       success: false,
// //       message: "Unable to review hospital.",
// //     });
// //   }
// // };

// exports.reviewHospital = async (req, res) => {
//   const session = await mongoose.startSession();

//   try {
//     const { status, rejectionReason } = req.body;
//     const { id } = req.params;

//     if (!mongoose.isValidObjectId(id)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid hospital ID.",
//       });
//     }

//     if (!["Verified", "Rejected"].includes(status)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid verification status.",
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

//     let result;

//     await session.withTransaction(async () => {
//       const hospital = await Hospital.findById(id).session(session);

//       if (!hospital) {
//         const error = new Error("Hospital not found.");
//         error.statusCode = 404;
//         throw error;
//       }

//       if (
//         !["Pending", "Under Review"].includes(
//           hospital.verificationStatus
//         )
//       ) {
//         const error = new Error(
//           "Hospital is not awaiting review."
//         );
//         error.statusCode = 409;
//         throw error;
//       }

//       if (status === "Verified") {
//         const applicant = await User.findById(
//           hospital.admin
//         ).session(session);

//         if (!applicant) {
//           const error = new Error(
//             "Hospital applicant account not found."
//           );
//           error.statusCode = 409;
//           throw error;
//         }

//         if (
//           !["patient", "hospital_admin"].includes(
//             applicant.role
//           )
//         ) {
//           const error = new Error(
//             "Applicant role is not eligible."
//           );
//           error.statusCode = 409;
//           throw error;
//         }

//         if (
//           applicant.hospitalId &&
//           applicant.hospitalId.toString() !==
//             hospital._id.toString()
//         ) {
//           const error = new Error(
//             "Applicant is linked to another hospital."
//           );
//           error.statusCode = 409;
//           throw error;
//         }

//         applicant.role = "hospital_admin";
//         applicant.hospitalId = hospital._id;
//         applicant.isActive = true;

//         hospital.verificationStatus = "Verified";
//         hospital.isActive = true;
//         hospital.rejectionReason = "";

//         await applicant.save({ session });
//       } else {
//         hospital.verificationStatus = "Rejected";
//         hospital.isActive = false;
//         hospital.rejectionReason = rejectionReason.trim();
//       }

//       hospital.reviewedBy = req.user.id;
//       hospital.reviewedAt = new Date();

//       await hospital.save({ session });

//       result = {
//         hospitalId: hospital._id,
//         hospitalName: hospital.hospitalName,
//         verificationStatus: hospital.verificationStatus,
//         isActive: hospital.isActive,
//         applicantRole:
//           status === "Verified" ? "hospital_admin" : undefined,
//       };
//     });

//     return res.status(200).json({
//       success: true,
//       message:
//         status === "Verified"
//           ? "Hospital verified and applicant promoted to hospital_admin."
//           : "Hospital rejected successfully.",
//       hospital: result,
//     });
//   } catch (error) {
//     console.error("Hospital review error:", error);

//     return res.status(error.statusCode || 500).json({
//       success: false,
//       message:
//         error.statusCode
//           ? error.message
//           : "Unable to review hospital.",
//     });
//   } finally {
//     await session.endSession();
//   }
// };

const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const Hospital = require("../models/Hospital");
const User = require("../models/User");
const Doctor = require("../models/Doctor");

const PRIVATE_ROOT = path.resolve(__dirname, "../private_uploads");
const STATUSES = ["Pending", "Under Review", "Verified", "Rejected"];
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// GET /api/admin/hospitals?status=&search=&page=&limit=
exports.getHospitals = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status && status !== "All") {
      if (!STATUSES.includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid status filter." });
      }
      filter.verificationStatus =
        status === "Pending" ? { $in: ["Pending", "Under Review"] } : status;
    }

    if (search?.trim()) {
      const regex = new RegExp(escapeRegex(search.trim()), "i");
      filter.$or = [
        { hospitalName: regex },
        { email: regex },
        { phone: regex },
        { "address.city": regex },
      ];
    }

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

    const [hospitals, total, all, pending, verified, rejected] = await Promise.all([
      Hospital.find(filter)
        .populate("admin", "fullname email phone")
        .sort({ createdAt: -1 })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      Hospital.countDocuments(filter),
      Hospital.countDocuments(),
      Hospital.countDocuments({ verificationStatus: { $in: ["Pending", "Under Review"] } }),
      Hospital.countDocuments({ verificationStatus: "Verified" }),
      Hospital.countDocuments({ verificationStatus: "Rejected" }),
    ]);

    return res.status(200).json({
      success: true,
      hospitals,
      statistics: { total: all, pending, verified, rejected },
      pagination: { total, page: pageNumber, limit: pageSize, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (error) {
    console.error("Get hospitals error:", error);
    return res.status(500).json({ success: false, message: "Unable to fetch hospitals." });
  }
};

// GET /api/admin/hospitals/pending
exports.getPendingHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find({
      verificationStatus: { $in: ["Pending", "Under Review"] },
    })
      .populate("admin", "fullname email phone")
      .sort({ createdAt: 1 })
      .lean();

    return res.status(200).json({ success: true, count: hospitals.length, hospitals });
  } catch (error) {
    console.error("Get pending hospitals error:", error);
    return res.status(500).json({ success: false, message: "Unable to fetch hospitals." });
  }
};

// GET /api/admin/hospitals/:id
exports.getHospitalById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid hospital ID." });
    }

    const hospital = await Hospital.findById(id)
      .populate("admin", "fullname email phone")
      .populate("reviewedBy", "fullname email")
      .lean();

    if (!hospital) {
      return res.status(404).json({ success: false, message: "Hospital not found." });
    }

    const doctorCount = await Doctor.countDocuments({ hospitalId: hospital._id });

    return res.status(200).json({ success: true, hospital: { ...hospital, doctorCount } });
  } catch (error) {
    console.error("Get hospital error:", error);
    return res.status(500).json({ success: false, message: "Unable to fetch hospital." });
  }
};

// GET /api/admin/hospitals/:id/document?type=registrationCertificate|ownerIdProof|additional&index=0
exports.getHospitalDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, index } = req.query;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid hospital ID." });
    }

    const hospital = await Hospital.findById(id).select("documents").lean();
    if (!hospital) {
      return res.status(404).json({ success: false, message: "Hospital not found." });
    }

    const docs = hospital.documents || {};
    const relative =
      type === "registrationCertificate" ? docs.registrationCertificate
      : type === "ownerIdProof" ? docs.ownerIdProof
      : type === "additional" ? (docs.additionalDocuments || [])[Number(index) || 0]
      : null;

    if (!relative) {
      return res.status(404).json({ success: false, message: "Document not found." });
    }

    const absolute = path.resolve(__dirname, "..", relative);

    if (!absolute.startsWith(PRIVATE_ROOT + path.sep) || !fs.existsSync(absolute)) {
      return res.status(404).json({ success: false, message: "Document file not found." });
    }

    return res.sendFile(absolute);
  } catch (error) {
    console.error("Get hospital document error:", error);
    return res.status(500).json({ success: false, message: "Unable to open document." });
  }
};

// PATCH /api/admin/hospitals/:id/review   (no transactions: works on standalone MongoDB)
exports.reviewHospital = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid hospital ID." });
    }

    if (!["Verified", "Rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid verification status." });
    }

    if (status === "Rejected" && (typeof rejectionReason !== "string" || !rejectionReason.trim())) {
      return res.status(400).json({ success: false, message: "Rejection reason is required." });
    }

    const hospital = await Hospital.findById(id).select("verificationStatus admin");

    if (!hospital) {
      return res.status(404).json({ success: false, message: "Hospital not found." });
    }

    if (!["Pending", "Under Review"].includes(hospital.verificationStatus)) {
      return res.status(409).json({ success: false, message: "Hospital is not awaiting review." });
    }

    let applicant = null;

    if (status === "Verified") {
      applicant = await User.findById(hospital.admin);

      if (!applicant) {
        return res.status(409).json({ success: false, message: "Hospital applicant account not found." });
      }
      if (!["patient", "hospital_admin"].includes(applicant.role)) {
        return res.status(409).json({ success: false, message: "Applicant role is not eligible." });
      }
      if (applicant.hospitalId && applicant.hospitalId.toString() !== hospital._id.toString()) {
        return res.status(409).json({ success: false, message: "Applicant is linked to another hospital." });
      }
    }

    // Atomic: only succeeds if it is still pending (prevents double review)
    const updated = await Hospital.findOneAndUpdate(
      { _id: id, verificationStatus: { $in: ["Pending", "Under Review"] } },
      {
        $set: {
          verificationStatus: status,
          isActive: status === "Verified",
          rejectionReason: status === "Rejected" ? rejectionReason.trim() : "",
          reviewedBy: req.user.id,
          reviewedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!updated) {
      return res.status(409).json({ success: false, message: "Hospital has already been reviewed." });
    }

    if (status === "Verified") {
      try {
        await User.updateOne(
          { _id: applicant._id },
          { $set: { role: "hospital_admin", hospitalId: updated._id, isActive: true } }
        );
      } catch (userError) {
        // Roll back the hospital review so data stays consistent
        await Hospital.updateOne(
          { _id: updated._id },
          { $set: { verificationStatus: "Pending", isActive: false, reviewedBy: null, reviewedAt: null } }
        );
        throw userError;
      }
    }

    return res.status(200).json({
      success: true,
      message:
        status === "Verified"
          ? "Hospital verified and applicant promoted to hospital_admin."
          : "Hospital rejected successfully.",
      hospital: {
        hospitalId: updated._id,
        hospitalName: updated.hospitalName,
        verificationStatus: updated.verificationStatus,
        isActive: updated.isActive,
      },
    });
  } catch (error) {
    console.error("Hospital review error:", error);
    return res.status(500).json({ success: false, message: "Unable to review hospital." });
  }
};