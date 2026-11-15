
// const express = require("express");
// const router = express.Router();

// const {
//   createDoctor,
//   getAllDoctors,
//   getDoctorsByHospital,
//   getDoctorById,
// } = require("../controllers/DoctorController");

// const { authenticate } = require("../middleware/authMiddleware");
// const { allowRoles } = require("../middleware/roleMiddleware");

// // Public: only approved doctors at verified hospitals.
// router.get("/", getAllDoctors);

// // Hospital Admin: only doctors belonging to their own hospital.
// // Keep this route before "/:id".
// router.get(
//   "/hospital",
//   authenticate,
//   allowRoles("hospital_admin"),
//   getDoctorsByHospital
// );

// // Hospital Admin: add a doctor to their own approved hospital.
// // The controller derives hospitalId from req.user.
// router.post(
//   "/",
//   authenticate,
//   allowRoles("hospital_admin"),
//   createDoctor
// );

// // Public: only approved doctor details should be returned.
// router.get("/:id", getDoctorById);

// module.exports = router;
// const express = require("express");
// const router = express.Router();
// const {
//   createDoctor, getAllDoctors, getDoctorsByHospital, getDoctorById,
// } = require("../controllers/DoctorController");
// const { authenticate } = require("../middleware/authMiddleware");
// const { allowRoles } = require("../middleware/roleMiddleware");

// // Static/more-specific routes should be declared before "/:id".
// router.get("/", getAllDoctors);
// router.get("/hospital/:hospitalId", getDoctorsByHospital);
// router.post("/", authenticate, allowRoles("hospital_admin"), createDoctor);
// router.get("/:id", getDoctorById);

// module.exports = router;


const express = require("express");
const router = express.Router();

const {
  createDoctor,
  getAllDoctors,
  getDoctorsByHospital,
  getDoctorById,
} = require("../controllers/DoctorController");

const { authenticate } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

// Public: approved doctors at verified hospitals
router.get("/", getAllDoctors);

// Declared before "/:id" so it is not treated as an id
router.get("/hospital/:hospitalId", getDoctorsByHospital);

// Hospital admin adds a doctor to their own approved hospital
router.post("/", authenticate, allowRoles("hospital_admin"), createDoctor);

router.get("/:id", getDoctorById);


module.exports = router;