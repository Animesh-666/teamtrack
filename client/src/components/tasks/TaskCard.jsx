/**
 * TaskCard.jsx
 * ─────────────────────────────────────────────────────────────
 * Card component for displaying a single task in grid/list views.
 *
 * Features:
 *  - Priority badge with color coding (High / Medium / Low)
 *  - Status indicator with dot + label
 *  - Animated progress bar (0-100%)
 *  - Assignee avatar with name
 *  - Deadline with urgency coloring
 *  - Project name tag
 *  - Admin action menu (edit / delete / change priority)
 *  - Quick status toggle (members can update)
 *  - Hover lift + glow animation
 *  - Click to open task details
 */

import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import ProgressBar from "../common/ProgressBar";

/* ── Icons ────────────────────────────────────────────────── */

const Icons = {
  MoreVertical: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  ),
  Edit: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  Trash: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  Clock: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  User: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Folder: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  ),
  MessageSquare: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  Flag: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  ),
};

/* ── Config maps ──────────────────────────────────────────── */

const PRIORITY_CONFIG = {
  High: {
    bg: "bg-red-500/10",
    text: "text-red-400",
    border: "border-red-500/20",
    icon: "text-red-400",
    glow: "shadow-red-500/5",
    gradient: "from-red-500/20 to-transparent",
  },
  Medium: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/20",
    icon: "text-amber-400",
    glow: "shadow-amber-500/5",
    gradient: "from-amber-500/20 to-transparent",
  },
  Low: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/20",
    icon: "text-blue-400",
    glow: "shadow-blue-500/5",
    gradient: "from-blue-500/20 to-transparent",
  },
};

const STATUS_CONFIG = {
  Pending: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/20",
    dot: "bg-amber-400",
    label: "Pending",
  },
  "In Progress": {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/20",
    dot: "bg-blue-400",
    label: "In Progress",
  },
  Completed: {
    bg: "bg-green-500/10",
    text: "text-green-400",
    border: "border-green-500/20",
    dot: "bg-green-400",
    label: "Completed",
  },
};

/* ── Helpers ──────────────────────────────────────────────── */

const getInitials = (name) =>
  name ? name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) : "?";

const nameToHue = (name) => {
  let hash = 0;
  for (let i = 0; i < (name || "").length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
};

const formatDeadline = (date) => {
  if (!date) return null;
  const d = new Date(date);
  const now = new Date();
  const diffDays = Math.ceil((d - now) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { text: `${Math.abs(diffDays)}d overdue`, urgent: true, overdue: true };
  if (diffDays === 0) return { text: "Due today", urgent: true, overdue: false };
  if (diffDays === 1) return { text: "Tomorrow", urgent: true, overdue: false };
  if (diffDays <= 3) return { text: `${diffDays}d left`, urgent: true, overdue: false };
  return {
    text: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    urgent: false,
    overdue: false,
  };
};

/* ── Component ────────────────────────────────────────────── */

const TaskCard = ({
  task,
  onEdit,
  onDelete,
  onViewDetails,
  onStatusChange,
  compact = false,
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  const pc = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.Low;
  const sc = STATUS_CONFIG[task.status] || STATUS_CONFIG.Pending;
  const dl = formatDeadline(task.deadline);

  const assignee = typeof task.assignedTo === "object" ? task.assignedTo : null;
  const assigneeName = assignee?.name || "Unassigned";
  const hue = nameToHue(assigneeName);

  const projectName =
    typeof task.projectId === "object" ? task.projectId?.projectName : null;

  const notesCount = Array.isArray(task.notes) ? task.notes.length : 0;

  /** Close menu on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /** Next status cycle for quick toggle */
  const nextStatus = () => {
    const cycle = { Pending: "In Progress", "In Progress": "Completed", Completed: "Pending" };
    return cycle[task.status] || "Pending";
  };

  return (
    <div
      id={`task-card-${task._id}`}
      className={`
        group relative rounded-2xl overflow-hidden
        bg-[#1e293b]/60 backdrop-blur-xl
        border border-white/[0.06]
        shadow-lg ${pc.glow}
        hover:shadow-xl hover:border-white/[0.1]
        hover:-translate-y-0.5
        transition-all duration-300 ease-out
        cursor-pointer
      `}
      onClick={() => onViewDetails?.(task)}
    >
      {/* ── Priority gradient top bar ─────────────────────── */}
      <div className={`h-1 w-full bg-gradient-to-r ${pc.gradient}`} />

      <div className={`p-4 ${compact ? "p-3" : "p-4 sm:p-5"}`}>
        {/* ── Header: priority + status + menu ─────────────── */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {/* Priority badge */}
            <span className={`
              inline-flex items-center gap-1 px-2 py-0.5 rounded-md
              text-[10px] font-bold uppercase tracking-wider
              border ${pc.bg} ${pc.text} ${pc.border}
            `}>
              <Icons.Flag className={`w-2.5 h-2.5 ${pc.icon}`} />
              {task.priority}
            </span>

            {/* Status badge */}
            <span className={`
              inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md
              text-[10px] font-semibold
              border ${sc.bg} ${sc.text} ${sc.border}
            `}>
              <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
              {sc.label}
            </span>
          </div>

          {/* Action menu */}
          <div ref={menuRef} className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              className="
                flex items-center justify-center w-7 h-7 rounded-lg
                text-slate-500 hover:text-white hover:bg-white/[0.08]
                transition-colors duration-150
                opacity-0 group-hover:opacity-100
              "
              aria-label="Task actions"
            >
              <Icons.MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div
                className="
                  absolute right-0 mt-1 w-44 py-1.5
                  bg-[#1e293b]/95 backdrop-blur-xl
                  border border-white/[0.08] rounded-xl
                  shadow-2xl shadow-black/40
                  animate-fade-in z-50
                "
                onClick={(e) => e.stopPropagation()}
              >
                {/* Quick status change */}
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onStatusChange?.(task._id, nextStatus());
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                >
                  <div className={`w-3 h-3 rounded-full ${STATUS_CONFIG[nextStatus()]?.dot || "bg-slate-400"}`} />
                  Mark as {nextStatus()}
                </button>

                <div className="my-1 border-t border-white/[0.06]" />

                {isAdmin && (
                  <button
                    onClick={() => { setShowMenu(false); onEdit?.(task); }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                  >
                    <Icons.Edit className="w-3.5 h-3.5" />
                    Edit Task
                  </button>
                )}

                {isAdmin && (
                  <button
                    onClick={() => { setShowMenu(false); onDelete?.(task); }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                  >
                    <Icons.Trash className="w-3.5 h-3.5" />
                    Delete Task
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Title ───────────────────────────────────────── */}
        <h3 className="text-sm font-bold text-white mb-1.5 line-clamp-2 group-hover:text-green-400 transition-colors duration-200">
          {task.title}
        </h3>

        {/* ── Description (truncated) ─────────────────────── */}
        {!compact && task.description && (
          <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-3">
            {task.description}
          </p>
        )}

        {/* ── Progress bar ────────────────────────────────── */}
        <div className={compact ? "mb-3" : "mb-4"}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
              Progress
            </span>
            <span className="text-[10px] font-semibold text-slate-400 tabular-nums">
              {task.progress || 0}%
            </span>
          </div>
          <ProgressBar value={task.progress || 0} size="sm" showLabel={false} />
        </div>

        {/* ── Footer: assignee, project, deadline, notes ──── */}
        <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
          {/* Left: assignee */}
          <div className="flex items-center gap-2 min-w-0">
            {assignee?.avatar ? (
              <img
                src={assignee.avatar}
                alt={assigneeName}
                className="w-6 h-6 rounded-md object-cover flex-shrink-0"
              />
            ) : (
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, hsl(${hue}, 60%, 45%), hsl(${hue + 30}, 50%, 35%))`,
                }}
              >
                <span className="text-[8px] font-bold text-white">{getInitials(assigneeName)}</span>
              </div>
            )}
            <span className="text-xs text-slate-400 truncate max-w-[80px]">
              {assigneeName}
            </span>
          </div>

          {/* Right: meta icons */}
          <div className="flex items-center gap-3">
            {/* Project tag */}
            {projectName && (
              <span className="hidden sm:flex items-center gap-1 text-[10px] text-slate-500" title={projectName}>
                <Icons.Folder className="w-3 h-3" />
                <span className="truncate max-w-[60px]">{projectName}</span>
              </span>
            )}

            {/* Notes count */}
            {notesCount > 0 && (
              <span className="flex items-center gap-0.5 text-[10px] text-slate-500" title={`${notesCount} notes`}>
                <Icons.MessageSquare className="w-3 h-3" />
                {notesCount}
              </span>
            )}

            {/* Deadline */}
            {dl && (
              <span
                className={`
                  flex items-center gap-1 text-[10px] font-medium
                  ${dl.overdue ? "text-red-400" : dl.urgent ? "text-amber-400" : "text-slate-500"}
                `}
                title={task.deadline ? new Date(task.deadline).toLocaleDateString() : ""}
              >
                <Icons.Clock className="w-3 h-3" />
                {dl.text}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
