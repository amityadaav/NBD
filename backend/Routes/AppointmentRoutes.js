const express = require("express");
const router = express.Router();

const { authenticate } = require("../middleware/authMiddleware");

const {
  bookAppointment,
  getAppointments,
  getAppointmentById,
  cancelAppointment,
} = require("../controllers/AppointmentController");

// Require authentication for appointment operations
router.use(authenticate);

router.post("/book", bookAppointment);
router.get("/", getAppointments);
router.get("/:id", getAppointmentById);
router.patch("/:id/cancel", cancelAppointment);

module.exports = router;