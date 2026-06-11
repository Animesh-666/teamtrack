/**
 * ProjectCard.jsx
 * ─────────────────────────────────────────────────────────────
 * Glassmorphism card for displaying a single project in the
 * projects grid / list view.
 *
 * Features:
 *  - Status badge with color coding (Active / Completed / On Hold)
 *  - Animated progress bar based on task completion
 *  - Member avatar stack with overflow count
 *  - Date range display with calendar icon
 *  - Hover lift + border glow animation
 *  - Action menu (edit / delete) for admins
 *  - Click to navigate to project detail page
 */

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import ProgressBar from "../common/ProgressBar";

/* ── Icons ────────────────────────────────────────────────── */

const Icons = {
  Calendar: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  Users: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Tasks: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
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
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  ),
  ArrowRight: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  ),
};

/* ── Status config ────────────────────────────────────────── */

const STATUS_CONFIG = {
  Active: {
    bg: "bg-green-500/10",
    text: "text-green-400",
    border: "border-green-500/20",
    dot: "bg-green-400",
    glow: "shadow-green-500/5",
    pulse: true,
  },
  Completed: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/20",
    dot: "bg-blue-400",
    glow: "shadow-blue-500/5",
    pulse: false,
  },
  "On Hold": {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/20",
    dot: "bg-amber-400",
    glow: "shadow-amber-500/5",
    pulse: false,
  },
};

/* ── Helpers ──────────────────────────────────────────────── */

/** Format date range */
const formatDateRange = (start, end) => {
  const opts = { month: "short", day: "numeric" };
  const s = start ? new Date(start).toLocaleDateString("en-US", opts) : "—";
  const e = end ? new Date(end).toLocaleDateString("en-US", { ...opts, year: "numeric" }) : "Ongoing";
  return `${s} → ${e}`;
};

/** Get initials from name */
const getInitials = (name) =>
  name
    ? name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

/** Generate a deterministic hue from a string */
const nameToHue = (name) => {
  let hash = 0;
  for (let i = 0; i < (name || "").length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
};

/* ── Component ────────────────────────────────────────────── */

const ProjectCard = ({
  project,
  onEdit,
  onDelete,
  taskStats = { total: 0, completed: 0 },
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  const isAdmin = user?.role === "ADMIN";
  const sc = STATUS_CONFIG[project.status] || STATUS_CONFIG.Active;
  const progress = taskStats.total > 0
    ? Math.round((taskStats.completed / taskStats.total) * 100)
    : 0;

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

  /** Visible members (max 4 avatars shown) */
  const members = project.members || [];
  const visibleMembers = members.slice(0, 4);
  const overflowCount = Math.max(0, members.length - 4);

  return (
    <div
      id={`project-card-${project._id}`}
      onClick={() => navigate(`/projects/${project._id}`)}
      className={`
        group relative p-5 rounded-2xl
        bg-transparent border border-slate-200 dark:border-white/[0.06]
        text-slate-800 dark:text-slate-200
        shadow-lg ${sc?.glow || ''}
        hover:shadow-xl hover:border-slate-300 dark:hover:border-white/[0.1]
        hover:-translate-y-0.5
        transition-all duration-300 ease-out
        cursor-pointer flex flex-col
      `}
      onClick={() => navigate(`/projects/${project._id}`)}
    >
      {/* ── Ambient top glow ──────────────────────────────── */}
      <div className={`
        absolute -top-8 -right-8 w-32 h-32 rounded-full blur-3xl
        ${sc.bg} opacity-0 group-hover:opacity-40
        transition-opacity duration-500 pointer-events-none
      `} />

      {/* ── Header: status + actions ──────────────────────── */}
      <div className="flex items-center justify-between mb-3 relative z-10">
        {/* Status badge */}
        <span className={`
          inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
          text-[11px] font-semibold uppercase tracking-wider
          border ${sc.bg} ${sc.text} ${sc.border}
        `}>
          <span className="relative flex h-1.5 w-1.5">
            <span className={`
              ${sc.dot} rounded-full inline-flex h-full w-full
            `} />
            {sc.pulse && (
              <span className={`absolute inline-flex h-full w-full rounded-full ${sc.dot} opacity-40 animate-ping`} />
            )}
          </span>
          {project.status}
        </span>

        {/* Action menu (admin only) */}
        {isAdmin && (
          <div ref={menuRef} className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              className="
                flex items-center justify-center w-8 h-8 rounded-lg
                text-slate-500 hover:text-white hover:bg-white/[0.08]
                transition-colors duration-150
                opacity-0 group-hover:opacity-100
              "
              aria-label="Project actions"
            >
              <Icons.MoreVertical className="w-4 h-4" />
            </button>

            {/* Dropdown */}
            {showMenu && (
              <div
                className="
                  absolute right-0 mt-1 w-40 py-1.5
                  bg-[#1e293b]/95 backdrop-blur-xl
                  border border-white/[0.08] rounded-xl
                  shadow-2xl shadow-black/40
                  animate-fade-in z-50
                "
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => { setShowMenu(false); onEdit?.(project); }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                >
                  <Icons.Edit className="w-3.5 h-3.5" />
                  Edit Project
                </button>
                <button
                  onClick={() => { setShowMenu(false); onDelete?.(project); }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                >
                  <Icons.Trash className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Project name ──────────────────────────────────── */}
      <h3 className="text-base font-bold text-white mb-1.5 line-clamp-1 group-hover:text-green-400 transition-colors duration-200">
        {project.projectName}
      </h3>

      {/* ── Description ───────────────────────────────────── */}
      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-4 flex-1">
        {project.description || "No description provided."}
      </p>

      {/* ── Progress bar ──────────────────────────────────── */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
            Progress
          </span>
          <span className="text-[10px] font-semibold text-slate-400">
            {taskStats.completed}/{taskStats.total} tasks
          </span>
        </div>
        <ProgressBar value={progress} size="sm" showLabel={false} />
      </div>

      {/* ── Footer: date + members ────────────────────────── */}
      <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
        {/* Date range */}
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
          <Icons.Calendar className="w-3.5 h-3.5" />
          <span>{formatDateRange(project.startDate, project.endDate)}</span>
        </div>

        {/* Member avatar stack */}
        <div className="flex items-center">
          {visibleMembers.map((member, idx) => {
            const name = typeof member === "object" ? member.name : member;
            const avatar = typeof member === "object" ? member.avatar : null;
            const hue = nameToHue(name);

            return (
              <div
                key={typeof member === "object" ? member._id : idx}
                className="
                  relative w-7 h-7 rounded-full
                  border-2 border-[#1e293b]
                  flex items-center justify-center
                  transition-transform duration-200 hover:scale-110 hover:z-10
                "
                style={{ marginLeft: idx > 0 ? "-6px" : "0" }}
                title={name}
              >
                {avatar ? (
                  <img
                    src={avatar}
                    alt={name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full rounded-full flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, hsl(${hue}, 60%, 45%), hsl(${hue + 30}, 50%, 35%))`,
                    }}
                  >
                    <span className="text-[9px] font-bold text-white">
                      {getInitials(name)}
                    </span>
                  </div>
                )}
              </div>
            );
          })}

          {/* Overflow count */}
          {overflowCount > 0 && (
            <div
              className="
                relative w-7 h-7 rounded-full
                border-2 border-[#1e293b]
                bg-white/[0.08] flex items-center justify-center
              "
              style={{ marginLeft: "-6px" }}
            >
              <span className="text-[9px] font-bold text-slate-400">
                +{overflowCount}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Hover arrow indicator ─────────────────────────── */}
      <div className="
        absolute bottom-5 right-5
        opacity-0 group-hover:opacity-100
        translate-x-2 group-hover:translate-x-0
        transition-all duration-300
      ">
        <Icons.ArrowRight className="w-4 h-4 text-green-400" />
      </div>
    </div>
  );
};

export default ProjectCard;
