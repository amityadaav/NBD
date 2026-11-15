const express = require("express");
const router = express.Router();

const { authenticate } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const { loadHospital } = require("../middleware/hospitalContext");

const profile = require("../controllers/HospitalAdminProfileController");
const doctors = require("../controllers/HospitalAdminDoctorController");
const appointments = require("../controllers/HospitalAdminAppointmentController");
const account = require("../controllers/HospitalAdminAccountController");
// Every route below requires: logged in -> hospital_admin role -> verified, active hospital
router.use(authenticate);
router.use(allowRoles("hospital_admin"));
router.use(loadHospital);

// ---------- Profile ----------
router.get("/profile", profile.getProfile);
router.patch("/profile", profile.updateProfile);
router.patch("/change-password", account.changePassword);
// ---------- Doctors ----------
router.get("/doctors", doctors.listDoctors);
router.post("/doctors", doctors.addDoctor);
router.get("/doctors/:id", doctors.getDoctor);
router.patch("/doctors/:id", doctors.updateDoctor);
router.patch("/doctors/:id/status", doctors.setDoctorActive);
router.delete("/doctors/:id", doctors.deleteDoctor);

// ---------- Appointments ----------
router.get("/appointments", appointments.listAppointments);
router.patch("/appointments/:id/status", appointments.updateAppointmentStatus);

module.exports = router;