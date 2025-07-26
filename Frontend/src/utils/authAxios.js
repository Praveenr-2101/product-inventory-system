import axios from "axios";
import { API_ROUTES } from "./apiRoutes";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const authAxios = axios.create({ baseURL: BASE_URL });

authAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

authAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refresh_token");

      if (refreshToken) {
        try {
          const res = await axios.post(`${BASE_URL}${API_ROUTES.REFRESH_TOKEN}`, {
            refresh: refreshToken,
          });
          const newAccess = res.data.access;
          localStorage.setItem("access_token", newAccess);
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return authAxios(originalRequest);
        } catch {
          localStorage.clear();
        }
      }
    }

    return Promise.reject(error);
  }
);

export default authAxios;
