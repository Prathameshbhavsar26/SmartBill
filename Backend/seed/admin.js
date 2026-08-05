import bcrypt from "bcryptjs";
import User from "../models/User.js";

/**
 * Seed a default Super Admin account on server startup.
 * This is idempotent — it only creates the admin if one with the given
 * email does not already exist. If the email exists with a different role
 * (e.g. a business owner), it is promoted to superadmin so the admin login
 * always opens the admin panel.
 */
const seedAdmin = async () => {
  const adminEmail = "gawaliomkar2005@gmail.com";
  const adminPassword = "Omkar@2005";

  try {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const existing = await User.findOne({ email: adminEmail });

    if (existing) {
      // If the email already exists (e.g. registered as a business owner),
      // promote it to superadmin and sync the password.
      let changed = false;
      if (existing.role !== "superadmin") {
        existing.role = "superadmin";
        changed = true;
      }
      if (!existing.businessName) {
        existing.businessName = "SmartBill";
        changed = true;
      }
      // Always ensure the admin password is set correctly.
      existing.password = hashedPassword;
      changed = true;

      if (changed) {
        await existing.save();
        console.log(
          `[SEED] Promoted existing user ${adminEmail} to Super Admin.`,
        );
      } else {
        console.log(
          `[SEED] Super Admin already exists (${adminEmail}). Skipping.`,
        );
      }
      return;
    }

    await User.create({
      firstName: "Omkar",
      lastName: "Gawali",
      businessName: "SmartBill",
      email: adminEmail,
      phone: "8830164600",
      businessType: "Services",
      password: hashedPassword,
      role: "superadmin",
    });

    console.log(`[SEED] Super Admin created: ${adminEmail}`);
  } catch (error) {
    console.error("[SEED] Error creating Super Admin:", error.message);
  }
};

export default seedAdmin;
