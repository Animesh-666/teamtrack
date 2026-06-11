import { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import NotificationItem from "../components/notifications/NotificationItem";
import EmptyState from "../components/common/EmptyState";
import ConfirmDialog from "../components/common/ConfirmDialog";
import notificationService from "../services/notificationService";
import useSocket from "../hooks/useSocket";

const Icons = {
  Bell: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  CheckAll: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="7 12 12 17 22 7" />
      <polyline points="2 12 7 17" />
    </svg>
  ),
  Trash: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  Loader: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="12" y1="2" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="22" />
    </svg>
  ),
};

const FILTER_TABS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "read", label: "Read" },
];

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [unreadCount, setUnreadCount] = useState(0);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [clearing, setClearing] = useState(false);

  const socketContext = useSocket();
  const socket = socketContext?.socket || socketContext;

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await notificationService.getNotifications();
      const items = res?.notifications || res?.data?.notifications || res?.data || (Array.isArray(res) ? res : []);
      setNotifications(items);
      setUnreadCount(items.filter((n) => !n.read).length);
    } catch {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success("All marked as read");
    } catch { toast.error("Failed action"); }
  };

  const handleClearAll = async () => {
    setClearing(true);
    try {
      await notificationService.clearAll();
      setNotifications([]);
      setUnreadCount(0);
      setClearDialogOpen(false);
      toast.success("Notifications cleared");
    } catch { toast.error("Failed action"); } finally { setClearing(false); }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === "unread") return !n.read;
    if (activeFilter === "read") return n.read;
    return true;
  });

  return (
    <div className="w-full h-full bg-transparent px-4 py-8 text-slate-800 dark:text-slate-200 transition-colors duration-300">
      <div className="mb-8 animate-fade-in-down">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center shadow-lg">
              <Icons.Bell className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Notifications</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Stay updated with your latest activity</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={handleMarkAllRead} disabled={unreadCount === 0} className="inline-flex items-center gap-2 px-4 h-10 rounded-xl bg-slate-50 dark:bg-[#1e293b]/60 border border-slate-200 dark:border-white/[0.08] text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1e293b] disabled:opacity-40 transition-all duration-200 shadow-sm">
              <Icons.CheckAll className="w-4 h-4" /> Mark All Read
            </button>
            <button onClick={() => setClearDialogOpen(true)} disabled={notifications.length === 0} className="inline-flex items-center gap-2 px-4 h-10 rounded-xl bg-slate-50 dark:bg-[#1e293b]/60 border border-slate-200 dark:border-white/[0.08] text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-red-500/10 hover:text-red-600 transition-all duration-200 shadow-sm">
              <Icons.Trash className="w-4 h-4" /> Clear All
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 mt-6 p-1 rounded-xl bg-slate-100 dark:bg-[#1e293b]/40 border border-slate-200 dark:border-white/[0.06] w-fit">
          {FILTER_TABS.map((tab) => {
            const isActive = activeFilter === tab.key;
            return (
              <button key={tab.key} onClick={() => setActiveFilter(tab.key)} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive ? "bg-white dark:bg-[#1e293b] text-slate-800 dark:text-white border border-slate-200 dark:border-white/[0.08] shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-800"}`}>
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2 animate-fade-in-up">
        {filteredNotifications.length === 0 ? (
          <EmptyState variant="notifications" title="All caught up!" description="No notifications found in this selector branch node loop segment." />
        ) : (
          filteredNotifications.map((n) => (
            <NotificationItem key={n._id} notification={n} onMarkAsRead={() => notificationService.markAsRead(n._id)} onDelete={() => notificationService.deleteNotification(n._id)} />
          ))
        )}
      </div>

      <ConfirmDialog isOpen={clearDialogOpen} onClose={() => setClearDialogOpen(false)} onConfirm={handleClearAll} title="Clear All Notifications" message="Permanently purge all data history log rows?" confirmLabel="Clear All" variant="danger" loading={clearing} />
    </div>
  );
};

export default NotificationsPage;