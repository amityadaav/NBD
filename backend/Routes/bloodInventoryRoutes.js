// Routes/bloodInventoryRoutes.js
const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/bloodInventoryController");
const { authenticate } = require("../middleware/authMiddleware");   // ✅
const { allowRoles } = require("../middleware/roleMiddleware");     // ✅

router.get("/:hospitalId", authenticate, ctrl.getHospitalInventory);

router.put(
  "/:hospitalId",
  authenticate,
  allowRoles("admin", "hospital_admin"),   // match your real role names
  ctrl.updateHospitalInventory
);

module.exports = router;