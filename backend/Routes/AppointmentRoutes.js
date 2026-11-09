const express = require("express");
const router = express.Router();

const {bookAppointment,getAppointments,getAppointmentById,cancelAppointment,} = require("../controllers/AppointmentController");

// Book new appointment
router.post("/book", bookAppointment);

// Get all appointments
router.get("/", getAppointments);

// Get appointment by ID
router.get("/:id", getAppointmentById);

// Cancel appointment
router.patch("/:id/cancel", cancelAppointment);

module.exports = router;
