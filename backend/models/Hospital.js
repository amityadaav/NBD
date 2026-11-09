
const mongoose = require("mongoose");

const hospitalSchema = new mongoose.Schema(
  {
    // Basic Hospital Information
    hospitalName: {
      type: String,
      required: [true, "Hospital name is required"],
      trim: true,
    },

    hospitalType: {
      type: String,
      enum: [
        "Clinic",
        "Hospital",
        "Multi-Specialty Hospital",
        "Super-Specialty Hospital",
        "Diagnostic Center",
        "Nursing Home",
      ],
      required: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },

    establishmentYear: {
      type: Number,
      min: 1800,
      max: new Date().getFullYear(),
    },

    // Hospital Contact Information
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      match: [/^[0-9]{10}$/, "Enter a valid 10-digit phone number"],
    },

    alternatePhone: {
      type: String,
      match: [/^[0-9]{10}$/, "Enter a valid 10-digit phone number"],
    },

    website: {
      type: String,
      trim: true,
    },

    // Owner / Authorized Representative
    owner: {
      name: {
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

      phone: {
        type: String,
        required: true,
        match: [/^[0-9]{10}$/, "Enter a valid phone number"],
      },

      designation: {
        type: String,
        default: "Hospital Administrator",
      },
    },

    // Hospital Address
    address: {
      street: {
        type: String,
        required: true,
        trim: true,
      },

      area: {
        type: String,
        required: true,
        trim: true,
      },

      city: {
        type: String,
        required: true,
        trim: true,
      },

      state: {
        type: String,
        required: true,
        trim: true,
      },

      pincode: {
        type: String,
        required: true,
        match: [/^[0-9]{6}$/, "Enter a valid 6-digit PIN code"],
      },

      country: {
        type: String,
        default: "India",
      },

      location: {
        latitude: Number,
        longitude: Number,
      },
    },

    // Medical Services
    specialties: [
      {
        type: String,
        trim: true,
      },
    ],

    departments: [
      {
        type: String,
        trim: true,
      },
    ],

    facilities: [
      {
        type: String,
        trim: true,
      },
    ],

    // Hospital Capacity
    totalBeds: {
      type: Number,
      min: 0,
      default: 0,
    },

    emergencyAvailable: {
      type: Boolean,
      default: false,
    },

    ambulanceAvailable: {
      type: Boolean,
      default: false,
    },

    // Operating Hours
    workingHours: [
      {
        day: {
          type: String,
          enum: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
          required: true,
        },

        isOpen: {
          type: Boolean,
          default: true,
        },

        openTime: String,
        closeTime: String,
      },
    ],

    // Registration and Verification Documents
    documents: {
      registrationCertificate: String,
      ownerIdProof: String,
      medicalLicense: String,
      additionalDocuments: [String],
    },

    // Images (store URLs from Cloudinary or another file service)
    logo: {
      type: String,
      default: "",
    },

    images: [
      {
        type: String,
      },
    ],

    // Verification Workflow
    verificationStatus: {
      type: String,
      enum: ["Pending", "Under Review", "Verified", "Rejected"],
      default: "Pending",
    },

    rejectionReason: {
      type: String,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: false,
    },

reviewedBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  default: null,
},

reviewedAt: {
  type: Date,
  default: null,
},


    // Link to the registered hospital administrator
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Hospital", hospitalSchema);