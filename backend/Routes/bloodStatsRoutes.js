// Routes/bloodStatsRoutes.js
const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/bloodStatsController");

router.get("/summary", ctrl.getSummary);
router.get("/groups", ctrl.getGroupAvailability);
router.get("/urgent", ctrl.getUrgent);
router.get("/compatibility/:group", ctrl.getCompatibility);

module.exports = router;