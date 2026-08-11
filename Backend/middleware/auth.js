import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
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

    // JWT_SECRET must be present in .env
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      console.error("JWT_SECRET is not configured in .env");

      return res.status(500).json({
        message: "Server authentication configuration error.",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, secret);

    // Store logged-in user's information in req.user
    req.user = {
      id: decoded.id,
      role: decoded.role,
      businessType: decoded.businessType || "Retail",
    };

    next();
  } catch (error) {
    console.error("AUTH MIDDLEWARE ERROR:", error.message);

    return res.status(401).json({
      message: "Invalid or expired authentication token.",
    });
  }
};
