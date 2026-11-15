const Hospital = require("../models/Hospital");

const ADDRESS_FIELDS = ["street", "area", "city", "state", "pincode", "country", "location"];

// GET /api/hospital-admin/profile
exports.getProfile = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.hospital._id).lean();

    if (!hospital) {
      return res.status(404).json({ success: false, message: "Hospital not found." });
    }

    return res.status(200).json({ success: true, hospital });
  } catch (error) {
    console.error("Get hospital profile error:", error);
    return res.status(500).json({ success: false, message: "Failed to load hospital profile." });
  }
};

// PATCH /api/hospital-admin/profile
// Name, type, email, owner, documents and verification fields cannot be changed here.
exports.updateProfile = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.hospital._id);

    if (!hospital) {
      return res.status(404).json({ success: false, message: "Hospital not found." });
    }

    const body = req.body || {};
    const has = (f) => Object.prototype.hasOwnProperty.call(body, f);

    // Simple fields
    for (const field of [
      "description", "phone", "alternatePhone", "website",
      "specialties", "departments", "facilities",
      "emergencyAvailable", "ambulanceAvailable", "workingHours",
    ]) {
      if (has(field)) hospital.set(field, body[field]);
    }

    if (has("totalBeds")) {
      const beds = Number(body.totalBeds);
      if (!Number.isFinite(beds) || beds < 0) {
        return res.status(400).json({ success: false, message: "Invalid totalBeds value." });
      }
      hospital.set("totalBeds", beds);
    }

    // Address: merge field by field so a partial update does not wipe required fields
    if (has("address")) {
      if (!body.address || typeof body.address !== "object" || Array.isArray(body.address)) {
        return res.status(400).json({ success: false, message: "Invalid address." });
      }
      for (const key of ADDRESS_FIELDS) {
        if (Object.prototype.hasOwnProperty.call(body.address, key)) {
          hospital.set(`address.${key}`, body.address[key]);
        }
      }
    }

    await hospital.save();

    return res.status(200).json({
      success: true,
      message: "Hospital profile updated successfully.",
      hospital,
    });
  } catch (error) {
    console.error("Update hospital profile error:", error);

    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ success: false, message: error.message });
    }

    return res.status(500).json({ success: false, message: "Failed to update hospital profile." });
  }
};