// models/Donation.js
const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
  {
    donor: { type: mongoose.Schema.Types.ObjectId, ref: "Donor", required: true },
    hospital: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital" },
    bloodRequest: { type: mongoose.Schema.Types.ObjectId, ref: "BloodRequest" },
    bloodGroup: { type: String, required: true },
    units: { type: Number, default: 1 },
    donatedAt: { type: Date, default: Date.now },
    certificateUrl: { type: String, default: "" },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Donation", donationSchema);