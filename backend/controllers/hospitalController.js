// const mongoose = require("mongoose");
// const Hospital = require("../models/Hospital");
// const path = require("path");

// const imagePath = (file) => (file ? `/uploads/hospitals/${file.filename}` : "");
// const privateDocumentPath = (file) =>
//   file ? path.posix.join("private_uploads", "hospital-documents", file.filename) : "";


// const UserData = require("../models/User");

// const registeringUser = await UserData.findById(req.user.id);

// if (!registeringUser || !registeringUser.isActive) {
//   return res.status(401).json({
//     success: false,
//     message: "Please login with an active account.",
//   });
// }

// // Logged-in account should match the authorized hospital representative.
// if (
//   registeringUser.email !==
//   String(owner.email).trim().toLowerCase()
// ) {
//   return res.status(403).json({
//     success: false,
//     message: "Hospital owner email must match your account email.",
//   });
// }
// exports.registerHospital = async (req, res) => {
//   try {
//     let data;
//     try {
//       data = JSON.parse(req.body.hospitalData || "{}");
//     } catch {
//       return res.status(400).json({ success: false, message: "Invalid hospitalData JSON." });
//     }

//     const {
//       hospitalName, hospitalType, ownershipType, registrationNumber,
//       description, establishmentYear, email, phone, alternatePhone, website,
//       owner, address, specialties, departments, facilities, totalBeds,
//       consultationFee, doctors, emergencyAvailable, ambulanceAvailable, workingHours,
//     } = data;

//     if (
//       !hospitalName || !hospitalType || !ownershipType || !email || !phone ||
//       !owner?.name || !owner?.email || !owner?.phone ||
//       !address?.street || !address?.area || !address?.city ||
//       !address?.state || !address?.pincode
//     ) {
//       return res.status(400).json({ success: false, message: "Please fill in all required fields." });
//     }

//     const normalizedEmail = String(email).trim().toLowerCase();
//     const existingHospital = await Hospital.findOne({ email: normalizedEmail });
//     if (existingHospital) {
//       return res.status(409).json({ success: false, message: "A hospital with this email already exists." });
//     }

//     const files = req.files || {};
//     const registrationCertificate = files.registrationCertificate?.[0];
//     const ownerId = files.ownerId?.[0];
//     const fireSafety = files.fireSafety?.[0];
//     const biomedicalWaste = files.biomedicalWaste?.[0];
//     const accreditation = files.accreditation?.[0];
//     const additionalDocuments = [fireSafety, biomedicalWaste, accreditation]
//       .filter(Boolean)
//       .map(privateDocumentPath);

//     const hospital = await Hospital.create({
//       hospitalName: String(hospitalName).trim(),
//       hospitalType,
//       ownershipType,
//       registrationNumber,
//       description,
//       establishmentYear,
//       email: normalizedEmail,
//       phone,
//       alternatePhone,
//       website,
//       owner,
//       address,
//       specialties: Array.isArray(specialties) ? specialties : [],
//       departments: Array.isArray(departments) ? departments : [],
//       facilities: Array.isArray(facilities) ? facilities : [],
//       totalBeds: Number(totalBeds) || 0,
//       consultationFee: Number(consultationFee) || 0,
//       doctors: Array.isArray(doctors) ? doctors : [],
//       emergencyAvailable: Boolean(emergencyAvailable),
//       ambulanceAvailable: Boolean(ambulanceAvailable),
//       workingHours: Array.isArray(workingHours) ? workingHours : [],
//       documents: {
//         registrationCertificate: privateDocumentPath(registrationCertificate),
//         ownerIdProof: privateDocumentPath(ownerId),
//         medicalLicense: "",
//         additionalDocuments,
//       },
//       logo: imagePath(files.logo?.[0]),
//       images: (files.images || []).map(imagePath),
//       verificationStatus: "Pending",
//       isActive: false,
//     });

//     return res.status(201).json({
//       success: true,
//       message: "Hospital registered successfully. Awaiting verification.",
//       hospital,
//     });
//   } catch (error) {
//     console.error("Register hospital error:", error);
//     if (error.name === "ValidationError") {
//       return res.status(400).json({ success: false, message: error.message });
//     }
//     if (error.code === 11000) {
//       return res.status(409).json({ success: false, message: "A hospital with this email already exists." });
//     }
//     return res.status(500).json({ success: false, message: "Internal server error." });
//   }
// };

// exports.getAllHospitals = async (_req, res) => {
//   try {
//     const hospitals = await Hospital.find().sort({ createdAt: -1 });
//     return res.status(200).json({ success: true, count: hospitals.length, hospitals });
//   } catch (error) {
//     console.error("Get hospitals error:", error);
//     return res.status(500).json({ success: false, message: "Failed to fetch hospitals." });
//   }
// };

// exports.getHospitalById = async (req, res) => {
//   try {
//     if (!mongoose.isValidObjectId(req.params.id)) {
//       return res.status(400).json({ success: false, message: "Invalid hospital ID." });
//     }
//     const hospital = await Hospital.findById(req.params.id);
//     if (!hospital) return res.status(404).json({ success: false, message: "Hospital not found." });
//     return res.status(200).json({ success: true, hospital });
//   } catch (error) {
//     console.error("Get hospital error:", error);
//     return res.status(500).json({ success: false, message: "Failed to fetch hospital." });
//   }
// };

// exports.updateHospital = async (req, res) => {
//   try {
//     if (!mongoose.isValidObjectId(req.params.id)) {
//       return res.status(400).json({ success: false, message: "Invalid hospital ID." });
//     }
//     const { verificationStatus, isActive, admin, ...updateData } = req.body;
//     const hospital = await Hospital.findByIdAndUpdate(
//       req.params.id,
//       { $set: updateData },
//       { new: true, runValidators: true }
//     );
//     if (!hospital) return res.status(404).json({ success: false, message: "Hospital not found." });
//     return res.status(200).json({ success: true, message: "Hospital updated successfully.", hospital });
//   } catch (error) {
//     console.error("Update hospital error:", error);
//     return res.status(400).json({ success: false, message: error.message || "Failed to update hospital." });
//   }
// };

// exports.deleteHospital = async (req, res) => {
//   try {
//     if (!mongoose.isValidObjectId(req.params.id)) {
//       return res.status(400).json({ success: false, message: "Invalid hospital ID." });
//     }
//     const hospital = await Hospital.findByIdAndDelete(req.params.id);
//     if (!hospital) return res.status(404).json({ success: false, message: "Hospital not found." });
//     return res.status(200).json({ success: true, message: "Hospital deleted successfully." });
//   } catch (error) {
//     console.error("Delete hospital error:", error);
//     return res.status(500).json({ success: false, message: "Failed to delete hospital." });
//   }
// };

const mongoose = require("mongoose");
const path = require("path");

const Hospital = require("../models/Hospital");
const UserData = require("../models/User");

const imagePath = (file) =>
  file ? `/uploads/hospitals/${file.filename}` : "";

const privateDocumentPath = (file) =>
  file
    ? path.posix.join(
        "private_uploads",
        "hospital-documents",
        file.filename
      )
    : "";

const normalizeEmail = (email) =>
  String(email || "").trim().toLowerCase();

const isValidId = (id) => mongoose.isValidObjectId(id);

// REGISTER HOSPITAL
// Route must use authenticate.
// Hospital Admin access is not granted until Main Admin approves.
exports.registerHospital = async (req, res) => {
  try {
    let data;

    try {
      data = JSON.parse(req.body.hospitalData || "{}");
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid hospitalData JSON.",
      });
    }

    const {
      hospitalName,
      hospitalType,
      ownershipType,
      registrationNumber,
      description,
      establishmentYear,
      email,
      phone,
      alternatePhone,
      website,
      owner,
      address,
      specialties,
      departments,
      facilities,
      totalBeds,
      consultationFee,
      doctors,
      emergencyAvailable,
      ambulanceAvailable,
      workingHours,
    } = data;

    if (
      !hospitalName?.trim() ||
      !hospitalType ||
      !ownershipType ||
      !email ||
      !phone ||
      !owner?.name?.trim() ||
      !owner?.email ||
      !owner?.phone ||
      !address?.street?.trim() ||
      !address?.area?.trim() ||
      !address?.city?.trim() ||
      !address?.state?.trim() ||
      !address?.pincode
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required hospital fields.",
      });
    }

    const normalizedEmail = normalizeEmail(email);
    const normalizedOwnerEmail = normalizeEmail(owner.email);

    // Applicant must be an authenticated, active account.
    const applicant = await UserData.findById(req.user.id);

    if (!applicant || !applicant.isActive) {
      return res.status(401).json({
        success: false,
        message: "Please login with an active account.",
      });
    }

    // Do not allow arbitrary users to create hospitals for other people.
    if (applicant.email !== normalizedOwnerEmail) {
      return res.status(403).json({
        success: false,
        message: "Owner email must match the logged-in account.",
      });
    }

    // One hospital application per account in this initial design.
    const existingApplication = await Hospital.findOne({
      admin: applicant._id,
    });

    if (existingApplication) {
      return res.status(409).json({
        success: false,
        message: "Your account already has a hospital application.",
      });
    }

    const existingHospital = await Hospital.findOne({
      email: normalizedEmail,
    });

    if (existingHospital) {
      return res.status(409).json({
        success: false,
        message: "A hospital with this email already exists.",
      });
    }

    const files = req.files || {};

    const registrationCertificate =
      files.registrationCertificate?.[0];

    const ownerId = files.ownerId?.[0];
    const fireSafety = files.fireSafety?.[0];
    const biomedicalWaste = files.biomedicalWaste?.[0];
    const accreditation = files.accreditation?.[0];

    const additionalDocuments = [
      fireSafety,
      biomedicalWaste,
      accreditation,
    ]
      .filter(Boolean)
      .map(privateDocumentPath);

    const hospital = await Hospital.create({
      hospitalName: hospitalName.trim(),
      hospitalType,
      ownershipType,
      registrationNumber,
      description,
      establishmentYear,
      email: normalizedEmail,
      phone,
      alternatePhone,
      website,

      owner: {
        name: owner.name.trim(),
        email: normalizedOwnerEmail,
        phone: owner.phone,
        designation:
          owner.designation || "Hospital Administrator",
      },

      address,
      specialties: Array.isArray(specialties) ? specialties : [],
      departments: Array.isArray(departments) ? departments : [],
      facilities: Array.isArray(facilities) ? facilities : [],
      totalBeds: Number(totalBeds) || 0,
      consultationFee: Number(consultationFee) || 0,
      doctors: Array.isArray(doctors) ? doctors : [],
      emergencyAvailable: emergencyAvailable === true,
      ambulanceAvailable: ambulanceAvailable === true,
      workingHours: Array.isArray(workingHours) ? workingHours : [],

      documents: {
        registrationCertificate:
          privateDocumentPath(registrationCertificate),
        ownerIdProof: privateDocumentPath(ownerId),
        medicalLicense: "",
        additionalDocuments,
      },

      logo: imagePath(files.logo?.[0]),
      images: (files.images || []).map(imagePath),

      verificationStatus: "Pending",
      rejectionReason: "",
      isActive: false,

      // Link application to authenticated user.
      admin: applicant._id,
    });

    return res.status(201).json({
      success: true,
      message:
        "Hospital registered successfully. Awaiting Main Admin verification.",
      hospital: {
        _id: hospital._id,
        hospitalName: hospital.hospitalName,
        verificationStatus: hospital.verificationStatus,
        isActive: hospital.isActive,
      },
    });
  } catch (error) {
    console.error("Register hospital error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A hospital with this email already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to register hospital.",
    });
  }
};

// PUBLIC: APPROVED HOSPITALS ONLY
exports.getAllHospitals = async (_req, res) => {
  try {
    const hospitals = await Hospital.find({
      verificationStatus: "Verified",
      isActive: true,
    })
      .select(
        "hospitalName hospitalType description email phone website address specialties departments facilities totalBeds emergencyAvailable ambulanceAvailable workingHours logo images"
      )
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: hospitals.length,
      hospitals,
    });
  } catch (error) {
    console.error("Get hospitals error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch hospitals.",
    });
  }
};

// PUBLIC: SINGLE APPROVED HOSPITAL ONLY
exports.getHospitalById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid hospital ID.",
      });
    }

    const hospital = await Hospital.findOne({
      _id: req.params.id,
      verificationStatus: "Verified",
      isActive: true,
    })
      .select(
        "hospitalName hospitalType description email phone website address specialties departments facilities totalBeds emergencyAvailable ambulanceAvailable workingHours logo images"
      )
      .lean();

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found.",
      });
    }

    return res.status(200).json({
      success: true,
      hospital,
    });
  } catch (error) {
    console.error("Get hospital error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch hospital.",
    });
  }
};

// HOSPITAL ADMIN: UPDATE OWN HOSPITAL PROFILE ONLY
// Route must use authenticate + allowRoles("hospital_admin").
exports.updateHospital = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid hospital ID.",
      });
    }

    // Never allow client to change ownership or approval fields.
    const {
      verificationStatus,
      isActive,
      admin,
      reviewedBy,
      reviewedAt,
      rejectionReason,
      _id,
      ...updateData
    } = req.body;

    const hospital = await Hospital.findOne({
      _id: req.params.id,
      admin: req.user.id,
      verificationStatus: "Verified",
      isActive: true,
    });

    if (!hospital || req.user.hospitalId?.toString() !== hospital._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You cannot update this hospital.",
      });
    }

    // Only allow known profile fields.
    const allowedFields = [
      "description",
      "phone",
      "alternatePhone",
      "website",
      "address",
      "specialties",
      "departments",
      "facilities",
      "totalBeds",
      "emergencyAvailable",
      "ambulanceAvailable",
      "workingHours",
      "logo",
      "images",
    ];

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(updateData, field)) {
        hospital.set(field, updateData[field]);
      }
    }

    await hospital.save();

    return res.status(200).json({
      success: true,
      message: "Hospital profile updated successfully.",
      hospital,
    });
  } catch (error) {
    console.error("Update hospital error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update hospital.",
    });
  }
};

// Deletion should be handled by a separate, audited
// Main Admin workflow. Do not expose a public delete endpoint.
exports.deleteHospital = async (_req, res) => {
  return res.status(403).json({
    success: false,
    message:
      "Hospital deletion is restricted. Contact the platform administrator.",
  });
};
