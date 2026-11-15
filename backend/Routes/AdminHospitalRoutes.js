
// const express = require("express");
// const router = express.Router();

// const { authenticate } = require("../middleware/authMiddleware");
// const { allowRoles } = require("../middleware/roleMiddleware");

// const {
//   getPendingHospitals,
//   reviewHospital,
// } = require("../controllers/AdminHospitalController");

// router.use(authenticate, allowRoles("super_admin"));

// router.get("/pending", getPendingHospitals);
// router.patch("/:id/review", reviewHospital);

// module.exports = router;
const express = require("express");
const router = express.Router();

const { authenticate } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

const {
  getHospitals,
  getPendingHospitals,
  getHospitalById,
  getHospitalDocument,
  reviewHospital,
} = require("../controllers/AdminHospitalController");

router.use(authenticate, allowRoles("super_admin"));

router.get("/", getHospitals);
router.get("/pending", getPendingHospitals); // before "/:id"
router.get("/:id", getHospitalById);
router.get("/:id/document", getHospitalDocument);
router.patch("/:id/review", reviewHospital);

module.exports = router;