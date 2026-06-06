/**
 * AuthContext.jsx
 * ─────────────────────────────────────────────────────────────
 * Provides authentication state, login, registration, logout, and token persistence.
 */

import { createContext, useState, useEffect } from "react";
import authService from "../services/authService";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize Auth state from localStorage token
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Fetch current user details
        const res = await authService.getMe();
        setUser(res.data?.user || res.data || res);
      } catch (error) {
        console.error("Authentication initialization failed:", error);
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const res = await authService.login(credentials);
      const data = res.data || res;
      localStorage.setItem("token", data.token);

      // 🚀 FIXED: Fallback directly to 'data' object if your server doesn't nest it under a 'user' key
      const completeUser = data.user || data;
      setUser(completeUser);
      return completeUser;
    } catch (error) {
      localStorage.removeItem("token");
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await authService.register(userData);
      const data = res.data || res;
      localStorage.setItem("token", data.token);

      // 🚀 FIXED: Fallback directly to 'data' object if your server doesn't nest it under a 'user' key
      const completeUser = data.user || data;
      setUser(completeUser);
      return completeUser;
    } catch (error) {
      localStorage.removeItem("token");
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout request failed on server:", error);
    } finally {
      localStorage.removeItem("token");
      setUser(null);
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};