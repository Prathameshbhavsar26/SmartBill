import Customer from "../models/Customer.js";

<<<<<<< HEAD
export const createCustomer = async (req, res) => {
  try {
    const { name, contact, phone, email, city, gst } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: "Business name is required.", field: "name" });
    }

    const businessType = req.user?.businessType || "Retail";
    const cleanedGst = businessType === "Wholesale" ? String(gst ?? "").trim() : "";

    const created = await Customer.create({
      name: String(name).trim(),
      contact: String(contact ?? "").trim(),
      phone: String(phone ?? "").trim(),
      email: String(email ?? "").trim().toLowerCase(),
      city: String(city ?? "").trim(),
      gst: cleanedGst,
    });

    const customer = {
      id: created._id.toString(),
      name: created.name,
      contact: created.contact,
      phone: created.phone,
      email: created.email,
      city: created.city,
      gst: created.gst,
      balance: created.balance,
      status: created.status,
      invoices: created.invoices,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    };

    return res.status(201).json({ message: "Customer created successfully.", customer });
  } catch (error) {
    console.error("CREATE CUSTOMER ERROR:", error);
    return res.status(500).json({ message: "Unable to create customer. Please try again." });
  }
};

export const listCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    const mapped = customers.map((c) => ({
      id: c._id.toString(),
      name: c.name,
      contact: c.contact,
      phone: c.phone,
      email: c.email,
      city: c.city,
      gst: c.gst,
      balance: c.balance,
      status: c.status,
      invoices: c.invoices,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));
    return res.status(200).json({ customers: mapped });
  } catch (error) {
    console.error("LIST CUSTOMERS ERROR:", error);
    return res.status(500).json({ message: "Unable to load customers. Please try again." });
=======
// ================= LIST CUSTOMERS =================
export const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({ ownerId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ message: "OK", customers });
  } catch (error) {
    console.error("GET CUSTOMERS ERROR:", error.message);
    return res.status(500).json({ message: "Failed to fetch customers." });
  }
};

// ================= GET SINGLE CUSTOMER =================
export const getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      ownerId: req.user._id,
    }).lean();

    if (!customer) {
      return res.status(404).json({ message: "Customer not found." });
    }

    return res.status(200).json({ message: "OK", customer });
  } catch (error) {
    console.error("GET CUSTOMER ERROR:", error.message);
    return res.status(500).json({ message: "Failed to fetch customer." });
  }
};

// ================= CREATE CUSTOMER =================
export const createCustomer = async (req, res) => {
  try {
    const {
      name,
      contact,
      phone,
      email,
      city,
      gst,
      openingBalance = 0,
    } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: "Customer name is required." });
    }

    const opening = Number(openingBalance) || 0;

    const existing = await Customer.findOne({
      ownerId: req.user._id,
      name: String(name).trim(),
    });

    if (existing) {
      return res.status(409).json({
        message: "A customer with this name already exists.",
        field: "name",
      });
    }

    const customer = await Customer.create({
      ownerId: req.user._id,
      name: String(name).trim(),
      contact: contact || "",
      phone: phone || "",
      email: email || "",
      city: city || "",
      gst: gst || "",
      openingBalance: opening,
      totalOrderValue: 0,
      totalPaid: 0,
      balance: opening,
      invoices: 0,
      status: "Active",
    });

    return res.status(201).json({ message: "OK", customer });
  } catch (error) {
    console.error("CREATE CUSTOMER ERROR:", error.message);
    return res.status(500).json({ message: "Failed to create customer." });
  }
};

// ================= UPDATE CUSTOMER =================
export const updateCustomer = async (req, res) => {
  try {
    const { name, contact, phone, email, city, gst, status } = req.body;

    const customer = await Customer.findOne({
      _id: req.params.id,
      ownerId: req.user._id,
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found." });
    }

    if (name !== undefined) customer.name = String(name).trim() || customer.name;
    if (contact !== undefined) customer.contact = contact;
    if (phone !== undefined) customer.phone = phone;
    if (email !== undefined) customer.email = email;
    if (city !== undefined) customer.city = city;
    if (gst !== undefined) customer.gst = gst;
    if (status !== undefined) {
      customer.status = ["Active", "Inactive"].includes(status)
        ? status
        : customer.status;
    }

    await customer.save();

    return res.status(200).json({ message: "OK", customer });
  } catch (error) {
    console.error("UPDATE CUSTOMER ERROR:", error.message);
    return res.status(500).json({ message: "Failed to update customer." });
  }
};

// ================= DELETE CUSTOMER =================
export const deleteCustomer = async (req, res) => {
  try {
    const result = await Customer.findOneAndDelete({
      _id: req.params.id,
      ownerId: req.user._id,
    });

    if (!result) {
      return res.status(404).json({ message: "Customer not found." });
    }

    return res.status(200).json({ message: "Customer deleted successfully." });
  } catch (error) {
    console.error("DELETE CUSTOMER ERROR:", error.message);
    return res.status(500).json({ message: "Failed to delete customer." });
>>>>>>> 767a4931 (Add customer and order management)
  }
};
