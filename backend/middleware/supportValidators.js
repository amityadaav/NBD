import { body, validationResult } from "express-validator";

export const createTicketRules = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required.")
    .isLength({ min: 2, max: 80 }).withMessage("Name must be 2–80 characters."),
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required.")
    .isEmail().withMessage("Please enter a valid email address.")
    .normalizeEmail(),
  body("subject")
    .trim()
    .notEmpty().withMessage("Subject is required.")
    .isLength({ min: 3, max: 150 }).withMessage("Subject must be 3–150 characters."),
  body("category")
    .optional()
    .isIn(["login", "account", "payment", "technical", "other"])
    .withMessage("Invalid category."),
  body("message")
    .trim()
    .notEmpty().withMessage("Message is required.")
    .isLength({ min: 10, max: 3000 }).withMessage("Message must be 10–3000 characters."),
  body("website") // honeypot field — bots fill it, humans don't
    .optional()
    .isEmpty().withMessage("Spam detected."),
];

export const replyRules = [
  body("message")
    .trim()
    .notEmpty().withMessage("Reply message is required.")
    .isLength({ min: 1, max: 2000 }).withMessage("Reply must be 1–2000 characters."),
];

export const statusRules = [
  body("status")
    .isIn(["open", "in_progress", "resolved"])
    .withMessage("Invalid status."),
];

export function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array(),
    });
  }
  next();
}