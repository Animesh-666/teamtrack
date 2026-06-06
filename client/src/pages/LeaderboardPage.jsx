import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import LeaderboardTable from "../components/leaderboard/LeaderboardTable";
import userService from "../services/userService";

const Icons = {
  Trophy: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
      <path d="M12 2a6 6 0 0 1 6 6v5a6 6 0 0 1-6 6 6 6 0 0 1-6-6V8a6 6 0 0 1 6-6z" />
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
  Sparkles: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z" />
    </svg>
  ),
  TaskCheck: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
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
  Crown: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2 4l3 12h14l3-12-6 7-4-9-4 9-6-7z" />
      <path d="M5 16h14v2a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-2z" />
    </svg>
  ),
};

const TIME_PERIODS = [
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
  { key: "all", label: "All Time" },
];

const PODIUM_CONFIG = {
  0: {
    label: "1st Place",
    medalEmoji: "🥇",
    gradient: "from-amber-500/20 via-yellow-500/10 to-transparent",
    border: "border-amber-500/30",
    glow: "shadow-amber-500/15",
    textColor: "text-amber-400",
    ringColor: "ring-amber-500/40",
    badgeBg: "bg-gradient-to-r from-amber-500 to-yellow-400",
    badgeText: "text-[#0f172a]",
    iconComponent: Icons.Crown,
  },
  1: {
    label: "2nd Place",
    medalEmoji: "🥈",
    gradient: "from-slate-300/15 via-slate-400/5 to-transparent",
    border: "border-slate-300/25",
    glow: "shadow-slate-300/10",
    textColor: "text-slate-300",
    ringColor: "ring-slate-300/30",
    badgeBg: "bg-gradient-to-r from-slate-300 to-slate-400",
    badgeText: "text-[#0f172a]",
    iconComponent: Icons.Trophy,
  },
  2: {
    label: "3rd Place",
    medalEmoji: "🥉",
    gradient: "from-amber-700/15 via-amber-800/5 to-transparent",
    border: "border-amber-700/25",
    glow: "shadow-amber-700/10",
    textColor: "text-amber-600",
    ringColor: "ring-amber-700/30",
    badgeBg: "bg-gradient-to-r from-amber-700 to-amber-800",
    badgeText: "text-white",
    iconComponent: Icons.Trophy,
  },
};

const getInitials = (name) =>
  name ? name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) : "?";

const nameToHue = (name) => {
  let hash = 0;
  for (let i = 0; i < (name || "").length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
};

const PodiumSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className="relative p-6 rounded-2xl bg-[#1e293b]/30 border border-white/[0.06] animate-pulse"
      >
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.06]" />
          <div className="w-24 h-4 rounded bg-white/[0.06]" />
          <div className="w-16 h-3 rounded bg-white/[0.04]" />
          <div className="flex gap-4 mt-2">
            <div className="w-12 h-8 rounded bg-white/[0.04]" />
            <div className="w-12 h-8 rounded bg-white/[0.04]" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const StatsSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className="p-5 rounded-2xl bg-[#1e293b]/30 border border-white/[0.06] animate-pulse"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/[0.06]" />
          <div className="space-y-1.5">
            <div className="w-8 h-5 rounded bg-white/[0.06]" />
            <div className="w-20 h-3 rounded bg-white/[0.04]" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const LeaderboardPage = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState("month");

  const fetchLeaderboard = useCallback(async (period) => {
    setLoading(true);
    try {
      const res = await userService.getLeaderboard({ period });
      const data = res.data?.members || res.data || [];
      setMembers(data);
    } catch {
      toast.error("Failed to load leaderboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard(timePeriod);
  }, [timePeriod, fetchLeaderboard]);

  const totalMembers = members.length;
  const totalTasks = members.reduce((sum, m) => sum + (m.completedTasks || 0), 0);
  const avgScore =
    totalMembers > 0
      ? Math.round(
          members.reduce((sum, m) => sum + (m.productivityScore || 0), 0) / totalMembers
        )
      : 0;

  const topThree = members.slice(0, 3);

  const handlePeriodChange = (period) => {
    setTimePeriod(period);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
      <div className="mb-8 animate-fade-in-down">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border border-amber-500/20 flex items-center justify-center shadow-lg shadow-amber-500/10">
              <Icons.Trophy className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Leaderboard
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Track team performance and celebrate top contributors
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#1e293b]/40 border border-white/[0.06]">
            {TIME_PERIODS.map((period) => {
              const isActive = timePeriod === period.key;
              return (
                <button
                  key={period.key}
                  onClick={() => handlePeriodChange(period.key)}
                  className={`
                    flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium
                    transition-all duration-200
                    ${
                      isActive
                        ? "bg-[#1e293b] text-white border border-white/[0.08] shadow-md"
                        : "text-slate-400 hover:text-slate-200"
                    }
                  `}
                >
                  {isActive && <Icons.Calendar className="w-3.5 h-3.5 text-green-400" />}
                  {period.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mb-8 animate-fade-in-up">
        {loading ? (
          <PodiumSkeleton />
        ) : topThree.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topThree.map((member, index) => {
              const config = PODIUM_CONFIG[index];
              const hue = nameToHue(member.name);
              const IconComp = config.iconComponent;

              return (
                <div
                  key={member._id || index}
                  className={`
                    group relative overflow-hidden p-6 rounded-2xl
                    bg-gradient-to-br ${config.gradient}
                    bg-[#1e293b]/40 backdrop-blur-xl
                    border ${config.border}
                    shadow-xl ${config.glow}
                    hover:shadow-2xl hover:-translate-y-0.5
                    transition-all duration-300
                    ${index === 0 ? "md:order-2" : index === 1 ? "md:order-1" : "md:order-3"}
                  `}
                >
                  <div
                    className={`
                      absolute -top-10 -right-10 w-32 h-32 rounded-full
                      opacity-20 blur-2xl
                      ${index === 0 ? "bg-amber-500" : index === 1 ? "bg-slate-300" : "bg-amber-700"}
                    `}
                  />

                  <div className="relative flex flex-col items-center text-center">
                    <div className="flex items-center gap-1.5 mb-4">
                      <span
                        className={`
                          inline-flex items-center gap-1 px-3 py-1 rounded-full
                          text-xs font-bold
                          ${config.badgeBg} ${config.badgeText}
                        `}
                      >
                        <IconComp className="w-3 h-3" />
                        {config.label}
                      </span>
                    </div>

                    {member.avatar ? (
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className={`
                          w-16 h-16 rounded-2xl object-cover mb-3
                          ring-3 ${config.ringColor}
                          group-hover:scale-110 transition-transform duration-300
                        `}
                      />
                    ) : (
                      <div
                        className={`
                          w-16 h-16 rounded-2xl flex items-center justify-center mb-3
                          ring-3 ${config.ringColor}
                          group-hover:scale-110 transition-transform duration-300
                        `}
                        style={{
                          background: `linear-gradient(135deg, hsl(${hue}, 60%, 45%), hsl(${hue + 30}, 50%, 35%))`,
                        }}
                      >
                        <span className="text-lg font-bold text-white">
                          {getInitials(member.name)}
                        </span>
                      </div>
                    )}

                    <h3 className="text-base font-bold text-white mb-0.5">
                      {member.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 capitalize mb-4">
                      {member.role === "admin" ? "Team Leader" : "Team Member"}
                    </p>

                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className={`text-lg font-bold ${config.textColor} tabular-nums`}>
                          {member.completedTasks || 0}
                        </p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">
                          Tasks
                        </p>
                      </div>
                      <div className="w-px h-8 bg-white/[0.08]" />
                      <div className="text-center">
                        <p className={`text-lg font-bold ${config.textColor} tabular-nums`}>
                          {member.productivityScore || 0}
                        </p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">
                          Score
                        </p>
                      </div>
                      <div className="w-px h-8 bg-white/[0.08]" />
                      <div className="text-center">
                        <p className={`text-lg font-bold ${config.textColor} tabular-nums`}>
                          {member.hoursLogged || 0}h
                        </p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">
                          Hours
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>

      <div className="mb-8 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
        {loading ? (
          <StatsSkeleton />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="group relative p-5 rounded-2xl bg-[#1e293b]/60 backdrop-blur-xl border border-white/[0.06] shadow-lg shadow-blue-500/5 hover:shadow-xl hover:border-white/[0.1] hover:-translate-y-0.5 transition-all duration-300">
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-blue-500/5 blur-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
              <div className="relative flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-lg shadow-blue-500/10">
                  <Icons.Users className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white tabular-nums">{totalMembers}</p>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                    Team Members
                  </p>
                </div>
              </div>
            </div>

            <div className="group relative p-5 rounded-2xl bg-[#1e293b]/60 backdrop-blur-xl border border-white/[0.06] shadow-lg shadow-green-500/5 hover:shadow-xl hover:border-white/[0.1] hover:-translate-y-0.5 transition-all duration-300">
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-green-500/5 blur-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
              <div className="relative flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center shadow-lg shadow-green-500/10">
                  <Icons.Sparkles className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white tabular-nums">{avgScore}</p>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                    Avg Productivity
                  </p>
                </div>
              </div>
            </div>

            <div className="group relative p-5 rounded-2xl bg-[#1e293b]/60 backdrop-blur-xl border border-white/[0.06] shadow-lg shadow-purple-500/5 hover:shadow-xl hover:border-white/[0.1] hover:-translate-y-0.5 transition-all duration-300">
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-purple-500/5 blur-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
              <div className="relative flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shadow-lg shadow-purple-500/10">
                  <Icons.TaskCheck className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white tabular-nums">{totalTasks}</p>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                    Tasks Completed
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
        <LeaderboardTable members={members} loading={loading} />
      </div>
    </div>
  );
};

export default LeaderboardPage;