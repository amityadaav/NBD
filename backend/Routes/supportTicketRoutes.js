const express = require("express");
const router = express.Router();

const {
  createTicket,
  listTickets,
  getTicket,
  replyToTicket,
  updateTicketStatus,
} = require("../controllers/supportTicketController");

const {
  createTicketRules,
  replyRules,
  statusRules,
  handleValidation,
} = require("../middleware/supportValidators");

const { submitTicketLimiter } = require("../middleware/supportRateLimit");

// exact file paths for your project
const { authenticate } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

/* ---------- PUBLIC (no auth) ---------- */
router.post(
  "/support-tickets",
  submitTicketLimiter,
  createTicketRules,
  handleValidation,
  createTicket
);

/* ---------- SUPER ADMIN ONLY ---------- */
router.get(
  "/admin/support-tickets",
  authenticate,
  allowRoles("super_admin"),
  listTickets
);

router.get(
  "/admin/support-tickets/:id",
  authenticate,
  allowRoles("super_admin"),
  getTicket
);

router.post(
  "/admin/support-tickets/:id/reply",
  authenticate,
  allowRoles("super_admin"),
  replyRules,
  handleValidation,
  replyToTicket
);

router.patch(
  "/admin/support-tickets/:id/status",
  authenticate,
  allowRoles("super_admin"),
  statusRules,
  handleValidation,
  updateTicketStatus
);

module.exports = router;