import axios from "axios";

// Base URL resolution order:
// 1. VITE_API_URL (if set) e.g. http://localhost:5000/api
// 2. Fall back to same-origin proxy /api (Vite dev server proxies to backend)
const BASE_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/+$/, "");

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Request interceptor: attach JWT token if present in localStorage.
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("smartbill_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: normalize errors so every caller gets a readable
// `message` regardless of whether the backend is reachable.
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = "Network error. Please check your connection and try again.";
    let status = null;
    let field = null;
    let errors = null;

    if (error.response) {
      // Server responded with a non-2xx status.
      status = error.response.status;
      const data = error.response.data || {};
      message = data.message || `Request failed with status ${status}`;
      field = data.field || null;
      errors = data.errors || null;
    } else if (error.request) {
      // Request was made but no response received (server offline / CORS / proxy).
      message =
        "Cannot reach the server. Make sure the backend is running on port 5000.";
    }

    return Promise.reject({
      message,
      status,
      field,
      errors,
      raw: error,
    });
  }
);

export default axiosClient;

