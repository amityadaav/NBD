const express = require("express");
const router = express.Router();

const { authenticate } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

const {
  getHospitalDashboard,
} = require("../controllers/HospitalAdminController");

router.use(authenticate);
router.use(allowRoles("hospital_admin"));

router.get("/dashboard", getHospitalDashboard);

module.exports = router;