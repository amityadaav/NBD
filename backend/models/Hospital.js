
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
      required: [true, "Hospital type is required"],
      trim: true,
    },

    ownershipType: {
      type: String,
      enum: ["Private", "Government", "Trust", "NGO", "Other"],
      required: [true, "Ownership type is required"],
    },

    registrationNumber: {
      type: String,
      trim: true,
      default: "",
    },

    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
      default: "",
    },

    establishmentYear: {
      type: Number,
      min: [1800, "Invalid establishment year"],
      max: [new Date().getFullYear(), "Establishment year cannot be in the future"],
    },

    // Hospital Contact Information
    email: {
      type: String,
      required: [true, "Hospital email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email address"],
    },

    phone: {
      type: String,
      required: [true, "Hospital phone is required"],
      match: [/^[0-9]{10}$/, "Enter a valid 10-digit phone number"],
    },

    alternatePhone: {
      type: String,
      default: "",
      validate: {
        validator: (value) => !value || /^[0-9]{10}$/.test(value),
        message: "Enter a valid 10-digit alternate phone number",
      },
    },

    website: {
      type: String,
      trim: true,
      default: "",
    },

    // Owner / Authorized Representative
    owner: {
      name: {
        type: String,
        required: [true, "Owner name is required"],
        trim: true,
      },

      email: {
        type: String,
        required: [true, "Owner email is required"],
        lowercase: true,
        trim: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid owner email"],
      },

      phone: {
        type: String,
        required: [true, "Owner phone is required"],
        match: [/^[0-9]{10}$/, "Enter a valid phone number"],
      },

      designation: {
        type: String,
        trim: true,
        default: "Hospital Administrator",
      },
    },

    // Hospital Address
    address: {
      street: {
        type: String,
        required: [true, "Street address is required"],
        trim: true,
      },

      area: {
        type: String,
        required: [true, "Area is required"],
        trim: true,
      },

      city: {
        type: String,
        required: [true, "City is required"],
        trim: true,
      },

      state: {
        type: String,
        required: [true, "State is required"],
        trim: true,
      },

      pincode: {
        type: String,
        required: [true, "PIN code is required"],
        match: [/^[0-9]{6}$/, "Enter a valid 6-digit PIN code"],
      },

      country: {
        type: String,
        trim: true,
        default: "India",
      },

      location: {
        latitude: {
          type: Number,
          min: -90,
          max: 90,
        },
        longitude: {
          type: Number,
          min: -180,
          max: 180,
        },
      },
    },

    // Medical Services
    specialties: {
      type: [String],
      default: [],
    },

    departments: {
      type: [String],
      default: [],
    },

    facilities: {
      type: [String],
      default: [],
    },

    // Hospital Capacity
    totalBeds: {
      type: Number,
      min: [0, "Beds cannot be negative"],
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

        openTime: {
          type: String,
          default: "",
        },

        closeTime: {
          type: String,
          default: "",
        },
      },
    ],

    // Registration and Verification Documents
    documents: {
      registrationCertificate: {
        type: String,
        default: "",
      },

      ownerIdProof: {
        type: String,
        default: "",
      },

      medicalLicense: {
        type: String,
        default: "",
      },

      additionalDocuments: {
        type: [String],
        default: [],
      },
    },

    // Images
    logo: {
      type: String,
      default: "",
    },

    images: {
      type: [String],
      default: [],
    },

    // Verification Workflow
    verificationStatus: {
      type: String,
      enum: ["Pending", "Under Review", "Verified", "Rejected"],
      default: "Pending",
      index: true,
    },

    rejectionReason: {
      type: String,
      trim: true,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: false,
      index: true,
    },

    // Review Information
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    // Hospital Administrator
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Useful for hospital search
hospitalSchema.index({
  "address.city": 1,
  "address.state": 1,
});

module.exports = mongoose.model("Hospital", hospitalSchema);
