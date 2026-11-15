const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/authMiddleware");
const {
  getEligibleAppointments,
  createPrescription,
  getHospitalPrescriptions,
} = require("../controllers/hospitalAdminPrescriptionController");

router.get("/eligible-appointments", authenticate, getEligibleAppointments);
router.get("/", authenticate, getHospitalPrescriptions);
router.post("/", authenticate, createPrescription);

module.exports = router;