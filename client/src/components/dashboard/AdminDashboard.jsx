/**
 * AdminDashboard.jsx
 * ─────────────────────────────────────────────────────────────
 * Admin (Team Leader) dashboard view for TeamTrack.
 *
 * Displays:
 * - Overview stat cards (projects, members, tasks, completion)
 * - Task distribution pie chart
 * - Member productivity bar chart
 * - Weekly performance line chart
 * - Recent activities feed
 * - Top performers mini-leaderboard
 * - Upcoming deadlines panel
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import StatCard from "../common/StatCard";
import ProgressBar from "../common/ProgressBar";
import Loader from "../common/Loader";
import TaskDistributionChart from "../../charts/TaskDistributionChart";
import MemberProductivityChart from "../../charts/MemberProductivityChart";
import WeeklyPerformanceChart from "../../charts/WeeklyPerformanceChart";
import projectService from "../../services/projectService";
import taskService from "../../services/taskService";
import reportService from "../../services/reportService";
import userService from "../../services/userService";

/* ── Inline Icons ─────────────────────────────────────────── */

const Icons = {
  Projects: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  ),
  Members: (props) => (
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
  Completed: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  Pending: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
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
  Trophy: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  ),
};

/* ── Activity type configs ────────────────────────────────── */
const ACTIVITY_ICONS = {
  task_created:      { color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",     label: "Task Created" },
  task_completed:    { color: "bg-green-500/10 text-green-600 dark:text-green-400",   label: "Task Completed" },
  task_updated:      { color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",   label: "Task Updated" },
  member_added:      { color: "bg-purple-500/10 text-purple-600 dark:text-purple-400", label: "Member Added" },
  report_submitted:  { color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",     label: "Report Submitted" },
  project_created:   { color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", label: "Project Created" },
};

/* ── Helper: format relative time ─────────────────────────── */
const timeAgo = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return past.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

/* ── Component ────────────────────────────────────────────── */

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalMembers: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    productivityScore: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [taskDistribution, setTaskDistribution] = useState({ pending: 0, inProgress: 0, completed: 0 });
  const [memberProductivity, setMemberProductivity] = useState([]);
  const [weeklyPerformance, setWeeklyPerformance] = useState([]);

  /** Fetch all dashboard data */
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch all data in parallel
        const [projectsRes, tasksRes, usersRes, reportsRes] = await Promise.allSettled([
          projectService.getProjects(),
          taskService.getTasks(),
          userService.getUsers(),
          reportService.getReports(),
        ]);

        const projects = projectsRes.status === "fulfilled" ? projectsRes.value?.data || [] : [];
        const tasks = tasksRes.status === "fulfilled" ? tasksRes.value?.data || [] : [];
        const users = usersRes.status === "fulfilled" ? usersRes.value?.data || [] : [];
        const reports = reportsRes.status === "fulfilled" ? reportsRes.value?.data || [] : [];

        // ── Calculate stats ──
        const completed = tasks.filter((t) => t.status === "Completed");
        const pending = tasks.filter((t) => t.status === "Pending");
        const inProgress = tasks.filter((t) => t.status === "In Progress");
        const score = tasks.length > 0 ? Math.round((completed.length / tasks.length) * 100) : 0;

        setStats({
          totalProjects: projects.length,
          totalMembers: users.filter((u) => u.role === "MEMBER").length,
          totalTasks: tasks.length,
          completedTasks: completed.length,
          pendingTasks: pending.length,
          inProgressTasks: inProgress.length,
          productivityScore: score,
        });

        // ── Task distribution for pie chart ──
        setTaskDistribution({
          pending: pending.length,
          inProgress: inProgress.length,
          completed: completed.length,
        });

        // ── Member productivity for bar chart ──
        const memberMap = {};
        users.filter((u) => u.role === "MEMBER").forEach((u) => {
          memberMap[u._id] = { name: u.name, assigned: 0, completed: 0, score: 0 };
        });
        tasks.forEach((t) => {
          const uid = t.assignedTo?._id || t.assignedTo;
          if (memberMap[uid]) {
            memberMap[uid].assigned++;
            if (t.status === "Completed") memberMap[uid].completed++;
          }
        });
        const productivity = Object.values(memberMap).map((m) => ({
          ...m,
          score: m.assigned > 0 ? Math.round((m.completed / m.assigned) * 100) : 0,
        }));
        setMemberProductivity(productivity);

        // ── Top performers ──
        const sorted = [...productivity].sort((a, b) => b.score - a.score).slice(0, 5);
        setTopPerformers(sorted);

        // ── Weekly performance (last 7 days mock) ──
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        const today = new Date();
        const weeklyData = days.map((day, i) => {
          const date = new Date(today);
          date.setDate(today.getDate() - (6 - i));
          const dayTasks = tasks.filter((t) => {
            const tDate = new Date(t.updatedAt || t.createdAt);
            return tDate.toDateString() === date.toDateString() && t.status === "Completed";
          });
          return { day, completed: dayTasks.length };
        });
        setWeeklyPerformance(weeklyData);

        // ── Upcoming deadlines ──
        const now = new Date();
        const upcoming = tasks
          .filter((t) => t.deadline && new Date(t.deadline) > now && t.status !== "Completed")
          .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
          .slice(0, 5)
          .map((t) => ({
            _id: t._id,
            title: t.title,
            deadline: t.deadline,
            priority: t.priority,
            assignee: t.assignedTo?.name || "Unassigned",
            daysLeft: Math.ceil((new Date(t.deadline) - now) / (1000 * 60 * 60 * 24)),
          }));
        setUpcomingDeadlines(upcoming);

        // ── Recent activities (combine and sort) ──
        const activities = [];

        tasks.slice(-10).forEach((t) => {
          activities.push({
            _id: t._id + "_created",
            type: "task_created",
            message: `Task "${t.title}" was created`,
            user: t.assignedBy?.name || "Admin",
            time: t.createdAt,
          });
          if (t.status === "Completed") {
            activities.push({
              _id: t._id + "_completed",
              type: "task_completed",
              message: `Task "${t.title}" was completed`,
              user: t.assignedTo?.name || "Member",
              time: t.updatedAt,
            });
          }
        });

        reports.slice(-5).forEach((r) => {
          activities.push({
            _id: r._id + "_report",
            type: "report_submitted",
            message: `Daily report submitted`,
            user: r.userId?.name || "Member",
            time: r.createdAt,
          });
        });

        activities.sort((a, b) => new Date(b.time) - new Date(a.time));
        setRecentActivities(activities.slice(0, 8));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  /* ── Loading state ──────────────────────────────────────── */
  if (loading) {
    return <Loader inline message="Loading dashboard..." />;
  }

  /* ── Priority badge helper ──────────────────────────────── */
  const priorityBadge = (priority) => {
    const map = {
      High:   "bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20",
      Medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20",
      Low:    "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20",
    };
    return map[priority] || map.Low;
  };

  /* ── Render ─────────────────────────────────────────────── */
  return (
    <div className="space-y-6 animate-fade-in text-slate-800 dark:text-slate-200">
      {/* ── Greeting header ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Welcome back, <span className="text-green-600 dark:text-green-400">{user?.name?.split(" ")[0]}</span> 👋
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Here's what's happening with your team today.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Icons.Calendar className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {/* ── Stat cards grid ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          icon={Icons.Projects}
          label="Total Projects"
          value={stats.totalProjects}
          color="blue"
          onClick={() => navigate("/projects")}
        />
        <StatCard
          icon={Icons.Members}
          label="Team Members"
          value={stats.totalMembers}
          color="purple"
        />
        <StatCard
          icon={Icons.Tasks}
          label="Total Tasks"
          value={stats.totalTasks}
          color="cyan"
          onClick={() => navigate("/tasks")}
        />
        <StatCard
          icon={Icons.Completed}
          label="Completed"
          value={stats.completedTasks}
          color="green"
          trend={{ value: `${stats.productivityScore}%`, direction: "up" }}
        />
        <StatCard
          icon={Icons.Pending}
          label="Pending"
          value={stats.pendingTasks}
          color="amber"
        />
        <StatCard
          icon={Icons.Score}
          label="Productivity"
          value={stats.productivityScore}
          suffix="%"
          color="green"
        />
      </div>

      {/* ── Charts row ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Distribution Pie */}
        <div className="p-5 rounded-2xl bg-transparent border border-slate-200 dark:border-white/[0.06] shadow-sm dark:shadow-none transition-colors duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-white">Task Distribution</h3>
            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Overview</span>
          </div>
          <TaskDistributionChart data={taskDistribution} />
        </div>

        {/* Member Productivity Bar */}
        <div className="p-5 rounded-2xl bg-transparent border border-slate-200 dark:border-white/[0.06] shadow-sm dark:shadow-none transition-colors duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-white">Member Productivity</h3>
            <button
              onClick={() => navigate("/leaderboard")}
              className="text-[10px] font-medium text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300 uppercase tracking-wider transition-colors"
            >
              View All
            </button>
          </div>
          <MemberProductivityChart data={memberProductivity} />
        </div>

        {/* Weekly Performance Line */}
        <div className="p-5 rounded-2xl bg-transparent border border-slate-200 dark:border-white/[0.06] shadow-sm dark:shadow-none transition-colors duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-white">Weekly Performance</h3>
            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Last 7 Days</span>
          </div>
          <WeeklyPerformanceChart data={weeklyPerformance} />
        </div>
      </div>

      {/* ── Bottom row: Activities + Leaderboard + Deadlines ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Recent Activities ──────────────────────────────── */}
        <div className="lg:col-span-1 p-5 rounded-2xl bg-transparent border border-slate-200 dark:border-white/[0.06] shadow-sm dark:shadow-none transition-colors duration-300">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-white">Recent Activities</h3>
            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Live</span>
          </div>

          <div className="space-y-1 max-h-80 overflow-y-auto scrollbar-thin pr-1">
            {recentActivities.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">No recent activities</p>
            ) : (
              recentActivities.map((activity, idx) => {
                const config = ACTIVITY_ICONS[activity.type] || ACTIVITY_ICONS.task_created;
                return (
                  <div
                    key={activity._id || idx}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.02] transition-colors duration-150"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    {/* Icon dot */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${config.color}`}>
                      <div className="w-2 h-2 rounded-full bg-current" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-2">
                        {activity.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">{activity.user}</span>
                        <span className="text-[10px] text-slate-300 dark:text-slate-600">•</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">{timeAgo(activity.time)}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Top Performers ─────────────────────────────────── */}
        <div className="p-5 rounded-2xl bg-transparent border border-slate-200 dark:border-white/[0.06] shadow-sm dark:shadow-none transition-colors duration-300">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Icons.Trophy className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <h3 className="text-sm font-semibold text-slate-800 dark:text-white">Top Performers</h3>
            </div>
            <button
              onClick={() => navigate("/leaderboard")}
              className="text-[10px] font-medium text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300 uppercase tracking-wider transition-colors flex items-center gap-1"
            >
              Leaderboard <Icons.ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {topPerformers.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">No data yet</p>
            ) : (
              topPerformers.map((performer, idx) => {
                const medals = ["🥇", "🥈", "🥉"];
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/60 hover:bg-slate-100 dark:bg-white/[0.02] dark:border-white/[0.04] dark:hover:bg-white/[0.04] transition-colors duration-150"
                  >
                    {/* Rank */}
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-200/50 dark:bg-white/[0.04] flex items-center justify-center">
                      {idx < 3 ? (
                        <span className="text-base">{medals[idx]}</span>
                      ) : (
                        <span className="text-xs font-bold text-slate-400 dark:text-slate-500">#{idx + 1}</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 dark:text-white truncate">{performer.name}</p>
                      <p className="text-[10px] text-slate-500">
                        {performer.completed}/{performer.assigned} tasks
                      </p>
                    </div>

                    {/* Score */}
                    <div className="flex-shrink-0 text-right">
                      <span className={`
                        text-sm font-bold tabular-nums
                        ${performer.score >= 80 ? "text-green-600 dark:text-green-400" : performer.score >= 50 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}
                      `}>
                        {performer.score}%
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Upcoming Deadlines ──────────────────────────────── */}
        <div className="p-5 rounded-2xl bg-transparent border border-slate-200 dark:border-white/[0.06] shadow-sm dark:shadow-none transition-colors duration-300">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Icons.Calendar className="w-4 h-4 text-red-500 dark:text-red-400" />
              <h3 className="text-sm font-semibold text-slate-800 dark:text-white">Upcoming Deadlines</h3>
            </div>
            <button
              onClick={() => navigate("/tasks")}
              className="text-[10px] font-medium text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300 uppercase tracking-wider transition-colors flex items-center gap-1"
            >
              All Tasks <Icons.ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {upcomingDeadlines.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">No upcoming deadlines</p>
            ) : (
              upcomingDeadlines.map((task) => (
                <div
                  key={task._id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 hover:bg-slate-100 dark:bg-white/[0.02] dark:border-white/[0.04] dark:hover:bg-white/[0.04] transition-colors duration-150 cursor-pointer"
                  onClick={() => navigate(`/tasks?id=${task._id}`)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-800 dark:text-white truncate">{task.title}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Assigned to {task.assignee}
                      </p>
                    </div>

                    {/* Priority badge */}
                    <span className={`flex-shrink-0 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${priorityBadge(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>

                  {/* Deadline info */}
                  <div className="flex items-center justify-between mt-2.5">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">
                      {new Date(task.deadline).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span className={`text-[10px] font-semibold ${task.daysLeft <= 1 ? "text-red-500 dark:text-red-400" : task.daysLeft <= 3 ? "text-amber-500 dark:text-amber-400" : "text-slate-400 dark:text-slate-500"}`}>
                      {task.daysLeft === 0
                        ? "Due today!"
                        : task.daysLeft === 1
                        ? "1 day left"
                        : `${task.daysLeft} days left`}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;