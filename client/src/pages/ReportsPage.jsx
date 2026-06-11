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

const STAT_COLORS = {
  blue: { bg: "bg-blue-500/10", border: "border-blue-200 dark:border-white/5", text: "text-blue-600 dark:text-blue-400" },
  green: { bg: "bg-green-500/10", border: "border-green-200 dark:border-white/5", text: "text-green-600 dark:text-green-400" },
  amber: { bg: "bg-amber-500/10", border: "border-amber-200 dark:border-white/5", text: "text-amber-600 dark:text-amber-400" }
};

const StatCard = ({ icon: Icon, label, value, subValue, colorCode }) => {
  const c = STAT_COLORS[colorCode] || STAT_COLORS.blue;
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-transparent border border-slate-200 dark:border-white/[0.04] transition-all duration-200`}>
      <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${c.text}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xl font-bold text-slate-800 dark:text-white tabular-nums leading-none mb-0.5">{value}</p>
        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">{label}</p>
        {subValue && <p className={`text-[10px] ${c.text} font-medium mt-0.5`}>{subValue}</p>}
      </div>
    </div>
  );
};

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
    if (datePreset === "custom") return { startDate: customStartDate, endDate: customEndDate };
    if (datePreset === "all") return { startDate: "", endDate: "" };
    const presetMap = {
      today: () => {
        const d = new Date(); d.setHours(0,0,0,0);
        return { startDate: d.toISOString().split("T")[0], endDate: d.toISOString().split("T")[0] };
      },
      week: () => {
        const d = new Date(); d.setDate(d.getDate() - d.getDay());
        return { startDate: d.toISOString().split("T")[0], endDate: new Date().toISOString().split("T")[0] };
      },
      month: () => {
        const d = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        return { startDate: d.toISOString().split("T")[0], endDate: new Date().toISOString().split("T")[0] };
      }
    };
    return presetMap[datePreset] ? presetMap[datePreset]() : { startDate: "", endDate: "" };
  }, [datePreset, customStartDate, customEndDate]);

  const fetchReports = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true); else setLoading(true);
      const params = {};
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;
      if (projectFilter) params.projectId = projectFilter;
      if (memberFilter) params.userId = memberFilter;

      const res = await reportService.getReports(params);
      setReports(res?.data || []);
    } catch {
      toast.error("Failed to load reports");
    } finally {
      setLoading(false); setRefreshing(false);
    }
  }, [dateRange, projectFilter, memberFilter]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  useEffect(() => {
    const loaderData = async () => {
      try {
        const pRes = await projectService.getProjects(); setProjects(pRes?.data || []);
        if (isAdmin) { const mRes = await userService.getUsers(); setMembers(mRes?.data || []); }
      } catch (err) { console.error(err); }
    };
    loaderData();
  }, [isAdmin]);

  const stats = useMemo(() => {
    const totalReports = reports.length;
    const totalHours = reports.reduce((sum, r) => sum + (r.hoursWorked || 0), 0);
    const avgHours = totalReports > 0 ? (totalHours / totalReports).toFixed(1) : "0";
    return { totalReports, totalHours, avgHours };
  }, [reports]);

  return (
    <div className="w-full h-full bg-transparent px-4 py-8 text-slate-800 dark:text-slate-200 transition-colors duration-300">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="animate-fade-in-down">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                  <Icons.FileText className="w-5 h-5 text-white" />
                </div>
                Daily Reports
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 ml-[52px]">Track daily progress and hours logged</p>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => fetchReports(true)} disabled={refreshing} className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all duration-200">
                <Icons.Refresh className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              </button>
              <button onClick={() => { setEditingReport(null); setShowReportForm(true); }} className="flex items-center gap-2 px-4 h-10 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-sm font-semibold text-white shadow-lg shadow-green-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200">
                <Icons.Plus className="w-4 h-4" /> Submit Report
              </button>
            </div>
          </div>

          {!loading && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <StatCard icon={Icons.FileText} label="Total Reports" value={stats.totalReports} colorCode="blue" />
              <StatCard icon={Icons.Clock} label="Hours Logged" value={`${stats.totalHours}h`} colorCode="green" />
              <StatCard icon={Icons.BarChart} label="Avg Hours" value={`${stats.avgHours}h`} subValue={parseFloat(stats.avgHours) >= 8 ? "Great productivity!" : undefined} colorCode="amber" />
            </div>
          )}
        </div>

        <div className="animate-fade-in-up">
          <div className="p-4 rounded-2xl bg-transparent border border-slate-200 dark:border-white/[0.06] transition-colors duration-300">
            <div className="mb-4">
              <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-2">Date Range</label>
              <div className="flex flex-wrap gap-2">
                {DATE_PRESETS.map((preset) => (
                  <button key={preset.key} onClick={() => setDatePreset(preset.key)} className={`flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-medium border transition-all duration-200 ${datePreset === preset.key ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20" : "bg-slate-50 dark:bg-white/[0.02] text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/[0.06] hover:text-slate-800 dark:hover:text-white"}`}>
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1.5">Project</label>
                <div className="relative">
                  <Icons.Folder className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)} className="w-full h-10 pl-9 pr-8 rounded-lg appearance-none bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-green-500">
                    <option value="" className="text-slate-500 dark:bg-[#1e293b]">All Projects</option>
                    {projects.map((p) => <option key={p._id} value={p._id} className="dark:bg-[#1e293b]">{p.projectName || p.name}</option>)}
                  </select>
                  <Icons.ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {isAdmin && (
                <div>
                  <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1.5">Member</label>
                  <div className="relative">
                    <Icons.Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                    <select value={memberFilter} onChange={(e) => setMemberFilter(e.target.value)} className="w-full h-10 pl-9 pr-8 rounded-lg appearance-none bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-green-500">
                      <option value="" className="text-slate-500 dark:bg-[#1e293b]">All Members</option>
                      {members.map((m) => <option key={m._id} value={m._id} className="dark:bg-[#1e293b]">{m.name}</option>)}
                    </select>
                    <Icons.ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="animate-fade-in-up">
          <ReportList reports={reports} onEdit={handleEditReport} loading={loading} />
        </div>

        <ReportForm isOpen={showReportForm} onClose={() => { setShowReportForm(false); setEditingReport(null); }} report={editingReport} onSuccess={() => fetchReports(true)} />
      </div>
    </div>
  );
};

export default ReportsPage;