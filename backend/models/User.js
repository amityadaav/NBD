
const { Schema, model } = require("mongoose");

const UserSchema = new Schema(
  {
    fullname: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },

    phone: {
      type: String,
      required: false,
      default: "",
      trim: true
    },

    role: {
      type: String,
      enum: ["patient", "doctor", "admin"],
      default: "patient",
    },

    profileImage: {
      type: String,
      default: "",
    },

    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer_not_to_say"],
      default: "prefer_not_to_say",
    },

    dateOfBirth: {
      type: Date,
      default: null,
    },

    address: {
      type: String,
      trim: true,
      default: "",
    },

    city: {
      type: String,
      trim: true,
      default: "",
    },

    state: {
      type: String,
      trim: true,
      default: "",
    },

    pincode: {
      type: String,
      trim: true,
      default: "",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    role: {
  type: String,
  enum: [
    "patient",
    "doctor",
    "hospital_admin",
    "super_admin",
    "admin", // Legacy role: migrate existing admin accounts
  ],
  default: "patient",
},

hospitalId: {
  type: require("mongoose").Schema.Types.ObjectId,
  ref: "Hospital",
  default: null,
},
  },
  {
    timestamps: true,
  }
);

const UserData = model("UserData", UserSchema);

module.exports = UserData;
