import axiosClient from "./axiosClient";

export const fetchCustomers = () =>
  axiosClient.get("/customers").then((res) => res.data.customers);

export const createCustomer = (payload) =>
  axiosClient.post("/customers", payload).then((res) => res.data.customer);
