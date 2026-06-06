/**
 * TaskDetails.jsx
 * ─────────────────────────────────────────────────────────────
 * Detailed view panel for a single task.
 * Can be used as a slide-over panel or modal content.
 *
 * Features:
 *  - Full task information display (title, description, meta)
 *  - Priority & status badges
 *  - Progress ring + progress bar
 *  - Assignee & assigner info cards
 *  - Deadline countdown with urgency
 *  - Notes / comments thread
 *  - Add note form (members + admin)
 *  - Quick status update buttons (members)
 *  - Edit / Delete actions (admin)
 *  - Responsive layout with glassmorphism
 */

import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import ProgressBar from "../common/ProgressBar";
import Loader from "../common/Loader";
import taskService from "../../services/taskService";
import toast from "react-hot-toast";

/* ── Icons ────────────────────────────────────────────────── */

const Icons = {
  X: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
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
  Calendar: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
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
  Send: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
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
  High:   { bg: "bg-red-500/10",   text: "text-red-400",   border: "border-red-500/20"   },
  Medium: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
  Low:    { bg: "bg-blue-500/10",  text: "text-blue-400",  border: "border-blue-500/20"  },
};

const STATUS_CONFIG = {
  Pending:       { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20", dot: "bg-amber-400" },
  "In Progress": { bg: "bg-blue-500/10",  text: "text-blue-400",  border: "border-blue-500/20",  dot: "bg-blue-400"  },
  Completed:     { bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/20", dot: "bg-green-400" },
};

const ALL_STATUSES = ["Pending", "In Progress", "Completed"];

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

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

const formatTime = (date) =>
  date
    ? new Date(date).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

const timeAgo = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diffMin = Math.floor((now - past) / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return past.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const deadlineInfo = (date) => {
  if (!date) return null;
  const d = new Date(date);
  const now = new Date();
  const diffDays = Math.ceil((d - now) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { text: `${Math.abs(diffDays)} days overdue`, color: "text-red-400", bg: "bg-red-500/10" };
  if (diffDays === 0) return { text: "Due today", color: "text-red-400", bg: "bg-red-500/10" };
  if (diffDays === 1) return { text: "Due tomorrow", color: "text-amber-400", bg: "bg-amber-500/10" };
  if (diffDays <= 3) return { text: `${diffDays} days left`, color: "text-amber-400", bg: "bg-amber-500/10" };
  if (diffDays <= 7) return { text: `${diffDays} days left`, color: "text-yellow-400", bg: "bg-yellow-500/10" };
  return { text: `${diffDays} days left`, color: "text-slate-400", bg: "bg-white/[0.04]" };
};

/* ── Progress Ring ────────────────────────────────────────── */

const ProgressRing = ({ value = 0, size = 80, strokeWidth = 6 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  const getColor = (v) => {
    if (v >= 80) return "#22c55e";
    if (v >= 50) return "#eab308";
    if (v >= 25) return "#f97316";
    return "#ef4444";
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={getColor(value)} strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s ease-out", filter: `drop-shadow(0 0 4px ${getColor(value)}40)` }}
        />
      </svg>
      <span className="absolute text-lg font-bold text-white tabular-nums">{Math.round(value)}%</span>
    </div>
  );
};

/* ── Person Card ──────────────────────────────────────────── */

const PersonCard = ({ person, role }) => {
  if (!person) return null;
  const p = typeof person === "object" ? person : { name: "Unknown" };
  const hue = nameToHue(p.name);

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
      {p.avatar ? (
        <img src={p.avatar} alt={p.name} className="w-9 h-9 rounded-lg object-cover ring-2 ring-white/[0.06]" />
      ) : (
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center ring-2 ring-white/[0.06]"
          style={{ background: `linear-gradient(135deg, hsl(${hue}, 60%, 45%), hsl(${hue + 30}, 50%, 35%))` }}
        >
          <span className="text-xs font-bold text-white">{getInitials(p.name)}</span>
        </div>
      )}
      <div className="min-w-0">
        <p className="text-sm font-medium text-white truncate">{p.name}</p>
        <p className="text-[10px] text-slate-500 uppercase tracking-wider">{role}</p>
      </div>
    </div>
  );
};

/* ── Component ────────────────────────────────────────────── */

const TaskDetails = ({
  task,
  onClose,
  onEdit,
  onDelete,
  onRefresh,
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const notesEndRef = useRef(null);

  const [noteText, setNoteText] = useState("");
  const [submittingNote, setSubmittingNote] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingProgress, setUpdatingProgress] = useState(false);
  const [localProgress, setLocalProgress] = useState(task?.progress || 0);

  /** Sync local progress when task changes */
  useEffect(() => {
    setLocalProgress(task?.progress || 0);
  }, [task?.progress]);

  if (!task) return null;

  const pc = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.Low;
  const sc = STATUS_CONFIG[task.status] || STATUS_CONFIG.Pending;
  const dl = deadlineInfo(task.deadline);
  const notes = Array.isArray(task.notes) ? task.notes : [];

  const assignee = typeof task.assignedTo === "object" ? task.assignedTo : null;
  const assigner = typeof task.assignedBy === "object" ? task.assignedBy : null;
  const project = typeof task.projectId === "object" ? task.projectId : null;

  /** Submit note */
  const handleSubmitNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    try {
      setSubmittingNote(true);
      await taskService.addNote(task._id, { text: noteText.trim() });
      setNoteText("");
      toast.success("Note added!");
      onRefresh?.();

      // Scroll to bottom of notes
      setTimeout(() => {
        notesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add note");
    } finally {
      setSubmittingNote(false);
    }
  };

  /** Update status */
  const handleStatusChange = async (newStatus) => {
    if (newStatus === task.status) return;

    try {
      setUpdatingStatus(true);
      const progressUpdate = newStatus === "Completed" ? 100 : undefined;
      await taskService.updateTask(task._id, {
        status: newStatus,
        ...(progressUpdate !== undefined && { progress: progressUpdate }),
      });
      toast.success(`Status updated to ${newStatus}`);
      onRefresh?.();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  /** Update progress */
  const handleProgressSave = async () => {
    if (localProgress === task.progress) return;

    try {
      setUpdatingProgress(true);
      const statusUpdate = localProgress === 100 ? "Completed" : undefined;
      await taskService.updateTask(task._id, {
        progress: localProgress,
        ...(statusUpdate && { status: statusUpdate }),
      });
      toast.success("Progress updated!");
      onRefresh?.();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update progress");
    } finally {
      setUpdatingProgress(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1 min-w-0 pr-4">
          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`
              inline-flex items-center gap-1 px-2.5 py-1 rounded-lg
              text-[11px] font-bold uppercase tracking-wider
              border ${pc.bg} ${pc.text} ${pc.border}
            `}>
              <Icons.Flag className="w-3 h-3" />
              {task.priority}
            </span>

            <span className={`
              inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
              text-[11px] font-semibold uppercase tracking-wider
              border ${sc.bg} ${sc.text} ${sc.border}
            `}>
              <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
              {task.status}
            </span>

            {dl && (
              <span className={`
                inline-flex items-center gap-1 px-2.5 py-1 rounded-lg
                text-[11px] font-medium ${dl.color} ${dl.bg}
              `}>
                <Icons.Clock className="w-3 h-3" />
                {dl.text}
              </span>
            )}
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-white mb-1">{task.title}</h2>

          {/* Project tag */}
          {project && (
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
              <Icons.Folder className="w-3.5 h-3.5" />
              {project.projectName}
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {isAdmin && (
            <>
              <button
                onClick={() => onEdit?.(task)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
                title="Edit task"
              >
                <Icons.Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete?.(task)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title="Delete task"
              >
                <Icons.Trash className="w-4 h-4" />
              </button>
            </>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
              title="Close"
            >
              <Icons.X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── Description ───────────────────────────────────── */}
      {task.description && (
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] mb-5">
          <h4 className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-2">Description</h4>
          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
            {task.description}
          </p>
        </div>
      )}

      {/* ── Progress + People row ──────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        {/* Progress card */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
          <h4 className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-3">Progress</h4>

          <div className="flex items-center gap-4 mb-3">
            <ProgressRing value={task.progress || 0} size={72} strokeWidth={5} />
            <div className="flex-1">
              <ProgressBar value={task.progress || 0} size="sm" className="mb-2" />
              <p className="text-[10px] text-slate-500">
                {task.status === "Completed" ? "Task completed" : `${100 - (task.progress || 0)}% remaining`}
              </p>
            </div>
          </div>

          {/* Progress slider (for updates) */}
          <div className="pt-3 border-t border-white/[0.04]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-slate-500">Update progress</span>
              <span className="text-[10px] font-semibold text-white tabular-nums">{localProgress}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={localProgress}
              onChange={(e) => setLocalProgress(parseInt(e.target.value, 10))}
              className="
                w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/[0.06]
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-green-400
                [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#1e293b]
                [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:shadow-green-500/30
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4
                [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-green-400
                [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#1e293b]
                [&::-moz-range-thumb]:cursor-pointer
              "
            />
            {localProgress !== (task.progress || 0) && (
              <button
                onClick={handleProgressSave}
                disabled={updatingProgress}
                className="
                  mt-2 w-full h-8 rounded-lg
                  bg-green-500/10 border border-green-500/20
                  text-xs font-medium text-green-400
                  hover:bg-green-500/20 transition-colors
                  disabled:opacity-50
                  flex items-center justify-center gap-1.5
                "
              >
                {updatingProgress ? (
                  <div className="w-3 h-3 rounded-full border-2 border-green-400/30 border-t-green-400 animate-spin" />
                ) : null}
                Save Progress
              </button>
            )}
          </div>
        </div>

        {/* People + Meta */}
        <div className="space-y-3">
          <PersonCard person={assignee} role="Assigned To" />
          <PersonCard person={assigner} role="Assigned By" />

          {/* Dates */}
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                <Icons.Calendar className="w-3 h-3" /> Created
              </span>
              <span className="text-xs text-slate-400">{formatDate(task.createdAt)}</span>
            </div>
            {task.deadline && (
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                  <Icons.Clock className="w-3 h-3" /> Deadline
                </span>
                <span className={`text-xs font-medium ${dl?.color || "text-slate-400"}`}>
                  {formatDate(task.deadline)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Quick Status Update ────────────────────────────── */}
      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] mb-5">
        <h4 className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-3">
          Update Status
        </h4>
        <div className="flex gap-2">
          {ALL_STATUSES.map((status) => {
            const config = STATUS_CONFIG[status];
            const isActive = task.status === status;
            return (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                disabled={updatingStatus || isActive}
                className={`
                  flex-1 h-9 rounded-xl text-xs font-semibold
                  border transition-all duration-200
                  flex items-center justify-center gap-1.5
                  disabled:cursor-not-allowed
                  ${
                    isActive
                      ? `${config.bg} ${config.text} ${config.border} shadow-md`
                      : "bg-white/[0.02] border-white/[0.06] text-slate-400 hover:bg-white/[0.04] hover:text-white"
                  }
                `}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? config.dot : "bg-slate-600"}`} />
                {status}
                {updatingStatus && isActive && (
                  <div className="w-3 h-3 rounded-full border-2 border-current/30 border-t-current animate-spin ml-1" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Notes / Comments ──────────────────────────────── */}
      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <Icons.MessageSquare className="w-4 h-4 text-blue-400" />
            Notes
            {notes.length > 0 && (
              <span className="text-[10px] text-slate-500 font-normal">({notes.length})</span>
            )}
          </h4>
        </div>

        {/* Notes thread */}
        <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin pr-1 mb-4">
          {notes.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">
              No notes yet. Add one below.
            </p>
          ) : (
            notes.map((note, idx) => {
              const noteUser = typeof note.user === "object" ? note.user : null;
              const nHue = nameToHue(noteUser?.name || "User");
              const isOwnNote = noteUser?._id === user?._id;

              return (
                <div
                  key={note._id || idx}
                  className={`
                    flex gap-3
                    ${isOwnNote ? "flex-row-reverse" : ""}
                  `}
                >
                  {/* Avatar */}
                  {noteUser?.avatar ? (
                    <img src={noteUser.avatar} alt={noteUser.name} className="w-7 h-7 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `linear-gradient(135deg, hsl(${nHue}, 60%, 45%), hsl(${nHue + 30}, 50%, 35%))` }}
                    >
                      <span className="text-[8px] font-bold text-white">{getInitials(noteUser?.name)}</span>
                    </div>
                  )}

                  {/* Bubble */}
                  <div
                    className={`
                      max-w-[80%] px-3 py-2 rounded-xl
                      ${
                        isOwnNote
                          ? "bg-green-500/10 border border-green-500/15"
                          : "bg-white/[0.03] border border-white/[0.06]"
                      }
                    `}
                  >
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-semibold text-white">
                        {isOwnNote ? "You" : noteUser?.name || "User"}
                      </span>
                      <span className="text-[9px] text-slate-600">
                        {timeAgo(note.createdAt || note.date)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                      {note.text || note.content}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={notesEndRef} />
        </div>

        {/* Add note form */}
        <form onSubmit={handleSubmitNote} className="flex gap-2">
          <input
            type="text"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add a note..."
            className="
              flex-1 h-10 px-4 rounded-xl
              bg-white/[0.04] border border-white/[0.08]
              text-sm text-slate-200 placeholder-slate-500
              focus:outline-none focus:border-green-500/40 focus:ring-1 focus:ring-green-500/20
              transition-all duration-200
            "
          />
          <button
            type="submit"
            disabled={submittingNote || !noteText.trim()}
            className="
              w-10 h-10 rounded-xl flex items-center justify-center
              bg-gradient-to-r from-green-500 to-emerald-600
              text-white shadow-md shadow-green-500/20
              hover:shadow-lg hover:shadow-green-500/25
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
            "
          >
            {submittingNote ? (
              <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <Icons.Send className="w-4 h-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TaskDetails;
