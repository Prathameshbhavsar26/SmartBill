import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import Verification from "../models/verifiy.js";

// ======================================================
// HELPER: BUILD AUTH RESPONSE
// ======================================================

const buildAuthPayload = (user, ownerUser = null) => {
  const effectiveOwnerId = user.ownerId ? user.ownerId : user._id;
  const effectiveBusinessName =
    user.ownerId && ownerUser ? ownerUser.businessName : user.businessName;
  const effectiveBusinessType =
    user.ownerId && ownerUser ? ownerUser.businessType : user.businessType;

  const token = jwt.sign(
    {
      id: user._id,
      ownerId: effectiveOwnerId,
      role: user.role,
      businessType: effectiveBusinessType,
      permissions: user.permissions || {},
    },
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
      businessName: effectiveBusinessName,
      businessType: effectiveBusinessType,
      email: user.email,
      phone: user.phone,
      role: user.role,
      ownerId: effectiveOwnerId,
      department: user.department || "",
      permissions: user.permissions || {},
      status: user.status || "Active",
      tagline: user.tagline || "",
      address: user.address || "",
      city: user.city || "",
      state: user.state || "",
      pincode: user.pincode || "",
      country: user.country || "India",
      gstin: user.gstin || "",
      panNumber: user.panNumber || "",
      msmeNumber: user.msmeNumber || "",
      bankName: user.bankName || "",
      accountNumber: user.accountNumber || "",
      ifscCode: user.ifscCode || "",
      branchName: user.branchName || "",
      upiId: user.upiId || "",
      invoiceTerms: user.invoiceTerms || "",
      invoiceFooter: user.invoiceFooter || "",
      logoUrl: user.logoUrl || "",
      signatureUrl: user.signatureUrl || "",
    },
  };
};

// ======================================================
// HELPER: NORMALIZE PHONE
// ======================================================

const normalizePhone = (raw) => {
  const digits = String(raw ?? "").replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    return digits.slice(2);
  }
  if (digits.length > 10) {
    return digits.slice(-10);
  }
  return digits;
};

// ======================================================
// REGISTER
// ======================================================

export const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      businessName,
      businessType,
      email,
      phone,
      password,
    } = req.body;

    const normalizedBusinessType = ["Retail", "Wholesale"].includes(
      String(businessType ?? "Retail").trim()
    )
      ? String(businessType ?? "Retail").trim()
      : "Retail";

    const errors = [];

    if (!firstName || !String(firstName).trim()) {
      errors.push("First name is required.");
    }

    if (!lastName || !String(lastName).trim()) {
      errors.push("Last name is required.");
    }

    if (!businessName || !String(businessName).trim()) {
      errors.push("Business name is required.");
    }

    if (
      !email ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())
    ) {
      errors.push("A valid email is required.");
    }

    const normalizedPhone = normalizePhone(phone);

    if (!/^\d{10}$/.test(normalizedPhone)) {
      errors.push("A valid 10-digit phone number is required.");
    }

    if (!password || String(password).length < 8) {
      errors.push("Password must be at least 8 characters.");
    }

    if (errors.length > 0) {
      return res.status(400).json({
        message: errors[0],
        errors,
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // Check duplicate phone
    const existingPhone = await User.findOne({
      phone: normalizedPhone,
    });

    if (existingPhone) {
      return res.status(409).json({
        message: "Mobile number already exists. Please sign in instead.",
        field: "phone",
      });
    }

    // Check duplicate email
    const existingEmail = await User.findOne({
      email: normalizedEmail,
    });

    if (existingEmail) {
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
      businessType: normalizedBusinessType,
      email: normalizedEmail,
      phone: normalizedPhone,
      password: hashedPassword,
    });

    return res.status(201).json(buildAuthPayload(user));
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        message: "Email or mobile number already exists.",
      });
    }

    console.error("REGISTER ERROR:", error);

    return res.status(500).json({
      message:
        "Something went wrong while creating your account. Please try again.",
    });
  }
};

// ======================================================
// LOGIN
// ======================================================

const detectIdentifier = (raw) => {
  const trimmed = String(raw ?? "").trim();

  if (!trimmed) {
    return { type: "none" };
  }

  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);

  if (isEmail) {
    return {
      type: "email",
      value: trimmed.toLowerCase(),
    };
  }

  const digits = trimmed.replace(/\D/g, "");

  const normalized =
    digits.startsWith("91") && digits.length === 12
      ? digits.slice(2)
      : digits;

  if (/^\d{10}$/.test(normalized)) {
    return {
      type: "phone",
      value: normalized,
    };
  }

  return {
    type: "none",
  };
};

export const login = async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    const identifier = detectIdentifier(email ?? phone);

    if (identifier.type === "none" || !password) {
      return res.status(400).json({
        message:
          "A valid email or mobile number and password are required.",
      });
    }

    const query =
      identifier.type === "email"
        ? { email: identifier.value }
        : { phone: identifier.value };

    const user = await User.findOne(query);

    if (!user) {
      const label =
        identifier.type === "email" ? "email" : "mobile number";

      return res.status(400).json({
        message: `Invalid ${label} or password.`,
      });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      const label =
        identifier.type === "email" ? "email" : "mobile number";

      return res.status(400).json({
        message: `Invalid ${label} or password.`,
      });
    }

    if (user.status === "Inactive") {
      return res.status(403).json({
        message: "Your account is deactivated. Please contact your business owner.",
      });
    }

    let ownerUser = null;
    if (user.ownerId) {
      ownerUser = await User.findById(user.ownerId);
    }

    return res.status(200).json(buildAuthPayload(user, ownerUser));
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      message:
        "Something went wrong while signing in. Please try again.",
    });
  }
};

// ======================================================
// GET CURRENT USER PROFILE
// ======================================================

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User profile not found.",
      });
    }

    let ownerUser = null;
    if (user.ownerId) {
      ownerUser = await User.findById(user.ownerId);
    }

    const payload = buildAuthPayload(user, ownerUser);

    return res.status(200).json({
      message: "Profile fetched successfully.",
      user: payload.user,
    });
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);

    return res.status(500).json({
      message: "Unable to load your profile. Please try again.",
    });
  }
};

// ======================================================
// UPDATE CURRENT USER PROFILE
// ======================================================

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      firstName,
      lastName,
      businessName,
      businessType,
      email,
      phone,
    } = req.body;

    // ----------------------------------------------
    // Validation
    // ----------------------------------------------

    if (!firstName || !String(firstName).trim()) {
      return res.status(400).json({
        message: "First name is required.",
        field: "firstName",
      });
    }

    if (!businessName || !String(businessName).trim()) {
      return res.status(400).json({
        message: "Business name is required.",
        field: "businessName",
      });
    }

    const normalizedEmail = String(email ?? "")
      .trim()
      .toLowerCase();

    if (
      !normalizedEmail ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
    ) {
      return res.status(400).json({
        message: "A valid email is required.",
        field: "email",
      });
    }

    const currentUserDoc = await User.findById(userId);
    if (!currentUserDoc) {
      return res.status(404).json({
        message: "User profile not found.",
      });
    }

    let normalizedPhone = normalizePhone(phone);
    if (!/^\d{10}$/.test(normalizedPhone)) {
      normalizedPhone = currentUserDoc.phone || "9876543210";
    }

    const normalizedBusinessType = String(businessType ?? currentUserDoc.businessType ?? "Retail").trim() || "Retail";

    // ----------------------------------------------
    // Check whether email belongs to another user (only if email changed)
    // ----------------------------------------------

    if (normalizedEmail && normalizedEmail !== currentUserDoc.email) {
      const existingEmail = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: userId },
      });

      if (existingEmail) {
        return res.status(409).json({
          message: "Email already belongs to another account.",
          field: "email",
        });
      }
    }

    // ----------------------------------------------
    // Check whether phone belongs to another user (only if phone changed)
    // ----------------------------------------------

    if (normalizedPhone && normalizedPhone !== currentUserDoc.phone && normalizedPhone !== "9876543210") {
      const existingPhone = await User.findOne({
        phone: normalizedPhone,
        _id: { $ne: userId },
      });

      if (existingPhone) {
        return res.status(409).json({
          message: "Mobile number already belongs to another account.",
          field: "phone",
        });
      }
    }

    // ----------------------------------------------
    // Update ONLY the currently logged-in user
    // ----------------------------------------------

    const updateFields = {
      firstName: String(firstName).trim(),
      lastName: String(lastName || "").trim(),
      businessName: String(businessName).trim(),
      businessType: normalizedBusinessType,
      email: normalizedEmail,
      phone: normalizedPhone,
    };

    const extraFields = [
      "tagline",
      "address",
      "city",
      "state",
      "pincode",
      "country",
      "gstin",
      "panNumber",
      "msmeNumber",
      "bankName",
      "accountNumber",
      "ifscCode",
      "branchName",
      "upiId",
      "invoiceTerms",
      "invoiceFooter",
      "logoUrl",
      "signatureUrl",
    ];

    extraFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        message: "User profile not found.",
      });
    }

    // Return a new token because profile information
    // such as businessType may have changed.
    const authPayload = buildAuthPayload(updatedUser);

    return res.status(200).json({
      message: "Profile updated successfully.",
      token: authPayload.token,
      user: authPayload.user,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        message: "Email or mobile number already belongs to another account.",
      });
    }

    console.error("UPDATE PROFILE ERROR:", error);

    return res.status(500).json({
      message:
        "Something went wrong while updating your profile. Please try again.",
    });
  }
};

// ======================================================
// OTP HELPERS
// ======================================================

// Generate a 6-digit OTP.
const generateOtp = () =>
  crypto.randomInt(100000, 999999).toString();

// ======================================================
// SEND OTP
// ======================================================

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
    const existingUser = await User.findOne({
      phone: normalizedPhone,
    });

    if (existingUser) {
      return res.status(409).json({
        message:
          "This phone number is already registered. Please sign in instead.",
        field: "phone",
      });
    }

    const otp = generateOtp();

    const expiresAt = new Date(
      Date.now() + 5 * 60 * 1000
    );

    await Verification.findOneAndDelete({
      phone: normalizedPhone,
    });

    await Verification.create({
      phone: normalizedPhone,
      otp,
      expiresAt,
    });

    // Development only
    console.log(`[OTP] For ${normalizedPhone}: ${otp}`);

    return res.status(200).json({
      message: "OTP sent successfully.",
      otp,
    });
  } catch (error) {
    console.error("SEND OTP ERROR:", error);

    return res.status(500).json({
      message:
        "Something went wrong while sending the OTP. Please try again.",
    });
  }
};

// ======================================================
// VERIFY OTP
// ======================================================

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

    const record = await Verification.findOne({
      phone: normalizedPhone,
    });

    if (!record) {
      return res.status(400).json({
        message:
          "No OTP was sent to this number. Please request a new OTP.",
        field: "otp",
      });
    }

    if (record.expiresAt < new Date()) {
      await Verification.deleteOne({
        _id: record._id,
      });

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