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
    </svg>
  ),
};

const TIME_PERIODS = [
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
  { key: "all", label: "All Time" },
];

const PODIUM_CONFIG = {
  0: { label: "1st Place", gradient: "from-amber-500/10 via-yellow-500/5 to-transparent", border: "border-amber-300 dark:border-amber-500/30", textColor: "text-amber-600 dark:text-amber-400", ringColor: "ring-amber-500/40", badgeBg: "bg-gradient-to-r from-amber-500 to-yellow-400", badgeText: "text-white dark:text-[#0f172a]", iconComponent: Icons.Crown },
  1: { label: "2nd Place", gradient: "from-slate-300/10 via-slate-400/5 to-transparent", border: "border-slate-300 dark:border-slate-300/25", textColor: "text-slate-600 dark:text-slate-300", ringColor: "ring-slate-300/30", badgeBg: "bg-gradient-to-r from-slate-400 to-slate-500", badgeText: "text-white", iconComponent: Icons.Trophy },
  2: { label: "3rd Place", gradient: "from-amber-700/10 via-amber-800/5 to-transparent", border: "border-amber-400 dark:border-amber-700/25", textColor: "text-amber-700 dark:text-amber-500", ringColor: "ring-amber-700/30", badgeBg: "bg-gradient-to-r from-amber-600 to-amber-800", badgeText: "text-white", iconComponent: Icons.Trophy },
};

const getInitials = (name) =>
  name ? name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) : "?";

const nameToHue = (name) => {
  let hash = 0;
  for (let i = 0; i < (name || "").length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash) % 360;
};

const LeaderboardPage = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState("month");

  const fetchLeaderboard = useCallback(async (period) => {
    setLoading(true);
    try {
      const res = await userService.getLeaderboard({ period });
      setMembers(res.data?.members || res.data || []);
    } catch {
      toast.error("Failed to load leaderboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLeaderboard(timePeriod); }, [timePeriod, fetchLeaderboard]);

  const totalMembers = members.length;
  const totalTasks = members.reduce((sum, m) => sum + (m.completedTasks || 0), 0);
  const avgScore = totalMembers > 0 ? Math.round(members.reduce((sum, m) => sum + (m.productivityScore || 0), 0) / totalMembers) : 0;
  const topThree = members.slice(0, 3);

  return (
    <div className="w-full h-full bg-transparent px-4 py-8 text-slate-800 dark:text-slate-200 transition-colors duration-300">
      {/* Page Header */}
      <div className="mb-8 animate-fade-in-down">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border border-amber-500/20 flex items-center justify-center shadow-md">
              <Icons.Trophy className="w-6 h-6 text-amber-500 dark:text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Leaderboard</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Track team performance and celebrate top contributors</p>
            </div>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-[#1e293b]/40 border border-slate-200 dark:border-white/[0.06]">
            {TIME_PERIODS.map((period) => {
              const isActive = timePeriod === period.key;
              return (
                <button 
                  key={period.key} 
                  onClick={() => setTimePeriod(period.key)} 
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive ? "bg-white dark:bg-[#1e293b] text-slate-800 dark:text-white border border-slate-200 dark:border-white/[0.08] shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"}`}
                >
                  {isActive && <Icons.Calendar className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />} {period.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Podium Block Cards */}
      <div className="mb-8 animate-fade-in-up">
        {!loading && topThree.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topThree.map((member, index) => {
              const config = PODIUM_CONFIG[index];
              const hue = nameToHue(member.name);
              const IconComp = config.iconComponent;

              return (
                <div 
                  key={member._id || index} 
                  className={`group relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br ${config.gradient} bg-transparent border ${config.border} shadow-sm transition-all duration-300 ${index === 0 ? "md:order-2" : index === 1 ? "md:order-1" : "md:order-3"}`}
                >
                  <div className="relative flex flex-col items-center text-center">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${config.badgeBg} ${config.badgeText} mb-3`}><IconComp className="w-3 h-3" />{config.label}</span>
                    
                    {member.avatar ? (
                      <img src={member.avatar} alt={member.name} className={`w-16 h-16 rounded-2xl object-cover mb-3 ring-3 ${config.ringColor}`} />
                    ) : (
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-3 ring-3 ${config.ringColor}`} style={{ background: `linear-gradient(135deg, hsl(${hue}, 60%, 45%), hsl(${hue + 30}, 50%, 35%))` }}>
                        <span className="text-lg font-bold text-white">{getInitials(member.name)}</span>
                      </div>
                    )}
                    
                    <h3 className="text-base font-bold text-slate-800 dark:text-white mb-0.5">{member.name}</h3>
                    <p className="text-[11px] text-slate-400 capitalize mb-4">{member.role === "ADMIN" || member.role === "TEAM LEADER" ? "Team Leader" : "Team Member"}</p>
                    
                    <div className="flex items-center gap-6 mt-2">
                      <div className="text-center"><p className={`text-lg font-bold ${config.textColor}`}>{member.completedTasks || 0}</p><p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">Tasks</p></div>
                      <div className="w-px h-8 bg-slate-200 dark:bg-white/[0.08]" />
                      <div className="text-center"><p className={`text-lg font-bold ${config.textColor}`}>{member.productivityScore || 0}%</p><p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">Score</p></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary Metrics Row */}
      <div className="mb-8 animate-fade-in-up">
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Team Members", value: totalMembers, icon: Icons.Users, c: "text-blue-600 dark:text-blue-400" }, 
              { label: "Avg Productivity", value: `${avgScore}%`, icon: Icons.Sparkles, c: "text-green-600 dark:text-green-400" }, 
              { label: "Tasks Completed", value: totalTasks, icon: Icons.TaskCheck, c: "text-purple-600 dark:text-purple-400" }
            ].map((box, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-transparent border border-slate-200 dark:border-white/[0.06] shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/[0.04] flex items-center justify-center">
                  <box.icon className={`w-5 h-5 ${box.c}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800 dark:text-white leading-none mb-1">{box.value}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">{box.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Leaderboard Table Container */}
      <div className="animate-fade-in-up">
        <LeaderboardTable members={members} loading={loading} />
      </div>
    </div>
  );
};

export default LeaderboardPage;