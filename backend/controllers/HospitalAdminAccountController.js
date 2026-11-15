const User = require("../models/User");

let bcrypt;
try {
  bcrypt = require("bcryptjs");
} catch {
  bcrypt = require("bcrypt");
}

// PATCH /api/hospital-admin/change-password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};

    if (typeof currentPassword !== "string" || typeof newPassword !== "string" || !currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Current and new password are required." });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: "New password must contain at least 8 characters." });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ success: false, message: "New password must differ from the current password." });
    }

    const user = await User.findById(req.user.id).select("+password");

    if (!user || !user.password) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const matches = await bcrypt.compare(currentPassword, user.password);

    if (!matches) {
      return res.status(400).json({ success: false, message: "Current password is incorrect." });
    }

    const hash = await bcrypt.hash(newPassword, 10);

    // updateOne bypasses any pre-save hashing hook, so the password is never double-hashed
    await User.updateOne({ _id: user._id }, { $set: { password: hash } });

    return res.status(200).json({ success: true, message: "Password updated successfully." });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({ success: false, message: "Failed to change password." });
  }
};