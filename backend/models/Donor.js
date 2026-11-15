// models/Donor.js
const mongoose = require("mongoose");

const donorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      required: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    city: { type: String, required: true, trim: true },
    area: { type: String, trim: true, default: "" },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ["male", "female", "other"] },
    weight: { type: Number }, // kg
    lastDonated: { type: Date, default: null },
    totalDonations: { type: Number, default: 0 },
    available: { type: Boolean, default: true },
    verified: { type: Boolean, default: false },
    rating: { type: Number, default: null, min: 0, max: 5 },
    medicalNotes: { type: String, default: "" },
    emergencyContact: {
      name: String,
      phone: String,
      relation: String,
    },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },
  },
  { timestamps: true }
);

donorSchema.index({ location: "2dsphere" });
donorSchema.index({ bloodGroup: 1, city: 1, available: 1 });

// Eligibility: 90-day cooldown between donations
donorSchema.virtual("isEligible").get(function () {
  if (!this.lastDonated) return true;
  const days = (Date.now() - this.lastDonated.getTime()) / 86_400_000;
  return days >= 90;
});

donorSchema.set("toJSON", { virtuals: true });
donorSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Donor", donorSchema);