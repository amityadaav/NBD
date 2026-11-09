const mongoose = require("mongoose");
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const Hospital = require("../models/Hospital");

exports.bookAppointment = async (req, res) => {
  try {
    const {
      patientName,
      patientEmail,
      patientPhone,
      doctorId,
      hospitalId,
      appointmentDate,
      appointmentTime,
      appointmentType,
      reason,
      consultationFee,
    } = req.body;

    if (
      !patientName ||
      !patientEmail ||
      !patientPhone ||
      !doctorId ||
      !hospitalId ||
      !appointmentDate ||
      !appointmentTime ||
      consultationFee === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    if (
      !mongoose.isValidObjectId(doctorId) ||
      !mongoose.isValidObjectId(hospitalId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor ID or hospital ID",
      });
    }

    const doctor = await Doctor.findById(doctorId);
    const hospital = await Hospital.findById(hospitalId);

    if (!doctor || !hospital) {
      return res.status(404).json({
        success: false,
        message: "Doctor or hospital not found",
      });
    }

    if (String(doctor.hospitalId) !== String(hospital._id)) {
      return res.status(400).json({
        success: false,
        message: "Selected doctor does not belong to this hospital",
      });
    }

    const appointment = await Appointment.create({
      patientName,
      patientEmail,
      patientPhone,
      doctorId,
      hospitalId,
      appointmentDate,
      appointmentTime,
      appointmentType: appointmentType || "In-Clinic",
      reason: reason || "",
      consultationFee,
    });

    return res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      appointment,
    });
  } catch (error) {
    console.error("Booking error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to book appointment",
      error: error.message,
    });
  }
};

// Get All Appointments
exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("doctorId")
      .populate("hospitalId")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch appointments",
      error: error.message,
    });
  }
};

// Get Single Appointment
exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("doctorId")
      .populate("hospitalId");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch appointment",
      error: error.message,
    });
  }
};

// Cancel Appointment
exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: "Cancelled" },
      { new: true, runValidators: true }
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
      data: appointment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to cancel appointment",
      error: error.message,
    });
  }
};
