
// const mongoose = require("mongoose");
// const path = require("path");

// const Hospital = require("../models/Hospital");
// const User = require("../models/User");
// const Doctor = require("../models/Doctor");
// // ================= HELPERS =================

// const normalizeEmail = (email) =>
//   String(email || "").trim().toLowerCase();

// const isValidId = (id) =>
//   mongoose.isValidObjectId(id);

// const isNonEmptyString = (value) =>
//   typeof value === "string" && value.trim().length > 0;

// const getUploadedFilePath = (file, folder) => {
//   if (!file) return "";
//   return path.posix.join(folder, file.filename);
// };

// const getPrivateDocumentPath = (file) =>
//   getUploadedFilePath(file, "private_uploads/hospital-documents");

// const getImagePath = (file) =>
//   getUploadedFilePath(file, "uploads/hospitals");

// // ================= REGISTER HOSPITAL =================
// // POST /api/hospitals/register
// // Requires authenticate middleware
// // Supports JSON and multipart/form-data

// exports.registerHospital = async (req, res) => {
//   try {
//     let data = {};

//     // Direct JSON request
//     if (req.is("application/json")) {
//       data = req.body || {};
//     } else {
//       // Multipart request with hospitalData field
//       try {
//         const rawData = req.body?.hospitalData;

//         data =
//           typeof rawData === "string"
//             ? JSON.parse(rawData)
//             : rawData || {};
//       } catch {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid hospitalData JSON.",
//         });
//       }
//     }

//     if (
//       !data ||
//       typeof data !== "object" ||
//       Array.isArray(data)
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid hospital data.",
//       });
//     }

//     const {
//       hospitalName,
//       hospitalType,
//       ownershipType,
//       registrationNumber,
//       description,
//       establishmentYear,
//       email,
//       phone,
//       alternatePhone,
//       website,
//       owner,
//       address,
//       specialties,
//       departments,
//       facilities,
//       totalBeds,
//       emergencyAvailable,
//       ambulanceAvailable,
//       workingHours,
//     } = data;

//     // Required field validation
//     const missingFields = [];

//     if (!isNonEmptyString(hospitalName))
//       missingFields.push("hospitalName");

//     if (!isNonEmptyString(hospitalType))
//       missingFields.push("hospitalType");

//     if (!isNonEmptyString(ownershipType))
//       missingFields.push("ownershipType");

//     if (!isNonEmptyString(email))
//       missingFields.push("email");

//     if (!isNonEmptyString(phone))
//       missingFields.push("phone");

//     if (!isNonEmptyString(owner?.name))
//       missingFields.push("owner.name");

//     if (!isNonEmptyString(owner?.email))
//       missingFields.push("owner.email");

//     if (!isNonEmptyString(owner?.phone))
//       missingFields.push("owner.phone");

//     if (!isNonEmptyString(address?.street))
//       missingFields.push("address.street");

//     if (!isNonEmptyString(address?.area))
//       missingFields.push("address.area");

//     if (!isNonEmptyString(address?.city))
//       missingFields.push("address.city");

//     if (!isNonEmptyString(address?.state))
//       missingFields.push("address.state");

//     if (!isNonEmptyString(address?.pincode))
//       missingFields.push("address.pincode");

//     if (missingFields.length > 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Please fill in all required hospital fields.",
//         missingFields,
//       });
//     }

//     // Authenticated user validation
//     if (!req.user?.id || !isValidId(req.user.id)) {
//       return res.status(401).json({
//         success: false,
//         message: "Please login with a valid account.",
//       });
//     }

//     const applicant = await User.findById(req.user.id);

//     if (!applicant || applicant.isActive === false) {
//       return res.status(401).json({
//         success: false,
//         message: "Account not found or inactive.",
//       });
//     }

//     const normalizedEmail = normalizeEmail(email);
//     const normalizedOwnerEmail = normalizeEmail(owner.email);

//     // Applicant must be the authorized representative
//     if (normalizeEmail(applicant.email) !== normalizedOwnerEmail) {
//       return res.status(403).json({
//         success: false,
//         message: "Owner email must match the logged-in account.",
//       });
//     }

//     // Allow only eligible applicant roles
//     if (!["patient", "hospital_admin"].includes(applicant.role)) {
//       return res.status(403).json({
//         success: false,
//         message: "Your account is not eligible to register a hospital.",
//       });
//     }

//     // Account already linked to a hospital
//     if (applicant.hospitalId) {
//       return res.status(409).json({
//         success: false,
//         message: "Your account is already linked to a hospital.",
//       });
//     }

//     // Prevent duplicate application by the same applicant
//     const existingApplication = await Hospital.findOne({
//       admin: applicant._id,
//     });

//     if (existingApplication) {
//       return res.status(409).json({
//         success: false,
//         message: "Your account already has a hospital application.",
//       });
//     }

//     // Prevent duplicate hospital email
//     const existingHospital = await Hospital.findOne({
//       email: normalizedEmail,
//     });

//     if (existingHospital) {
//       return res.status(409).json({
//         success: false,
//         message: "A hospital with this email already exists.",
//       });
//     }

//     // Files are optional here; upload middleware must be configured
//     const files = req.files || {};

//     const registrationCertificate =
//       files.registrationCertificate?.[0];

//     const ownerId = files.ownerId?.[0];
//     const fireSafety = files.fireSafety?.[0];
//     const biomedicalWaste = files.biomedicalWaste?.[0];
//     const accreditation = files.accreditation?.[0];

//     const additionalDocuments = [
//       fireSafety,
//       biomedicalWaste,
//       accreditation,
//     ]
//       .filter(Boolean)
//       .map(getPrivateDocumentPath);

//     // Ignore client-supplied admin/status/review fields
//     const hospital = await Hospital.create({
//       hospitalName: hospitalName.trim(),
//       hospitalType,
//       ownershipType,
//       registrationNumber,
//       description,
//       establishmentYear,

//       email: normalizedEmail,
//       phone: phone.trim(),
//       alternatePhone,
//       website,

//       owner: {
//         name: owner.name.trim(),
//         email: normalizedOwnerEmail,
//         phone: owner.phone.trim(),
//         designation:
//           owner.designation?.trim() || "Hospital Administrator",
//       },

//       address,

//       specialties: Array.isArray(specialties) ? specialties : [],
//       departments: Array.isArray(departments) ? departments : [],
//       facilities: Array.isArray(facilities) ? facilities : [],

//       totalBeds:
//         totalBeds === undefined || totalBeds === null
//           ? 0
//           : Number(totalBeds),

//       emergencyAvailable: emergencyAvailable === true,
//       ambulanceAvailable: ambulanceAvailable === true,

//       workingHours: Array.isArray(workingHours)
//         ? workingHours
//         : [],

//       documents: {
//         registrationCertificate:
//           getPrivateDocumentPath(registrationCertificate),

//         ownerIdProof: getPrivateDocumentPath(ownerId),

//         medicalLicense: "",

//         additionalDocuments,
//       },

//       logo: getImagePath(files.logo?.[0]),

//       images: (files.images || []).map(getImagePath),

//       verificationStatus: "Pending",
//       rejectionReason: "",
//       isActive: false,

//       reviewedBy: null,
//       reviewedAt: null,

//       // Trusted authenticated applicant
//       admin: applicant._id,
//     });

//     return res.status(201).json({
//       success: true,
//       message:
//         "Hospital registered successfully. Awaiting Main Admin verification.",
//       hospital: {
//         _id: hospital._id,
//         hospitalName: hospital.hospitalName,
//         verificationStatus: hospital.verificationStatus,
//         isActive: hospital.isActive,
//       },
//     });
//   }catch (error) {
//   console.error("REGISTER HOSPITAL ERROR:", error);
//   console.error("ERROR NAME:", error.name);
//   console.error("ERROR MESSAGE:", error.message);
//   console.error("ERROR STACK:", error.stack);

//   return res.status(500).json({
//     success: false,
//     message: "Hospital registration failed",
//     error: error.message,
//   });
// }
// };

// // ================= GET ALL VERIFIED HOSPITALS =================
// // GET /api/hospitals

// exports.getAllHospitals = async (req, res) => {
//   try {
//     const hospitals = await Hospital.find({
//       verificationStatus: "Verified",
//       isActive: true,
//     })
//       .select(
//         "hospitalName hospitalType description email phone website address specialties departments facilities totalBeds emergencyAvailable ambulanceAvailable workingHours logo images"
//       )
//       .sort({ createdAt: -1 })
//       .lean();

//     return res.status(200).json({
//       success: true,
//       count: hospitals.length,
//       hospitals,
//     });
//   } catch (error) {
//     console.error("Get hospitals error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch hospitals.",
//     });
//   }
// };

// // ================= GET HOSPITAL BY ID =================
// // GET /api/hospitals/:id

// exports.getHospitalById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!isValidId(id)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid hospital ID.",
//       });
//     }

//     const hospital = await Hospital.findOne({
//       _id: id,
//       verificationStatus: "Verified",
//       isActive: true,
//     })
//       .select(
//         "hospitalName hospitalType description email phone website address specialties departments facilities totalBeds emergencyAvailable ambulanceAvailable workingHours logo images"
//       )
//       .lean();

//     if (!hospital) {
//       return res.status(404).json({
//         success: false,
//         message: "Hospital not found.",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       hospital,
//     });
//   } catch (error) {
//     console.error("Get hospital by ID error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch hospital.",
//     });
//   }
// };

// // ================= GET MY HOSPITAL =================
// // GET /api/hospitals/my
// // Requires authentication

// exports.getMyHospital = async (req, res) => {
//   try {
//     if (!req.user?.id || !isValidId(req.user.id)) {
//       return res.status(401).json({
//         success: false,
//         message: "Unauthorized.",
//       });
//     }

//     const hospital = await Hospital.findOne({
//       admin: req.user.id,
//     }).lean();

//     if (!hospital) {
//       return res.status(404).json({
//         success: false,
//         message: "No hospital application found.",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       hospital,
//     });
//   } catch (error) {
//     console.error("Get my hospital error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch your hospital.",
//     });
//   }
// };

// // ================= UPDATE OWN HOSPITAL =================
// // PATCH /api/hospitals/:id
// // Requires authenticate + allowRoles("hospital_admin")

// exports.updateHospital = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!isValidId(id)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid hospital ID.",
//       });
//     }

//     const hospital = await Hospital.findOne({
//       _id: id,
//       admin: req.user.id,
//       verificationStatus: "Verified",
//       isActive: true,
//     });

//     if (
//       !hospital ||
//       req.user.hospitalId?.toString() !== hospital._id.toString()
//     ) {
//       return res.status(403).json({
//         success: false,
//         message: "You cannot update this hospital.",
//       });
//     }

//     // Only these fields can be updated
//     const allowedFields = [
//       "description",
//       "phone",
//       "alternatePhone",
//       "website",
//       "address",
//       "specialties",
//       "departments",
//       "facilities",
//       "totalBeds",
//       "emergencyAvailable",
//       "ambulanceAvailable",
//       "workingHours",
//       "logo",
//       "images",
//     ];

//     for (const field of allowedFields) {
//       if (
//         Object.prototype.hasOwnProperty.call(req.body || {}, field)
//       ) {
//         hospital.set(field, req.body[field]);
//       }
//     }

//     await hospital.save();

//     return res.status(200).json({
//       success: true,
//       message: "Hospital updated successfully.",
//       hospital,
//     });
//   } catch (error) {
//     console.error("Update hospital error:", error);

//     if (error.name === "ValidationError") {
//       return res.status(400).json({
//         success: false,
//         message: error.message,
//       });
//     }

//     return res.status(500).json({
//       success: false,
//       message: "Failed to update hospital.",
//     });
//   }
// };

// // ================= DELETE HOSPITAL =================
// // DELETE /api/hospitals/:id
// // Restricted to Super Admin, with an audited workflow recommended

// exports.deleteHospital = async (req, res) => {
//   return res.status(403).json({
//     success: false,
//     message:
//       "Hospital deletion is disabled. Use an audited admin workflow.",
//   });
// };

// // ================= GET PENDING HOSPITALS =================
// // GET /api/admin/hospitals/pending
// // Requires authenticate + allowRoles("super_admin")

// exports.getPendingHospitals = async (req, res) => {
//   try {
//     const hospitals = await Hospital.find({
//       verificationStatus: {
//         $in: ["Pending", "Under Review"],
//       },
//     })
//       .populate("admin", "fullname email phone role")
//       .sort({ createdAt: 1 })
//       .lean();

//     return res.status(200).json({
//       success: true,
//       count: hospitals.length,
//       hospitals,
//     });
//   } catch (error) {
//     console.error("Get pending hospitals error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch pending hospitals.",
//     });
//   }
// };

// // ================= REVIEW HOSPITAL =================
// // PATCH /api/admin/hospitals/:id/review
// // Body: { "status": "Verified" } or
// //       { "status": "Rejected", "rejectionReason": "..." }
// // Requires authenticate + allowRoles("super_admin")
// //
// // NOTE: Approval uses a MongoDB transaction.
// // MongoDB must run as a replica set or sharded cluster.

// exports.reviewHospital = async (req, res) => {
//   let session;

//   try {
//     const { id } = req.params;
//     const { status, rejectionReason } = req.body || {};

//     if (!isValidId(id)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid hospital ID.",
//       });
//     }

//     if (!["Verified", "Rejected"].includes(status)) {
//       return res.status(400).json({
//         success: false,
//         message: "Status must be Verified or Rejected.",
//       });
//     }

//     if (
//       status === "Rejected" &&
//       !isNonEmptyString(rejectionReason)
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Rejection reason is required.",
//       });
//     }

//     // Rejection does not require promoting an applicant account
//     if (status === "Rejected") {
//       const hospital = await Hospital.findOneAndUpdate(
//         {
//           _id: id,
//           verificationStatus: {
//             $in: ["Pending", "Under Review"],
//           },
//         },
//         {
//           $set: {
//             verificationStatus: "Rejected",
//             rejectionReason: rejectionReason.trim(),
//             isActive: false,
//             reviewedBy: req.user.id,
//             reviewedAt: new Date(),
//           },
//         },
//         {
//           new: true,
//           runValidators: true,
//         }
//       );

//       if (!hospital) {
//         return res.status(404).json({
//           success: false,
//           message: "Pending hospital application not found.",
//         });
//       }

//       return res.status(200).json({
//         success: true,
//         message: "Hospital application rejected.",
//         hospital: {
//           _id: hospital._id,
//           hospitalName: hospital.hospitalName,
//           verificationStatus: hospital.verificationStatus,
//           isActive: hospital.isActive,
//           rejectionReason: hospital.rejectionReason,
//         },
//       });
//     }

//     // Approval: atomically verify hospital and link admin
//     session = await mongoose.startSession();

//     let approvedHospital;

//     await session.withTransaction(async () => {
//       const hospital = await Hospital.findOne({
//         _id: id,
//         verificationStatus: {
//           $in: ["Pending", "Under Review"],
//         },
//       }).session(session);

//       if (!hospital) {
//         const error = new Error(
//           "Pending hospital application not found."
//         );
//         error.statusCode = 404;
//         throw error;
//       }

//       const applicant = await User.findById(
//         hospital.admin
//       ).session(session);

//       if (!applicant || applicant.isActive === false) {
//         const error = new Error(
//           "Applicant account not found or inactive."
//         );
//         error.statusCode = 404;
//         throw error;
//       }

//       if (
//         applicant.hospitalId &&
//         applicant.hospitalId.toString() !== hospital._id.toString()
//       ) {
//         const error = new Error(
//           "Applicant is already linked to another hospital."
//         );
//         error.statusCode = 409;
//         throw error;
//       }

//       if (!["patient", "hospital_admin"].includes(applicant.role)) {
//         const error = new Error(
//           "Applicant account is not eligible for hospital admin access."
//         );
//         error.statusCode = 409;
//         throw error;
//       }

//       hospital.verificationStatus = "Verified";
//       hospital.rejectionReason = "";
//       hospital.isActive = true;
//       hospital.reviewedBy = req.user.id;
//       hospital.reviewedAt = new Date();

//       await hospital.save({ session });

//       applicant.role = "hospital_admin";
//       applicant.hospitalId = hospital._id;

//       await applicant.save({ session });

//       approvedHospital = hospital;
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Hospital verified successfully.",
//       hospital: {
//         _id: approvedHospital._id,
//         hospitalName: approvedHospital.hospitalName,
//         verificationStatus: approvedHospital.verificationStatus,
//         isActive: approvedHospital.isActive,
//       },
//     });
//   } catch (error) {
//     console.error("Review hospital error:", error);

//     return res.status(error.statusCode || 500).json({
//       success: false,
//       message: error.statusCode
//         ? error.message
//         : "Failed to review hospital.",
//     });
//   } finally {
//     if (session) {
//       await session.endSession();
//     }
//   }
// };

const mongoose = require("mongoose");
const path = require("path");

const Hospital = require("../models/Hospital");
const Doctor = require("../models/Doctor");
const User = require("../models/User");

// ================= HELPERS =================

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();
const isValidId = (id) => mongoose.isValidObjectId(id);
const isNonEmptyString = (v) => typeof v === "string" && v.trim().length > 0;

const getUploadedFilePath = (file, folder) =>
  file ? path.posix.join(folder, file.filename) : "";

const getPrivateDocumentPath = (file) =>
  getUploadedFilePath(file, "private_uploads/hospital-documents");

const getImagePath = (file) => getUploadedFilePath(file, "uploads/hospitals");

const ALLOWED_DAYS = [
  "Monday", "Tuesday", "Wednesday", "Thursday",
  "Friday", "Saturday", "Sunday",
];

const parseJson = (raw, fallback) => {
  if (raw === undefined || raw === null || raw === "") return fallback;
  return typeof raw === "string" ? JSON.parse(raw) : raw;
};

const PUBLIC_HOSPITAL_FIELDS =
  "hospitalName hospitalType description email phone website address specialties departments facilities totalBeds emergencyAvailable ambulanceAvailable workingHours logo images";

// ================= REGISTER HOSPITAL =================
// POST /api/hospitals/register   (authenticate -> multer -> this)
// Works on standalone MongoDB (no transactions). If doctor creation
// fails, the hospital that was just created is deleted (rollback).

exports.registerHospital = async (req, res) => {
  let createdHospital = null;

  try {
    // ---------- Parse payload ----------
    let data;
    let doctors;

    try {
      data = req.is("application/json")
        ? req.body || {}
        : parseJson(req.body?.hospitalData, {});
    } catch {
      return res.status(400).json({ success: false, message: "Invalid hospitalData JSON." });
    }

    try {
      doctors = data?.doctors ?? parseJson(req.body?.doctors, []);
    } catch {
      return res.status(400).json({ success: false, message: "Invalid doctors JSON." });
    }

    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return res.status(400).json({ success: false, message: "Invalid hospital data." });
    }

    if (!Array.isArray(doctors) || doctors.length === 0) {
      return res.status(400).json({ success: false, message: "Please add at least one doctor." });
    }

    // ---------- Validate doctors ----------
    const cleanDoctors = [];

    for (let i = 0; i < doctors.length; i++) {
      const d = doctors[i];

      if (!d || typeof d !== "object" || Array.isArray(d)) {
        return res.status(400).json({ success: false, message: `Invalid doctor data at index ${i}.` });
      }

      const missing = ["name", "specialty", "qualification", "medicalRegistrationNumber"]
        .filter((f) => !isNonEmptyString(d[f]));

      if (missing.length) {
        return res.status(400).json({
          success: false,
          message: `Doctor ${i + 1} is missing required fields.`,
          missingFields: missing,
        });
      }

      const experience = Number(d.experience ?? 0);
      const consultationFee = Number(d.consultationFee);

      if (!Number.isFinite(experience) || experience < 0) {
        return res.status(400).json({ success: false, message: `Invalid experience for doctor ${i + 1}.` });
      }

      if (!Number.isFinite(consultationFee) || consultationFee < 0) {
        return res.status(400).json({ success: false, message: `Invalid consultation fee for doctor ${i + 1}.` });
      }

      let days = d.availableDays ?? [];
      if (typeof days === "string") {
        try { days = JSON.parse(days); } catch { days = [days]; }
      }

      if (!Array.isArray(days) || days.length === 0 || days.some((x) => !ALLOWED_DAYS.includes(x))) {
        return res.status(400).json({ success: false, message: `Invalid availableDays for doctor ${i + 1}.` });
      }

      cleanDoctors.push({
        name: d.name.trim(),
        email: normalizeEmail(d.email) || undefined,
        phone: d.phone ? String(d.phone).trim() : undefined,
        specialty: d.specialty.trim(),
        qualification: d.qualification.trim(),
        experience,
        consultationFee,
        availableDays: [...new Set(days)],
        medicalRegistrationNumber: d.medicalRegistrationNumber.trim(),
      });
    }

    // ---------- Validate hospital ----------
    const {
      hospitalName, hospitalType, ownershipType, registrationNumber,
      description, establishmentYear, email, phone, alternatePhone,
      website, owner, address, specialties, departments, facilities,
      totalBeds, emergencyAvailable, ambulanceAvailable, workingHours,
    } = data;

    const missingFields = [];
    if (!isNonEmptyString(hospitalName)) missingFields.push("hospitalName");
    if (!isNonEmptyString(hospitalType)) missingFields.push("hospitalType");
    if (!isNonEmptyString(ownershipType)) missingFields.push("ownershipType");
    if (!isNonEmptyString(email)) missingFields.push("email");
    if (!isNonEmptyString(phone)) missingFields.push("phone");
    if (!isNonEmptyString(owner?.name)) missingFields.push("owner.name");
    if (!isNonEmptyString(owner?.email)) missingFields.push("owner.email");
    if (!isNonEmptyString(owner?.phone)) missingFields.push("owner.phone");
    if (!isNonEmptyString(address?.street)) missingFields.push("address.street");
    if (!isNonEmptyString(address?.area)) missingFields.push("address.area");
    if (!isNonEmptyString(address?.city)) missingFields.push("address.city");
    if (!isNonEmptyString(address?.state)) missingFields.push("address.state");
    if (!isNonEmptyString(address?.pincode)) missingFields.push("address.pincode");

    if (missingFields.length) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
        missingFields,
      });
    }

    // ---------- Auth / applicant ----------
    if (!req.user?.id || !isValidId(req.user.id)) {
      return res.status(401).json({ success: false, message: "Please login with a valid account." });
    }

    const applicant = await User.findById(req.user.id);

    if (!applicant || applicant.isActive === false) {
      return res.status(401).json({ success: false, message: "Account not found or inactive." });
    }

    const normalizedEmail = normalizeEmail(email);
    const normalizedOwnerEmail = normalizeEmail(owner.email);

    if (normalizeEmail(applicant.email) !== normalizedOwnerEmail) {
      return res.status(403).json({
        success: false,
        message: "Official email must match the email of the logged-in account.",
      });
    }

    if (!["patient", "hospital_admin"].includes(applicant.role)) {
      return res.status(403).json({ success: false, message: "Your account is not eligible to register a hospital." });
    }

    if (applicant.hospitalId) {
      return res.status(409).json({ success: false, message: "Your account is already linked to a hospital." });
    }

    if (await Hospital.findOne({ admin: applicant._id })) {
      return res.status(409).json({ success: false, message: "Your account already has a hospital application." });
    }

    if (await Hospital.findOne({ email: normalizedEmail })) {
      return res.status(409).json({ success: false, message: "A hospital with this email already exists." });
    }

    // ---------- Files ----------
    const files = req.files || {};

    const additionalDocuments = [
      files.fireSafety?.[0],
      files.biomedicalWaste?.[0],
      files.accreditation?.[0],
    ]
      .filter(Boolean)
      .map(getPrivateDocumentPath);

    // ---------- Create hospital ----------
    createdHospital = await Hospital.create({
      hospitalName: hospitalName.trim(),
      hospitalType,
      ownershipType,
      registrationNumber,
      description,
      establishmentYear,
      email: normalizedEmail,
      phone: phone.trim(),
      alternatePhone,
      website,
      owner: {
        name: owner.name.trim(),
        email: normalizedOwnerEmail,
        phone: owner.phone.trim(),
        designation: owner.designation?.trim() || "Hospital Administrator",
      },
      address,
      specialties: Array.isArray(specialties) ? specialties : [],
      departments: Array.isArray(departments) ? departments : [],
      facilities: Array.isArray(facilities) ? facilities : [],
      totalBeds: totalBeds === undefined || totalBeds === null ? 0 : Number(totalBeds),
      emergencyAvailable: emergencyAvailable === true,
      ambulanceAvailable: ambulanceAvailable === true,
      workingHours: Array.isArray(workingHours) ? workingHours : [],
      documents: {
        registrationCertificate: getPrivateDocumentPath(files.registrationCertificate?.[0]),
        ownerIdProof: getPrivateDocumentPath(files.ownerId?.[0]),
        medicalLicense: "",
        additionalDocuments,
      },
      logo: getImagePath(files.logo?.[0]),
      images: (files.images || []).map(getImagePath),

      // Server-controlled
      verificationStatus: "Pending",
      rejectionReason: "",
      isActive: false,
      reviewedBy: null,
      reviewedAt: null,
      admin: applicant._id,
    });

    // ---------- Create doctors (rollback hospital on failure) ----------
    let createdDoctors;

    try {
      createdDoctors = await Doctor.insertMany(
        cleanDoctors.map((d) => ({
          ...d,
          hospitalId: createdHospital._id,
          profileImage: "",
          verificationStatus: "Pending",
          rejectionReason: "",
          isActive: false,
          createdBy: applicant._id,
          reviewedBy: null,
          reviewedAt: null,
        })),
        { ordered: true }
      );
    } catch (doctorError) {
      await Hospital.deleteOne({ _id: createdHospital._id }).catch(() => {});
      await Doctor.deleteMany({ hospitalId: createdHospital._id }).catch(() => {});
      createdHospital = null;
      throw doctorError;
    }

    return res.status(201).json({
      success: true,
      message: "Hospital registered successfully. Awaiting Main Admin verification.",
      hospital: {
        _id: createdHospital._id,
        hospitalName: createdHospital.hospitalName,
        verificationStatus: createdHospital.verificationStatus,
        isActive: createdHospital.isActive,
      },
      doctors: {
        count: createdDoctors.length,
        verificationStatus: "Pending",
        isActive: false,
      },
    });
  } catch (error) {
    console.error("REGISTER HOSPITAL ERROR:", error);

    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ success: false, message: error.message });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A hospital or doctor with duplicate unique data already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Hospital registration failed.",
      // Remove this line in production
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};

// ================= GET ALL VERIFIED HOSPITALS =================

exports.getAllHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find({ verificationStatus: "Verified", isActive: true })
      .select(PUBLIC_HOSPITAL_FIELDS)
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ success: true, count: hospitals.length, hospitals });
  } catch (error) {
    console.error("Get hospitals error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch hospitals." });
  }
};

// ================= GET HOSPITAL BY ID =================

exports.getHospitalById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ success: false, message: "Invalid hospital ID." });
    }

    const hospital = await Hospital.findOne({ _id: id, verificationStatus: "Verified", isActive: true })
      .select(PUBLIC_HOSPITAL_FIELDS)
      .lean();

    if (!hospital) {
      return res.status(404).json({ success: false, message: "Hospital not found." });
    }

    return res.status(200).json({ success: true, hospital });
  } catch (error) {
    console.error("Get hospital by ID error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch hospital." });
  }
};

// ================= GET MY HOSPITAL =================

exports.getMyHospital = async (req, res) => {
  try {
    if (!req.user?.id || !isValidId(req.user.id)) {
      return res.status(401).json({ success: false, message: "Unauthorized." });
    }

    const hospital = await Hospital.findOne({ admin: req.user.id }).lean();

    if (!hospital) {
      return res.status(404).json({ success: false, message: "No hospital application found." });
    }

    return res.status(200).json({ success: true, hospital });
  } catch (error) {
    console.error("Get my hospital error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch your hospital." });
  }
};

// ================= UPDATE OWN HOSPITAL =================

// ================= UPDATE HOSPITAL =================
// hospital_admin: only their own verified, active hospital
// super_admin: any hospital

exports.updateHospital = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ success: false, message: "Invalid hospital ID." });
    }

    const isSuperAdmin = req.user.role === "super_admin";

    const hospital = await Hospital.findOne(
      isSuperAdmin
        ? { _id: id }
        : { _id: id, admin: req.user.id, verificationStatus: "Verified", isActive: true }
    );

    if (!hospital) {
      return res.status(403).json({ success: false, message: "You cannot update this hospital." });
    }

    if (!isSuperAdmin && req.user.hospitalId?.toString() !== hospital._id.toString()) {
      return res.status(403).json({ success: false, message: "You cannot update this hospital." });
    }

    const allowedFields = [
      "description", "phone", "alternatePhone", "website", "address",
      "specialties", "departments", "facilities", "totalBeds",
      "emergencyAvailable", "ambulanceAvailable", "workingHours",
      "logo", "images",
    ];

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body || {}, field)) {
        hospital.set(field, req.body[field]);
      }
    }

    await hospital.save();

    return res.status(200).json({ success: true, message: "Hospital updated successfully.", hospital });
  } catch (error) {
    console.error("Update hospital error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message });
    }

    return res.status(500).json({ success: false, message: "Failed to update hospital." });
  }
};
// ================= DELETE HOSPITAL (disabled) =================

exports.deleteHospital = async (req, res) =>
  res.status(403).json({
    success: false,
    message: "Hospital deletion is disabled. Use an audited admin workflow.",
  });