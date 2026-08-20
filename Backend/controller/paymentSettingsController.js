import PaymentSettings from "../models/PaymentSettings.js";
import User from "../models/User.js";
import BusinessSettings from "../models/BusinessSettings.js";

// GET /api/settings/payment
export const getPaymentSettings = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    let paymentSettings = await PaymentSettings.findOne({ userId });

    // If no payment settings exist yet, create default settings and initialize from User / BusinessSettings profile if present
    if (!paymentSettings) {
      const user = await User.findById(userId);
      const biz = await BusinessSettings.findOne({ userId });

      paymentSettings = await PaymentSettings.create({
        userId,
        sales: ["Cash", "UPI & QR Code", "Credit / Debit Card", "Store Credit / Khata"],
        purchase: ["Cash", "Bank Transfer", "Cheque / DD", "Credit / Debit Card"],
        expenses: ["Cash", "UPI & QR Code", "Bank Transfer", "Credit / Debit Card"],
        defaultSalesMethod: "Cash",
        upiSettings: {
          enabled: true,
          upiId: user?.upiId || "smartbill@okaxis",
          payeeName: user?.businessName || biz?.businessName || (user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "SmartBill Store"),
          showDynamicQrOnInvoice: true,
        },
        bankSettings: {
          enabled: true,
          bankName: user?.bankName || "HDFC Bank",
          accountHolderName: user?.businessName || biz?.businessName || (user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "SmartBill Store"),
          accountNumber: user?.accountNumber || "50200045892147",
          accountType: "Current",
          ifscCode: user?.ifscCode || "HDFC0001234",
          branchName: user?.branchName || "Industrial Area Branch",
          showOnInvoice: true,
        },
        transactionRules: {
          cashRounding: true,
          allowSplitPayment: true,
          requireReferenceNumber: false,
        },
        customMethods: [],
      });
    }

    return res.status(200).json({
      message: "Payment settings retrieved successfully.",
      paymentSettings,
    });
  } catch (error) {
    console.error("GET PAYMENT SETTINGS ERROR:", error);
    return res.status(500).json({
      message: "Failed to retrieve payment settings.",
    });
  }
};

// PUT /api/settings/payment
export const updatePaymentSettings = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const {
      sales,
      purchase,
      expenses,
      defaultSalesMethod,
      upiSettings,
      bankSettings,
      transactionRules,
      customMethods,
    } = req.body;

    const paymentSettings = await PaymentSettings.findOneAndUpdate(
      { userId },
      {
        $set: {
          ...(sales ? { sales } : {}),
          ...(purchase ? { purchase } : {}),
          ...(expenses ? { expenses } : {}),
          ...(defaultSalesMethod ? { defaultSalesMethod } : {}),
          ...(upiSettings ? { upiSettings } : {}),
          ...(bankSettings ? { bankSettings } : {}),
          ...(transactionRules ? { transactionRules } : {}),
          ...(customMethods ? { customMethods } : {}),
        },
      },
      {
        returnDocument: "after",
        upsert: true,
        runValidators: true,
      }
    );

    // Also synchronize banking and UPI details into User record so all invoice templates stay in sync
    if (bankSettings || upiSettings) {
      await User.findByIdAndUpdate(userId, {
        $set: {
          ...(bankSettings?.bankName ? { bankName: bankSettings.bankName } : {}),
          ...(bankSettings?.accountNumber ? { accountNumber: bankSettings.accountNumber } : {}),
          ...(bankSettings?.ifscCode ? { ifscCode: bankSettings.ifscCode } : {}),
          ...(bankSettings?.branchName ? { branchName: bankSettings.branchName } : {}),
          ...(upiSettings?.upiId ? { upiId: upiSettings.upiId } : {}),
        },
      }).catch((err) => console.warn("User bank sync warning:", err.message));
    }

    return res.status(200).json({
      message: "Payment settings updated successfully.",
      paymentSettings,
    });
  } catch (error) {
    console.error("UPDATE PAYMENT SETTINGS ERROR:", error);
    return res.status(400).json({
      message: error.message || "Failed to update payment settings.",
    });
  }
};

export default {
  getPaymentSettings,
  updatePaymentSettings,
};
