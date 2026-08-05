import Customer from "../models/Customer.js";

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
  }
};
