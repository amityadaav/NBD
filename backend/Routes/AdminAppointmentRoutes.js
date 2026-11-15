
const express = require("express");
const router = express.Router();

const { authenticate } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

const {
  getAllAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment,
} = require("../controllers/AdminAppointmentController");

// Get all appointments
router.get(
  "/",
  authenticate,
  allowRoles("super_admin", "admin"),
  getAllAppointments
);

// Get appointment by ID
router.get(
  "/:id",
  authenticate,
  allowRoles("super_admin", "admin"),
  getAppointmentById
);

// Update appointment status
router.patch(
  "/:id/status",
  authenticate,
  allowRoles("super_admin", "admin"),
  updateAppointmentStatus
);

// Cancel appointment
router.patch(
  "/:id/cancel",
  authenticate,
  allowRoles("super_admin", "admin"),
  cancelAppointment
);

module.exports = router;