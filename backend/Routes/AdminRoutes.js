
const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

// Import the Dashboard controller you just showed me
const { getDashboard } = require("../controllers/AdminController"); 

// All routes here require super_admin
router.use(authenticate, allowRoles("super_admin"));

// THIS is the route the frontend calls for stats
router.get("/dashboard", getDashboard);

module.exports = router;