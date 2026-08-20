import Order from "../models/Order.js";
import Purchase from "../models/Purchase.js";
import Expense from "../models/Expense.js";

export const getCashBalance = async (ownerId) => {
  // Cash in from Sales
  const sales = await Order.aggregate([
    { $match: { ownerId, paymentMode: "Cash" } },
    { $group: { _id: null, totalIn: { $sum: "$amountPaid" }, totalRefund: { $sum: "$refundAmount" } } }
  ]);
  
  const cashIn = (sales[0]?.totalIn || 0) - (sales[0]?.totalRefund || 0);

  // Cash out from Purchases
  const purchases = await Purchase.aggregate([
    { $match: { ownerId, paymentMethod: "Cash" } },
    { $group: { _id: null, totalOut: { $sum: "$amountPaid" } } }
  ]);
  const cashOutPurchases = purchases[0]?.totalOut || 0;

  // Cash out from Expenses
  const expenses = await Expense.aggregate([
    { $match: { ownerId, paymentMethod: "Cash" } },
    { $group: { _id: null, totalOut: { $sum: "$amount" } } }
  ]);
  const cashOutExpenses = expenses[0]?.totalOut || 0;

  return cashIn - cashOutPurchases - cashOutExpenses;
};
