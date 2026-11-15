
const UserData = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const normalizeEmail = (email) =>
  String(email || "").trim().toLowerCase();

const createToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
      hospitalId: user.hospitalId
        ? user.hospitalId.toString()
        : null,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

// PUBLIC SIGNUP: patients only.
exports.signup = async (req, res) => {
  try {
    const { fullname, email, password, confirmPassword } = req.body;

    if (!fullname?.trim() || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    const normalizedEmail = normalizeEmail(email);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and confirm password must match.",
      });
    }

    const existingUser = await UserData.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await UserData.create({
      fullname: fullname.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "patient",
      hospitalId: null,
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      user: {
        id: newUser._id,
        fullname: newUser.fullname,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email already registered.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create account.",
    });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const existingUser = await UserData.findOne({
      email: normalizeEmail(email),
    }).select("+password");

    if (!existingUser || !existingUser.isActive) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password, or account inactive.",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Hospital Admin must have an approved, active hospital.

if (existingUser.role === "hospital_admin") {
  const Hospital = require("../models/Hospital");

  if (!existingUser.hospitalId) {
    return res.status(403).json({
      success: false,
      message: "No hospital is linked to your account.",
    });
  }

  const hospital = await Hospital.findOne({
    _id: existingUser.hospitalId,
    admin: existingUser._id,
  }).select("verificationStatus isActive");

  if (!hospital) {
    return res.status(403).json({
      success: false,
      message: "Hospital account linkage is invalid.",
    });
  }

  if (
    hospital.verificationStatus !== "Verified" ||
    hospital.isActive !== true
  ) {
    return res.status(403).json({
      success: false,
      message: "Your hospital is not approved or active.",
    });
  }
}


    const token = createToken(existingUser);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: existingUser._id,
        fullname: existingUser.fullname,
        email: existingUser.email,
        role: existingUser.role,
        hospitalId: existingUser.hospitalId || null,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to login.",
    });
  }
};
