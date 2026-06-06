/**
 * NotificationItem.jsx
 * ─────────────────────────────────────────────────────────────
 * Individual notification item component.
 *
 * Features:
 *  - Displays notifications with context-specific icons & colors
 *  - Supports multiple notification types (task, project, report, system, etc.)
 *  - Displays relative/formatted time
 *  - Read/unread indicators and status changes
 *  - Mark as read & delete actions with smooth hover transitions
 *  - Premium modern styling with glassmorphism and subtle borders
 */

import { Link } from "react-router-dom";

/* ── Icons ────────────────────────────────────────────────── */

const Icons = {
  Task: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
  ),
  Project: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  ),
  Report: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  System: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
  Check: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Trash: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
};

/* ── Type Configuration ───────────────────────────────────── */

const TYPE_CONFIGS = {
  task_assigned: {
    icon: Icons.Task,
    colorClass: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    linkPrefix: "/tasks",
  },
  task_completed: {
    icon: Icons.Task,
    colorClass: "text-green-400 bg-green-500/10 border-green-500/20",
    linkPrefix: "/tasks",
  },
  task_updated: {
    icon: Icons.Task,
    colorClass: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    linkPrefix: "/tasks",
  },
  project_assigned: {
    icon: Icons.Project,
    colorClass: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    linkPrefix: "/projects",
  },
  project_updated: {
    icon: Icons.Project,
    colorClass: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    linkPrefix: "/projects",
  },
  report_submitted: {
    icon: Icons.Report,
    colorClass: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    linkPrefix: "/reports",
  },
  system: {
    icon: Icons.System,
    colorClass: "text-slate-400 bg-white/[0.04] border-white/[0.08]",
    linkPrefix: null,
  },
};

/* ── Helpers ──────────────────────────────────────────────── */

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

/* ── Component ────────────────────────────────────────────── */

const NotificationItem = ({
  notification,
  onMarkAsRead,
  onDelete,
  onCloseDropdown,
}) => {
  const { _id, message, type, read, createdAt, relatedId } = notification;

  const config = TYPE_CONFIGS[type] || TYPE_CONFIGS.system;
  const IconComponent = config.icon;

  /** Action handling wrappers */
  const handleMarkRead = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!read && onMarkAsRead) {
      onMarkAsRead(_id);
    }
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(_id);
    }
  };

  const handleItemClick = () => {
    if (!read && onMarkAsRead) {
      onMarkAsRead(_id);
    }
    if (onCloseDropdown) {
      onCloseDropdown();
    }
  };

  /** Resolve target route link */
  const getTargetLink = () => {
    if (!config.linkPrefix || !relatedId) return null;
    return `${config.linkPrefix}/${relatedId}`;
  };

  const targetLink = getTargetLink();

  const contentMarkup = (
    <div className="flex gap-3">
      {/* Icon Wrapper */}
      <div className={`
        w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
        border backdrop-blur-md transition-all duration-300
        ${config.colorClass}
        ${!read ? "scale-105 shadow-lg shadow-current/5" : ""}
      `}>
        <IconComponent className="w-4 h-4" />
      </div>

      {/* Message content */}
      <div className="flex-1 min-w-0 pr-4">
        <p className={`
          text-xs sm:text-sm leading-relaxed break-words transition-colors duration-200
          ${!read ? "text-white font-medium" : "text-slate-400"}
        `}>
          {message}
        </p>
        <span className="text-[10px] text-slate-500 font-medium block mt-1 tabular-nums">
          {formatTimeAgo(createdAt)}
        </span>
      </div>

      {/* Unread dot */}
      {!read && (
        <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
      )}
    </div>
  );

  return (
    <div
      onClick={handleItemClick}
      className={`
        group relative p-4 rounded-xl border transition-all duration-200 cursor-pointer
        ${
          !read
            ? "bg-[#1e293b]/70 border-white/[0.08] hover:bg-[#1e293b]/90 shadow-md shadow-black/10"
            : "bg-[#1e293b]/20 border-white/[0.04] hover:bg-[#1e293b]/40 hover:border-white/[0.06]"
        }
      `}
    >
      {/* Clickable body wrapper */}
      {targetLink ? (
        <Link to={targetLink} className="block w-full">
          {contentMarkup}
        </Link>
      ) : (
        <div className="w-full">{contentMarkup}</div>
      )}

      {/* Action buttons (Appear on hover) */}
      <div className="
        absolute right-3 bottom-2.5 flex items-center gap-1
        opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100
        transition-all duration-200 ease-out
      ">
        {!read && onMarkAsRead && (
          <button
            onClick={handleMarkRead}
            className="
              w-7 h-7 rounded-lg flex items-center justify-center
              text-slate-500 hover:text-white bg-[#1e293b]/90 hover:bg-green-500/20 hover:text-green-400
              border border-white/[0.06] hover:border-green-500/20
              transition-all duration-150
            "
            title="Mark as read"
          >
            <Icons.Check className="w-3.5 h-3.5" />
          </button>
        )}
        {onDelete && (
          <button
            onClick={handleDelete}
            className="
              w-7 h-7 rounded-lg flex items-center justify-center
              text-slate-500 hover:text-white bg-[#1e293b]/90 hover:bg-red-500/20 hover:text-red-400
              border border-white/[0.06] hover:border-red-500/20
              transition-all duration-150
            "
            title="Delete notification"
          >
            <Icons.Trash className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default NotificationItem;