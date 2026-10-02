import Razorpay from "razorpay";
import "dotenv/config";

const key_id = process.env.RAZORPAY_KEY_ID || "rzp_test_TPCMQcPRZqe62i";
const key_secret = process.env.RAZORPAY_KEY_SECRET || "WB9HIOs9OudSgP3ivaGXeJ2E";

let instance = null;
try {
  instance = new Razorpay({
    key_id,
    key_secret,
  });
} catch (err) {
  console.warn("Razorpay instance initialization notice:", err.message);
}

export const razorpayInstance = instance;

