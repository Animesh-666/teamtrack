import { useState, useEffect, useMemo, useCallback } from 'react'; // 🚀 FIXED: Added missing React core hooks imports
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import projectService from "../services/projectService";
import taskService from "../services/taskService";
import ProjectForm from "../components/projects/ProjectForm";

const Loader = () => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 rounded-full border-2 border-green-500/20" />
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-green-400" />
      </div>
      <p className="text-sm text-slate-400">Loading project…</p>
    </div>
  </div>
);

const NotFound = ({ onBack }) => (
  <div className="flex min-h-[60vh] items-center justify-center px-4">
    <div className="animate-fade-in-up text-center">
      <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl border border-white/5 bg-[#1e293b]/60 backdrop-blur-xl">
        <svg className="h-12 w-12 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          />
        </svg>
      </div>
      <h2 className="mb-2 text-2xl font-bold text-white">Project Not Found</h2>
      <p className="mb-8 text-sm text-slate-400">
        The project you&apos;re looking for doesn&apos;t exist or has been removed.
      </p>
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-green-500/20 transition-all hover:shadow-green-500/30 hover:brightness-110"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Back to Projects
      </button>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const map = {
    active: { label: 'Active', cls: 'bg-green-500/10 text-green-400 border-green-500/20' },
    completed: { label: 'Completed', cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    'on-hold': { label: 'On Hold', cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  };
  const s = map[String(status).toLowerCase()] || map.active;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${s.cls}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {s.label}
    </span>
  );
};

const StatCard = ({ icon, label, value, accent }) => (
  <div className="rounded-xl border border-white/5 bg-[#1e293b]/60 p-5 backdrop-blur-xl transition-colors hover:border-white/10">
    <div className="mb-3 flex items-center gap-3">
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${accent}`}>{icon}</div>
      <p className="text-xs font-medium text-slate-400">{label}</p>
    </div>
    <p className="text-2xl font-bold text-white">{value}</p>
  </div>
);

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // 🚀 FIXED: Robust case-insensitive comparison mapping both ADMIN and TEAM LEADER configurations
  const isAdmin = useMemo(() => {
    const roleUpper = (user?.role || '').trim().toUpperCase();
    return roleUpper === 'ADMIN' || roleUpper === 'TEAM LEADER';
  }, [user]);

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setNotFound(false);
      const [projectData, taskData] = await Promise.all([
        projectService.getProject(id),
        taskService.getTasks({ projectId: id }),
      ]);
      setProject(projectData);
      setTasks(Array.isArray(taskData) ? taskData : taskData?.tasks || []);
    } catch (err) {
      if (err?.response?.status === 404) {
        setNotFound(true);
      } else {
        toast.error(err?.response?.data?.message || 'Failed to load project');
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 🚀 FIXED STATUS PARSING: Matches the lowercase variations or 'Pending' strings from task controller schema definitions safely
  const analytics = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => String(t.status).toLowerCase() === 'completed').length;
    const inProgress = tasks.filter((t) => String(t.status).toLowerCase() === 'in-progress' || String(t.status).toLowerCase() === 'in progress').length;
    const todo = tasks.filter((t) => String(t.status).toLowerCase() === 'todo' || String(t.status).toLowerCase() === 'pending').length;
    const overdue = tasks.filter(
      (t) => String(t.status).toLowerCase() !== 'completed' && t.dueDate && new Date(t.dueDate) < new Date()
    ).length;
    const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, inProgress, todo, overdue, completionPct };
  }, [tasks]);

  const members = project?.members || project?.team || [];

  const handleBack = useCallback(() => navigate('/projects'), [navigate]);

  const handleEditSuccess = useCallback(() => {
    fetchData(); // Refetch fresh array layout records directly from database collections
    setShowEditForm(false);
    toast.success('Project updated successfully');
  }, [fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a]">
        <Loader />
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <div className="min-h-screen bg-[#0f172a]">
        <NotFound onBack={handleBack} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] px-4 py-8 sm:px-6 lg:px-8">
      {/* Upper Title Block Container Header */}
      <div className="animate-fade-in-down mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="group flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#1e293b]/60 text-slate-400 backdrop-blur-xl transition-all hover:border-green-500/30 hover:text-white"
          >
            <svg className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white sm:text-3xl">{project.name || project.projectName}</h1>
              <StatusBadge status={project.status} />
            </div>
            {project.description && (
              <p className="mt-1 max-w-2xl text-sm text-slate-400">{project.description}</p>
            )}
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowEditForm(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#1e293b] px-5 py-2.5 text-sm font-medium text-white transition-all hover:border-green-500/30 hover:bg-[#1e293b]/80"
          >
            <svg className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
            Edit Project
          </button>
        )}
      </div>

      <div className="mb-8 h-px bg-gradient-to-r from-transparent via-green-500/20 to-transparent" />

      {/* Analytics Counter Row Layout */}
      <div className="animate-fade-in-up mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Completion" value={`${analytics.completionPct}%`} accent="bg-green-500/10" icon={<svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        <StatCard label="Total Tasks" value={analytics.total} accent="bg-blue-500/10" icon={<svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 6.878V6a2.25 2.25 0 012.25-2.25h7.5A2.25 2.25 0 0118 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 004.5 9v.878m13.5-3A2.25 2.25 0 0119.5 9v.878m0 0a2.246 2.246 0 00-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0121 12v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6c0-.98.626-1.813 1.5-2.122" /></svg>} />
        <StatCard label="In Progress" value={analytics.inProgress} accent="bg-purple-500/10" icon={<svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" /></svg>} />
        <StatCard label="To Do" value={analytics.todo} accent="bg-slate-500/10" icon={<svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>} />
        <StatCard label="Overdue" value={analytics.overdue} accent="bg-red-500/10" icon={<svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
      </div>

      {/* Progress slider graph overlay */}
      <div className="animate-fade-in-up mb-8 rounded-xl border border-white/5 bg-[#1e293b]/60 p-5 backdrop-blur-xl">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium text-white">Overall Progress</span>
          <span className="text-sm font-semibold text-green-400">{analytics.completionPct}%</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-700/50">
          <div
            className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-700 ease-out"
            style={{ width: `${analytics.completionPct}%` }}
          />
        </div>
        <div className="mt-3 flex gap-6 text-xs text-slate-400">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-green-400" /> Completed ({analytics.completed})</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-purple-400" /> In Progress ({analytics.inProgress})</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-slate-400" /> To Do ({analytics.todo})</span>
        </div>
      </div>

      {/* Dashboard Subsplit Panels */}
      <div className="grid gap-8 lg:grid-cols-3">
        
        {/* Left Columns: Embedded Standalone Task Tracker Card Grid List */}
        <div className="animate-fade-in-up lg:col-span-2">
          <div className="rounded-2xl border border-white/5 bg-[#1e293b]/60 p-6 backdrop-blur-xl min-h-[340px]">
            <h3 className="text-base font-semibold text-white mb-4">Project Workspace Tasks</h3>
            {tasks.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-sm">No tasks assigned or created inside this tracking node yet.</div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div key={task._id} className="p-4 rounded-xl border border-white/5 bg-[#0f172a]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-white/10">
                    <div>
                      <h4 className="text-sm font-semibold text-white">{task.title}</h4>
                      {task.description && <p className="text-xs text-slate-400 mt-1 truncate max-w-md">{task.description}</p>}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border tracking-wide uppercase ${
                        String(task.status).toLowerCase() === 'completed' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        String(task.status).toLowerCase() === 'in-progress' || String(task.status).toLowerCase() === 'in progress' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                        'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Columns: Team assignment directory & Project Timelines */}
        <div className="animate-fade-in-up" style={{ animationDelay: '120ms' }}>
          <div className="rounded-2xl border border-white/5 bg-[#1e293b]/60 p-6 backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">Team Members</h3>
              <span className="rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-400">
                {members.length}
              </span>
            </div>

            {members.length === 0 ? (
              <div className="py-6 text-center text-sm text-slate-500">No members assigned to this scope</div>
            ) : (
              <div className="space-y-3">
                {members.map((member, idx) => {
                  const name = member?.name || member?.user?.name || 'Unknown';
                  const email = member?.email || member?.user?.email || '';
                  const role = member?.role || member?.projectRole || 'Member';
                  const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

                  return (
                    <div key={member._id || idx} className="flex items-center gap-3 rounded-xl border border-white/5 bg-[#0f172a]/40 p-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-xs font-bold text-white ring-2 ring-white/10">
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white">{name}</p>
                        <p className="truncate text-xs text-slate-400">{email}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium capitalize text-slate-400">
                        {role}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-6 rounded-2xl border border-white/5 bg-[#1e293b]/60 p-6 backdrop-blur-xl">
            <h3 className="mb-4 text-base font-semibold text-white">Project Timeline</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-500/10">
                  <svg className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Start Date</p>
                  <p className="text-sm font-medium text-white">
                    {project.startDate
                      ? new Date(project.startDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : '—'}
                  </p>
                </div>
              </div>
              <div className="ml-4 h-6 w-px bg-gradient-to-b from-green-500/20 to-red-500/20" />
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/10">
                  <svg className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Due Date</p>
                  <p className="text-sm font-medium text-white">
                    {project.endDate || project.dueDate
                      ? new Date(project.endDate || project.dueDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : '—'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🚀 FIXED PROPS DICTIONARY MATCH: Passes isOpen={true} directly within code boundary */}
      {showEditForm && (
        <ProjectForm
          isOpen={true}
          project={project}
          onSuccess={handleEditSuccess}
          onClose={() => setShowEditForm(false)}
        />
      )}
    </div>
  );
};

export default ProjectDetailPage;