import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

    // No token
    if (!token) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    // JWT_SECRET must be present in .env (or fallback)
    const secret = process.env.JWT_SECRET || "smartbill_secret_key_123";

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      decoded = jwt.verify(token, "smartbill_secret_key_123`");
    }

    const dbUser = await User.findById(decoded.id).select("-password");
    if (!dbUser) {
      return res.status(401).json({
        message: "Not authorized, user account not found.",
      });
    }

    if (dbUser.role !== "superadmin") {
      let ownerUser = null;
      if (dbUser.ownerId) {
        ownerUser = await User.findById(dbUser.ownerId);
      }

      const userStatus = dbUser.status || "Active";
      const ownerStatus = ownerUser ? (ownerUser.status || "Active") : "Active";

      if (userStatus === "Suspended" || ownerStatus === "Suspended") {
        const reason = dbUser.suspensionReason || ownerUser?.suspensionReason;
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

    const effectiveOwnerId = dbUser.ownerId || dbUser._id;

    // Store logged-in user's information in req.user
    req.user = {
      id: effectiveOwnerId.toString(),
      actualUserId: dbUser._id,
      userId: dbUser._id,
      ownerId: effectiveOwnerId,
      _id: effectiveOwnerId,
      role: dbUser.role,
      businessType: dbUser.businessType || "Retail",
      permissions: dbUser.permissions || {},
    };

    next();
  } catch (error) {
    console.error("AUTH MIDDLEWARE ERROR:", error.message);

    return res.status(401).json({
      message: "Invalid or expired authentication token.",
    });
  }
};
