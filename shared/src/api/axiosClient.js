import axios from "axios";

// Robust Base URL resolution:
// Automatically normalizes full URLs, strips quotes/trailing slashes, and appends /api if missing
export const resolveApiBaseUrl = () => {
  let raw = "";
  if (typeof import.meta !== "undefined" && import.meta.env) {
    raw = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "";
  }

  let base = String(raw || "").trim();
  if (base.includes("\n")) {
    const lines = base.split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("#"));
    const found = lines.find((l) => (l.includes("http://") || l.includes("https://")) && (l.includes("api") || l.includes("5000") || l.includes("render")));
    if (found) {
      base = found.includes("=") ? found.split("=").slice(1).join("=") : found;
    } else {
      base = lines[0] || "";
    }
  }
  const httpMatch = base.match(/https?:\/\/[^\s"']+/);
  if (httpMatch) {
    base = httpMatch[0];
  }
  base = base.replace(/#.*$/, "").trim().replace(/^["']|["']$/g, "").replace(/\/+$/, "");

  if (base.includes("smartbill-crm.onrender.com")) {
    base = "https://smartbill-backend-tqf5.onrender.com/api";
  }

  if (!base) {
    return "https://smartbill-backend-tqf5.onrender.com/api";
  }

  if ((base.startsWith("http://") || base.startsWith("https://")) && !base.endsWith("/api")) {
    base = `${base}/api`;
  }

  return base;
};

const BASE_URL = resolveApiBaseUrl();

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000,
});

// Request interceptor: attach JWT token if present in localStorage.
axiosClient.interceptors.request.use(
  (config) => {
    const token = typeof localStorage !== "undefined" ? localStorage.getItem("smartbill_token") : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with auto-fallback between proxy and direct host in development
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If request was canceled by AbortController or axios cancel, do not retry
    if (
      axios.isCancel(error) ||
      error?.name === "CanceledError" ||
      error?.code === "ERR_CANCELED" ||
      error?.message === "canceled" ||
      originalRequest?.signal?.aborted
    ) {
      return Promise.reject({
        name: "CanceledError",
        code: "ERR_CANCELED",
        isCanceled: true,
        message: "canceled",
        raw: error,
      });
    }

    // In local development, if request to /api fails due to network error, try fallback to localhost:5000/api
    const isLocalDev =
      typeof window !== "undefined" &&
      window.location &&
      (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

    if (!error.response && originalRequest && !originalRequest._retryFallback && isLocalDev) {
      originalRequest._retryFallback = true;
      try {
        const fallbackBase =
          originalRequest.baseURL === "/api" || !originalRequest.baseURL
            ? `${window.location.protocol}//${window.location.hostname}:5000/api`
            : "/api";
        originalRequest.baseURL = fallbackBase;
        const token = typeof localStorage !== "undefined" ? localStorage.getItem("smartbill_token") : null;
        if (token) {
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        return await axiosClient.request(originalRequest);
      } catch (fallbackError) {
        if (fallbackError.response) {
          const status = fallbackError.response.status;
          const data = fallbackError.response.data || {};
          const isSusp = Boolean(
            data.isSuspended ||
            data.status === "Suspended" ||
            data.code === "ACCOUNT_SUSPENDED" ||
            (status === 403 && typeof data.message === "string" && /suspended/i.test(data.message))
          );
          return Promise.reject({
            message: data.message || `Request failed with status ${status}`,
            status,
            field: data.field || null,
            errors: data.errors || null,
            raw: fallbackError,
            data,
            isSuspended: isSusp,
            suspensionReason: data.suspensionReason || null,
          });
        }
      }
    }

    let message = "Network error. Please check your connection and try again.";
    let status = null;
    let field = null;
    let errors = null;
    let data = {};
    let isSuspended = false;
    let suspensionReason = null;

    if (error.response) {
      status = error.response.status;
      data = error.response.data || {};
      message = data.message || `Request failed with status ${status}`;
      field = data.field || null;
      errors = data.errors || null;
      suspensionReason = data.suspensionReason || null;
      isSuspended = Boolean(
        data.isSuspended ||
        data.status === "Suspended" ||
        data.code === "ACCOUNT_SUSPENDED" ||
        (status === 403 && typeof message === "string" && /suspended/i.test(message))
      );

      // If active session token was rejected due to suspension and not login endpoint
      if (isSuspended && !originalRequest?.url?.includes("/auth/login")) {
        try {
          sessionStorage.setItem(
            "smartbill_suspension_notice",
            JSON.stringify({
              reason: suspensionReason || "",
              message: message,
            })
          );
          localStorage.removeItem("smartbill_token");
          localStorage.removeItem("smartbill_user");
          window.dispatchEvent(new Event("userUpdated"));
          if (!window.location.pathname.includes("/login")) {
            window.location.href = "/login";
          }
        } catch {}
      } else if (status === 401 && !originalRequest?.url?.includes("/auth/login")) {
        try {
          localStorage.removeItem("smartbill_token");
          localStorage.removeItem("smartbill_user");
          window.dispatchEvent(new Event("userUpdated"));
          if (!window.location.pathname.includes("/login")) {
            window.location.href = "/login";
          }
        } catch {}
      }
    } else if (error.request) {
      if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
        message = "Server request timed out. Please check if your backend is active and try again.";
      } else {
        const isLocal = typeof window !== "undefined" && window.location && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
        if (isLocal) {
          message = "Cannot reach local backend at http://localhost:5000. Please ensure npm run dev / backend server is running.";
        } else {
          message = "Unable to reach the SmartBill server. Please check your network connection or try again.";
        }
      }
    }

    return Promise.reject({
      message,
      status,
      field,
      errors,
      raw: error,
      data,
      isSuspended,
      suspensionReason,
    });
  }
);

export default axiosClient;
