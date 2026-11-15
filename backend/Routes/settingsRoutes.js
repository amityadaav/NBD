const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/authMiddleware");
const {
  getSettings,
  updateSettings,
  changePassword,
} = require("../controllers/settingsController");

router.use(authenticate);

router.get("/", getSettings);
router.patch("/", updateSettings);
router.patch("/password", changePassword);

module.exports = router;