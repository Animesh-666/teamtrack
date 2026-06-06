/**
 * useAuth.js
 * ─────────────────────────────────────────────────────────────
 * Custom React hook wrapping the AuthContext to easily access
 * user session data and authentication actions.
 */

import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default useAuth;