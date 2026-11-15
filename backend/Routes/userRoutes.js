const express = require("express");
const { getDashboardData,getMyAppointments ,getMyPrescriptions} = require("../controllers/userController");
const { authenticate } = require("../middleware/authMiddleware"); // adjust casing if needed

const router = express.Router();

router.get("/dashboard", authenticate, getDashboardData);
router.get("/appointments", authenticate, getMyAppointments);
router.get("/prescriptions", authenticate, getMyPrescriptions);

module.exports = router;