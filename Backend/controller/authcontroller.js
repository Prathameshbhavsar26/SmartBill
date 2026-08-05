import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import Verification from "../models/verifiy.js";

// Helper to build a safe, token-bearing auth response.
const buildAuthPayload = (user) => {
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
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
      message:
        "Something went wrong while creating your account. Please try again.",
    });
  }
};

// ================= LOGIN =================

// Detect whether the login identifier is an email or a phone number.
// Returns { type: "email" } | { type: "phone", value } | { type: "none" }.
const detectIdentifier = (raw) => {
  const trimmed = String(raw ?? "").trim();
  if (!trimmed) return { type: "none" };

  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  if (isEmail) return { type: "email", value: trimmed.toLowerCase() };

  const digits = trimmed.replace(/\D/g, "");
  const normalized =
    digits.startsWith("91") && digits.length === 12 ? digits.slice(2) : digits;

  if (/^\d{10}$/.test(normalized)) {
    return { type: "phone", value: normalized };
  }

  return { type: "none" };
};

export const login = async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    const identifier = detectIdentifier(email ?? phone);

    if (identifier.type === "none" || !password) {
      return res
        .status(400)
        .json({
          message: "A valid email or mobile number and password are required.",
        });
    }

    const query =
      identifier.type === "email"
        ? { email: identifier.value }
        : { phone: identifier.value };

    const user = await User.findOne(query);

    if (!user) {
      const label = identifier.type === "email" ? "email" : "mobile number";
      return res.status(400).json({ message: `Invalid ${label} or password.` });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      const label = identifier.type === "email" ? "email" : "mobile number";
      return res.status(400).json({ message: `Invalid ${label} or password.` });
    }

    return res.status(200).json(buildAuthPayload(user));
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({
      message: "Something went wrong while signing in. Please try again.",
    });
  }
};

// ================= OTP VERIFICATION =================

// Normalize phone to 10-digit Indian format (strips +91 / 91 prefix).
const normalizePhone = (raw) => {
  const digits = String(raw ?? "").replace(/\D/g, "");
  return digits.startsWith("91") && digits.length === 12
    ? digits.slice(2)
    : digits;
};

// Generate a 6-digit OTP.
const generateOtp = () => crypto.randomInt(100000, 999999).toString();

// Send OTP to a phone number.
// NOTE: Since no SMS provider is configured, the OTP is logged to the
// server console so it can be used during development.
export const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    const normalizedPhone = normalizePhone(phone);

    if (!/^\d{10}$/.test(normalizedPhone)) {
      return res.status(400).json({
        message: "A valid 10-digit phone number is required.",
        field: "phone",
      });
    }

    // Check if this number is already registered
    const existingUser = await User.findOne({ phone: normalizedPhone });
    if (existingUser) {
      return res.status(409).json({
        message:
          "This phone number is already registered. Please sign in instead.",
        field: "phone",
      });
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min

    await Verification.findOneAndDelete({ phone: normalizedPhone });
    await Verification.create({
      phone: normalizedPhone,
      otp,
      expiresAt,
    });

    // Development-only: print the OTP to the console.
    console.log(`[OTP] For ${normalizedPhone}: ${otp}`);

    return res.status(200).json({
      message: "OTP sent successfully.",
    });
  } catch (error) {
    console.error("SEND OTP ERROR:", error);
    return res.status(500).json({
      message: "Something went wrong while sending the OTP. Please try again.",
    });
  }
};

// Verify the OTP provided for a phone number.
export const verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const normalizedPhone = normalizePhone(phone);

    if (!/^\d{10}$/.test(normalizedPhone)) {
      return res.status(400).json({
        message: "A valid 10-digit phone number is required.",
        field: "phone",
      });
    }

    if (!otp || !/^\d{6}$/.test(String(otp).trim())) {
      return res.status(400).json({
        message: "A valid 6-digit OTP is required.",
        field: "otp",
      });
    }

    const record = await Verification.findOne({ phone: normalizedPhone });

    if (!record) {
      return res.status(400).json({
        message: "No OTP was sent to this number. Please request a new OTP.",
        field: "otp",
      });
    }

    if (record.expiresAt < new Date()) {
      await Verification.deleteOne({ _id: record._id });
      return res.status(400).json({
        message: "OTP has expired. Please request a new one.",
        field: "otp",
      });
    }

    if (record.otp !== String(otp).trim()) {
      return res.status(400).json({
        message: "Incorrect OTP. Please try again.",
        field: "otp",
      });
    }

    record.verified = true;
    await record.save();

    return res.status(200).json({
      message: "Phone number verified successfully.",
      verified: true,
    });
  } catch (error) {
    console.error("VERIFY OTP ERROR:", error);
    return res.status(500).json({
      message:
        "Something went wrong while verifying the OTP. Please try again.",
    });
  }
};
