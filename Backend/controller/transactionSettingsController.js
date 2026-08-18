import TransactionSettings from "../models/TransactionSettings.js";

// GET /api/settings/transaction
export const getTransactionSettings = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    let transaction = await TransactionSettings.findOne({ userId });

    // If no transaction settings exist yet, create default settings
    if (!transaction) {
      transaction = await TransactionSettings.create({
        userId,

        // Sales & Pricing
        salePrice: "Retail Price",
        discountType: "Percentage",
        allowDiscount: true,
        allowPriceEditing: false,
        allowNegativeStock: false,

        // Discount Rules
        discountAppliedOn: "Item-wise",
        maximumDiscount: "20",
        restrictDiscountLimit: true,

        // Sales Returns
        requireReturnPasscode: false,
        allowPartialReturn: true,
        restoreStockAfterReturn: true,
        allowReturnWithoutInvoice: false,

        // Cash Discount
        enableCashDiscount: true,
        cashDiscountType: "Percentage",
        defaultCashDiscount: "0",

        // Invoice Behavior
        autoSaveInvoice: true,
        printAfterSaving: false,
        showPrintPreview: true,

        // Order Management
        linkOrdersToInvoices: true,
        autoConvertOrders: false,
        allowPartialOrderConversion: true,
      });
    }

    return res.status(200).json({
      message: "Transaction settings retrieved successfully.",
      transactionSettings: transaction,
    });
  } catch (error) {
    console.error("GET TRANSACTION SETTINGS ERROR:", error);

    return res.status(500).json({
      message: "Failed to retrieve transaction settings.",
    });
  }
};

// PUT /api/settings/transaction
export const updateTransactionSettings = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    const {
      salePrice,
      discountType,
      allowDiscount,
      allowPriceEditing,
      allowNegativeStock,

      discountAppliedOn,
      maximumDiscount,
      restrictDiscountLimit,

      requireReturnPasscode,
      allowPartialReturn,
      restoreStockAfterReturn,
      allowReturnWithoutInvoice,

      enableCashDiscount,
      cashDiscountType,
      defaultCashDiscount,

      autoSaveInvoice,
      printAfterSaving,
      showPrintPreview,

      linkOrdersToInvoices,
      autoConvertOrders,
      allowPartialOrderConversion,
    } = req.body;

    const transaction = await TransactionSettings.findOneAndUpdate(
      { userId },
      {
        $set: {
          salePrice: salePrice ?? "Retail Price",
          discountType: discountType ?? "Percentage",
          allowDiscount: allowDiscount ?? true,
          allowPriceEditing: allowPriceEditing ?? false,
          allowNegativeStock: allowNegativeStock ?? false,

          discountAppliedOn: discountAppliedOn ?? "Item-wise",
          maximumDiscount: maximumDiscount ?? "20",
          restrictDiscountLimit: restrictDiscountLimit ?? true,

          requireReturnPasscode: requireReturnPasscode ?? false,
          allowPartialReturn: allowPartialReturn ?? true,
          restoreStockAfterReturn: restoreStockAfterReturn ?? true,
          allowReturnWithoutInvoice: allowReturnWithoutInvoice ?? false,

          enableCashDiscount: enableCashDiscount ?? true,
          cashDiscountType: cashDiscountType ?? "Percentage",
          defaultCashDiscount: defaultCashDiscount ?? "0",

          autoSaveInvoice: autoSaveInvoice ?? true,
          printAfterSaving: printAfterSaving ?? false,
          showPrintPreview: showPrintPreview ?? true,

          linkOrdersToInvoices: linkOrdersToInvoices ?? true,
          autoConvertOrders: autoConvertOrders ?? false,
          allowPartialOrderConversion:
            allowPartialOrderConversion ?? true,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      message: "Transaction settings saved successfully.",
      transactionSettings: transaction,
    });
  } catch (error) {
    console.error("UPDATE TRANSACTION SETTINGS ERROR:", error);

    return res.status(400).json({
      message:
        error.message || "Failed to save transaction settings.",
    });
  }
};

export default {
  getTransactionSettings,
  updateTransactionSettings,
};