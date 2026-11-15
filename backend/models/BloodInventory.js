// models/BloodInventory.js
const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },
    units: {
      "A+": { type: Number, default: 0 },
      "A-": { type: Number, default: 0 },
      "B+": { type: Number, default: 0 },
      "B-": { type: Number, default: 0 },
      "AB+": { type: Number, default: 0 },
      "AB-": { type: Number, default: 0 },
      "O+": { type: Number, default: 0 },
      "O-": { type: Number, default: 0 },
    },
    capacity: {
      "A+": { type: Number, default: 500 },
      "A-": { type: Number, default: 300 },
      "B+": { type: Number, default: 400 },
      "B-": { type: Number, default: 250 },
      "AB+": { type: Number, default: 300 },
      "AB-": { type: Number, default: 200 },
      "O+": { type: Number, default: 500 },
      "O-": { type: Number, default: 400 },
    },
    city: { type: String, required: true },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BloodInventory", inventorySchema);