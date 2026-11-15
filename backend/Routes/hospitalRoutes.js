
// const express = require("express");
// const router = express.Router();

// const { authenticate } = require("../middleware/authMiddleware");
// const { allowRoles } = require("../middleware/roleMiddleware");

// const {
//   createDoctor,
// } = require("../controllers/DoctorController");

// router.post(
//   "/",
//   authenticate,
//   allowRoles("hospital_admin", "super_admin"),
//   createDoctor
// );

// module.exports = router;
const express = require("express");
const router = express.Router();

const { authenticate } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const { hospitalRegistrationUpload } = require("../middleware/hospitalUpload");

const {
  registerHospital,
  getAllHospitals,
  getHospitalById,
  getMyHospital,
  updateHospital,
  deleteHospital,
} = require("../controllers/hospitalController");

// Public list of verified hospitals
router.get("/", getAllHospitals);

// Logged-in applicant: register (multipart). Order matters:
// authenticate -> multer -> controller
router.post("/register", authenticate, hospitalRegistrationUpload, registerHospital);

// Must be declared before "/:id"
router.get("/my", authenticate, getMyHospital);

router.get("/:id", getHospitalById);

// Hospital admin edits their own hospital; super admin can edit any hospital
router.patch("/:id", authenticate, allowRoles("hospital_admin", "super_admin"), updateHospital);

router.delete("/:id", authenticate, allowRoles("super_admin"), deleteHospital);

module.exports = router;