
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

const mongoose = require("mongoose");
const Doctor = require("../models/Doctor");
const Hospital = require("../models/Hospital");

const VALID_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const parseAvailableDays = (value) => {
  if (value === undefined || value === null || value === "") {
    return [];
  }

  const parsed = typeof value === "string" ? JSON.parse(value) : value;

  if (!Array.isArray(parsed)) {
    throw new Error("availableDays must be an array.");
  }

  if (!parsed.every((day) => VALID_DAYS.includes(day))) {
    throw new Error("Invalid availableDays value.");
  }

  return [...new Set(parsed)];
};

// CREATE DOCTOR
// Route must use authenticate + allowRoles("hospital_admin").
exports.createDoctor = async (req, res) => {
  try {
    const {
      name,
      specialty,
      qualification,
      experience,
      consultationFee,
      availableDays,
      medicalRegistrationNumber,
      email,
      phone,
    } = req.body;

    if (
      !name?.trim() ||
      !specialty?.trim() ||
      !qualification?.trim() ||
      !medicalRegistrationNumber?.trim() ||
      consultationFee === undefined ||
      experience === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required doctor fields.",
      });
    }

    const numericExperience = Number(experience);
    const numericFee = Number(consultationFee);

    if (
      !Number.isFinite(numericExperience) ||
      numericExperience < 0 ||
      !Number.isFinite(numericFee) ||
      numericFee < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Experience and consultation fee must be valid non-negative numbers.",
      });
    }

    // Never accept hospital ownership from the request body.
    const hospital = await Hospital.findOne({
      _id: req.user.hospitalId,
      admin: req.user.id,
      verificationStatus: "Verified",
      isActive: true,
    });

    if (!hospital) {
      return res.status(403).json({
        success: false,
        message: "Only admins of verified hospitals can register doctors.",
      });
    }

    let parsedAvailableDays;

    try {
      parsedAvailableDays = parseAvailableDays(availableDays);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    const profileImage = req.file
      ? `/uploads/doctors/${req.file.filename}`
      : "";

    const doctor = await Doctor.create({
      name: name.trim(),
      email: email ? email.trim().toLowerCase() : "",
      phone: phone || "",
      specialty: specialty.trim(),
      qualification: qualification.trim(),
      experience: numericExperience,
      medicalRegistrationNumber:
        medicalRegistrationNumber.trim(),
      hospitalId: hospital._id,
      consultationFee: numericFee,
      availableDays: parsedAvailableDays,
      profileImage,
      createdBy: req.user.id,
      verificationStatus: "Pending",
      rejectionReason: "",
      reviewedBy: null,
      reviewedAt: null,
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Doctor submitted for Main Admin verification.",
      doctor,
    });
  } catch (error) {
    console.error("Create doctor error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This medical registration number is already registered for this hospital.",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to register doctor.",
    });
  }
};

// PUBLIC: APPROVED DOCTORS AT VERIFIED, ACTIVE HOSPITALS
exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({
      isActive: true,
      verificationStatus: "Approved",
    })
      .populate({
        path: "hospitalId",
        match: {
          verificationStatus: "Verified",
          isActive: true,
        },
        select: "hospitalName hospitalType address specialties",
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

// HOSPITAL ADMIN: ONLY OWN HOSPITAL'S DOCTORS
// Route must use authenticate + allowRoles("hospital_admin").
exports.getDoctorsByHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({
      _id: req.user.hospitalId,
      admin: req.user.id,
      verificationStatus: "Verified",
      isActive: true,
    });

    if (!hospital) {
      return res.status(403).json({
        success: false,
        message: "Hospital access is not available.",
      });
    }

    const doctors = await Doctor.find({
      hospitalId: hospital._id,
    }).sort({ createdAt: -1 });

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

// PUBLIC: SINGLE APPROVED DOCTOR ONLY
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
      .populate({
        path: "hospitalId",
        match: {
          verificationStatus: "Verified",
          isActive: true,
        },
        select: "hospitalName hospitalType address specialties",
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
    console.error("Get doctor error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch doctor.",
    });
  }
};
