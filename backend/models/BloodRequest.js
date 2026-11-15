// models/BloodRequest.js
const mongoose = require("mongoose");

const bloodRequestSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    patientName: { type: String, required: true, trim: true },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      required: true,
    },
    unitsNeeded: { type: Number, required: true, min: 1 },
    urgency: {
      type: String,
      enum: ["normal", "urgent", "critical"],
      default: "urgent",
    },
    hospital: {
      name: { type: String, required: true },
      city: { type: String, required: true },
      area: { type: String, default: "" },
      address: { type: String, default: "" },
    },
    contactName: { type: String, required: true },
    contactPhone: { type: String, required: true },
    neededBy: { type: Date, required: true },
    notes: { type: String, default: "" },
    status: {
      type: String,
      enum: ["open", "fulfilled", "cancelled", "expired"],
      default: "open",
    },
    respondedDonors: [
      {
        donor: { type: mongoose.Schema.Types.ObjectId, ref: "Donor" },
        status: {
          type: String,
          enum: ["interested", "accepted", "donated", "declined"],
          default: "interested",
        },
        respondedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

bloodRequestSchema.index({ status: 1, bloodGroup: 1, "hospital.city": 1 });
bloodRequestSchema.index({ neededBy: 1 });

module.exports = mongoose.model("BloodRequest", bloodRequestSchema);