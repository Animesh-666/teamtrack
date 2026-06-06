/**
 * AuthLayout.jsx
 * ─────────────────────────────────────────────────────────────
 * Layout wrapper for authentication routes (Login, Register).
 * Provides a global theme wrapper and viewport constraints.
 */

import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="relative min-h-screen bg-[#0f172a] text-slate-200 selection:bg-green-500/30 selection:text-white">
      {/* Viewport content */}
      <main className="relative z-10 w-full min-h-screen flex flex-col">
        <Outlet />
      </main>
    </div>
  );
};

export default AuthLayout;