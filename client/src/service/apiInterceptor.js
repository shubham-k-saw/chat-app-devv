import axios from "axios";
import { reFreshAccessToken } from "./api";
const API_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // This ensures cookies are sent with every request
});

const axiosInterceptor = () => {
  api.interceptors.response.use(
    async (response) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Attempt to refresh the token
          await reFreshAccessToken();

          // If successful, retry the original request
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh token failed, redirect to login
          if (window.location.pathname === "/login") {
            return;
          } else {
            window.location.href = "/login";
          }
          localStorage.removeItem("userInfo");

          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  return api;
};

export default axiosInterceptor;
