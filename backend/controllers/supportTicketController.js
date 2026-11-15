import SupportTicket from "../models/SupportTicket.js";
import crypto from "crypto";

const genTicketNumber = () =>
  "ND-" +
  Date.now().toString(36).toUpperCase().slice(-6) +
  crypto.randomBytes(2).toString("hex").toUpperCase();

/* ================= PUBLIC ================= */

export async function createTicket(req, res) {
  try {
    const { name, email, subject, category, message } = req.body;

    // Honeypot — silently accept but don't save (or reject). We reject.
    if (req.body.website) {
      return res.status(400).json({ success: false, message: "Spam detected." });
    }

    // Per-email throttle: max 3 open tickets, max 10 per day
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [openCount, dayCount] = await Promise.all([
      SupportTicket.countDocuments({
        email: email.toLowerCase(),
        status: { $ne: "resolved" },
      }),
      SupportTicket.countDocuments({
        email: email.toLowerCase(),
        createdAt: { $gte: oneDayAgo },
      }),
    ]);

    if (openCount >= 3) {
      return res.status(429).json({
        success: false,
        message:
          "You already have 3 open support tickets. Please wait for a reply before creating another.",
      });
    }

    if (dayCount >= 10) {
      return res.status(429).json({
        success: false,
        message: "Daily ticket limit reached. Please try again tomorrow.",
      });
    }

    // Duplicate guard: identical subject+message within 10 min
    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000);
    const duplicate = await SupportTicket.findOne({
      email: email.toLowerCase(),
      subject,
      message,
      createdAt: { $gte: tenMinAgo },
    });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "A similar ticket was just submitted. Please wait for a reply.",
        ticketNumber: duplicate.ticketNumber,
      });
    }

    const ticket = await SupportTicket.create({
      ticketNumber: genTicketNumber(),
      name,
      email: email.toLowerCase(),
      subject,
      category: category || "other",
      message,
      ipAddress: req.ip,
      userAgent: (req.get("user-agent") || "").slice(0, 300),
      // if auth middleware is optional on this route and user is present:
      userId: req.user?._id,
    });

    return res.status(201).json({
      success: true,
      message: "Support ticket submitted successfully.",
      ticket: {
        ticketNumber: ticket.ticketNumber,
        subject: ticket.subject,
        status: ticket.status,
        createdAt: ticket.createdAt,
      },
    });
  } catch (error) {
    console.error("createTicket error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to submit ticket." });
  }
}

/* ================= SUPER ADMIN ================= */

export async function listTickets(req, res) {
  try {
    const { status, page = 1, limit = 20, search = "" } = req.query;

    const filter = {};
    if (status && ["open", "in_progress", "resolved"].includes(status)) {
      filter.status = status;
    }
    if (search) {
      filter.$or = [
        { ticketNumber: new RegExp(search, "i") },
        { email: new RegExp(search, "i") },
        { name: new RegExp(search, "i") },
        { subject: new RegExp(search, "i") },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

    const [tickets, total, counts] = await Promise.all([
      SupportTicket.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .select("-replies -ipAddress -userAgent")
        .lean(),
      SupportTicket.countDocuments(filter),
      SupportTicket.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
    ]);

    const stats = { open: 0, in_progress: 0, resolved: 0 };
    counts.forEach((c) => (stats[c._id] = c.count));

    return res.json({
      success: true,
      tickets,
      stats,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    console.error("listTickets error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to load tickets." });
  }
}

export async function getTicket(req, res) {
  try {
    const ticket = await SupportTicket.findById(req.params.id).lean();
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found." });
    }
    return res.json({ success: true, ticket });
  } catch (error) {
    console.error("getTicket error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to load ticket." });
  }
}

export async function replyToTicket(req, res) {
  try {
    const { message } = req.body;
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found." });
    }

    ticket.replies.push({
      author: req.user._id,
      authorName: req.user.name || "Support Team",
      message,
      isAdminReply: true,
    });

    // Auto-move open -> in_progress when admin replies
    if (ticket.status === "open") {
      ticket.status = "in_progress";
    }

    await ticket.save();

    return res.json({
      success: true,
      message: "Reply sent.",
      ticket,
    });
  } catch (error) {
    console.error("replyToTicket error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to send reply." });
  }
}

export async function updateTicketStatus(req, res) {
  try {
    const { status } = req.body;
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found." });
    }

    ticket.status = status;
    if (status === "resolved") {
      ticket.resolvedAt = new Date();
      ticket.resolvedBy = req.user._id;
    } else {
      ticket.resolvedAt = undefined;
      ticket.resolvedBy = undefined;
    }

    await ticket.save();

    return res.json({ success: true, message: "Status updated.", ticket });
  } catch (error) {
    console.error("updateTicketStatus error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update status." });
  }
}