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
      <line x1="4.93" y1="4.93" x2="7.76" h2="7.76" />
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
      <line x1="2" y1="12" x2="6" y2="12" />
      <line x1="18" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
    </svg>
  ),
};

const FILTER_TABS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "read", label: "Read" },
];

const SkeletonItem = () => (
  <div className="p-4 rounded-xl border border-white/[0.06] bg-[#1e293b]/30 animate-pulse">
    <div className="flex gap-3">
      <div className="w-9 h-9 rounded-xl bg-white/[0.06] flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-white/[0.06] rounded w-3/4" />
        <div className="h-3 bg-white/[0.04] rounded w-1/2" />
        <div className="h-2.5 bg-white/[0.03] rounded w-20 mt-1" />
      </div>
    </div>
  </div>
);

const PAGE_SIZE = 15;

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [clearing, setClearing] = useState(false);

  const observerRef = useRef(null);
  const sentinelRef = useRef(null);
  
  // Custom hook extraction setup
  const socketContext = useSocket();
  // Extract socket client if it's nested inside an object context wrapper
  const socket = socketContext?.socket || socketContext;

  const fetchNotifications = useCallback(async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const res = await notificationService.getNotifications({
        page: pageNum,
        limit: PAGE_SIZE,
      });

      const items = res?.notifications || res?.data?.notifications || res?.data || (Array.isArray(res) ? res : []);
      
      setNotifications((prev) =>
        append ? [...prev, ...items] : items
      );
      setHasMore(items.length >= PAGE_SIZE);
    } catch (err) {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications(1, false);
  }, []);

  useEffect(() => {
    if (!sentinelRef.current) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loadingMore && !loading) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchNotifications(nextPage, true);
        }
      },
      { threshold: 0.1 }
    );

    observerRef.current.observe(sentinelRef.current);

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [hasMore, loadingMore, loading, page, fetchNotifications]);

  // 🚀 FIXED: Added type-checking guards to prevent undefined socket instances from freezing the page
  useEffect(() => {
    if (!socket || typeof socket.on !== "function") return;

    const handleNewNotification = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    };

    socket.on("notification:new", handleNewNotification);
    return () => {
      if (typeof socket.off === "function") {
        socket.off("notification:new", handleNewNotification);
      }
    };
  }, [socket]);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch {
      toast.error("Failed to mark as read");
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      toast.success("Notification removed");
    } catch {
      toast.error("Failed to delete notification");
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark all as read");
    } finally {
      setMarkingAll(false);
    }
  };

  const handleClearAll = async () => {
    setClearing(true);
    try {
      await notificationService.clearAll();
      setNotifications([]);
      setClearDialogOpen(false);
      toast.success("All notifications cleared");
    } catch {
      toast.error("Failed to clear notifications");
    } finally {
      setClearing(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === "unread") return !n.read;
    if (activeFilter === "read") return n.read;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0f172a] px-4 sm:px-6 lg:px-8 py-8 max-w-4xl mx-auto">
      <div className="mb-8 animate-fade-in-down">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center shadow-lg shadow-green-500/10">
              <Icons.Bell className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Notifications
                </h1>
                {unreadCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-green-500 text-[11px] font-bold text-white shadow-lg shadow-green-500/30 animate-pulse">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-400 mt-0.5">
                Stay updated with your latest activity
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllRead}
              disabled={markingAll || unreadCount === 0}
              className="inline-flex items-center gap-2 px-4 h-10 rounded-xl bg-[#1e293b]/60 border border-white/[0.08] text-sm font-medium text-slate-300 hover:bg-[#1e293b] hover:text-white hover:border-green-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
            >
              {markingAll ? <Icons.Loader className="w-4 h-4 animate-spin" /> : <Icons.CheckAll className="w-4 h-4" />}
              <span className="hidden sm:inline">Mark All Read</span>
            </button>

            <button
              onClick={() => setClearDialogOpen(true)}
              disabled={notifications.length === 0}
              className="inline-flex items-center gap-2 px-4 h-10 rounded-xl bg-[#1e293b]/60 border border-white/[0.08] text-sm font-medium text-slate-300 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
            >
              <Icons.Trash className="w-4 h-4" />
              <span className="hidden sm:inline">Clear All</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 mt-6 p-1 rounded-xl bg-[#1e293b]/40 border border-white/[0.06] w-fit">
          {FILTER_TABS.map((tab) => {
            const isActive = activeFilter === tab.key;
            const count =
              tab.key === "all"
                ? notifications.length
                : tab.key === "unread"
                ? unreadCount
                : notifications.length - unreadCount;

            return (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive ? "bg-[#1e293b] text-white border border-white/[0.08] shadow-md" : "text-slate-400 hover:text-slate-200"}`}
              >
                {tab.label}
                <span className={`text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center ${isActive ? "bg-green-500/20 text-green-400" : "bg-white/[0.06] text-slate-500"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2 animate-fade-in-up">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonItem key={i} />
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="py-8">
            <EmptyState
              variant="notifications"
              title={activeFilter === "unread" ? "No unread notifications" : activeFilter === "read" ? "No read notifications" : "All caught up!"}
              description={activeFilter === "unread" ? "You've read all your notifications. Nice work!" : activeFilter === "read" ? "Notifications you've read will appear here." : "You have no notifications right now. We'll let you know when something happens."}
            />
          </div>
        ) : (
          <>
            {filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification._id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDelete}
              />
            ))}

            {hasMore && (
              <div ref={sentinelRef} className="flex items-center justify-center py-6">
                {loadingMore && (
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full border-2 border-white/10 border-t-green-400 animate-spin" />
                    <span className="text-xs text-slate-500 font-medium">Loading more…</span>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        isOpen={clearDialogOpen}
        onClose={() => setClearDialogOpen(false)}
        onConfirm={handleClearAll}
        title="Clear All Notifications"
        message="This will permanently delete all your notifications. This action cannot be undone."
        confirmLabel="Clear All"
        variant="danger"
        loading={clearing}
      />
    </div>
  );
};

export default NotificationsPage;