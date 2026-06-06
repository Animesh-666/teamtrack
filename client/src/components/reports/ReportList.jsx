/**
 * ReportList.jsx
 * ─────────────────────────────────────────────────────────────
 * Displays a list of daily reports, grouped by date.
 *
 * Features:
 *  - Reports grouped by date with section headers
 *  - Each report card shows user, project, hours, text preview
 *  - Expandable report text (click to read full)
 *  - Edit button for own reports
 *  - Admin can view all reports with member filter
 *  - Hours worked visual bar per report
 *  - Daily hours summary per date group
 *  - Empty state when no reports found
 *  - Pagination / "Load More" button
 *  - Smooth animations on card entry
 */

import { useState, useMemo } from "react";
import { useAuth } from "../../hooks/useAuth";
import EmptyState from "../common/EmptyState";

/* ── Icons ────────────────────────────────────────────────── */

const Icons = {
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
  Edit: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  ChevronDown: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="6 9 12 15 18 9" />
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
  FileText: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  MoreHorizontal: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  ),
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

/** Format date as a section header */
const formatSectionDate = (dateStr) => {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";

  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

/** Format time */
const formatTime = (date) =>
  date
    ? new Date(date).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

/** Hours color */
const getHoursColor = (hours) => {
  if (hours >= 8) return { text: "text-green-400", bg: "bg-green-500/10", fill: "bg-green-400" };
  if (hours >= 5) return { text: "text-blue-400", bg: "bg-blue-500/10", fill: "bg-blue-400" };
  if (hours >= 3) return { text: "text-amber-400", bg: "bg-amber-500/10", fill: "bg-amber-400" };
  return { text: "text-slate-400", bg: "bg-white/[0.04]", fill: "bg-slate-500" };
};

/* ── Single Report Card ───────────────────────────────────── */

const ReportCard = ({ report, onEdit, isOwn, animationDelay = 0 }) => {
  const [expanded, setExpanded] = useState(false);

  const reportUser = typeof report.userId === "object" ? report.userId : null;
  const reportProject = typeof report.projectId === "object" ? report.projectId : null;
  const hue = nameToHue(reportUser?.name);
  const hours = report.hoursWorked || 0;
  const hColor = getHoursColor(hours);
  const isLong = (report.reportText || "").length > 200;

  return (
    <div
      className="
        group relative p-4 sm:p-5 rounded-2xl
        bg-[#1e293b]/60 backdrop-blur-xl
        border border-white/[0.06]
        hover:border-white/[0.1]
        transition-all duration-300 ease-out
        animate-fade-in-up
      "
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {/* ── Header: user + time + actions ─────────────────── */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* User avatar */}
          {reportUser?.avatar ? (
            <img
              src={reportUser.avatar}
              alt={reportUser.name}
              className="w-9 h-9 rounded-lg object-cover ring-2 ring-white/[0.06] flex-shrink-0"
            />
          ) : (
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center ring-2 ring-white/[0.06] flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, hsl(${hue}, 60%, 45%), hsl(${hue + 30}, 50%, 35%))`,
              }}
            >
              <span className="text-xs font-bold text-white">{getInitials(reportUser?.name)}</span>
            </div>
          )}

          <div>
            <p className="text-sm font-semibold text-white">
              {reportUser?.name || "Team Member"}
              {isOwn && (
                <span className="ml-1.5 text-[9px] text-green-400 font-medium uppercase tracking-wider">(You)</span>
              )}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                <Icons.Clock className="w-3 h-3" />
                {formatTime(report.createdAt)}
              </span>
              {reportProject && (
                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                  <Icons.Folder className="w-3 h-3" />
                  <span className="truncate max-w-[100px]">{reportProject.projectName}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Hours badge + Edit */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Hours badge */}
          <span className={`
            inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
            text-xs font-semibold ${hColor.text} ${hColor.bg}
          `}>
            <Icons.Clock className="w-3.5 h-3.5" />
            {hours}h
          </span>

          {/* Edit button (own reports only) */}
          {isOwn && onEdit && (
            <button
              onClick={() => onEdit(report)}
              className="
                w-8 h-8 rounded-lg flex items-center justify-center
                text-slate-500 hover:text-white hover:bg-white/[0.08]
                opacity-0 group-hover:opacity-100
                transition-all duration-150
              "
              title="Edit report"
            >
              <Icons.Edit className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Hours worked visual bar ───────────────────────── */}
      <div className="mb-3">
        <div className="flex items-center gap-1">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className={`
                h-1 flex-1 rounded-full transition-all duration-300
                ${i < Math.ceil(hours) ? hColor.fill : "bg-white/[0.04]"}
                ${i < Math.ceil(hours) ? "opacity-80" : "opacity-40"}
              `}
              style={{ transitionDelay: `${i * 25}ms` }}
            />
          ))}
        </div>
      </div>

      {/* ── Report text ───────────────────────────────────── */}
      <div className="relative">
        <p
          className={`
            text-sm text-slate-300 leading-relaxed whitespace-pre-line
            ${!expanded && isLong ? "line-clamp-4" : ""}
          `}
        >
          {report.reportText}
        </p>

        {/* Read more / less toggle */}
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="
              mt-2 inline-flex items-center gap-1
              text-xs font-medium text-green-400 hover:text-green-300
              transition-colors duration-150
            "
          >
            {expanded ? "Show less" : "Read more"}
            <Icons.ChevronDown
              className={`
                w-3 h-3 transition-transform duration-200
                ${expanded ? "rotate-180" : ""}
              `}
            />
          </button>
        )}
      </div>
    </div>
  );
};

/* ── Main Component ───────────────────────────────────────── */

const ReportList = ({
  reports = [],
  onEdit,
  loading = false,
  hasMore = false,
  onLoadMore,
  loadingMore = false,
}) => {
  const { user } = useAuth();

  /** Group reports by date */
  const groupedReports = useMemo(() => {
    const groups = {};

    const sorted = [...reports].sort(
      (a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)
    );

    sorted.forEach((report) => {
      const dateKey = new Date(report.date || report.createdAt).toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = {
          date: report.date || report.createdAt,
          reports: [],
          totalHours: 0,
        };
      }
      groups[dateKey].reports.push(report);
      groups[dateKey].totalHours += report.hoursWorked || 0;
    });

    return Object.values(groups);
  }, [reports]);

  /* ── Loading state ──────────────────────────────────────── */
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="
              p-5 rounded-2xl
              bg-[#1e293b]/40
              border border-white/[0.04]
              animate-pulse
            "
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-white/[0.06]" />
              <div className="space-y-1.5">
                <div className="w-32 h-3 rounded bg-white/[0.06]" />
                <div className="w-20 h-2 rounded bg-white/[0.04]" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="w-full h-2.5 rounded bg-white/[0.04]" />
              <div className="w-3/4 h-2.5 rounded bg-white/[0.04]" />
              <div className="w-1/2 h-2.5 rounded bg-white/[0.04]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  /* ── Empty state ────────────────────────────────────────── */
  if (reports.length === 0) {
    return <EmptyState variant="reports" />;
  }

  /* ── Report list grouped by date ────────────────────────── */
  return (
    <div className="space-y-8">
      {groupedReports.map((group, groupIdx) => {
        const hColor = getHoursColor(group.totalHours / Math.max(group.reports.length, 1));

        return (
          <div key={group.date} className="space-y-3">
            {/* ── Date section header ──────────────────────── */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-3">
                {/* Date icon */}
                <div className="
                  w-8 h-8 rounded-lg
                  bg-white/[0.04] border border-white/[0.06]
                  flex items-center justify-center
                ">
                  <Icons.Calendar className="w-4 h-4 text-slate-500" />
                </div>

                {/* Date label */}
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {formatSectionDate(group.date)}
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    {group.reports.length} report{group.reports.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {/* Total hours for the day */}
              <div className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                ${hColor.bg}
              `}>
                <Icons.Clock className={`w-3.5 h-3.5 ${hColor.text}`} />
                <span className={`text-xs font-semibold ${hColor.text}`}>
                  {group.totalHours}h total
                </span>
              </div>
            </div>

            {/* ── Divider line ─────────────────────────────── */}
            <div className="flex items-center gap-3 px-1">
              <div className="flex-1 h-px bg-gradient-to-r from-white/[0.08] to-transparent" />
            </div>

            {/* ── Report cards ─────────────────────────────── */}
            <div className="space-y-3">
              {group.reports.map((report, idx) => {
                const reportUserId =
                  typeof report.userId === "object" ? report.userId._id : report.userId;
                const isOwn = reportUserId === user?._id;

                return (
                  <ReportCard
                    key={report._id || idx}
                    report={report}
                    onEdit={onEdit}
                    isOwn={isOwn}
                    animationDelay={groupIdx * 100 + idx * 50}
                  />
                );
              })}
            </div>
          </div>
        );
      })}

      {/* ── Load More ─────────────────────────────────────── */}
      {hasMore && (
        <div className="flex justify-center pt-4">
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            className="
              flex items-center gap-2 px-6 h-10 rounded-xl
              bg-white/[0.04] border border-white/[0.08]
              text-sm font-medium text-slate-400
              hover:bg-white/[0.08] hover:text-white
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
            "
          >
            {loadingMore ? (
              <div className="w-4 h-4 rounded-full border-2 border-slate-600 border-t-green-400 animate-spin" />
            ) : (
              <Icons.MoreHorizontal className="w-4 h-4" />
            )}
            {loadingMore ? "Loading..." : "Load More Reports"}
          </button>
        </div>
      )}

      {/* ── Summary footer ────────────────────────────────── */}
      <div className="
        flex items-center justify-center gap-6
        py-4 border-t border-white/[0.06]
        text-[11px] text-slate-500
      ">
        <span className="flex items-center gap-1.5">
          <Icons.FileText className="w-3.5 h-3.5" />
          {reports.length} total report{reports.length !== 1 ? "s" : ""}
        </span>
        <span className="flex items-center gap-1.5">
          <Icons.Clock className="w-3.5 h-3.5" />
          {reports.reduce((sum, r) => sum + (r.hoursWorked || 0), 0)}h total logged
        </span>
        <span className="flex items-center gap-1.5">
          <Icons.Calendar className="w-3.5 h-3.5" />
          {groupedReports.length} day{groupedReports.length !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
};

export default ReportList;