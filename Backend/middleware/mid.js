import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * Authentication middleware — verifies the JWT from the Authorization header
 * and attaches the authenticated user to `req.user`.
 */
export const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ")
      ? header.slice(7)
      : req.query?.token
      ? String(req.query.token).trim()
      : null;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Not authorized, no token provided." });
    }

    let decoded;
    const secret = process.env.JWT_SECRET || "smartbill_secret_key_123";
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      try {
        decoded = jwt.verify(token, "smartbill_secret_key_123`");
      } catch (err2) {
        throw err;
      }
    }

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res
        .status(401)
        .json({ message: "Not authorized, user not found." });
    }

    if (user.role !== "superadmin") {
      let ownerUser = null;
      if (user.ownerId) {
        ownerUser = await User.findById(user.ownerId);
      }

      const userStatus = user.status || "Active";
      const ownerStatus = ownerUser ? (ownerUser.status || "Active") : "Active";

      if (userStatus === "Suspended" || ownerStatus === "Suspended") {
        const reason = user.suspensionReason || ownerUser?.suspensionReason;
        return res.status(403).json({
          message: reason
            ? `Your account has been suspended by administration. Reason: ${reason}`
            : "Your account has been suspended by administration. Access denied.",
        });
      }

      if (userStatus === "Inactive" || ownerStatus === "Inactive") {
        return res.status(403).json({
          message: "Your account is deactivated. Access denied.",
        });
      }
    }

    const effectiveOwnerId = user.ownerId ? user.ownerId : user._id;

    req.user = user.toObject();
    req.user.actualUserId = user._id;
    req.user.ownerId = effectiveOwnerId;
    req.user.effectiveOwnerId = effectiveOwnerId;
    req.user._id = effectiveOwnerId;
    req.user.id = effectiveOwnerId.toString();

    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Not authorized, invalid or expired token." });
  }
};
