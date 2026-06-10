/**
 * DashboardLayout.jsx
 * ─────────────────────────────────────────────────────────────
 * Primary dashboard layout that wraps all authenticated views.
 * Handles responsive sidebar states, overlays, navigation grids.
 */

import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/common/Sidebar";
import Navbar from "../components/common/Navbar";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeMobileSidebar = () => {
    setSidebarOpen(false);
  };

  const openMobileSidebar = () => {
    setSidebarOpen(true);
  };

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-800 dark:text-slate-200 selection:bg-green-500/30 selection:text-white flex overflow-hidden transition-colors duration-300">
      {/* Sidebar Navigation */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={toggleSidebar} 
        onCloseMobile={closeMobileSidebar} 
      />

      {/* Main Workspace Wrapper */}
      <div 
        className={`
          flex-1 flex flex-col min-w-0 min-h-screen
          transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${sidebarOpen ? "lg:pl-64" : "lg:pl-20"}
        `}
      >
        {/* Top Navbar Header */}
        <Navbar 
          onMenuClick={openMobileSidebar} 
          sidebarOpen={sidebarOpen} 
        />

        {/* Content Outlet Viewport */}
        <main className="flex-1 overflow-y-auto p-1 sm:p-2 scrollbar-thin">
          <div className="h-full w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;