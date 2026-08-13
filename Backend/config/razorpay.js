import Razorpay from "razorpay";
import "dotenv/config";

const key_id = process.env.RAZORPAY_KEY_ID || "rzp_test_TPCMQcPRZqe62i";
const key_secret = process.env.RAZORPAY_KEY_SECRET || "rzp_test_secret_placeholder";

export const razorpayInstance = new Razorpay({
  key_id,
  key_secret,
});
