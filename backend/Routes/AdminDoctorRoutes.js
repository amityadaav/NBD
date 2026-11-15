
// const express = require("express");
// const router = express.Router();

// const { authenticate } = require("../middleware/authMiddleware");
// const { allowRoles } = require("../middleware/roleMiddleware");

// const {
//   getPendingDoctors,
//   reviewDoctor,
// } = require("../controllers/AdminDoctorController");

// router.use(
//   authenticate,
//   allowRoles("hospital_admin", "super_admin")
// );

// router.get("/pending", getPendingDoctors);
// router.patch("/:id/review", reviewDoctor);

// module.exports = router;

const express = require("express");
const router = express.Router();

const { authenticate } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

const {
  getDoctors,
  getPendingDoctors,
  reviewDoctor,
} = require("../controllers/AdminDoctorController");

router.use(authenticate);

router.use(
  allowRoles("super_admin", "hospital_admin")
);

router.get("/", getDoctors);

router.get("/pending", getPendingDoctors);

router.patch("/:id/review", reviewDoctor);

module.exports = router;
