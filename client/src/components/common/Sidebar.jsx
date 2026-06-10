/**
 * Sidebar.jsx
 * ─────────────────────────────────────────────────────────────
 * Primary navigation sidebar for the TeamTrack dashboard.
 *
 * Features:
 * - Collapsible with smooth width transition
 * - Role-based menu items (ADMIN vs MEMBER)
 * - Active route highlighting with animated indicator
 * - Glassmorphism card styling (Light/Dark Ready)
 * - User info panel at the bottom
 * - Mobile-responsive overlay mode
 */

import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

/* ── Icon components (inline SVGs to avoid extra deps) ────── */

const Icons = {
  Dashboard: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  Projects: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  ),
  Tasks: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
  Reports: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  Notifications: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  Leaderboard: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  ),
  Profile: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Logout: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  Collapse: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="11 17 6 12 11 7" />
      <polyline points="18 17 13 12 18 7" />
    </svg>
  ),
  Expand: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="13 17 18 12 13 7" />
      <polyline points="6 17 11 12 6 7" />
    </svg>
  ),
};

/* ── Navigation link definitions ──────────────────────────── */

const NAV_ITEMS = [
  { to: "/dashboard",     label: "Dashboard",     icon: Icons.Dashboard,     roles: ["ADMIN", "MEMBER"] },
  { to: "/projects",      label: "Projects",      icon: Icons.Projects,      roles: ["ADMIN", "MEMBER"] },
  { to: "/tasks",         label: "Tasks",         icon: Icons.Tasks,         roles: ["ADMIN", "MEMBER"] },
  { to: "/reports",       label: "Reports",       icon: Icons.Reports,       roles: ["ADMIN", "MEMBER"] },
  { to: "/notifications", label: "Notifications", icon: Icons.Notifications, roles: ["ADMIN", "MEMBER"] },
  { to: "/leaderboard",   label: "Leaderboard",   icon: Icons.Leaderboard,   roles: ["ADMIN", "MEMBER"] },
  { to: "/profile",       label: "Profile",       icon: Icons.Profile,       roles: ["ADMIN", "MEMBER"] },
];

/* ── Component ────────────────────────────────────────────── */

const Sidebar = ({ isOpen, onToggle, onCloseMobile }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [hoveredItem, setHoveredItem] = useState(null);

  /** Filter nav items by user role */
  const visibleItems = NAV_ITEMS.filter((item) =>
    item.roles.includes(user?.role)
  );

  /** Handle logout */
  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  /** Derive initials for fallback avatar */
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "TT";

  return (
    <>
      {/* ── Mobile overlay backdrop ─────────────────────────── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar container ───────────────────────────────── */}
      <aside
        id="sidebar"
        className={`
          fixed top-0 left-0 z-50 h-screen flex flex-col
          border-r border-slate-200 dark:border-white/[0.06]
          bg-white/80 dark:bg-[#0b1120]/80 backdrop-blur-2xl
          transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${isOpen ? "w-64" : "w-20"}
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* ── Brand header ──────────────────────────────────── */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-white/[0.06]">
          <div className="flex items-center gap-3 overflow-hidden">
            {/* Logo mark */}
            <div className="relative flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20">
              <span className="text-sm font-extrabold text-white tracking-tighter">TT</span>
              {/* Glow ring */}
              <span className="absolute inset-0 rounded-lg ring-2 ring-green-400/20 animate-pulse" />
            </div>
            {/* Wordmark */}
            <span
              className={`
                font-bold text-lg tracking-wide text-slate-800 dark:text-white whitespace-nowrap
                transition-opacity duration-200
                ${isOpen ? "opacity-100" : "opacity-0 lg:opacity-0"}
              `}
            >
              TEAM<span className="text-green-500 dark:text-green-400">TRACK</span>
            </span>
          </div>

          {/* ── Collapse / Expand toggle (desktop only) ──── */}
          <button
            id="sidebar-toggle"
            onClick={onToggle}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/[0.06] transition-colors"
            title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isOpen ? (
              <Icons.Collapse className="w-4 h-4" />
            ) : (
              <Icons.Expand className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* ── Navigation links ──────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onCloseMobile}
                onMouseEnter={() => setHoveredItem(item.to)}
                onMouseLeave={() => setHoveredItem(null)}
                className={({ isActive }) => `
                  group relative flex items-center gap-3 px-3 py-2.5 rounded-xl
                  font-medium text-sm transition-all duration-200
                  ${
                    isActive
                      ? "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-500/10"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/[0.04]"
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    {/* Active indicator bar */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-green-500 dark:bg-green-400 shadow-[0_0_8px_rgba(34,197,94,0.3)] dark:shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                    )}

                    <Icon
                      className={`
                        w-5 h-5 flex-shrink-0 transition-transform duration-200
                        ${hoveredItem === item.to ? "scale-110" : ""}
                        ${isActive ? "drop-shadow-[0_0_6px_rgba(34,197,94,0.3)] dark:drop-shadow-[0_0_6px_rgba(34,197,94,0.5)]" : ""}
                      `}
                    />

                    <span
                      className={`
                        whitespace-nowrap transition-opacity duration-200
                        ${isOpen ? "opacity-100" : "opacity-0 lg:opacity-0 w-0 overflow-hidden"}
                      `}
                    >
                      {item.label}
                    </span>

                    {/* Tooltip when collapsed (desktop) */}
                    {!isOpen && (
                      <span className="
                        absolute left-full ml-3 px-2.5 py-1 rounded-md text-xs font-medium
                        bg-slate-800 text-white border border-white/10 shadow-xl
                        opacity-0 group-hover:opacity-100 pointer-events-none
                        transition-opacity duration-150 whitespace-nowrap z-50
                      ">
                        {item.label}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* ── Divider ───────────────────────────────────────── */}
        <div className="mx-4 border-t border-slate-200 dark:border-white/[0.06]" />

        {/* ── User info + logout ─────────────────────────────── */}
        <div className="p-3 space-y-2">
          {/* User card */}
          <div
            className={`
              flex items-center gap-3 p-2 rounded-xl
              bg-slate-50 border border-slate-200 hover:bg-slate-100
              dark:bg-white/[0.03] dark:border-white/[0.06] dark:hover:bg-white/[0.06]
              transition-all duration-200 cursor-pointer
            `}
            onClick={() => { navigate("/profile"); onCloseMobile?.(); }}
          >
            {/* Avatar */}
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-9 h-9 rounded-lg object-cover ring-2 ring-green-500/30 flex-shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center flex-shrink-0 ring-2 ring-green-500/20">
                <span className="text-xs font-bold text-white">{initials}</span>
              </div>
            )}

            {/* Name & role */}
            <div
              className={`
                overflow-hidden transition-opacity duration-200
                ${isOpen ? "opacity-100" : "opacity-0 lg:opacity-0 w-0"}
              `}
            >
              <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{user?.name}</p>
              <p className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">
                {user?.role === "ADMIN" ? "Team Leader" : "Member"}
              </p>
            </div>
          </div>

          {/* Logout button */}
          <button
            id="logout-btn"
            onClick={handleLogout}
            className={`
              group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
              text-sm font-medium text-slate-500 hover:text-red-500 hover:bg-red-50
              dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-500/10
              transition-all duration-200
            `}
          >
            <Icons.Logout className="w-5 h-5 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
            <span
              className={`
                whitespace-nowrap transition-opacity duration-200
                ${isOpen ? "opacity-100" : "opacity-0 lg:opacity-0 w-0 overflow-hidden"}
              `}
            >
              Logout
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;