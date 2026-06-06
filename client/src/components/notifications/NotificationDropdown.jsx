/**
 * NotificationDropdown.jsx
 * ─────────────────────────────────────────────────────────────
 * Fixed: Added socket connection guard to prevent rendering crashes.
 */

import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useSocket } from "../../hooks/useSocket";
import notificationService from "../../services/notificationService";
import NotificationItem from "./NotificationItem";

/* ── Icons ────────────────────────────────────────────────── */

const Icons = {
  Bell: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  CheckDouble: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 6 7 17l-5-5" />
      <path d="m22 10-7.5 7.5L13 16" />
    </svg>
  ),
  Sparkles: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z" />
    </svg>
  ),
  ExternalLink: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  ),
};

/* ── Component ────────────────────────────────────────────── */

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const socket = useSocket();
  const dropdownRef = useRef(null);

  /** Compute unread notification counts */
  const unreadCount = notifications.filter((n) => !n.read).length;

  /** Fetch notifications on mount */
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationService.getNotifications();
      setNotifications(res?.data || res?.notifications || []);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  /** Socket.IO listener with Guard Clause 🚀 */
  useEffect(() => {
    // Check if socket exists and .on is actually a function before using it
    if (socket && typeof socket.on === "function") {
      const handleNewNotification = (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        
        toast.custom((t) => (
          <div className="flex items-center gap-3 p-4 rounded-xl shadow-2xl backdrop-blur-xl bg-[#1e293b]/95 border border-white/[0.08] text-slate-200 text-sm max-w-sm animate-fade-in-up">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 flex items-center justify-center flex-shrink-0">
              <Icons.Sparkles className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-white text-xs">New Notification</p>
              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{notification.message}</p>
            </div>
          </div>
        ));
      };

      socket.on("notification", handleNewNotification);
      socket.on("new_notification", handleNewNotification);

      return () => {
        socket.off("notification", handleNewNotification);
        socket.off("new_notification", handleNewNotification);
      };
    }
  }, [socket]);

  /** Close dropdown when clicking outside */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkAsRead = async (id) => {
    try {
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
      await notificationService.markAsRead(id);
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      await notificationService.markAllAsRead();
      toast.success("All marked as read! 🚀");
    } catch (err) {
      toast.error("Failed to update notifications");
    }
  };

  const handleDelete = async (id) => {
    try {
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      await notificationService.deleteNotification(id);
    } catch (err) {
      console.error("Failed to delete notification", err);
    }
  };

  const recentNotifications = notifications.slice(0, 5);

  return (
    <div ref={dropdownRef} className="relative z-40">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${isOpen ? "bg-green-500/10 text-green-400 border border-green-500/20 shadow-md" : "bg-white/[0.03] text-slate-400 border border-white/[0.06] hover:bg-white/[0.06] hover:text-white"}`}
      >
        <Icons.Bell className={`w-5 h-5 ${unreadCount > 0 && !isOpen ? "animate-wiggle" : ""}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-r from-red-500 to-rose-600 text-[9px] font-bold text-white flex items-center justify-center border-2 border-[#0f172a] animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-[#182235]/95 backdrop-blur-xl border border-white/[0.08] shadow-2xl shadow-black/40 overflow-hidden animate-fade-in-down">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.06]">
            <div>
              <h3 className="text-sm font-semibold text-white">Notifications</h3>
              <p className="text-[10px] text-slate-500 font-medium">{unreadCount} unread message{unreadCount !== 1 ? "s" : ""}</p>
            </div>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllAsRead} className="flex items-center gap-1 text-[11px] font-semibold text-green-400 hover:text-green-300 px-2 py-1 rounded-lg hover:bg-green-500/10 transition-all">
                <Icons.CheckDouble className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[360px] overflow-y-auto scrollbar-thin divide-y divide-white/[0.03]">
            {loading && notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="w-6 h-6 rounded-full border-2 border-slate-700 border-t-green-400 animate-spin" />
              </div>
            ) : recentNotifications.length > 0 ? (
              <div className="p-2 space-y-1.5">
                {recentNotifications.map((notification) => (
                  <NotificationItem
                    key={notification._id}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    onDelete={handleDelete}
                    onCloseDropdown={() => setIsOpen(false)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <h4 className="text-xs font-semibold text-slate-400">All caught up!</h4>
              </div>
            )}
          </div>

          <Link to="/notifications" onClick={() => setIsOpen(false)} className="flex items-center justify-center py-3 border-t border-white/[0.06] text-xs font-semibold text-slate-400 hover:text-white bg-white/[0.01] transition-all">
            View all notifications
            <Icons.ExternalLink className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;