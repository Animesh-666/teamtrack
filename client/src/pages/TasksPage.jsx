import { useState, useEffect, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import { useDebounce } from "../hooks/useDebounce";

import taskService from "../services/taskService";
import userService from "../services/userService";

import SearchBar from "../components/common/SearchBar";
import FilterPanel from "../components/common/FilterPanel";
import EmptyState from "../components/common/EmptyState";
import ConfirmDialog from "../components/common/ConfirmDialog";
import Modal from "../components/common/Modal";

import TaskCard from "../components/tasks/TaskCard";
import TaskForm from "../components/tasks/TaskForm";
import TaskDetails from "../components/tasks/TaskDetails";

const Icons = {
  Plus: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Grid: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  ),
  List: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  ),
  Refresh: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  ),
  CheckSquare: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
  Clock: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Loader: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
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
  Check: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
};

const SkeletonCard = ({ index }) => (
  <div
    className="rounded-2xl overflow-hidden bg-[#1e293b]/40 border border-white/[0.04] animate-pulse"
    style={{ animationDelay: `${index * 80}ms` }}
  >
    <div className="h-1 w-full bg-white/[0.04]" />
    <div className="p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-16 h-5 rounded-md bg-white/[0.06]" />
        <div className="w-20 h-5 rounded-md bg-white/[0.06]" />
      </div>
      <div className="w-3/4 h-4 rounded bg-white/[0.06] mb-2" />
      <div className="w-full h-3 rounded bg-white/[0.04] mb-1" />
      <div className="w-2/3 h-3 rounded bg-white/[0.04] mb-4" />
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <div className="w-12 h-2.5 rounded bg-white/[0.04]" />
          <div className="w-8 h-2.5 rounded bg-white/[0.04]" />
        </div>
        <div className="w-full h-1.5 rounded-full bg-white/[0.04]" />
      </div>
      <div className="pt-3 border-t border-white/[0.04] flex justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-white/[0.06]" />
          <div className="w-16 h-3 rounded bg-white/[0.04]" />
        </div>
        <div className="w-20 h-3 rounded bg-white/[0.04]" />
      </div>
    </div>
  </div>
);

const StatBadge = ({ icon: Icon, label, value, color, bg }) => (
  <div
    className={`
      flex items-center gap-2.5 px-4 py-2.5 rounded-xl
      ${bg} border border-white/[0.04]
      transition-all duration-200 hover:border-white/[0.08]
    `}
  >
    <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
      <Icon className={`w-4 h-4 ${color}`} />
    </div>
    <div>
      <p className="text-lg font-bold text-white tabular-nums leading-none mb-0.5">{value}</p>
      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">{label}</p>
    </div>
  </div>
);

const TasksPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [members, setMembers] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);

  const [filterValues, setFilterValues] = useState({
    status: "",
    priority: "",
    assignee: "",
  });

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [viewingTask, setViewingTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTasks = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const params = {};
      if (filterValues.status) params.status = filterValues.status;
      if (filterValues.priority) params.priority = filterValues.priority;
      if (filterValues.assignee) params.assignedTo = filterValues.assignee;

      const res = await taskService.getTasks(params);
      setTasks(res?.data || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filterValues]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    if (!isAdmin) return;
    const fetchMembers = async () => {
      try {
        const res = await userService.getUsers();
        setMembers((res?.data || []).filter((u) => u.role === "MEMBER"));
      } catch (err) {
        console.error("Error fetching members:", err);
      }
    };
    fetchMembers();
  }, [isAdmin]);

  const filteredTasks = useMemo(() => {
    if (!debouncedSearch) return tasks;
    const q = debouncedSearch.toLowerCase();
    return tasks.filter(
      (t) =>
        t.title?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q)
    );
  }, [tasks, debouncedSearch]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const pending = tasks.filter((t) => t.status === "Pending").length;
    const inProgress = tasks.filter((t) => t.status === "In Progress").length;
    const completed = tasks.filter((t) => t.status === "Completed").length;
    return { total, pending, inProgress, completed };
  }, [tasks]);

  const filterConfig = useMemo(() => {
    const configs = [
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "Pending", label: "Pending" },
          { value: "In Progress", label: "In Progress" },
          { value: "Completed", label: "Completed" },
        ],
      },
      {
        key: "priority",
        label: "Priority",
        type: "select",
        options: [
          { value: "Low", label: "Low" },
          { value: "Medium", label: "Medium" },
          { value: "High", label: "High" },
        ],
      },
    ];

    if (isAdmin && members.length > 0) {
      configs.push({
        key: "assignee",
        label: "Assignee",
        type: "select",
        options: members.map((m) => ({
          value: m._id,
          label: m.name,
        })),
      });
    }

    return configs;
  }, [isAdmin, members]);

  const handleFilterChange = (key, value) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleFilterReset = () => {
    setFilterValues({ status: "", priority: "", assignee: "" });
  };

  const handleRefresh = () => {
    fetchTasks(true);
  };

  const handleCreateTask = () => {
    setEditingTask(null);
    setShowTaskForm(true);
  };

  const handleEditTask = (task) => {
    setViewingTask(null);
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleViewDetails = (task) => {
    setViewingTask(task);
  };

  const handleDetailsRefresh = async () => {
    try {
      const res = await taskService.getTasks();
      const updatedTasks = res?.data || [];
      setTasks(updatedTasks);

      if (viewingTask) {
        const refreshed = updatedTasks.find((t) => t._id === viewingTask._id);
        if (refreshed) setViewingTask(refreshed);
      }
    } catch (err) {
      console.error("Error refreshing tasks:", err);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const progressUpdate = newStatus === "Completed" ? 100 : undefined;
      await taskService.updateTask(taskId, {
        status: newStatus,
        ...(progressUpdate !== undefined && { progress: progressUpdate }),
      });
      toast.success(`Status updated to ${newStatus}`);
      fetchTasks(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const handleDeletePrompt = (task) => {
    setViewingTask(null);
    setTaskToDelete(task);
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    try {
      setDeleting(true);
      await taskService.deleteTask(taskToDelete._id);
      toast.success("Task deleted successfully");
      setTaskToDelete(null);
      fetchTasks(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete task");
    } finally {
      setDeleting(false);
    }
  };

  const handleFormSuccess = () => {
    fetchTasks(true);
  };

  return (
    <div className="w-full h-full bg-transparent px-4 py-8 text-slate-800 dark:text-slate-200 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="animate-fade-in-down">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/25">
                  <Icons.CheckSquare className="w-5 h-5 text-white" />
                </div>
                Tasks
              </h1>
              <p className="text-sm text-slate-400 mt-1 ml-[52px]">
                Manage and track all team tasks
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
                title="Refresh tasks"
              >
                <Icons.Refresh className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              </button>

              {isAdmin && (
                <button
                  onClick={handleCreateTask}
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
                  New Task
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <StatBadge
              icon={Icons.CheckSquare}
              label="Total Tasks"
              value={stats.total}
              color="text-slate-300"
              bg="bg-white/[0.03]"
            />
            <StatBadge
              icon={Icons.Clock}
              label="Pending"
              value={stats.pending}
              color="text-amber-400"
              bg="bg-amber-500/[0.06]"
            />
            <StatBadge
              icon={Icons.Loader}
              label="In Progress"
              value={stats.inProgress}
              color="text-blue-400"
              bg="bg-blue-500/[0.06]"
            />
            <StatBadge
              icon={Icons.Check}
              label="Completed"
              value={stats.completed}
              color="text-green-400"
              bg="bg-green-500/[0.06]"
            />
          </div>
        </div>

        <div className="animate-fade-in-up space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search tasks by title..."
              className="flex-1"
              loading={!!debouncedSearch && loading}
            />

            <div className="flex items-center rounded-xl bg-white/[0.04] border border-white/[0.08] p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`
                  flex items-center justify-center w-9 h-8 rounded-lg
                  transition-all duration-200
                  ${
                    viewMode === "grid"
                      ? "bg-green-500/15 text-green-400 shadow-sm"
                      : "text-slate-500 hover:text-white"
                  }
                `}
                title="Grid view"
              >
                <Icons.Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`
                  flex items-center justify-center w-9 h-8 rounded-lg
                  transition-all duration-200
                  ${
                    viewMode === "list"
                      ? "bg-green-500/15 text-green-400 shadow-sm"
                      : "text-slate-500 hover:text-white"
                  }
                `}
                title="List view"
              >
                <Icons.List className="w-4 h-4" />
              </button>
            </div>
          </div>

          <FilterPanel
            filters={filterConfig}
            values={filterValues}
            onChange={handleFilterChange}
            onReset={handleFilterReset}
          />
        </div>

        <div className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          {loading && !refreshing && (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                  : "grid grid-cols-1 gap-3"
              }
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} index={i} />
              ))}
            </div>
          )}

          {!loading && filteredTasks.length === 0 && (
            <EmptyState
              variant={debouncedSearch ? "search" : "tasks"}
              title={
                debouncedSearch
                  ? "No matching tasks"
                  : "No tasks yet"
              }
              description={
                debouncedSearch
                  ? `No tasks match "${debouncedSearch}". Try a different search term or clear filters.`
                  : "Create your first task to start tracking progress and boosting productivity."
              }
              actionLabel={
                debouncedSearch
                  ? "Clear Search"
                  : isAdmin
                  ? "Create Task"
                  : undefined
              }
              onAction={
                debouncedSearch
                  ? () => {
                      setSearchQuery("");
                      handleFilterReset();
                    }
                  : isAdmin
                  ? handleCreateTask
                  : undefined
              }
            />
          )}

          {!loading && filteredTasks.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-slate-500">
                  Showing{" "}
                  <span className="text-slate-300 font-medium">{filteredTasks.length}</span>{" "}
                  task{filteredTasks.length !== 1 ? "s" : ""}
                  {debouncedSearch && (
                    <span>
                      {" "}
                      for{" "}
                      <span className="text-green-400">"{debouncedSearch}"</span>
                    </span>
                  )}
                </p>

                {refreshing && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <div className="w-3 h-3 rounded-full border-2 border-slate-600 border-t-green-400 animate-spin" />
                    Refreshing...
                  </div>
                )}
              </div>

              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                    : "grid grid-cols-1 gap-3"
                }
              >
                {filteredTasks.map((task, idx) => (
                  <div
                    key={task._id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${idx * 40}ms` }}
                  >
                    <TaskCard
                      task={task}
                      compact={viewMode === "list"}
                      onViewDetails={handleViewDetails}
                      onEdit={handleEditTask}
                      onDelete={handleDeletePrompt}
                      onStatusChange={handleStatusChange}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <TaskForm
          isOpen={showTaskForm}
          onClose={() => {
            setShowTaskForm(false);
            setEditingTask(null);
          }}
          task={editingTask}
          onSuccess={handleFormSuccess}
        />

        <Modal
          isOpen={!!viewingTask}
          onClose={() => setViewingTask(null)}
          title={
            <span className="flex items-center gap-2">
              <Icons.CheckSquare className="w-5 h-5 text-green-400" />
              Task Details
            </span>
          }
          size="lg"
        >
          <TaskDetails
            task={viewingTask}
            onClose={() => setViewingTask(null)}
            onEdit={handleEditTask}
            onDelete={handleDeletePrompt}
            onRefresh={handleDetailsRefresh}
          />
        </Modal>

        <ConfirmDialog
          isOpen={!!taskToDelete}
          onClose={() => setTaskToDelete(null)}
          onConfirm={handleConfirmDelete}
          title="Delete Task"
          message={
            taskToDelete
              ? `Are you sure you want to delete "${taskToDelete.title}"? This action cannot be undone.`
              : "This action cannot be undone."
          }
          confirmLabel="Delete"
          variant="danger"
          loading={deleting}
        />
      </div>
    </div>
  );
};

export default TasksPage;