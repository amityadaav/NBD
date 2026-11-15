
// const jwt = require("jsonwebtoken");
// const User = require("../models/User");

// exports.authenticate = async (req, res, next) => {
//   try {
//     const header = req.headers.authorization;

//     if (!header || !header.startsWith("Bearer ")) {
//       return res.status(401).json({
//         success: false,
//         message: "Authentication required.",
//       });
//     }

//     if (!process.env.JWT_SECRET) {
//       console.error("JWT_SECRET is not configured.");

//       return res.status(500).json({
//         success: false,
//         message: "Server authentication configuration error.",
//       });
//     }

//     const token = header.split(" ")[1];
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     if (!decoded.id) {
//       return res.status(401).json({
//         success: false,
//         message: "Token does not contain a valid user ID.",
//       });
//     }

//     const user = await User.findById(decoded.id)
//       .select("_id fullname email role hospitalId isActive");

//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         message: "User associated with this token was not found.",
//       });
//     }

//     if (user.isActive !== true) {
//       return res.status(403).json({
//         success: false,
//         message: "Account is inactive. Contact an administrator.",
//       });
//     }

//     req.user = {
//       id: user._id.toString(),
//       role: user.role,
//       hospitalId: user.hospitalId,
//     };

//     return next();
//   } catch (error) {
//     console.error("Authentication error:", error.message);

//     return res.status(401).json({
//       success: false,
//       message: "Invalid or expired token.",
//     });
//   }
// };
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "JWT_SECRET is not configured.",
      });
    }

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload.",
      });
    }

    const user = await User.findById(decoded.id).select(
      "_id fullname email role hospitalId isActive"
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.isActive !== true) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive.",
      });
    }

    req.user = {
      id: user._id.toString(),
      role: user.role,
      hospitalId: user.hospitalId,
    };

    return next();
  } catch (error) {
    console.error("Authentication error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

module.exports = { authenticate };