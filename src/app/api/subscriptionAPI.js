import axiosClient from "./axiosClient";

export const subscriptionAPI = {
  createOrder: (planName) =>
    axiosClient.post("/subscriptions/create-order", { planName }).then((res) => res.data),

  verifyPayment: (payload) =>
    axiosClient.post("/subscriptions/verify-payment", payload).then((res) => res.data),

  getSubscriptionStatus: () =>
    axiosClient.get("/subscriptions/status").then((res) => res.data),
};

export default subscriptionAPI;
