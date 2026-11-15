const express = require("express");
const router = express.Router();

const { authenticate } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const { getPatients, setPatientStatus } = require("../controllers/AdminPatientController");

router.use(authenticate, allowRoles("super_admin"));

router.get("/", getPatients);
router.patch("/:id/status", setPatientStatus);

module.exports = router;