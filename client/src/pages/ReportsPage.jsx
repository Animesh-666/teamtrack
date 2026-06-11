import { useState, useEffect, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";

import reportService from "../services/reportService";
import projectService from "../services/projectService";
import userService from "../services/userService";

import ReportList from "../components/reports/ReportList";
import ReportForm from "../components/reports/ReportForm";

const Icons = {
  FileText: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  Plus: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Refresh: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  ),
  Clock: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
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
  BarChart: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  Folder: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
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
  ChevronDown: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  X: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
};

const getDateRange = (preset) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (preset) {
    case "today":
      return {
        startDate: today.toISOString().split("T")[0],
        endDate: today.toISOString().split("T")[0],
      };
    case "week": {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      return {
        startDate: weekStart.toISOString().split("T")[0],
        endDate: today.toISOString().split("T")[0],
      };
    }
    case "month": {
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      return {
        startDate: monthStart.toISOString().split("T")[0],
        endDate: today.toISOString().split("T")[0],
      };
    }
    default:
      return { startDate: "", endDate: "" };
  }
};

const DATE_PRESETS = [
  { key: "all", label: "All Time" },
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
  { key: "custom", label: "Custom" },
];

const StatCard = ({ icon: Icon, label, value, subValue, color, bg }) => (
  <div
    className={`
      flex items-center gap-3 px-4 py-3 rounded-xl
      ${bg} border border-white/[0.04]
      transition-all duration-200 hover:border-white/[0.08]
    `}
  >
    <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
      <Icon className={`w-5 h-5 ${color}`} />
    </div>
    <div className="min-w-0">
      <p className="text-xl font-bold text-white tabular-nums leading-none mb-0.5">{value}</p>
      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">{label}</p>
      {subValue && (
        <p className={`text-[10px] ${color} font-medium mt-0.5`}>{subValue}</p>
      )}
    </div>
  </div>
);

const PageSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04] animate-pulse"
        >
          <div className="w-10 h-10 rounded-xl bg-white/[0.06]" />
          <div className="space-y-1.5">
            <div className="w-12 h-5 rounded bg-white/[0.06]" />
            <div className="w-20 h-2.5 rounded bg-white/[0.04]" />
          </div>
        </div>
      ))}
    </div>

    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="p-5 rounded-2xl bg-[#1e293b]/40 border border-white/[0.04] animate-pulse"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-white/[0.06]" />
            <div className="space-y-1.5">
              <div className="w-32 h-3.5 rounded bg-white/[0.06]" />
              <div className="w-20 h-2.5 rounded bg-white/[0.04]" />
            </div>
          </div>
          <div className="flex gap-1 mb-3">
            {Array.from({ length: 12 }).map((_, j) => (
              <div key={j} className="h-1 flex-1 rounded-full bg-white/[0.04]" />
            ))}
          </div>
          <div className="space-y-2">
            <div className="w-full h-3 rounded bg-white/[0.04]" />
            <div className="w-3/4 h-3 rounded bg-white/[0.04]" />
            <div className="w-1/2 h-3 rounded bg-white/[0.04]" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ReportsPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [datePreset, setDatePreset] = useState("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [memberFilter, setMemberFilter] = useState("");

  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);

  const [showReportForm, setShowReportForm] = useState(false);
  const [editingReport, setEditingReport] = useState(null);

  const dateRange = useMemo(() => {
    if (datePreset === "custom") {
      return { startDate: customStartDate, endDate: customEndDate };
    }
    if (datePreset === "all") {
      return { startDate: "", endDate: "" };
    }
    return getDateRange(datePreset);
  }, [datePreset, customStartDate, customEndDate]);

  const fetchReports = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const params = {};
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;
      if (projectFilter) params.projectId = projectFilter;
      if (memberFilter) params.userId = memberFilter;

      const res = await reportService.getReports(params);
      setReports(res?.data || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dateRange, projectFilter, memberFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await projectService.getProjects();
        setProjects(res?.data || []);
      } catch (err) {
        console.error("Error fetching projects:", err);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    const fetchMembers = async () => {
      try {
        const res = await userService.getUsers();
        setMembers(res?.data || []);
      } catch (err) {
        console.error("Error fetching members:", err);
      }
    };
    fetchMembers();
  }, [isAdmin]);

  const stats = useMemo(() => {
    const totalReports = reports.length;
    const totalHours = reports.reduce((sum, r) => sum + (r.hoursWorked || 0), 0);
    const avgHours = totalReports > 0 ? (totalHours / totalReports).toFixed(1) : "0";
    return { totalReports, totalHours, avgHours };
  }, [reports]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (datePreset !== "all") count++;
    if (projectFilter) count++;
    if (memberFilter) count++;
    return count;
  }, [datePreset, projectFilter, memberFilter]);

  const handleRefresh = () => {
    fetchReports(true);
  };

  const handleSubmitReport = () => {
    setEditingReport(null);
    setShowReportForm(true);
  };

  const handleEditReport = (report) => {
    setEditingReport(report);
    setShowReportForm(true);
  };

  const handleFormSuccess = () => {
    fetchReports(true);
  };

  const handleResetFilters = () => {
    setDatePreset("all");
    setCustomStartDate("");
    setCustomEndDate("");
    setProjectFilter("");
    setMemberFilter("");
  };

  return (
    <div className="w-full h-full bg-transparent px-4 py-8 text-slate-800 dark:text-slate-200 transition-colors duration-300">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="animate-fade-in-down">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/25">
                  <Icons.FileText className="w-5 h-5 text-white" />
                </div>
                Daily Reports
              </h1>
              <p className="text-sm text-slate-400 mt-1 ml-[52px]">
                Track daily progress and hours logged
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="
                  w-10 h-10 rounded-xl flex items-center justify-center
                  bg-white/[0.04] border border-white/[0.08]
                  text-slate-400 hover:text-white hover:bg-white/[0.08]
                  disabled:opacity-50 transition-all duration-200
                "
                title="Refresh reports"
              >
                <Icons.Refresh className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              </button>

              <button
                onClick={handleSubmitReport}
                className="
                  flex items-center gap-2 px-4 h-10 rounded-xl
                  bg-gradient-to-r from-green-500 to-emerald-600
                  text-sm font-semibold text-white
                  shadow-lg shadow-green-500/25
                  hover:shadow-xl hover:shadow-green-500/30
                  hover:-translate-y-0.5 active:translate-y-0
                  transition-all duration-200
                "
              >
                <Icons.Plus className="w-4 h-4" />
                Submit Report
              </button>
            </div>
          </div>

          {!loading && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <StatCard
                icon={Icons.FileText}
                label="Total Reports"
                value={stats.totalReports}
                color="text-blue-400"
                bg="bg-blue-500/[0.06]"
              />
              <StatCard
                icon={Icons.Clock}
                label="Hours Logged"
                value={`${stats.totalHours}h`}
                color="text-green-400"
                bg="bg-green-500/[0.06]"
              />
              <StatCard
                icon={Icons.BarChart}
                label="Avg Hours"
                value={`${stats.avgHours}h`}
                subValue={
                  parseFloat(stats.avgHours) >= 8
                    ? "Great productivity!"
                    : parseFloat(stats.avgHours) >= 5
                    ? "Good pace"
                    : undefined
                }
                color="text-amber-400"
                bg="bg-amber-500/[0.06]"
              />
            </div>
          )}
        </div>

        <div className="animate-fade-in-up">
          <div
            className="
              p-4 rounded-2xl
              bg-[#1e293b]/40 backdrop-blur-xl
              border border-white/[0.06]
            "
          >
            <div className="mb-4">
              <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-2">
                Date Range
              </label>
              <div className="flex flex-wrap gap-2">
                {DATE_PRESETS.map((preset) => (
                  <button
                    key={preset.key}
                    onClick={() => setDatePreset(preset.key)}
                    className={`
                      flex items-center gap-1.5 px-3 h-8 rounded-lg
                      text-xs font-medium border transition-all duration-200
                      ${
                        datePreset === preset.key
                          ? "bg-green-500/10 text-green-400 border-green-500/20 shadow-sm"
                          : "bg-white/[0.02] text-slate-400 border-white/[0.06] hover:bg-white/[0.04] hover:text-white"
                      }
                    `}
                  >
                    {preset.key === "today" && <Icons.Calendar className="w-3 h-3" />}
                    {preset.label}
                  </button>
                ))}
              </div>

              {datePreset === "custom" && (
                <div className="flex flex-col sm:flex-row gap-3 mt-3 animate-fade-in">
                  <div className="flex-1">
                    <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="
                        w-full h-10 px-3 rounded-lg
                        bg-white/[0.04] border border-white/[0.08]
                        text-sm text-slate-200
                        focus:outline-none focus:border-green-500/40 focus:ring-1 focus:ring-green-500/20
                        transition-all duration-200
                        [color-scheme:dark]
                      "
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="
                        w-full h-10 px-3 rounded-lg
                        bg-white/[0.04] border border-white/[0.08]
                        text-sm text-slate-200
                        focus:outline-none focus:border-green-500/40 focus:ring-1 focus:ring-green-500/20
                        transition-all duration-200
                        [color-scheme:dark]
                      "
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1.5">
                  Project
                </label>
                <div className="relative">
                  <Icons.Folder className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <select
                    value={projectFilter}
                    onChange={(e) => setProjectFilter(e.target.value)}
                    className="
                      w-full h-10 pl-9 pr-8 rounded-lg appearance-none
                      bg-white/[0.04] border border-white/[0.08]
                      text-sm text-slate-200
                      focus:outline-none focus:border-green-500/40 focus:ring-1 focus:ring-green-500/20
                      transition-all duration-200
                    "
                  >
                    <option value="" className="bg-[#1e293b] text-slate-400">
                      All Projects
                    </option>
                    {projects.map((p) => (
                      <option key={p._id} value={p._id} className="bg-[#1e293b] text-slate-200">
                        {p.projectName}
                      </option>
                    ))}
                  </select>
                  <Icons.ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                </div>
              </div>

              {isAdmin && (
                <div>
                  <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1.5">
                    Member
                  </label>
                  <div className="relative">
                    <Icons.Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <select
                      value={memberFilter}
                      onChange={(e) => setMemberFilter(e.target.value)}
                      className="
                        w-full h-10 pl-9 pr-8 rounded-lg appearance-none
                        bg-white/[0.04] border border-white/[0.08]
                        text-sm text-slate-200
                        focus:outline-none focus:border-green-500/40 focus:ring-1 focus:ring-green-500/20
                        transition-all duration-200
                      "
                    >
                      <option value="" className="bg-[#1e293b] text-slate-400">
                        All Members
                      </option>
                      {members.map((m) => (
                        <option key={m._id} value={m._id} className="bg-[#1e293b] text-slate-200">
                          {m.name}
                        </option>
                      ))}
                    </select>
                    <Icons.ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                  </div>
                </div>
              )}
            </div>

            {activeFilterCount > 0 && (
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.06]">
                <div className="flex items-center gap-2 flex-wrap">
                  {datePreset !== "all" && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 h-7 rounded-lg bg-white/[0.06] border border-white/[0.08] text-xs text-slate-300">
                      <span className="text-slate-500">Date:</span>
                      <span className="text-green-400">
                        {DATE_PRESETS.find((p) => p.key === datePreset)?.label}
                      </span>
                      <button
                        onClick={() => {
                          setDatePreset("all");
                          setCustomStartDate("");
                          setCustomEndDate("");
                        }}
                        className="ml-0.5 text-slate-500 hover:text-white transition-colors"
                      >
                        <Icons.X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {projectFilter && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 h-7 rounded-lg bg-white/[0.06] border border-white/[0.08] text-xs text-slate-300">
                      <span className="text-slate-500">Project:</span>
                      <span className="text-green-400 truncate max-w-[120px]">
                        {projects.find((p) => p._id === projectFilter)?.projectName || "Selected"}
                      </span>
                      <button
                        onClick={() => setProjectFilter("")}
                        className="ml-0.5 text-slate-500 hover:text-white transition-colors"
                      >
                        <Icons.X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {memberFilter && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 h-7 rounded-lg bg-white/[0.06] border border-white/[0.08] text-xs text-slate-300">
                      <span className="text-slate-500">Member:</span>
                      <span className="text-green-400 truncate max-w-[120px]">
                        {members.find((m) => m._id === memberFilter)?.name || "Selected"}
                      </span>
                      <button
                        onClick={() => setMemberFilter("")}
                        className="ml-0.5 text-slate-500 hover:text-white transition-colors"
                      >
                        <Icons.X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>

                <button
                  onClick={handleResetFilters}
                  className="
                    text-xs font-medium text-slate-500 hover:text-red-400
                    transition-colors duration-150 underline underline-offset-2 flex-shrink-0
                  "
                >
                  Reset all
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          {loading && !refreshing && <PageSkeleton />}

          {refreshing && (
            <div className="flex items-center justify-center gap-2 py-3 mb-4 text-xs text-slate-500">
              <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-600 border-t-green-400 animate-spin" />
              Refreshing reports...
            </div>
          )}

          {!loading && (
            <ReportList
              reports={reports}
              onEdit={handleEditReport}
              loading={false}
            />
          )}
        </div>

        <ReportForm
          isOpen={showReportForm}
          onClose={() => {
            setShowReportForm(false);
            setEditingReport(null);
          }}
          report={editingReport}
          onSuccess={handleFormSuccess}
        />
      </div>
    </div>
  );
};

export default ReportsPage;