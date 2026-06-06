/**
 * MemberDashboard.jsx
 * ─────────────────────────────────────────────────────────────
 * Member (Team Member) dashboard view for TeamTrack.
 *
 * Displays:
 *  - Personal stat cards (assigned, completed, in-progress, score)
 *  - Today's progress ring
 *  - Assigned tasks kanban-style cards
 *  - Daily report quick-submit
 *  - Upcoming deadlines list
 *  - Personal task distribution chart
 *  - Weekly performance chart
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import StatCard from "../common/StatCard";
import ProgressBar from "../common/ProgressBar";
import Loader from "../common/Loader";
import EmptyState from "../common/EmptyState";
import TaskDistributionChart from "../../charts/TaskDistributionChart";
import WeeklyPerformanceChart from "../../charts/WeeklyPerformanceChart";
import taskService from "../../services/taskService";
import reportService from "../../services/reportService";
import toast from "react-hot-toast";

/* ── Inline Icons ─────────────────────────────────────────── */

const Icons = {
  Tasks: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
  Completed: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  InProgress: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="12" y1="2" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
      <line x1="2" y1="12" x2="6" y2="12" />
      <line x1="18" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
    </svg>
  ),
  Score: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
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
  ArrowRight: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  ),
  Send: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  ),
  Clock: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
};

/* ── Circular Progress Ring ───────────────────────────────── */

const ProgressRing = ({ value = 0, size = 120, strokeWidth = 8 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  const getColor = (v) => {
    if (v >= 80) return { stroke: "#22c55e", glow: "rgba(34, 197, 94, 0.3)" };
    if (v >= 50) return { stroke: "#eab308", glow: "rgba(234, 179, 8, 0.3)" };
    if (v >= 25) return { stroke: "#f97316", glow: "rgba(249, 115, 22, 0.3)" };
    return { stroke: "#ef4444", glow: "rgba(239, 68, 68, 0.3)" };
  };

  const color = getColor(value);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color.stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 1s ease-out",
            filter: `drop-shadow(0 0 6px ${color.glow})`,
          }}
        />
      </svg>

      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-white tabular-nums">{Math.round(value)}%</span>
        <span className="text-[10px] text-slate-500 uppercase tracking-wider">Today</span>
      </div>
    </div>
  );
};

/* ── Helper: format deadline ──────────────────────────────── */
const formatDeadline = (date) => {
  const d = new Date(date);
  const now = new Date();
  const diffDays = Math.ceil((d - now) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return { text: "Due Today", urgent: true };
  if (diffDays === 1) return { text: "Tomorrow", urgent: true };
  if (diffDays < 0) return { text: `${Math.abs(diffDays)}d overdue`, urgent: true };
  if (diffDays <= 3) return { text: `${diffDays} days left`, urgent: true };
  return {
    text: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    urgent: false,
  };
};

/* ── Status badge helper ──────────────────────────────────── */
const statusConfig = {
  "Pending":     { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20", dot: "bg-amber-400" },
  "In Progress": { bg: "bg-blue-500/10",  text: "text-blue-400",  border: "border-blue-500/20",  dot: "bg-blue-400" },
  "Completed":   { bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/20", dot: "bg-green-400" },
};

const priorityConfig = {
  High:   "bg-red-500/10 text-red-400 border-red-500/20",
  Medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Low:    "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

/* ── Component ────────────────────────────────────────────── */

const MemberDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({
    assigned: 0,
    completed: 0,
    inProgress: 0,
    pending: 0,
    score: 0,
  });
  const [todayProgress, setTodayProgress] = useState(0);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [taskDistribution, setTaskDistribution] = useState({ pending: 0, inProgress: 0, completed: 0 });
  const [weeklyPerformance, setWeeklyPerformance] = useState([]);

  // Quick report state
  const [reportText, setReportText] = useState("");
  const [hoursWorked, setHoursWorked] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);
  const [todayReportSubmitted, setTodayReportSubmitted] = useState(false);

  /** Fetch member-specific data */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [tasksRes, reportsRes] = await Promise.allSettled([
          taskService.getMyTasks(),
          reportService.getMyReports(),
        ]);

        const myTasks = tasksRes.status === "fulfilled" ? tasksRes.value?.data || [] : [];
        const myReports = reportsRes.status === "fulfilled" ? reportsRes.value?.data || [] : [];

        setTasks(myTasks);
        setReports(myReports);

        // ── Stats ──
        const completed = myTasks.filter((t) => t.status === "Completed");
        const inProgress = myTasks.filter((t) => t.status === "In Progress");
        const pending = myTasks.filter((t) => t.status === "Pending");
        const score = myTasks.length > 0 ? Math.round((completed.length / myTasks.length) * 100) : 0;

        setStats({
          assigned: myTasks.length,
          completed: completed.length,
          inProgress: inProgress.length,
          pending: pending.length,
          score,
        });

        // ── Task distribution ──
        setTaskDistribution({
          pending: pending.length,
          inProgress: inProgress.length,
          completed: completed.length,
        });

        // ── Today's progress ──
        const today = new Date().toDateString();
        const todayTasks = myTasks.filter((t) => {
          const updated = new Date(t.updatedAt || t.createdAt).toDateString();
          return updated === today;
        });
        const todayCompleted = todayTasks.filter((t) => t.status === "Completed").length;
        const todayTotal = todayTasks.length || 1;
        setTodayProgress(Math.round((todayCompleted / todayTotal) * 100));

        // ── Weekly performance ──
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        const now = new Date();
        const weeklyData = days.map((day, i) => {
          const date = new Date(now);
          date.setDate(now.getDate() - (6 - i));
          const dayCompleted = myTasks.filter((t) => {
            const tDate = new Date(t.updatedAt || t.createdAt);
            return tDate.toDateString() === date.toDateString() && t.status === "Completed";
          });
          return { day, completed: dayCompleted.length };
        });
        setWeeklyPerformance(weeklyData);

        // ── Upcoming deadlines ──
        const nowDate = new Date();
        const upcoming = myTasks
          .filter((t) => t.deadline && new Date(t.deadline) > nowDate && t.status !== "Completed")
          .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
          .slice(0, 5);
        setUpcomingDeadlines(upcoming);

        // ── Check if today's report already submitted ──
        const todayReport = myReports.find(
          (r) => new Date(r.date || r.createdAt).toDateString() === today
        );
        setTodayReportSubmitted(!!todayReport);
      } catch (error) {
        console.error("Error fetching member dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /** Submit quick daily report */
  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportText.trim()) {
      toast.error("Please write your report");
      return;
    }

    try {
      setSubmittingReport(true);
      await reportService.submitReport({
        reportText: reportText.trim(),
        hoursWorked: parseFloat(hoursWorked) || 0,
        date: new Date().toISOString(),
      });

      toast.success("Daily report submitted! 🎉");
      setReportText("");
      setHoursWorked("");
      setTodayReportSubmitted(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit report");
    } finally {
      setSubmittingReport(false);
    }
  };

  /* ── Loading state ──────────────────────────────────────── */
  if (loading) {
    return <Loader inline message="Loading your dashboard..." />;
  }

  /* ── Render ─────────────────────────────────────────────── */
  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Greeting header ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Hey, <span className="text-green-400">{user?.name?.split(" ")[0]}</span> 🚀
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Track your progress and stay productive today.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Icons.Calendar className="w-4 h-4" />
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {/* ── Top row: Stats + Today's Progress Ring ───────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Stat cards */}
        <StatCard
          icon={Icons.Tasks}
          label="Assigned Tasks"
          value={stats.assigned}
          color="blue"
          onClick={() => navigate("/tasks")}
        />
        <StatCard
          icon={Icons.Completed}
          label="Completed"
          value={stats.completed}
          color="green"
        />
        <StatCard
          icon={Icons.InProgress}
          label="In Progress"
          value={stats.inProgress}
          color="amber"
        />
        <StatCard
          icon={Icons.Score}
          label="My Score"
          value={stats.score}
          suffix="%"
          color={stats.score >= 70 ? "green" : stats.score >= 40 ? "amber" : "red"}
        />
      </div>

      {/* ── Middle row: Progress Ring + Active Tasks + Quick Report ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Today's Progress + Charts ──────────────────────── */}
        <div className="space-y-6">
          {/* Progress ring card */}
          <div className="
            p-6 rounded-2xl
            bg-[#1e293b]/60 backdrop-blur-xl
            border border-white/[0.06]
            shadow-lg
            flex flex-col items-center
          ">
            <h3 className="text-sm font-semibold text-white mb-4">Today's Progress</h3>
            <ProgressRing value={todayProgress} size={140} strokeWidth={10} />
            <div className="mt-4 grid grid-cols-3 gap-4 w-full text-center">
              <div>
                <p className="text-lg font-bold text-white">{stats.pending}</p>
                <p className="text-[10px] text-slate-500 uppercase">Pending</p>
              </div>
              <div>
                <p className="text-lg font-bold text-blue-400">{stats.inProgress}</p>
                <p className="text-[10px] text-slate-500 uppercase">Active</p>
              </div>
              <div>
                <p className="text-lg font-bold text-green-400">{stats.completed}</p>
                <p className="text-[10px] text-slate-500 uppercase">Done</p>
              </div>
            </div>
          </div>

          {/* Task Distribution mini chart */}
          <div className="
            p-5 rounded-2xl
            bg-[#1e293b]/60 backdrop-blur-xl
            border border-white/[0.06]
            shadow-lg
          ">
            <h3 className="text-sm font-semibold text-white mb-3">My Task Distribution</h3>
            <TaskDistributionChart data={taskDistribution} />
          </div>
        </div>

        {/* ── Active / Recent Tasks ──────────────────────────── */}
        <div className="
          p-5 rounded-2xl
          bg-[#1e293b]/60 backdrop-blur-xl
          border border-white/[0.06]
          shadow-lg
        ">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">My Tasks</h3>
            <button
              onClick={() => navigate("/tasks")}
              className="text-[10px] font-medium text-green-400 hover:text-green-300 uppercase tracking-wider transition-colors flex items-center gap-1"
            >
              View All <Icons.ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5 max-h-[500px] overflow-y-auto scrollbar-thin pr-1">
            {tasks.length === 0 ? (
              <EmptyState variant="tasks" />
            ) : (
              tasks
                .filter((t) => t.status !== "Completed")
                .slice(0, 8)
                .map((task) => {
                  const sc = statusConfig[task.status] || statusConfig.Pending;
                  const dl = task.deadline ? formatDeadline(task.deadline) : null;

                  return (
                    <div
                      key={task._id}
                      className="
                        p-3.5 rounded-xl
                        bg-white/[0.02] border border-white/[0.04]
                        hover:bg-white/[0.05] hover:border-white/[0.08]
                        transition-all duration-200 cursor-pointer
                        group
                      "
                      onClick={() => navigate(`/tasks?id=${task._id}`)}
                    >
                      {/* Header: title + priority */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${sc.dot}`} />
                          <p className="text-sm font-medium text-white truncate group-hover:text-green-400 transition-colors">
                            {task.title}
                          </p>
                        </div>
                        <span className={`
                          flex-shrink-0 px-2 py-0.5 rounded-md text-[10px] font-semibold
                          border ${priorityConfig[task.priority] || priorityConfig.Low}
                        `}>
                          {task.priority}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <ProgressBar value={task.progress || 0} size="xs" showLabel={false} className="mb-2" />

                      {/* Footer: status + deadline */}
                      <div className="flex items-center justify-between">
                        <span className={`
                          inline-flex items-center gap-1 px-2 py-0.5 rounded-md
                          text-[10px] font-medium border
                          ${sc.bg} ${sc.text} ${sc.border}
                        `}>
                          <span className={`w-1 h-1 rounded-full ${sc.dot}`} />
                          {task.status}
                        </span>

                        {dl && (
                          <span className={`
                            text-[10px] font-medium flex items-center gap-1
                            ${dl.urgent ? "text-red-400" : "text-slate-500"}
                          `}>
                            <Icons.Clock className="w-3 h-3" />
                            {dl.text}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>

        {/* ── Right Column: Quick Report + Deadlines + Weekly ── */}
        <div className="space-y-6">

          {/* ── Quick Daily Report ────────────────────────────── */}
          <div className="
            p-5 rounded-2xl
            bg-[#1e293b]/60 backdrop-blur-xl
            border border-white/[0.06]
            shadow-lg
          ">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Daily Report</h3>
              {todayReportSubmitted && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-green-500/10 text-green-400 text-[10px] font-medium border border-green-500/20">
                  ✓ Submitted
                </span>
              )}
            </div>

            {todayReportSubmitted ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Icons.Completed className="w-6 h-6 text-green-400" />
                </div>
                <p className="text-sm text-slate-400">Today's report has been submitted.</p>
                <button
                  onClick={() => navigate("/reports")}
                  className="mt-3 text-xs text-green-400 hover:text-green-300 transition-colors underline underline-offset-2"
                >
                  View all reports
                </button>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-3">
                <textarea
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  placeholder="What did you work on today?"
                  rows={3}
                  className="
                    w-full px-3 py-2.5 rounded-xl resize-none
                    bg-white/[0.04] border border-white/[0.08]
                    text-sm text-slate-200 placeholder-slate-500
                    focus:outline-none focus:border-green-500/40 focus:ring-1 focus:ring-green-500/20
                    transition-all duration-200 scrollbar-thin
                  "
                />

                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Icons.Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="number"
                      value={hoursWorked}
                      onChange={(e) => setHoursWorked(e.target.value)}
                      placeholder="Hours"
                      min="0"
                      max="24"
                      step="0.5"
                      className="
                        w-full h-10 pl-9 pr-3 rounded-xl
                        bg-white/[0.04] border border-white/[0.08]
                        text-sm text-slate-200 placeholder-slate-500
                        focus:outline-none focus:border-green-500/40 focus:ring-1 focus:ring-green-500/20
                        transition-all duration-200
                        [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                      "
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReport || !reportText.trim()}
                    className="
                      h-10 px-4 rounded-xl
                      bg-gradient-to-r from-green-500 to-emerald-600
                      text-sm font-semibold text-white
                      shadow-lg shadow-green-500/25
                      hover:shadow-xl hover:shadow-green-500/30
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transition-all duration-200
                      flex items-center gap-2
                    "
                  >
                    {submittingReport ? (
                      <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    ) : (
                      <Icons.Send className="w-4 h-4" />
                    )}
                    Submit
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* ── Upcoming Deadlines ────────────────────────────── */}
          <div className="
            p-5 rounded-2xl
            bg-[#1e293b]/60 backdrop-blur-xl
            border border-white/[0.06]
            shadow-lg
          ">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Icons.Calendar className="w-4 h-4 text-red-400" />
                <h3 className="text-sm font-semibold text-white">Upcoming Deadlines</h3>
              </div>
            </div>

            <div className="space-y-2.5">
              {upcomingDeadlines.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">No upcoming deadlines 🎉</p>
              ) : (
                upcomingDeadlines.map((task) => {
                  const dl = formatDeadline(task.deadline);
                  return (
                    <div
                      key={task._id}
                      className="
                        flex items-center gap-3 p-2.5 rounded-xl
                        bg-white/[0.02] border border-white/[0.04]
                        hover:bg-white/[0.04] transition-colors cursor-pointer
                      "
                      onClick={() => navigate(`/tasks?id=${task._id}`)}
                    >
                      {/* Urgency dot */}
                      <div className={`
                        w-2 h-2 rounded-full flex-shrink-0
                        ${dl.urgent ? "bg-red-400 shadow-[0_0_6px_rgba(239,68,68,0.5)]" : "bg-slate-500"}
                      `} />

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white truncate">{task.title}</p>
                      </div>

                      <span className={`
                        text-[10px] font-semibold flex-shrink-0
                        ${dl.urgent ? "text-red-400" : "text-slate-500"}
                      `}>
                        {dl.text}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ── Weekly Performance ────────────────────────────── */}
          <div className="
            p-5 rounded-2xl
            bg-[#1e293b]/60 backdrop-blur-xl
            border border-white/[0.06]
            shadow-lg
          ">
            <h3 className="text-sm font-semibold text-white mb-3">My Weekly Performance</h3>
            <WeeklyPerformanceChart data={weeklyPerformance} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;
