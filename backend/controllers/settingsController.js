const bcrypt = require("bcrypt");
const User = require("../models/User");

const ALLOWED_PREFS = [
  "emailNotifications",
  "smsNotifications",
  "appointmentReminders",
  "prescriptionAlerts",
  "adminAlerts",
  "language",
  "theme",
];

const DEFAULT_PREFS = {
  emailNotifications: true,
  smsNotifications: false,
  appointmentReminders: true,
  prescriptionAlerts: true,
  adminAlerts: true,
  language: "en",
  theme: "system",
};

// GET /api/settings
exports.getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "fullname email phone gender dateOfBirth city state role preferences createdAt"
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    return res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        phone: user.phone || "",
        gender: user.gender || "prefer_not_to_say",
        dateOfBirth: user.dateOfBirth || null,
        city: user.city || "",
        state: user.state || "",
        role: user.role,
        createdAt: user.createdAt,
        preferences: { ...DEFAULT_PREFS, ...(user.preferences || {}) },
      },
    });
  } catch (error) {
    console.error("Get settings error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Unable to load settings." });
  }
};

// PATCH /api/settings
exports.updateSettings = async (req, res) => {
  try {
    const {
      fullname,
      phone,
      gender,
      dateOfBirth,
      city,
      state,
      preferences,
    } = req.body;

    const updates = {};

    if (typeof fullname === "string") {
      if (!fullname.trim()) {
        return res
          .status(400)
          .json({ success: false, message: "Name cannot be empty." });
      }
      updates.fullname = fullname.trim();
    }

    if (typeof phone === "string") updates.phone = phone.trim();
    if (typeof city === "string") updates.city = city.trim();
    if (typeof state === "string") updates.state = state.trim();

    if (
      gender &&
      ["male", "female", "other", "prefer_not_to_say"].includes(gender)
    ) {
      updates.gender = gender;
    }

    if (dateOfBirth) {
      const d = new Date(dateOfBirth);
      if (!Number.isNaN(d.getTime())) updates.dateOfBirth = d;
    }

    if (preferences && typeof preferences === "object") {
      for (const key of ALLOWED_PREFS) {
        if (preferences[key] !== undefined) {
          updates[`preferences.${key}`] = preferences[key];
        }
      }
    }

    if (Object.keys(updates).length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Nothing to update." });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("fullname email phone preferences role");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Settings updated successfully.",
      user,
    });
  } catch (error) {
    console.error("Update settings error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Unable to update settings." });
  }
};

// PATCH /api/settings/password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "All password fields are required." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters.",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirmation do not match.",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from current password.",
      });
    }

    const user = await User.findById(req.user.id).select("+password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Current password is incorrect." });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Password changed successfully." });
  } catch (error) {
    console.error("Change password error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Unable to change password." });
  }
};