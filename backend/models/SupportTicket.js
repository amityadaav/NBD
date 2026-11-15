import mongoose from "mongoose";

const replySchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    authorName: { type: String, required: true },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    isAdminReply: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const supportTicketSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 120,
    },
    subject: { type: String, required: true, trim: true, maxlength: 150 },
    category: {
      type: String,
      enum: ["login", "account", "payment", "technical", "other"],
      default: "other",
    },
    message: { type: String, required: true, trim: true, maxlength: 3000 },

    status: {
      type: String,
      enum: ["open", "in_progress", "resolved"],
      default: "open",
      index: true,
    },

    replies: [replySchema],

    // optional link if ticket submitted by a logged-in user
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // abuse tracking
    ipAddress: { type: String },
    userAgent: { type: String, maxlength: 300 },
    resolvedAt: { type: Date },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

supportTicketSchema.index({ createdAt: -1 });
supportTicketSchema.index({ email: 1, createdAt: -1 });

export default mongoose.model("SupportTicket", supportTicketSchema);