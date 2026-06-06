/**
 * ProjectDetails.jsx
 * ─────────────────────────────────────────────────────────────
 * Detailed view of a single project, displayed on the
 * ProjectDetailPage.
 *
 * Features:
 *  - Project header with status, dates, creator info
 *  - Description section with rich text display
 *  - Team members grid with remove capability (admin)
 *  - Task overview with stats + task list
 *  - Project analytics (task distribution chart)
 *  - Edit / Delete / Add member actions (admin)
 *  - Responsive multi-column layout
 *  - Glassmorphism cards throughout
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import ProgressBar from "../common/ProgressBar";
import StatCard from "../common/StatCard";
import EmptyState from "../common/EmptyState";
import Loader from "../common/Loader";
import ConfirmDialog from "../common/ConfirmDialog";
import TaskDistributionChart from "../../charts/TaskDistributionChart";
import ProjectCompletionChart from "../../charts/ProjectCompletionChart";
import taskService from "../../services/taskService";
import projectService from "../../services/projectService";
import toast from "react-hot-toast";

/* ── Icons ────────────────────────────────────────────────── */

const Icons = {
  ArrowLeft: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
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
  User: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
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
  Plus: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
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
  InProgress: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="12" y1="2" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
      <line x1="2" y1="12" x2="6" y2="12" />
      <line x1="18" y1="12" x2="22" y2="12" />
    </svg>
  ),
  Mail: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  X: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  ExternalLink: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  ),
};

/* ── Status config ────────────────────────────────────────── */

const STATUS_CONFIG = {
  Active:    { bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/20", dot: "bg-green-400", pulse: true },
  Completed: { bg: "bg-blue-500/10",  text: "text-blue-400",  border: "border-blue-500/20",  dot: "bg-blue-400",  pulse: false },
  "On Hold": { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20", dot: "bg-amber-400", pulse: false },
};

const PRIORITY_CONFIG = {
  High:   "bg-red-500/10 text-red-400 border-red-500/20",
  Medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Low:    "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

const TASK_STATUS_CONFIG = {
  Pending:       { dot: "bg-amber-400",  text: "text-amber-400" },
  "In Progress": { dot: "bg-blue-400",   text: "text-blue-400" },
  Completed:     { dot: "bg-green-400",  text: "text-green-400" },
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

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

const daysRemaining = (endDate) => {
  if (!endDate) return null;
  const diff = Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return { text: `${Math.abs(diff)}d overdue`, urgent: true };
  if (diff === 0) return { text: "Ends today", urgent: true };
  if (diff <= 3) return { text: `${diff}d remaining`, urgent: true };
  return { text: `${diff}d remaining`, urgent: false };
};

/* ── Component ────────────────────────────────────────────── */

const ProjectDetails = ({ project, onEdit, onRefresh }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === "ADMIN";

  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRemoveMember, setShowRemoveMember] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [removingMember, setRemovingMember] = useState(false);

  const sc = STATUS_CONFIG[project?.status] || STATUS_CONFIG.Active;
  const deadline = daysRemaining(project?.endDate);

  /** Fetch tasks for this project */
  useEffect(() => {
    const fetchTasks = async () => {
      if (!project?._id) return;
      try {
        setLoadingTasks(true);
        const res = await taskService.getTasksByProject(project._id);
        setTasks(res?.data || []);
      } catch (err) {
        console.error("Error fetching project tasks:", err);
      } finally {
        setLoadingTasks(false);
      }
    };
    fetchTasks();
  }, [project?._id]);

  /** Task statistics */
  const taskStats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === "Completed").length,
    inProgress: tasks.filter((t) => t.status === "In Progress").length,
    pending: tasks.filter((t) => t.status === "Pending").length,
  };
  const completionPercentage = taskStats.total > 0
    ? Math.round((taskStats.completed / taskStats.total) * 100)
    : 0;

  /** Delete project */
  const handleDelete = async () => {
    try {
      setDeleting(true);
      await projectService.deleteProject(project._id);
      toast.success("Project deleted successfully");
      navigate("/projects");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete project");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  /** Remove member */
  const handleRemoveMember = async () => {
    if (!showRemoveMember) return;
    try {
      setRemovingMember(true);
      await projectService.removeMember(project._id, showRemoveMember._id);
      toast.success(`${showRemoveMember.name} removed from project`);
      onRefresh?.();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove member");
    } finally {
      setRemovingMember(false);
      setShowRemoveMember(null);
    }
  };

  if (!project) {
    return <Loader inline message="Loading project..." />;
  }

  const members = project.members || [];
  const creator = project.createdBy;
  const creatorName = typeof creator === "object" ? creator.name : "Admin";

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Back button + Title header ────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          {/* Back */}
          <button
            id="project-detail-back"
            onClick={() => navigate("/projects")}
            className="
              flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl
              bg-white/[0.04] border border-white/[0.08]
              text-slate-400 hover:text-white hover:bg-white/[0.08]
              transition-all duration-200
            "
          >
            <Icons.ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            {/* Status badge */}
            <span className={`
              inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg mb-2
              text-[11px] font-semibold uppercase tracking-wider
              border ${sc.bg} ${sc.text} ${sc.border}
            `}>
              <span className="relative flex h-1.5 w-1.5">
                <span className={`${sc.dot} rounded-full inline-flex h-full w-full`} />
                {sc.pulse && (
                  <span className={`absolute inline-flex h-full w-full rounded-full ${sc.dot} opacity-40 animate-ping`} />
                )}
              </span>
              {project.status}
            </span>

            {/* Title */}
            <h1 className="text-2xl font-bold text-white">{project.projectName}</h1>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Icons.User className="w-3.5 h-3.5" />
                Created by {creatorName}
              </span>
              <span className="flex items-center gap-1.5">
                <Icons.Calendar className="w-3.5 h-3.5" />
                {formatDate(project.startDate)} — {formatDate(project.endDate)}
              </span>
              {deadline && (
                <span className={`flex items-center gap-1.5 font-medium ${deadline.urgent ? "text-red-400" : "text-slate-400"}`}>
                  <Icons.Pending className="w-3.5 h-3.5" />
                  {deadline.text}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Admin actions */}
        {isAdmin && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              id="project-detail-edit"
              onClick={() => onEdit?.(project)}
              className="
                flex items-center gap-2 h-10 px-4 rounded-xl
                bg-white/[0.06] border border-white/[0.08]
                text-sm font-medium text-slate-300
                hover:bg-white/[0.1] hover:text-white
                transition-all duration-200
              "
            >
              <Icons.Edit className="w-4 h-4" />
              Edit
            </button>
            <button
              id="project-detail-delete"
              onClick={() => setShowDeleteConfirm(true)}
              className="
                flex items-center gap-2 h-10 px-4 rounded-xl
                bg-red-500/10 border border-red-500/20
                text-sm font-medium text-red-400
                hover:bg-red-500/20 hover:text-red-300
                transition-all duration-200
              "
            >
              <Icons.Trash className="w-4 h-4" />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* ── Description ───────────────────────────────────── */}
      {project.description && (
        <div className="
          p-5 rounded-2xl
          bg-[#1e293b]/60 backdrop-blur-xl
          border border-white/[0.06]
        ">
          <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
            Description
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
            {project.description}
          </p>
        </div>
      )}

      {/* ── Task Stats ────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={Icons.Tasks}      label="Total Tasks"  value={taskStats.total}      color="cyan" />
        <StatCard icon={Icons.Completed}  label="Completed"    value={taskStats.completed}  color="green" />
        <StatCard icon={Icons.InProgress} label="In Progress"  value={taskStats.inProgress} color="blue" />
        <StatCard icon={Icons.Pending}    label="Pending"      value={taskStats.pending}    color="amber" />
      </div>

      {/* ── Overall Progress ──────────────────────────────── */}
      <div className="
        p-5 rounded-2xl
        bg-[#1e293b]/60 backdrop-blur-xl
        border border-white/[0.06]
      ">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">Overall Progress</h3>
          <span className="text-sm font-bold text-white tabular-nums">
            {completionPercentage}%
          </span>
        </div>
        <ProgressBar value={completionPercentage} size="md" showLabel={false} />
      </div>

      {/* ── Middle row: Members + Charts ──────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Team Members ─────────────────────────────────── */}
        <div className="
          p-5 rounded-2xl
          bg-[#1e293b]/60 backdrop-blur-xl
          border border-white/[0.06]
        ">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Icons.User className="w-4 h-4 text-purple-400" />
              Team Members
              <span className="ml-1 text-[10px] text-slate-500 font-normal">({members.length})</span>
            </h3>
            {isAdmin && (
              <button
                onClick={() => onEdit?.(project)}
                className="
                  flex items-center gap-1.5 text-[10px] font-medium text-green-400
                  hover:text-green-300 uppercase tracking-wider transition-colors
                "
              >
                <Icons.Plus className="w-3.5 h-3.5" />
                Add
              </button>
            )}
          </div>

          {members.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">No members assigned yet</p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto scrollbar-thin pr-1">
              {members.map((member) => {
                const m = typeof member === "object" ? member : { _id: member, name: "Member" };
                const hue = nameToHue(m.name);

                return (
                  <div
                    key={m._id}
                    className="
                      flex items-center gap-3 p-3 rounded-xl
                      bg-white/[0.02] border border-white/[0.04]
                      hover:bg-white/[0.05] transition-colors duration-150
                      group/member
                    "
                  >
                    {/* Avatar */}
                    {m.avatar ? (
                      <img
                        src={m.avatar}
                        alt={m.name}
                        className="w-9 h-9 rounded-lg object-cover ring-2 ring-white/[0.06]"
                      />
                    ) : (
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center ring-2 ring-white/[0.06]"
                        style={{
                          background: `linear-gradient(135deg, hsl(${hue}, 60%, 45%), hsl(${hue + 30}, 50%, 35%))`,
                        }}
                      >
                        <span className="text-xs font-bold text-white">{getInitials(m.name)}</span>
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{m.name}</p>
                      {m.email && (
                        <p className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                          <Icons.Mail className="w-3 h-3" />
                          {m.email}
                        </p>
                      )}
                    </div>

                    {/* Remove button (admin) */}
                    {isAdmin && (
                      <button
                        onClick={() => setShowRemoveMember(m)}
                        className="
                          flex-shrink-0 w-7 h-7 rounded-lg
                          flex items-center justify-center
                          text-slate-500 hover:text-red-400 hover:bg-red-500/10
                          opacity-0 group-hover/member:opacity-100
                          transition-all duration-150
                        "
                        title={`Remove ${m.name}`}
                      >
                        <Icons.X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Task Distribution Chart ──────────────────────── */}
        <div className="
          p-5 rounded-2xl
          bg-[#1e293b]/60 backdrop-blur-xl
          border border-white/[0.06]
        ">
          <h3 className="text-sm font-semibold text-white mb-4">Task Distribution</h3>
          {loadingTasks ? (
            <Loader inline size="small" message="" />
          ) : taskStats.total === 0 ? (
            <EmptyState variant="tasks" />
          ) : (
            <TaskDistributionChart
              data={{
                pending: taskStats.pending,
                inProgress: taskStats.inProgress,
                completed: taskStats.completed,
              }}
            />
          )}
        </div>
      </div>

      {/* ── Project Tasks List ─────────────────────────────── */}
      <div className="
        p-5 rounded-2xl
        bg-[#1e293b]/60 backdrop-blur-xl
        border border-white/[0.06]
      ">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Icons.Tasks className="w-4 h-4 text-cyan-400" />
            Project Tasks
          </h3>
          {isAdmin && (
            <button
              onClick={() => navigate(`/tasks?projectId=${project._id}`)}
              className="
                flex items-center gap-1.5 h-8 px-3 rounded-lg
                bg-gradient-to-r from-green-500 to-emerald-600
                text-xs font-semibold text-white
                shadow-md shadow-green-500/20
                hover:shadow-lg hover:shadow-green-500/25
                transition-all duration-200
              "
            >
              <Icons.Plus className="w-3.5 h-3.5" />
              New Task
            </button>
          )}
        </div>

        {loadingTasks ? (
          <Loader inline size="small" message="Loading tasks..." />
        ) : tasks.length === 0 ? (
          <EmptyState
            variant="tasks"
            onAction={isAdmin ? () => navigate(`/tasks?projectId=${project._id}`) : undefined}
          />
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left text-[10px] font-medium text-slate-500 uppercase tracking-wider pb-3 pr-4">Task</th>
                  <th className="text-left text-[10px] font-medium text-slate-500 uppercase tracking-wider pb-3 pr-4">Assignee</th>
                  <th className="text-left text-[10px] font-medium text-slate-500 uppercase tracking-wider pb-3 pr-4">Priority</th>
                  <th className="text-left text-[10px] font-medium text-slate-500 uppercase tracking-wider pb-3 pr-4">Status</th>
                  <th className="text-left text-[10px] font-medium text-slate-500 uppercase tracking-wider pb-3 pr-4 w-36">Progress</th>
                  <th className="text-left text-[10px] font-medium text-slate-500 uppercase tracking-wider pb-3">Deadline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {tasks.map((task) => {
                  const tsc = TASK_STATUS_CONFIG[task.status] || TASK_STATUS_CONFIG.Pending;
                  const assignee = typeof task.assignedTo === "object" ? task.assignedTo : null;
                  const hue = nameToHue(assignee?.name);

                  return (
                    <tr
                      key={task._id}
                      className="hover:bg-white/[0.02] transition-colors cursor-pointer group/row"
                      onClick={() => navigate(`/tasks?id=${task._id}`)}
                    >
                      {/* Task name */}
                      <td className="py-3 pr-4">
                        <p className="text-sm font-medium text-white truncate max-w-[200px] group-hover/row:text-green-400 transition-colors">
                          {task.title}
                        </p>
                      </td>

                      {/* Assignee */}
                      <td className="py-3 pr-4">
                        {assignee ? (
                          <div className="flex items-center gap-2">
                            {assignee.avatar ? (
                              <img src={assignee.avatar} alt={assignee.name} className="w-6 h-6 rounded-md object-cover" />
                            ) : (
                              <div
                                className="w-6 h-6 rounded-md flex items-center justify-center"
                                style={{
                                  background: `linear-gradient(135deg, hsl(${hue}, 60%, 45%), hsl(${hue + 30}, 50%, 35%))`,
                                }}
                              >
                                <span className="text-[8px] font-bold text-white">{getInitials(assignee.name)}</span>
                              </div>
                            )}
                            <span className="text-xs text-slate-400 truncate max-w-[100px]">{assignee.name}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500">Unassigned</span>
                        )}
                      </td>

                      {/* Priority */}
                      <td className="py-3 pr-4">
                        <span className={`
                          inline-flex px-2 py-0.5 rounded-md
                          text-[10px] font-semibold border
                          ${PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.Low}
                        `}>
                          {task.priority}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 pr-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${tsc.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${tsc.dot}`} />
                          {task.status}
                        </span>
                      </td>

                      {/* Progress */}
                      <td className="py-3 pr-4">
                        <ProgressBar value={task.progress || 0} size="xs" className="w-full" />
                      </td>

                      {/* Deadline */}
                      <td className="py-3">
                        <span className="text-xs text-slate-500">
                          {task.deadline
                            ? new Date(task.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                            : "—"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Delete Confirm Dialog ──────────────────────────── */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Project"
        message={`Are you sure you want to delete "${project.projectName}"? This will also remove all associated tasks. This action cannot be undone.`}
        confirmLabel="Delete Project"
        variant="danger"
        loading={deleting}
      />

      {/* ── Remove Member Confirm ──────────────────────────── */}
      <ConfirmDialog
        isOpen={!!showRemoveMember}
        onClose={() => setShowRemoveMember(null)}
        onConfirm={handleRemoveMember}
        title="Remove Member"
        message={`Are you sure you want to remove ${showRemoveMember?.name} from this project?`}
        confirmLabel="Remove"
        variant="warning"
        loading={removingMember}
      />
    </div>
  );
};

export default ProjectDetails;
