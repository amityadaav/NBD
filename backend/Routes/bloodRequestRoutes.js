// Routes/bloodRequestRoutes.js
const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/bloodRequestController");
const { authenticate } = require("../middleware/authMiddleware");

router.get("/urgent", ctrl.getUrgentRequests);              // public
router.get("/my", authenticate, ctrl.getMyRequests);
router.get("/", ctrl.listRequests);                         // public
router.post("/", authenticate, ctrl.createRequest);
router.post("/:id/respond", authenticate, ctrl.respondToRequest);
router.put("/:id/status", authenticate, ctrl.updateRequestStatus);
router.get("/:id", ctrl.getRequestById);                    // LAST

module.exports = router;