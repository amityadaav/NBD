
const express = require("express");
const router = express.Router();

const {
  registerHospital,
  getAllHospitals,
  getHospitalById,
  updateHospital,
  deleteHospital,
} = require("../Controllers/HospitalController");

// Register a new hospital
router.post("/register", registerHospital);

// Get all hospitals
router.get("/", getAllHospitals);

// Get a single hospital by ID
router.get("/:id", getHospitalById);

// Update hospital details
router.put("/:id", updateHospital);

// Delete a hospital
router.delete("/:id", deleteHospital);

module.exports = router;
