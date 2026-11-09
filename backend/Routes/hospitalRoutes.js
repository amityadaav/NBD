
const express = require("express");
const router = express.Router();

const {
  registerHospital,
  getAllHospitals,
  getHospitalById,
  updateHospital,
  deleteHospital,
} = require("../controllers/hospitalController");

const { authenticate } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const { hospitalRegistrationUpload } = require("../middleware/upload");

// Register hospital application.
// The controller links it to the authenticated applicant.
router.post(
  "/register",
  authenticate,
  hospitalRegistrationUpload,
  registerHospital
);

// Public listing: controller must return verified, active hospitals only.
router.get("/", getAllHospitals);

// Public details: controller must return verified, active hospitals only.
router.get("/:id", getHospitalById);

// Hospital Admin can update only their own approved hospital.
router.put(
  "/:id",
  authenticate,
  allowRoles("hospital_admin"),
  updateHospital
);

// Deletion is blocked by the controller; no public delete access.
router.delete(
  "/:id",
  authenticate,
  allowRoles("super_admin"),
  deleteHospital
);

module.exports = router;
