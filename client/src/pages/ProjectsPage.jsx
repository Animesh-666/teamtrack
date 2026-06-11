/**
 * ProjectsPage.jsx
 * ─────────────────────────────────────────────────────────────
 * Project tracking component view with fixed robust modal state management.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { useDebounce } from '../hooks/useDebounce';
import projectService from '../services/projectService';
import ProjectCard from '../components/projects/ProjectCard';
import ProjectForm from '../components/projects/ProjectForm';
import SearchBar from '../components/common/SearchBar';

const STATUS_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
  { label: 'On Hold', value: 'on-hold' },
];

const SkeletonCard = () => (
  <div className="animate-pulse bg-transparent border border-slate-200 dark:border-white/[0.06] rounded-xl p-6 transition-colors duration-300">
    <div className="mb-4 h-4 w-3/4 rounded bg-slate-300 dark:bg-slate-700" />
    <div className="mb-2 h-3 w-full rounded bg-slate-200 dark:bg-slate-700/60" />
    <div className="mb-6 h-3 w-5/6 rounded bg-slate-200 dark:bg-slate-700/40" />
    <div className="flex items-center justify-between">
      <div className="h-6 w-20 rounded-full bg-slate-200 dark:bg-slate-700/50" />
      <div className="flex -space-x-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-7 w-7 rounded-full bg-slate-300 dark:bg-slate-700 ring-2 ring-white dark:ring-[#1e293b]" />
        ))}
      </div>
    </div>
    <div className="mt-4 h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700/40" />
  </div>
);

const EmptyState = ({ hasFilters, onClear }) => (
  <div className="animate-fade-in-up col-span-full flex flex-col items-center justify-center py-20 text-center">
    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-transparent border border-slate-200 dark:border-white/[0.06]">
      <svg className="h-10 w-10 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
        />
      </svg>
    </div>
    <h3 className="mb-2 text-lg font-semibold text-slate-800 dark:text-white">
      {hasFilters ? 'No matching projects' : 'No projects yet'}
    </h3>
    <p className="mb-6 max-w-sm text-sm text-slate-500 dark:text-slate-400">
      {hasFilters
        ? "Try adjusting your search or filters to find what you're looking for."
        : 'Get started by creating your first project. Collaborate with your team and track progress.'}
    </p>
    {hasFilters && (
      <button
        onClick={onClear}
        className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1e293b] px-4 py-2 text-sm font-medium text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-[#1e293b]/80 transition-colors"
      >
        Clear Filters
      </button>
    )}
  </div>
);

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, loading }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="animate-fade-in-up relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1e293b] p-6 shadow-2xl">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
          <svg className="h-6 w-6 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>
        <h3 className="mb-2 text-center text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
        <p className="mb-6 text-center text-sm text-slate-500 dark:text-slate-400">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0f172a] px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-[#0f172a]/80 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Deleting…
              </span>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const ProjectsPage = () => {
  const { user } = useAuth();
  
  const isAdmin = useMemo(() => {
    const userRole = (user?.role || '').trim().toUpperCase();
    return userRole === 'ADMIN' || userRole === 'TEAM LEADER';
  }, [user]);

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const res = await projectService.getProjects();
      const cleanData = res?.projects || res?.data || res;
      setProjects(Array.isArray(cleanData) ? cleanData : []);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const filteredProjects = useMemo(() => {
    let result = projects;
    if (statusFilter !== 'all') {
      result = result.filter((p) => p.status === statusFilter);
    }
    if (debouncedSearch.trim()) {
      const query = debouncedSearch.toLowerCase();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
      );
    }
    return result;
  }, [projects, statusFilter, debouncedSearch]);

  const stats = useMemo(() => {
    const total = projects.length;
    const active = projects.filter((p) => p.status === 'active').length;
    const completed = projects.filter((p) => p.status === 'completed').length;
    const onHold = projects.filter((p) => p.status === 'on-hold').length;
    return { total, active, completed, onHold };
  }, [projects]);

  const handleCreateProject = () => {
    setEditingProject(null);
    setShowForm(true);
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    fetchProjects();
    setShowForm(false);
    setEditingProject(null);
  };

  const handleDeleteProject = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await projectService.deleteProject(deleteTarget._id);
      setProjects((prev) => prev.filter((p) => p._id !== deleteTarget._id));
      toast.success('Project deleted successfully');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete project');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }, [deleteTarget]);

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setStatusFilter('all');
  }, []);

  const hasActiveFilters = statusFilter !== 'all' || debouncedSearch.trim().length > 0;

  return (
    <div className="w-full h-full bg-transparent px-4 py-8 text-slate-800 dark:text-slate-200 transition-colors duration-300">
      <div className="animate-fade-in-down mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Projects</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Manage and track all your team projects in one place.
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={handleCreateProject}
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-green-500/20 transition-all hover:shadow-green-500/30 hover:brightness-110"
            >
              <svg className="h-5 w-5 transition-transform group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              New Project
            </button>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {[
            { label: 'Total', value: stats.total, color: 'text-slate-800 dark:text-white', bg: 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10' },
            { label: 'Active', value: stats.active, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
            { label: 'Completed', value: stats.completed, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
            { label: 'On Hold', value: stats.onHold, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
          ].map((stat) => (
            <div key={stat.label} className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium ${stat.bg}`}>
              <span className={`font-bold ${stat.color}`}>{stat.value}</span>
              <span className="text-slate-500 dark:text-slate-400">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6 h-px bg-gradient-to-r from-transparent via-green-500/20 to-transparent" />

      <div className="animate-fade-in-up mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:max-w-md">
          <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search projects…" />
        </div>

        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`rounded-lg px-4 py-2 text-xs font-medium transition-all ${statusFilter === opt.value ? 'bg-green-500/20 text-green-600 dark:text-green-400 ring-1 ring-green-500/30' : 'border border-slate-200 dark:border-white/5 bg-white/60 dark:bg-[#1e293b]/60 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/10 hover:text-slate-800 dark:hover:text-white'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <EmptyState hasFilters={hasActiveFilters} onClear={handleClearFilters} />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project, idx) => (
            <div key={project._id} className="animate-fade-in-up" style={{ animationDelay: `${idx * 60}ms` }}>
              <ProjectCard
                project={project}
                onEdit={isAdmin ? () => handleEditProject(project) : undefined}
                onDelete={isAdmin ? () => setDeleteTarget(project) : undefined}
              />
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <ProjectForm
          isOpen={true}
          project={editingProject}
          onSuccess={handleFormSuccess}
          onClose={() => setShowForm(false)}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Project"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone and all associated tasks will be removed.`}
        onConfirm={handleDeleteProject}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
};

export default ProjectsPage;