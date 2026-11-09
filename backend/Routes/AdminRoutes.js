
const express = require("express");
const router = express.Router();

const { authenticate } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const { getDashboard } = require("../controllers/AdminController");

router.use(authenticate);
router.use(allowRoles("super_admin"));

router.get("/dashboard", getDashboard);

module.exports = router;
