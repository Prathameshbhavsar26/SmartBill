import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Helper to build a safe, token-bearing auth response.
const buildAuthPayload = (user) => {
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return {
    message: "OK",
    token,
    user: {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      businessName: user.businessName,
      businessType: user.businessType,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  };
};

// ================= REGISTER =================

export const register = async (req, res) => {
  try {
    const { firstName, lastName, businessName, email, phone, password } =
      req.body;

    // ---- Validation ----
    const errors = [];

    if (!firstName || !String(firstName).trim())
      errors.push("First name is required.");
    if (!lastName || !String(lastName).trim())
      errors.push("Last name is required.");
    if (!businessName || !String(businessName).trim())
      errors.push("Business name is required.");
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim()))
      errors.push("A valid email is required.");
    const rawPhoneDigits = String(phone ?? "").replace(/\D/g, "");
    const normalizedPhone = rawPhoneDigits.startsWith("91")
  ? rawPhoneDigits.slice(2)
  : rawPhoneDigits;

if (!normalizedPhone || !/^\d{10}$/.test(normalizedPhone)) {
  errors.push("A valid 10-digit phone number is required.");
}

// Check if mobile number already exists
const existingPhone = await User.findOne({ phone: normalizedPhone });

if (existingPhone) {
  return res.status(409).json({
    message: "Mobile number already exists. Please sign in instead.",
    field: "phone",
  });
}
    if (!password || String(password).length < 8)
      errors.push("Password must be at least 8 characters.");

    if (errors.length > 0) {
      return res.status(400).json({ message: errors[0], errors });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // Check for duplicate email
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({
        message: "Email already exists. Please sign in instead.",
        field: "email",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName: String(firstName).trim(),
      lastName: String(lastName).trim(),
      businessName: String(businessName).trim(),
      email: normalizedEmail,
      phone: normalizedPhone,
      password: hashedPassword,
    });

    // Return token + user so the frontend can auto-login after registration.
    return res.status(201).json(buildAuthPayload(user));
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        message: "Email already exists. Please sign in instead.",
        field: "email",
      });
    }
    console.error("REGISTER ERROR:", error);
    return res.status(500).json({
      message: "Something went wrong while creating your account. Please try again.",
    });
  }
};

// ================= LOGIN =================

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: String(email).trim().toLowerCase() });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    return res.status(200).json(buildAuthPayload(user));
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({
      message: "Something went wrong while signing in. Please try again.",
    });
  }
};
