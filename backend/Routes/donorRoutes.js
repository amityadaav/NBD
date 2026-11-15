// Routes/donorRoutes.js
const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/donorController");
const { authenticate } = require("../middleware/authMiddleware");   // ✅ destructured

// Public
router.get("/search", authenticate, ctrl.searchDonors);

// Authenticated donor self-service (must come BEFORE /:id)
router.post("/register", authenticate, ctrl.registerDonor);
router.get("/me/profile", authenticate, ctrl.getMyDonorProfile);
router.put("/me/profile", authenticate, ctrl.updateMyDonorProfile);
router.put("/me/availability", authenticate, ctrl.toggleAvailability);
router.post("/me/donations", authenticate, ctrl.recordDonation);
router.get("/me/donations", authenticate, ctrl.getMyDonations);

// Dynamic routes LAST
router.get("/:id", authenticate, ctrl.getDonorById);
router.post("/:id/contact", authenticate, ctrl.contactDonor);

module.exports = router;