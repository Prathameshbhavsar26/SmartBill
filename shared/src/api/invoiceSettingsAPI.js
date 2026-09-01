import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const getInvoiceSettings = async () => {
  const token = localStorage.getItem("smartbill_token");
  if (!token) throw new Error("No auth token");

  const response = await axios.get(`${API_URL}/api/settings/invoice`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateInvoiceSettings = async (data) => {
  const token = localStorage.getItem("smartbill_token");
  if (!token) throw new Error("No auth token");

  const response = await axios.put(`${API_URL}/api/settings/invoice`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};



