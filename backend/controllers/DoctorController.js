
// const mongoose = require("mongoose");
// const Doctor = require("../models/Doctor");
// const Hospital = require("../models/Hospital");

// // Create Doctor

// exports.createDoctor = async (req, res) => {
//   try {
//     const {
//       name,
//       specialty,
//       qualification,
//       experience,
//       hospitalId,
//       consultationFee,
//       availableDays,
//     } = req.body;

//     if (
//       !name ||
//       !specialty ||
//       !qualification ||
//       !hospitalId ||
//       consultationFee === undefined
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Please provide all required fields",
//       });
//     }

//     if (!mongoose.isValidObjectId(hospitalId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid hospital ID",
//       });
//     }

//     const hospital = await Hospital.findById(hospitalId);

//     if (!hospital) {
//       return res.status(404).json({
//         success: false,
//         message: "Hospital not found",
//       });
//     }

//     // Multer provides the uploaded file in req.file
//     const profileImage = req.file
//       ? `/uploads/doctors/${req.file.filename}`
//       : "";

//     let parsedAvailableDays = availableDays || [];

//     if (typeof parsedAvailableDays === "string") {
//       parsedAvailableDays = JSON.parse(parsedAvailableDays);
//     }

//     if (!Array.isArray(parsedAvailableDays)) {
//       return res.status(400).json({
//         success: false,
//         message: "availableDays must be an array",
//       });
//     }

//     const doctor = await Doctor.create({
//       name,
//       specialty,
//       qualification,
//       experience: Number(experience),
//       hospitalId,
//       consultationFee: Number(consultationFee),
//       availableDays: parsedAvailableDays,
//       profileImage,
//     });

//     return res.status(201).json({
//       success: true,
//       message: "Doctor created successfully",
//       doctor,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Failed to create doctor",
//       error: error.message,
//     });
//   }
// };

// // Get All Active Doctors with Hospital Details
// exports.getAllDoctors = async (req, res) => {
//   try {
//     const doctors = await Doctor.find({ isActive: true }).populate(
//       "hospitalId",
//       "hospitalName address"
//     );

//     return res.status(200).json({
//       success: true,
//       count: doctors.length,
//       doctors,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch doctors",
//       error: error.message,
//     });
//   }
// };

// // Get Doctors by Hospital
// exports.getDoctorsByHospital = async (req, res) => {
//   try {
//     const { hospitalId } = req.params;

//     if (!mongoose.isValidObjectId(hospitalId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid hospital ID",
//       });
//     }

//     const doctors = await Doctor.find({
//       hospitalId,
//       isActive: true,
//     }).populate("hospitalId", "hospitalName address");

//     return res.status(200).json({
//       success: true,
//       count: doctors.length,
//       doctors,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch hospital doctors",
//       error: error.message,
//     });
//   }
// };

// // Get Single Doctor
// exports.getDoctorById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!mongoose.isValidObjectId(id)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid doctor ID",
//       });
//     }

//     const doctor = await Doctor.findById(id).populate(
//       "hospitalId",
//       "hospitalName address"
//     );

//     if (!doctor) {
//       return res.status(404).json({
//         success: false,
//         message: "Doctor not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       doctor,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch doctor",
//       error: error.message,
//     });
//   }
// };

// const mongoose = require("mongoose");
// const Doctor = require("../models/Doctor");
// const Hospital = require("../models/Hospital");

// exports.createDoctor = async (req, res) => {
//   try {
//     const {
//       name,
//       email,
//       phone,
//       specialty,
//       qualification,
//       experience,
//       consultationFee,
//       profileImage,
//       availableDays,
//       medicalRegistrationNumber,
//       hospitalId,
//     } = req.body;

//     // Required field validation
//     if (
//       !name?.trim() ||
//       !specialty?.trim() ||
//       !qualification?.trim() ||
//       !medicalRegistrationNumber?.trim() ||
//       consultationFee === undefined ||
//       consultationFee === null ||
//       hospitalId === undefined ||
//       hospitalId === null
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Please provide all required fields.",
//       });
//     }

//     if (!mongoose.isValidObjectId(hospitalId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid hospital ID.",
//       });
//     }

//     if (
//       !Number.isFinite(Number(consultationFee)) ||
//       Number(consultationFee) < 0
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid consultation fee.",
//       });
//     }

//     if (
//       experience !== undefined &&
//       (!Number.isFinite(Number(experience)) ||
//         Number(experience) < 0)
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid experience.",
//       });
//     }

//     if (
//       !Array.isArray(availableDays ?? []) ||
//       (availableDays ?? []).some(
//         (day) =>
//           ![
//             "Monday",
//             "Tuesday",
//             "Wednesday",
//             "Thursday",
//             "Friday",
//             "Saturday",
//             "Sunday",
//           ].includes(day)
//       )
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid available days.",
//       });
//     }

//     // Verify hospital
//     const hospital = await Hospital.findOne({
//       _id: hospitalId,
//       verificationStatus: "Verified",
//       isActive: true,
//     }).select("_id admin");

//     if (!hospital) {
//       return res.status(404).json({
//         success: false,
//         message: "Verified active hospital not found.",
//       });
//     }

//     // Hospital Admin can add doctors only to their own hospital
//     if (req.user.role === "hospital_admin") {
//       if (
//         !req.user.hospitalId ||
//         hospital._id.toString() !==
//           req.user.hospitalId.toString() ||
//         hospital.admin?.toString() !== req.user.id
//       ) {
//         return res.status(403).json({
//           success: false,
//           message: "You cannot add doctors to this hospital.",
//         });
//       }
//     }

//     const doctor = await Doctor.create({
//       name: name.trim(),
//       email,
//       phone,
//       specialty: specialty.trim(),
//       qualification: qualification.trim(),
//       experience: experience ?? 0,
//       hospitalId: hospital._id,
//       consultationFee: Number(consultationFee),
//       profileImage: profileImage || "",
//       availableDays: availableDays || [],
//       medicalRegistrationNumber:
//         medicalRegistrationNumber.trim(),

//       // Server-controlled fields
//       createdBy: req.user.id,
//       verificationStatus: "Pending",
//       rejectionReason: "",
//       reviewedBy: null,
//       reviewedAt: null,
//       isActive: false,
//     });

//     return res.status(201).json({
//       success: true,
//       message: "Doctor added successfully. Awaiting verification.",
//       doctor,
//     });
//   } catch (error) {
//     console.error("Create doctor error:", error);

//     if (error.name === "ValidationError") {
//       return res.status(400).json({
//         success: false,
//         message: error.message,
//       });
//     }

//     if (error.code === 11000) {
//       return res.status(409).json({
//         success: false,
//         message: "Duplicate doctor record.",
//       });
//     }

//     return res.status(500).json({
//       success: false,
//       message: "Failed to add doctor.",
//     });
//   }
// };

const mongoose = require("mongoose");
const Doctor = require("../models/Doctor");
const Hospital = require("../models/Hospital");

// ================= CREATE DOCTOR =================
// POST /api/doctors
// Hospital Admin only

exports.createDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      specialty,
      qualification,
      experience,
      consultationFee,
      availableDays,
      medicalRegistrationNumber,
    } = req.body;

    if (
      !name?.trim() ||
      !specialty?.trim() ||
      !qualification?.trim() ||
      !medicalRegistrationNumber?.trim() ||
      consultationFee === undefined ||
      consultationFee === null
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required doctor fields.",
      });
    }

    if (!req.user?.id || !mongoose.isValidObjectId(req.user.id)) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (req.user.role !== "hospital_admin") {
      return res.status(403).json({
        success: false,
        message: "Only hospital admins can add doctors.",
      });
    }

    const fee = Number(consultationFee);
    const exp = Number(experience ?? 0);

    if (!Number.isFinite(fee) || fee < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid consultation fee.",
      });
    }

    if (!Number.isFinite(exp) || exp < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid experience.",
      });
    }

    let days = availableDays ?? [];

    if (typeof days === "string") {
      try {
        days = JSON.parse(days);
      } catch {
        return res.status(400).json({
          success: false,
          message: "Invalid availableDays JSON.",
        });
      }
    }

    const validDays = [
      "Monday", "Tuesday", "Wednesday", "Thursday",
      "Friday", "Saturday", "Sunday",
    ];

    if (
      !Array.isArray(days) ||
      days.some((day) => !validDays.includes(day))
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid available days.",
      });
    }

    // Hospital ID comes from the authenticated account.
    // Never trust hospitalId sent by the client.
    if (!req.user.hospitalId ||
        !mongoose.isValidObjectId(req.user.hospitalId)) {
      return res.status(403).json({
        success: false,
        message: "Your account is not linked to a hospital.",
      });
    }

    const hospital = await Hospital.findOne({
      _id: req.user.hospitalId,
      admin: req.user.id,
      verificationStatus: "Verified",
      isActive: true,
    }).select("_id");

    if (!hospital) {
      return res.status(403).json({
        success: false,
        message: "Your hospital is not approved or active.",
      });
    }

    const profileImage = req.file
      ? `/uploads/doctors/${req.file.filename}`
      : "";

    const doctor = await Doctor.create({
      name: name.trim(),
      email: email?.trim().toLowerCase() || undefined,
      phone: phone?.trim() || undefined,
      specialty: specialty.trim(),
      qualification: qualification.trim(),
      experience: exp,
      hospitalId: hospital._id,
      consultationFee: fee,
      availableDays: days,
      profileImage,
      medicalRegistrationNumber:
        medicalRegistrationNumber.trim(),

      // Server-controlled fields
      createdBy: req.user.id,
      verificationStatus: "Pending",
      rejectionReason: "",
      reviewedBy: null,
      reviewedAt: null,
      isActive: false,
    });

    return res.status(201).json({
      success: true,
      message: "Doctor added successfully. Awaiting verification.",
      doctor,
    });
  } catch (error) {
    console.error("Create doctor error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Duplicate doctor record.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to add doctor.",
    });
  }
};

// ================= PUBLIC DOCTOR QUERY =================

const PUBLIC_DOCTOR_FIELDS =
  "name specialty qualification experience hospitalId consultationFee profileImage availableDays verificationStatus";

// Get all approved doctors at verified active hospitals
exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({
      isActive: true,
      verificationStatus: "Approved",
    })
      .select(PUBLIC_DOCTOR_FIELDS)
      .populate({
        path: "hospitalId",
        match: {
          verificationStatus: "Verified",
          isActive: true,
        },
        select: "hospitalName address",
      })
      .lean();

    const visibleDoctors = doctors.filter(
      (doctor) => doctor.hospitalId
    );

    return res.status(200).json({
      success: true,
      count: visibleDoctors.length,
      doctors: visibleDoctors,
    });
  } catch (error) {
    console.error("Get doctors error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch doctors.",
    });
  }
};

// Get approved doctors by hospital
exports.getDoctorsByHospital = async (req, res) => {
  try {
    const { hospitalId } = req.params;

    if (!mongoose.isValidObjectId(hospitalId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid hospital ID.",
      });
    }

    const hospital = await Hospital.findOne({
      _id: hospitalId,
      verificationStatus: "Verified",
      isActive: true,
    }).select("_id");

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found.",
      });
    }

    const doctors = await Doctor.find({
      hospitalId: hospital._id,
      isActive: true,
      verificationStatus: "Approved",
    })
      .select(PUBLIC_DOCTOR_FIELDS)
      .populate("hospitalId", "hospitalName address")
      .lean();

    return res.status(200).json({
      success: true,
      count: doctors.length,
      doctors,
    });
  } catch (error) {
    console.error("Get hospital doctors error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch hospital doctors.",
    });
  }
};

// Get one approved doctor
exports.getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor ID.",
      });
    }

    const doctor = await Doctor.findOne({
      _id: id,
      isActive: true,
      verificationStatus: "Approved",
    })
      .select(PUBLIC_DOCTOR_FIELDS)
      .populate({
        path: "hospitalId",
        match: {
          verificationStatus: "Verified",
          isActive: true,
        },
        select: "hospitalName address",
      })
      .lean();

    if (!doctor || !doctor.hospitalId) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found.",
      });
    }

    return res.status(200).json({
      success: true,
      doctor,
    });
  } catch (error) {
    console.error("Get doctor by ID error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch doctor.",
    });
  }
};
