/**
 * ProjectForm.jsx
 * ─────────────────────────────────────────────────────────────
 * Create / Edit project form rendered inside an independent Modal overlay.
 * Fully self-contained to prevent common component dependency bugs.
 */

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import projectService from "../../services/projectService";
import userService from "../../services/userService";

/* ── Inline SVG Icons ─────────────────────────────────────── */
const Icons = {
  Project: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  ),
  Search: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  X: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
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
};

const STATUS_OPTIONS = [
  { value: "Active",    label: "Active",    color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
  { value: "Completed", label: "Completed", color: "text-blue-400",  bg: "bg-blue-500/10",  border: "border-blue-500/20"  },
  { value: "On Hold",   label: "On Hold",   color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
];

const getInitials = (name) =>
  name ? name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) : "?";

const nameToHue = (name) => {
  let hash = 0;
  for (let i = 0; i < (name || "").length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
};

const toInputDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toISOString().split("T")[0];
};

const ProjectForm = ({ isOpen, onClose, project = null, onSuccess }) => {
  if (!isOpen) return null; // Prevent invisible rendering loop states entirely

  const isEdit = !!project;
  const [allUsers, setAllUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [memberSearch, setMemberSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      projectName: "",
      description: "",
      startDate: toInputDate(new Date()),
      endDate: "",
      status: "Active",
    },
  });

  const watchedStatus = watch("status");

  // Inline debouncing hook setup
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(memberSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [memberSearch]);

  /** Load users list for member assignment */
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const res = await userService.getUsers();
        // Fallback checks to unpack raw arrays or wrapped structures smoothly
        const users = res?.data || res || [];
        setAllUsers(Array.isArray(users) ? users : []);
      } catch (err) {
        console.error("Error loading users database entries:", err);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  /** Pre-fill form values dynamically */
  useEffect(() => {
    if (project) {
      reset({
        projectName: project.name || project.projectName || "",
        description: project.description || "",
        startDate: toInputDate(project.startDate),
        endDate: toInputDate(project.endDate),
        status: project.status || "Active",
      });

      const existing = (project.members || []).map((m) =>
        typeof m === "object" ? m : { _id: m, name: "Member" }
      );
      setSelectedMembers(existing);
    } else {
      reset({
        projectName: "",
        description: "",
        startDate: toInputDate(new Date()),
        endDate: "",
        status: "Active",
      });
      setSelectedMembers([]);
    }
  }, [project, reset]);

  /** Filter user arrays natively */
  const filteredUsers = useMemo(() => {
    const selectedIds = new Set(selectedMembers.map((m) => m._id));
    return allUsers
      .filter((u) => !selectedIds.has(u._id))
      .filter(
        (u) =>
          !debouncedSearch ||
          u.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          u.email?.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
  }, [allUsers, selectedMembers, debouncedSearch]);

  const addMember = (user) => {
    setSelectedMembers((prev) => [...prev, user]);
    setMemberSearch("");
  };

  const removeMember = (userId) => {
    setSelectedMembers((prev) => prev.filter((m) => m._id !== userId));
  };

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);

      const payload = {
        name: data.projectName,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        status: data.status,
        members: selectedMembers.map((m) => m._id),
      };

      if (isEdit) {
        await projectService.updateProject(project._id, payload);
        toast.success("Project updated successfully! ✨");
      } else {
        await projectService.createProject(payload);
        toast.success("Project created successfully! 🎉");
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      const msg = error.response?.data?.message || `Failed to ${isEdit ? "update" : "create"} project`;
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = `
    w-full h-11 px-4 rounded-xl
    bg-[#0f172a]/60 border border-white/[0.08]
    text-sm text-slate-200 placeholder-slate-500
    focus:outline-none focus:border-green-500/40 focus:ring-1 focus:ring-green-500/20
    transition-all duration-200
  `;

  const labelClass = "block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5";
  const errorClass = "text-[11px] text-red-400 mt-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop Dimmer */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300" 
        onClick={submitting ? undefined : onClose}
      />

      {/* Modal Container Body */}
      <div className="animate-fade-in-up relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#1e293b] p-6 shadow-2xl scrollbar-thin">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-5">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Icons.Project className="w-5 h-5 text-green-400" />
            {isEdit ? "Edit Project" : "Create New Project"}
          </h3>
          <button 
            onClick={onClose}
            disabled={submitting}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
          >
            <Icons.X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Form */}
        <form id="project-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label htmlFor="projectName" className={labelClass}>
              Project Name <span className="text-red-400">*</span>
            </label>
            <input
              id="projectName"
              type="text"
              placeholder="Enter project name..."
              className={`${inputClass} ${errors.projectName ? "border-red-500/40 focus:border-red-500/40" : ""}`}
              {...register("projectName", { required: "Project name is required" })}
            />
            {errors.projectName && <p className={errorClass}>{errors.projectName.message}</p>}
          </div>

          <div>
            <label htmlFor="description" className={labelClass}>Description</label>
            <textarea
              id="description"
              rows={3}
              placeholder="Describe your project goals, scope, and objectives..."
              className={`${inputClass} h-auto py-3 resize-none`}
              {...register("description")}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className={labelClass}>Start Date *</label>
              <input
                id="startDate"
                type="date"
                className={`${inputClass} [color-scheme:dark]`}
                {...register("startDate", { required: "Start date is required" })}
              />
            </div>
            <div>
              <label htmlFor="endDate" className={labelClass}>End Date</label>
              <input
                id="endDate"
                type="date"
                className={`${inputClass} [color-scheme:dark]`}
                {...register("endDate")}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Status</label>
            <div className="grid grid-cols-3 gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`relative flex items-center justify-center gap-2 h-10 rounded-xl cursor-pointer border text-sm font-medium transition-all duration-200 ${watchedStatus === opt.value ? `${opt.bg} ${opt.color} ${opt.border} shadow-md` : "bg-[#0f172a]/30 border-white/[0.06] text-slate-400 hover:bg-[#0f172a]/50 hover:text-white"}`}
                >
                  <input type="radio" value={opt.value} className="sr-only" {...register("status")} />
                  {watchedStatus === opt.value && <Icons.Check className="w-3.5 h-3.5" />}
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className={labelClass}>Team Members Assignment</label>
            {selectedMembers.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedMembers.map((member) => {
                  const hue = nameToHue(member.name);
                  return (
                    <span key={member._id} className="inline-flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-lg bg-[#0f172a]/40 border border-white/[0.08] text-xs font-medium text-slate-300">
                      <div className="w-5 h-5 rounded-md flex items-center justify-center text-[8px] font-bold text-white" style={{ background: `linear-gradient(135deg, hsl(${hue}, 60%, 45%), hsl(${hue + 30}, 50%, 35%))` }}>
                        {getInitials(member.name)}
                      </div>
                      {member.name}
                      <button type="button" onClick={() => removeMember(member._id)} className="ml-0.5 text-slate-500 hover:text-red-400 transition-colors">
                        <Icons.X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}

            <div className="relative">
              <Icons.Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="Search members by name or email..."
                className={`${inputClass} pl-10`}
              />
            </div>

            {memberSearch && (
              <div className="mt-2 max-h-40 overflow-y-auto bg-[#0f172a] border border-white/[0.08] rounded-xl shadow-xl scrollbar-thin">
                {loadingUsers ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="w-5 h-5 rounded-full border-2 border-slate-600 border-t-green-400 animate-spin" />
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">No matching members found</p>
                ) : (
                  filteredUsers.map((u) => {
                    const hue = nameToHue(u.name);
                    return (
                      <button key={u._id} type="button" onClick={() => addMember(u)} className="w-full flex items-center gap-3 px-3.5 py-2.5 hover:bg-white/[0.04] transition-colors text-left">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-bold text-white" style={{ background: `linear-gradient(135deg, hsl(${hue}, 60%, 45%), hsl(${hue + 30}, 50%, 35%))` }}>
                          {getInitials(u.name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-white truncate">{u.name}</p>
                          <p className="text-[10px] text-slate-500 truncate">{u.email}</p>
                        </div>
                        <Icons.Plus className="w-4 h-4 text-green-400 flex-shrink-0" />
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </form>


        {/* Modal Footer Controls */}
        <div className="flex items-center justify-end gap-3 border-t border-white/[0.08] pt-4 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="h-10 px-5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-sm font-medium text-slate-300 hover:bg-white/[0.1] hover:text-white disabled:opacity-50 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="project-form"
            disabled={submitting}
            className="h-10 px-5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-sm font-semibold text-white shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 disabled:opacity-50 transition-all duration-200 flex items-center gap-2"
          >
            {submitting ? (
              <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : isEdit ? (
              <Icons.Check className="w-4 h-4" />
            ) : (
              <Icons.Plus className="w-4 h-4" />
            )}
            {isEdit ? "Update Project" : "Create Project"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProjectForm;