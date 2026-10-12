
const Hospital = require("../models/Hospital");

// Register Hospital
exports.registerHospital = async (req, res) => {
  try {
    const {
      hospitalName,
      hospitalType,
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
      emergencyAvailable,
      ambulanceAvailable,
      workingHours,
      documents,
      logo,
      images,
    } = req.body;

    // Required field validation
    if (!hospitalName ||!hospitalType ||!email ||!phone ||!owner?.name ||!owner?.email ||!owner?.phone ||!address?.street ||!address?.area ||
      !address?.city ||
      !address?.state ||
      !address?.pincode
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields.",
      });
    }

    // Check existing hospital email
    const existingHospital = await Hospital.findOne({
      email: email.toLowerCase(),
    });

    if (existingHospital) {
      return res.status(409).json({
        success: false,
        message: "A hospital with this email already exists.",
      });
    }

    // Create hospital
    const hospital = await Hospital.create({hospitalName,hospitalType,description,establishmentYear,email,phone,alternatePhone,website,
      owner,
      address,
      specialties,
      departments,
      facilities,
      totalBeds,
      emergencyAvailable,
      ambulanceAvailable,
      workingHours,
      documents,
      logo,
      images,
    });

    return res.status(201).json({
      success: true,
      message: "Hospital registered successfully. Awaiting verification.",
      hospital,
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
      message: "Internal server error.",
    });
  }
};

// Get All Hospitals
exports.getAllHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find().sort({ createdAt: -1 });

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

// Get Hospital By ID
exports.getHospitalById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid hospital ID.",
      });
    }

    const hospital = await Hospital.findById(id);

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

// Update Hospital
exports.updateHospital = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid hospital ID.",
      });
    }

    // Do not allow ordinary updates to change verification status.
    const {
      verificationStatus,
      isActive,
      admin,
      ...updateData
    } = req.body;

    const hospital = await Hospital.findByIdAndUpdate(
      id,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Hospital updated successfully.",
      hospital,
    });
  } catch (error) {
    console.error("Update hospital error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update hospital.",
    });
  }
};

// Delete Hospital
exports.deleteHospital = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid hospital ID.",
      });
    }

    const hospital = await Hospital.findByIdAndDelete(id);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Hospital deleted successfully.",
    });
  } catch (error) {
    console.error("Delete hospital error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete hospital.",
    });
  }
};
