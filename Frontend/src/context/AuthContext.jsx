import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_ROUTES } from "../utils/apiRoutes";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const authAxios = axios.create({
    baseURL: BASE_URL,
  });

  authAxios.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  authAxios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        const refreshToken = localStorage.getItem('refresh_token');

        if (refreshToken) {
          try {
            const res = await axios.post(`${BASE_URL}${API_ROUTES.REFRESH_TOKEN}`, {
              refresh: refreshToken,
            });

            const newAccess = res.data.access;
            localStorage.setItem('access_token', newAccess);
            authAxios.defaults.headers.Authorization = `Bearer ${newAccess}`;
            originalRequest.headers.Authorization = `Bearer ${newAccess}`;

            return authAxios(originalRequest);
          } catch {
            logout();
            return Promise.reject(error);
          }
        } else {
          logout();
        }
      }
      return Promise.reject(error);
    }
  );

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const email = localStorage.getItem('email');
    if (token && email) {
      setUser({ email });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${BASE_URL}${API_ROUTES.LOGIN}`, { email, password });
      const { access, refresh } = response.data;

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('email', email);
      setUser({ email });

      return true;
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      setUser(null);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('email');
    setUser(null);
  };

  if (loading) return <div>Loading authentication...</div>;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, authAxios }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
