const mongoose = require("mongoose");

const MedicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    dosage: { type: String, trim: true, default: "" },       // e.g. "500mg"
    frequency: { type: String, trim: true, default: "" },    // e.g. "Twice a day"
    duration: { type: String, trim: true, default: "" },     // e.g. "5 days"
    instructions: { type: String, trim: true, default: "" }, // e.g. "After meals"
  },
  { _id: false }
);

const PrescriptionSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      default: null,
    },
    diagnosis: { type: String, trim: true, default: "" },
    medicines: { type: [MedicineSchema], default: [] },
    notes: { type: String, trim: true, default: "" },
    followUpDate: { type: Date, default: null },
    issuedDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["Active", "Completed", "Expired"],
      default: "Active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Prescription", PrescriptionSchema);