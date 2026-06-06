/**
 * LeaderboardTable.jsx
 * ─────────────────────────────────────────────────────────────
 * Custom analytics leaderboard table displaying team rankings.
 *
 * Features:
 *  - Displays member rankings with gold/silver/bronze styling for top 3
 *  - Shows total completed tasks, hours logged, and aggregate Productivity Score
 *  - Live searching/filtering of team members
 *  - Sortable columns (by rank, name, tasks, hours, score) with direction indicators
 *  - Premium modern styling using HSL fallback avatars, gradient bars, and glow hover effects
 *  - Fully responsive layout that handles small screen viewports gracefully
 */

import { useState, useMemo } from "react";

/* ── Icons ────────────────────────────────────────────────── */

const Icons = {
  Search: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  Trophy: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
      <path d="M12 2a6 6 0 0 1 6 6v5a6 6 0 0 1-6 6 6 6 0 0 1-6-6V8a6 6 0 0 1 6-6z" />
    </svg>
  ),
  Task: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  Clock: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Sparkles: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z" />
    </svg>
  ),
  ArrowUp: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
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

/** Get medal background, text, and glow class based on rank */
const getRankBadgeClass = (rank) => {
  if (rank === 1) {
    return {
      bg: "bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-lg shadow-amber-500/10",
      pill: "bg-gradient-to-r from-amber-500 to-yellow-400 text-[#0f172a] border-amber-400/30",
      row: "bg-gradient-to-r from-amber-500/[0.03] to-transparent border-amber-500/10",
    };
  }
  if (rank === 2) {
    return {
      bg: "bg-slate-300/10 border-slate-300/30 text-slate-300 shadow-lg shadow-slate-300/5",
      pill: "bg-gradient-to-r from-slate-300 to-slate-400 text-[#0f172a] border-slate-300/30",
      row: "bg-gradient-to-r from-slate-300/[0.02] to-transparent border-slate-300/5",
    };
  }
  if (rank === 3) {
    return {
      bg: "bg-amber-700/10 border-amber-700/30 text-amber-600 shadow-lg shadow-amber-700/5",
      pill: "bg-gradient-to-r from-amber-700 to-amber-800 text-white border-amber-700/30",
      row: "bg-gradient-to-r from-amber-700/[0.01] to-transparent border-amber-700/5",
    };
  }
  return {
    bg: "bg-white/[0.03] border-white/[0.06] text-slate-400",
    pill: "bg-[#1e293b] text-slate-400 border-white/[0.04]",
    row: "border-white/[0.03]",
  };
};

/* ── Component ────────────────────────────────────────────── */

const LeaderboardTable = ({ members = [], loading = false }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "productivityScore", direction: "desc" });

  /** Set sorting key & direction */
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  /** Filter and sort members list */
  const sortedMembers = useMemo(() => {
    // 1. Filter out by search query
    const filtered = members.filter((member) =>
      (member.name || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 2. Sort by the configured key
    return [...filtered].sort((a, b) => {
      let valA = a[sortConfig.key];
      let valB = b[sortConfig.key];

      // Handle nulls/undefs
      if (valA === undefined || valA === null) valA = 0;
      if (valB === undefined || valB === null) valB = 0;

      // Handle alphabetical values
      if (typeof valA === "string") {
        return sortConfig.direction === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      // Handle numeric values
      return sortConfig.direction === "asc" ? valA - valB : valB - valA;
    });
  }, [members, searchTerm, sortConfig]);

  /** Helper to render sorting indicators */
  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return (
      <Icons.ArrowUp
        className={`w-3.5 h-3.5 transition-transform duration-200 ${
          sortConfig.direction === "desc" ? "rotate-180" : ""
        }`}
      />
    );
  };

  /** Table Header item styling */
  const headerClass = (key, align = "left") => `
    px-5 py-4 cursor-pointer select-none text-xs font-semibold uppercase tracking-wider
    text-slate-400 hover:text-white transition-colors duration-150
    ${align === "right" ? "text-right" : "text-left"}
  `;

  return (
    <div className="space-y-4">
      {/* ── Toolbar: Search Filter ─────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Icons.Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Filter team members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="
              w-full h-11 pl-10 pr-4 rounded-xl
              bg-[#1e293b]/40 border border-white/[0.06]
              text-sm text-slate-200 placeholder-slate-500
              focus:outline-none focus:border-green-500/40 focus:ring-1 focus:ring-green-500/20
              transition-all duration-200
            "
          />
        </div>
        <div className="flex items-center gap-1.5 self-end sm:self-auto text-[11px] text-slate-500 font-medium">
          <Icons.Sparkles className="w-3.5 h-3.5 text-green-400" />
          Rankings update dynamically based on contributions
        </div>
      </div>

      {/* ── Table Container ────────────────────────────────── */}
      <div className="
        w-full rounded-2xl overflow-hidden
        bg-[#1e293b]/30 backdrop-blur-xl
        border border-white/[0.06]
        shadow-xl
      ">
        <div className="w-full overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[700px] border-collapse text-left">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/[0.06]">
                <th
                  onClick={() => requestSort("rank")}
                  className={`${headerClass("rank")} w-20 text-center`}
                >
                  <div className="flex items-center justify-center gap-1">
                    Rank {getSortIndicator("rank")}
                  </div>
                </th>
                <th onClick={() => requestSort("name")} className={headerClass("name")}>
                  <div className="flex items-center gap-1">
                    Member {getSortIndicator("name")}
                  </div>
                </th>
                <th
                  onClick={() => requestSort("completedTasks")}
                  className={headerClass("completedTasks", "right")}
                >
                  <div className="flex items-center justify-end gap-1">
                    Tasks {getSortIndicator("completedTasks")}
                  </div>
                </th>
                <th
                  onClick={() => requestSort("hoursLogged")}
                  className={headerClass("hoursLogged", "right")}
                >
                  <div className="flex items-center justify-end gap-1">
                    Hours {getSortIndicator("hoursLogged")}
                  </div>
                </th>
                <th
                  onClick={() => requestSort("productivityScore")}
                  className={`${headerClass("productivityScore", "right")} w-48`}
                >
                  <div className="flex items-center justify-end gap-1">
                    Productivity {getSortIndicator("productivityScore")}
                  </div>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/[0.04]">
              {loading ? (
                // Skeletons
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-5 py-5 text-center">
                      <div className="w-6 h-6 rounded-lg bg-white/[0.06] mx-auto" />
                    </td>
                    <td className="px-5 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-white/[0.06]" />
                        <div className="space-y-1.5">
                          <div className="w-24 h-3 rounded bg-white/[0.06]" />
                          <div className="w-16 h-2.5 rounded bg-white/[0.04]" />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-5 text-right">
                      <div className="w-8 h-3 rounded bg-white/[0.04] ml-auto" />
                    </td>
                    <td className="px-5 py-5 text-right">
                      <div className="w-12 h-3 rounded bg-white/[0.04] ml-auto" />
                    </td>
                    <td className="px-5 py-5">
                      <div className="w-full h-2 rounded bg-white/[0.04] ml-auto max-w-[120px]" />
                    </td>
                  </tr>
                ))
              ) : sortedMembers.length > 0 ? (
                sortedMembers.map((member, index) => {
                  const rank = index + 1;
                  const rankStyle = getRankBadgeClass(rank);
                  const hue = nameToHue(member.name);
                  const score = member.productivityScore || 0;

                  return (
                    <tr
                      key={member._id || index}
                      className={`
                        group hover:bg-white/[0.01] transition-all duration-200
                        ${rankStyle.row}
                      `}
                    >
                      {/* Rank Column */}
                      <td className="px-5 py-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center">
                          {rank <= 3 ? (
                            <div className={`
                              w-8 h-8 rounded-full border flex items-center justify-center text-xs font-black
                              ${rankStyle.pill}
                            `}>
                              {rank === 1 ? (
                                <Icons.Trophy className="w-3.5 h-3.5" />
                              ) : (
                                rank
                              )}
                            </div>
                          ) : (
                            <span className="text-sm font-semibold text-slate-500 tabular-nums">
                              {rank}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Member profile details */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {/* Avatar */}
                          {member.avatar ? (
                            <img
                              src={member.avatar}
                              alt={member.name}
                              className="w-9 h-9 rounded-lg object-cover ring-2 ring-white/[0.06] flex-shrink-0"
                            />
                          ) : (
                            <div
                              className="w-9 h-9 rounded-lg flex items-center justify-center ring-2 ring-white/[0.06] flex-shrink-0"
                              style={{
                                background: `linear-gradient(135deg, hsl(${hue}, 60%, 45%), hsl(${hue + 30}, 50%, 35%))`,
                              }}
                            >
                              <span className="text-xs font-bold text-white">
                                {getInitials(member.name)}
                              </span>
                            </div>
                          )}

                          {/* Meta */}
                          <div>
                            <p className="text-sm font-semibold text-white group-hover:text-green-400 transition-colors duration-150">
                              {member.name}
                            </p>
                            <p className="text-[10px] text-slate-500 capitalize">
                              {member.role === "admin" ? "Team Leader" : "Team Member"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Completed tasks */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <span className="text-sm font-semibold text-slate-200 flex items-center justify-end gap-1.5 tabular-nums">
                          <Icons.Task className="w-3.5 h-3.5 text-slate-500" />
                          {member.completedTasks || 0}
                        </span>
                      </td>

                      {/* Hours logged */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <span className="text-sm font-semibold text-slate-200 flex items-center justify-end gap-1.5 tabular-nums">
                          <Icons.Clock className="w-3.5 h-3.5 text-slate-500" />
                          {member.hoursLogged || 0}h
                        </span>
                      </td>

                      {/* Productivity bar Column */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex flex-col items-end gap-1 max-w-[160px] ml-auto">
                          <span className="text-xs font-bold text-slate-200 tabular-nums flex items-center gap-1">
                            <Icons.Sparkles className="w-3 h-3 text-green-400" />
                            {score}
                          </span>

                          {/* Gradient progress tracker */}
                          <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500"
                              style={{ width: `${Math.min(score, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                // Empty state search
                <tr>
                  <td colSpan="5" className="px-5 py-12 text-center">
                    <span className="text-sm text-slate-500 block">No matching team members found.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardTable;