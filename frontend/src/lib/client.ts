import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api";

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token on every request
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle authentication errors
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    // Only redirect on 401 if it's not a login/register request
    const isAuthEndpoint =
      err.config?.url?.includes("/auth/login") ||
      err.config?.url?.includes("/auth/register");

    if (
      err.response?.status === 401 &&
      typeof window !== "undefined" &&
      !isAuthEndpoint
    ) {
      localStorage.removeItem("access_token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);
