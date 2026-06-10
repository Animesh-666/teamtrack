/**
 * Navbar.jsx
 * ─────────────────────────────────────────────────────────────
 * Top navigation bar for the TeamTrack dashboard layout.
 *
 * Features:
 * - Mobile hamburger toggle for the sidebar
 * - Global search bar with keyboard shortcut hint
 * - Notification bell with unread count badge
 * - User avatar dropdown (profile / logout)
 * - Glassmorphism + subtle border glow (Light/Dark Ready)
 */

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useSocket } from "../../hooks/useSocket";
import NotificationDropdown from "../notifications/NotificationDropdown";
import ThemeToggle from './ThemeToggle';

/* ── Icon helpers ─────────────────────────────────────────── */

const MenuIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const SearchIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const BellIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const ChevronDownIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

/* ── Component ────────────────────────────────────────────── */

const Navbar = ({ onMenuClick, sidebarOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const userMenuRef = useRef(null);
  const notifRef = useRef(null);

  /* Close dropdowns on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* Keyboard shortcut: Ctrl+K or Cmd+K to focus search */
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        document.getElementById("navbar-search")?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  /** Handle search submit */
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/tasks?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  /** Handle logout */
  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
    navigate("/login");
  };

  /** Initials fallback */
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "TT";

  return (
    <header
      id="navbar"
      className={`
        sticky top-0 z-30 h-16 flex items-center justify-between px-4 lg:px-6
        bg-white/80 dark:bg-[#0b1120]/70 
        border-b border-slate-200 dark:border-white/[0.06]
        backdrop-blur-2xl transition-colors duration-300
      `}
    >
      {/* ── Left: hamburger + search ─────────────────────── */}
      <div className="flex items-center gap-4">
        {/* Mobile menu toggle */}
        <button
          id="mobile-menu-toggle"
          onClick={onMenuClick}
          className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/[0.06] transition-colors"
          aria-label="Toggle sidebar"
        >
          <MenuIcon className="w-5 h-5" />
        </button>

        {/* Search bar */}
        <form onSubmit={handleSearchSubmit} className="hidden sm:flex items-center relative">
          <SearchIcon className="absolute left-3 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <input
            id="navbar-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks, projects..."
            className="
              w-64 lg:w-80 h-10 pl-10 pr-16 rounded-xl
              bg-slate-100 dark:bg-white/[0.04] 
              border border-transparent dark:border-white/[0.08]
              text-sm text-slate-900 dark:text-slate-200 
              placeholder-slate-500
              focus:outline-none focus:bg-white dark:focus:bg-white/[0.06] focus:border-green-500/40 focus:ring-1 focus:ring-green-500/20
              transition-all duration-200
            "
          />
          {/* Shortcut badge */}
          <kbd className="absolute right-3 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 dark:text-slate-500 bg-slate-200 dark:bg-white/[0.06] rounded-md">
            ⌘K
          </kbd>
        </form>
      </div>

      {/* ── Right: notifications + user ──────────────────── */}
      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <div ref={notifRef} className="relative">
          <button
            id="notification-bell"
            onClick={() => setShowNotifications((prev) => !prev)}
            className="
              relative flex items-center justify-center w-10 h-10 rounded-xl
              text-slate-500 hover:bg-slate-100 
              dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/[0.06]
              transition-colors duration-200
            "
            aria-label="Notifications"
          >
            <BellIcon className={`w-5 h-5 ${showNotifications ? "text-green-500 dark:text-green-400" : ""}`} />

            {/* Unread badge */}
            {unreadCount > 0 && (
              <span className="
                absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1
                flex items-center justify-center
                rounded-full bg-green-500 text-[10px] font-bold text-white
                shadow-lg shadow-green-500/30
                animate-bounce-subtle
              ">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notification dropdown */}
          {showNotifications && (
            <NotificationDropdown
              onClose={() => setShowNotifications(false)}
              onUnreadCountChange={setUnreadCount}
            />
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-slate-200 dark:bg-white/[0.06] mx-1" />

        {/* User menu */}
        <div ref={userMenuRef} className="relative">
          <button
            id="user-menu-toggle"
            onClick={() => setShowUserMenu((prev) => !prev)}
            className="
              flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-xl
              hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-colors duration-200
            "
          >
            {/* Avatar */}
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-lg object-cover ring-2 ring-green-500/30"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center ring-2 ring-green-500/20">
                <span className="text-[11px] font-bold text-white">{initials}</span>
              </div>
            )}

            {/* Name (hidden on small screens) */}
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-slate-800 dark:text-white leading-tight truncate max-w-[120px]">
                {user?.name}
              </p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">
                {user?.role === "ADMIN" ? "Leader" : "Member"}
              </p>
            </div>

            <ChevronDownIcon
              className={`
                hidden md:block w-4 h-4 text-slate-400 dark:text-slate-500
                transition-transform duration-200
                ${showUserMenu ? "rotate-180" : ""}
              `}
            />
          </button>

          {/* Dropdown */}
          {showUserMenu && (
            <div className="
              absolute right-0 mt-2 w-56 py-2
              bg-white dark:bg-[#1e293b]/95 
              border border-slate-200 dark:border-white/[0.08] 
              rounded-xl shadow-xl dark:shadow-2xl dark:shadow-black/40
              backdrop-blur-xl animate-fade-in-up
            ">
              {/* User info header */}
              <div className="px-4 py-2.5 border-b border-slate-100 dark:border-white/[0.06]">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>

              {/* Menu items */}
              <div className="py-1">
                <button
                  id="user-menu-profile"
                  onClick={() => { setShowUserMenu(false); navigate("/profile"); }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/[0.06] transition-colors"
                >
                  <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  My Profile
                </button>

                <button
                  id="user-menu-dashboard"
                  onClick={() => { setShowUserMenu(false); navigate("/dashboard"); }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/[0.06] transition-colors"
                >
                  <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                  </svg>
                  Dashboard
                </button>
              </div>

              {/* Appearance & Logout */}
              <div className="border-t border-slate-100 dark:border-white/[0.06] pt-2 mt-2">
                
                {/* Theme Toggle Row */}
                <div className="w-full flex items-center justify-between px-4 py-2">
                  <span className="text-sm text-slate-600 dark:text-slate-300">Appearance</span>
                  <ThemeToggle />
                </div>

                {/* Logout Button */}
                <button
                  id="user-menu-logout"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 mt-1 text-sm text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 transition-colors"
                >
                  <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;