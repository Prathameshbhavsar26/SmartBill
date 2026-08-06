import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * Authentication middleware — verifies the JWT from the Authorization header
 * and attaches the authenticated user to `req.user`.
 */
export const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Not authorized, no token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res
        .status(401)
        .json({ message: "Not authorized, user not found." });
    }

    req.user = user;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Not authorized, invalid or expired token." });
  }
};
