
const express = require("express");
const router = express.Router();

const { authenticate } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

const {
  getPendingDoctors,
  reviewDoctor,
} = require("../controllers/AdminDoctorController");

router.use(authenticate, allowRoles("super_admin"));

router.get("/pending", getPendingDoctors);
router.patch("/:id/review", reviewDoctor);

module.exports = router;
