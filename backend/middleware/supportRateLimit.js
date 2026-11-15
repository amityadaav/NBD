const rateLimit = require("express-rate-limit");

/**
 * Hard limit for public ticket submissions.
 * 5 tickets per IP every 15 minutes.
 */
const submitTicketLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message:
        "Too many support tickets submitted from this IP. Please wait 15 minutes and try again.",
    });
  },
});

/**
 * Softer limiter for future public lookup endpoints (e.g. check ticket status).
 */
const lookupTicketLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many requests. Please slow down.",
    });
  },
});

module.exports = { submitTicketLimiter, lookupTicketLimiter };