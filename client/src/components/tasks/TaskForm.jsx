/**
 * TaskForm.jsx
 * ─────────────────────────────────────────────────────────────
 * Create / Edit task form rendered inside a Modal.
 *
 * Features:
 *  - React Hook Form with validation
 *  - Create mode (blank) and Edit mode (pre-filled)
 *  - Title, description, project selection, assignee selection
 *  - Priority selector (radio cards)
 *  - Status selector (radio cards)
 *  - Progress slider with animated fill
 *  - Deadline date picker
 *  - Toast notifications on success/error
 *  - Loading state during submission
 *  - Fully responsive, glassmorphism inputs
 */

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Modal from "../common/Modal";
import taskService from "../../services/taskService";
import projectService from "../../services/projectService";
import userService from "../../services/userService";

/* ── Icons ────────────────────────────────────────────────── */

const Icons = {
  Task: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
  Check: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Plus: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  ChevronDown: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  Flag: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  ),
};

/* ── Priority & Status configs ────────────────────────────── */

const PRIORITY_OPTIONS = [
  {
    value: "Low",
    label: "Low",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    activeBg: "bg-blue-500/15",
  },
  {
    value: "Medium",
    label: "Medium",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    activeBg: "bg-amber-500/15",
  },
  {
    value: "High",
    label: "High",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    activeBg: "bg-red-500/15",
  },
];

const STATUS_OPTIONS = [
  {
    value: "Pending",
    label: "Pending",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    dot: "bg-amber-400",
  },
  {
    value: "In Progress",
    label: "In Progress",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    dot: "bg-blue-400",
  },
  {
    value: "Completed",
    label: "Completed",
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    dot: "bg-green-400",
  },
];

/* ── Helpers ──────────────────────────────────────────────── */

const toInputDate = (date) => {
  if (!date) return "";
  return new Date(date).toISOString().split("T")[0];
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

/** Dynamic gradient for the progress slider thumb track */
const getProgressGradient = (value) => {
  if (value >= 80) return "from-green-500 to-emerald-400";
  if (value >= 50) return "from-yellow-500 to-amber-400";
  if (value >= 25) return "from-orange-500 to-amber-400";
  return "from-red-500 to-orange-400";
};

/* ── Component ────────────────────────────────────────────── */

const TaskForm = ({
  isOpen,
  onClose,
  task = null,
  defaultProjectId = null,
  onSuccess,
}) => {
  const isEdit = !!task;

  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /** React Hook Form */
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      projectId: defaultProjectId || "",
      assignedTo: "",
      priority: "Medium",
      status: "Pending",
      progress: 0,
      deadline: "",
    },
  });

  const watchedPriority = watch("priority");
  const watchedStatus = watch("status");
  const watchedProgress = watch("progress");
  const watchedProjectId = watch("projectId");

  /** Load projects and members */
  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      try {
        setLoadingData(true);
        const [projRes, userRes] = await Promise.allSettled([
          projectService.getProjects(),
          userService.getUsers(),
        ]);

        setProjects(projRes.status === "fulfilled" ? projRes.value?.data || [] : []);
        setMembers(userRes.status === "fulfilled" ? (userRes.value?.data || []).filter((u) => u.role === "MEMBER") : []);
      } catch (err) {
        console.error("Error loading form data:", err);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [isOpen]);

  /** Pre-fill form when editing */
  useEffect(() => {
    if (isOpen && task) {
      reset({
        title: task.title || "",
        description: task.description || "",
        projectId: typeof task.projectId === "object" ? task.projectId._id : task.projectId || "",
        assignedTo: typeof task.assignedTo === "object" ? task.assignedTo._id : task.assignedTo || "",
        priority: task.priority || "Medium",
        status: task.status || "Pending",
        progress: task.progress || 0,
        deadline: toInputDate(task.deadline),
      });
    } else if (isOpen && !task) {
      reset({
        title: "",
        description: "",
        projectId: defaultProjectId || "",
        assignedTo: "",
        priority: "Medium",
        status: "Pending",
        progress: 0,
        deadline: "",
      });
    }
  }, [isOpen, task, defaultProjectId, reset]);

  /** Auto-set progress to 100 when status is Completed */
  useEffect(() => {
    if (watchedStatus === "Completed" && watchedProgress < 100) {
      setValue("progress", 100);
    }
  }, [watchedStatus, watchedProgress, setValue]);

  /** Filter members by selected project (show project members) */
  const availableMembers = useMemo(() => {
    if (!watchedProjectId) return members;

    const selectedProject = projects.find((p) => p._id === watchedProjectId);
    if (!selectedProject || !selectedProject.members?.length) return members;

    const projectMemberIds = new Set(
      selectedProject.members.map((m) => (typeof m === "object" ? m._id : m))
    );

    // Prefer project members but show all with a separator
    const projectMembers = members.filter((m) => projectMemberIds.has(m._id));
    const otherMembers = members.filter((m) => !projectMemberIds.has(m._id));

    return [...projectMembers, ...otherMembers];
  }, [watchedProjectId, projects, members]);

  /** Submit handler */
  const onSubmit = async (data) => {
    try {
      setSubmitting(true);

      const payload = {
        ...data,
        progress: parseInt(data.progress, 10),
      };

      if (isEdit) {
        await taskService.updateTask(task._id, payload);
        toast.success("Task updated successfully! ✨");
      } else {
        await taskService.createTask(payload);
        toast.success("Task created successfully! 🎉");
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      const msg = error.response?.data?.message || `Failed to ${isEdit ? "update" : "create"} task`;
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  /** Shared input classes */
  const inputClass = `
    w-full h-11 px-4 rounded-xl
    bg-white/[0.04] border border-white/[0.08]
    text-sm text-slate-200 placeholder-slate-500
    focus:outline-none focus:border-green-500/40 focus:ring-1 focus:ring-green-500/20
    transition-all duration-200
  `;
  const labelClass = "block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5";
  const errorClass = "text-[11px] text-red-400 mt-1";

  /* ── Footer ─────────────────────────────────────────────── */
  const footer = (
    <>
      <button
        type="button"
        onClick={onClose}
        disabled={submitting}
        className="
          h-10 px-5 rounded-xl
          bg-white/[0.06] border border-white/[0.08]
          text-sm font-medium text-slate-300
          hover:bg-white/[0.1] hover:text-white
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-200
        "
      >
        Cancel
      </button>
      <button
        type="submit"
        form="task-form"
        disabled={submitting}
        className="
          h-10 px-5 rounded-xl
          bg-gradient-to-r from-green-500 to-emerald-600
          text-sm font-semibold text-white
          shadow-lg shadow-green-500/25
          hover:shadow-xl hover:shadow-green-500/30
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-200
          flex items-center gap-2
        "
      >
        {submitting ? (
          <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
        ) : isEdit ? (
          <Icons.Check className="w-4 h-4" />
        ) : (
          <Icons.Plus className="w-4 h-4" />
        )}
        {isEdit ? "Update Task" : "Create Task"}
      </button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={submitting ? undefined : onClose}
      title={
        <span className="flex items-center gap-2">
          <Icons.Task className="w-5 h-5 text-green-400" />
          {isEdit ? "Edit Task" : "Create New Task"}
        </span>
      }
      size="lg"
      footer={footer}
    >
      <form id="task-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        {/* ── Title ──────────────────────────────────────────── */}
        <div>
          <label htmlFor="task-title" className={labelClass}>
            Title <span className="text-red-400">*</span>
          </label>
          <input
            id="task-title"
            type="text"
            placeholder="Enter task title..."
            className={`${inputClass} ${errors.title ? "border-red-500/40 focus:border-red-500/40 focus:ring-red-500/20" : ""}`}
            {...register("title", {
              required: "Task title is required",
              minLength: { value: 3, message: "Must be at least 3 characters" },
              maxLength: { value: 200, message: "Must be less than 200 characters" },
            })}
          />
          {errors.title && <p className={errorClass}>{errors.title.message}</p>}
        </div>

        {/* ── Description ───────────────────────────────────── */}
        <div>
          <label htmlFor="task-description" className={labelClass}>
            Description
          </label>
          <textarea
            id="task-description"
            rows={3}
            placeholder="Describe the task requirements, acceptance criteria..."
            className={`${inputClass} h-auto py-3 resize-none scrollbar-thin`}
            {...register("description", {
              maxLength: { value: 2000, message: "Must be less than 2000 characters" },
            })}
          />
          {errors.description && <p className={errorClass}>{errors.description.message}</p>}
        </div>

        {/* ── Project + Assignee (side by side) ──────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Project */}
          <div>
            <label htmlFor="task-project" className={labelClass}>
              Project <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <select
                id="task-project"
                className={`${inputClass} appearance-none pr-10 ${errors.projectId ? "border-red-500/40" : ""}`}
                {...register("projectId", { required: "Project is required" })}
              >
                <option value="" className="bg-[#1e293b] text-slate-400">Select project...</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id} className="bg-[#1e293b] text-slate-200">
                    {p.projectName}
                  </option>
                ))}
              </select>
              <Icons.ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>
            {errors.projectId && <p className={errorClass}>{errors.projectId.message}</p>}
          </div>

          {/* Assignee */}
          <div>
            <label htmlFor="task-assignee" className={labelClass}>
              Assign To <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <select
                id="task-assignee"
                className={`${inputClass} appearance-none pr-10 ${errors.assignedTo ? "border-red-500/40" : ""}`}
                {...register("assignedTo", { required: "Assignee is required" })}
              >
                <option value="" className="bg-[#1e293b] text-slate-400">Select member...</option>
                {availableMembers.map((m) => (
                  <option key={m._id} value={m._id} className="bg-[#1e293b] text-slate-200">
                    {m.name}
                  </option>
                ))}
              </select>
              <Icons.ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>
            {errors.assignedTo && <p className={errorClass}>{errors.assignedTo.message}</p>}
          </div>
        </div>

        {/* ── Priority ──────────────────────────────────────── */}
        <div>
          <label className={labelClass}>
            <span className="flex items-center gap-1.5">
              <Icons.Flag className="w-3.5 h-3.5 text-slate-400" />
              Priority
            </span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {PRIORITY_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`
                  relative flex items-center justify-center gap-1.5
                  h-10 rounded-xl cursor-pointer
                  border text-sm font-medium
                  transition-all duration-200
                  ${
                    watchedPriority === opt.value
                      ? `${opt.activeBg} ${opt.color} ${opt.border} shadow-md`
                      : "bg-white/[0.02] border-white/[0.06] text-slate-400 hover:bg-white/[0.04] hover:text-white"
                  }
                `}
              >
                <input
                  type="radio"
                  value={opt.value}
                  className="sr-only"
                  {...register("priority")}
                />
                {watchedPriority === opt.value && (
                  <Icons.Flag className="w-3 h-3" />
                )}
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        {/* ── Status ────────────────────────────────────────── */}
        <div>
          <label className={labelClass}>Status</label>
          <div className="grid grid-cols-3 gap-2">
            {STATUS_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`
                  relative flex items-center justify-center gap-1.5
                  h-10 rounded-xl cursor-pointer
                  border text-sm font-medium
                  transition-all duration-200
                  ${
                    watchedStatus === opt.value
                      ? `${opt.bg} ${opt.color} ${opt.border} shadow-md`
                      : "bg-white/[0.02] border-white/[0.06] text-slate-400 hover:bg-white/[0.04] hover:text-white"
                  }
                `}
              >
                <input
                  type="radio"
                  value={opt.value}
                  className="sr-only"
                  {...register("status")}
                />
                {watchedStatus === opt.value && (
                  <span className={`w-1.5 h-1.5 rounded-full ${opt.dot}`} />
                )}
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        {/* ── Progress Slider ───────────────────────────────── */}
        <div>
          <label className={labelClass}>
            Progress — <span className="text-white font-semibold">{watchedProgress}%</span>
          </label>

          {/* Visual progress bar */}
          <div className="relative mb-2">
            <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${getProgressGradient(watchedProgress)} transition-all duration-300`}
                style={{ width: `${watchedProgress}%` }}
              />
            </div>
          </div>

          {/* Range input */}
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            className="
              w-full h-2 rounded-full appearance-none cursor-pointer
              bg-transparent
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-5
              [&::-webkit-slider-thumb]:h-5
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-green-400
              [&::-webkit-slider-thumb]:border-2
              [&::-webkit-slider-thumb]:border-[#1e293b]
              [&::-webkit-slider-thumb]:shadow-lg
              [&::-webkit-slider-thumb]:shadow-green-500/30
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:transition-all
              [&::-webkit-slider-thumb]:hover:scale-125
              [&::-moz-range-thumb]:w-5
              [&::-moz-range-thumb]:h-5
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-green-400
              [&::-moz-range-thumb]:border-2
              [&::-moz-range-thumb]:border-[#1e293b]
              [&::-moz-range-thumb]:cursor-pointer
            "
            {...register("progress", { valueAsNumber: true })}
          />

          {/* Quick percentage buttons */}
          <div className="flex items-center gap-1.5 mt-2">
            {[0, 25, 50, 75, 100].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setValue("progress", v)}
                className={`
                  px-2 py-0.5 rounded-md text-[10px] font-medium
                  border transition-all duration-150
                  ${
                    watchedProgress === v
                      ? "bg-green-500/10 text-green-400 border-green-500/20"
                      : "bg-white/[0.02] text-slate-500 border-white/[0.06] hover:bg-white/[0.04] hover:text-white"
                  }
                `}
              >
                {v}%
              </button>
            ))}
          </div>
        </div>

        {/* ── Deadline ──────────────────────────────────────── */}
        <div>
          <label htmlFor="task-deadline" className={labelClass}>
            Deadline
          </label>
          <input
            id="task-deadline"
            type="date"
            className={`${inputClass} [color-scheme:dark]`}
            {...register("deadline")}
          />
        </div>
      </form>
    </Modal>
  );
};

export default TaskForm;
