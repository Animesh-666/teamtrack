/**
 * ReportForm.jsx
 * ─────────────────────────────────────────────────────────────
 * Daily report submission / editing form.
 *
 * Features:
 *  - Create new daily report or edit existing one
 *  - Rich textarea with character counter
 *  - Hours worked input with visual time indicator
 *  - Project selector (associates report with a project)
 *  - Date picker (defaults to today)
 *  - React Hook Form validation
 *  - Toast notifications on success/error
 *  - Loading state during submission
 *  - Can be used standalone or inside a Modal
 *  - Motivational prompt when textarea is empty
 */

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Modal from "../common/Modal";
import reportService from "../../services/reportService";
import projectService from "../../services/projectService";

/* ── Icons ────────────────────────────────────────────────── */

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
  Sparkles: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z" />
    </svg>
  ),
};

/* ── Motivational prompts ─────────────────────────────────── */

const PROMPTS = [
  "What progress did you make today?",
  "What tasks did you work on?",
  "Any blockers or challenges faced?",
  "What do you plan for tomorrow?",
  "Key learnings or highlights from today?",
];

/* ── Helpers ──────────────────────────────────────────────── */

const toInputDate = (date) => {
  if (!date) return new Date().toISOString().split("T")[0];
  return new Date(date).toISOString().split("T")[0];
};

/** Hour indicator segments (visual representation of hours) */
const getHourSegments = (hours) => {
  const maxSegments = 12;
  const filled = Math.min(Math.round(hours * 2) / 2, maxSegments); // half-hour precision
  return { filled, total: maxSegments };
};

/** Color based on hours worked */
const getHoursColor = (hours) => {
  if (hours >= 8) return { text: "text-green-400", bg: "bg-green-500/10", fill: "bg-green-400" };
  if (hours >= 5) return { text: "text-blue-400", bg: "bg-blue-500/10", fill: "bg-blue-400" };
  if (hours >= 3) return { text: "text-amber-400", bg: "bg-amber-500/10", fill: "bg-amber-400" };
  return { text: "text-slate-400", bg: "bg-white/[0.04]", fill: "bg-slate-400" };
};

const MAX_CHARS = 2000;

/* ── Component ────────────────────────────────────────────── */

const ReportForm = ({
  isOpen,
  onClose,
  report = null,
  onSuccess,
  inline = false, // If true, render without modal wrapper
}) => {
  const isEdit = !!report;

  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [promptIndex] = useState(Math.floor(Math.random() * PROMPTS.length));

  /** React Hook Form */
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      reportText: "",
      hoursWorked: "",
      projectId: "",
      date: toInputDate(new Date()),
    },
  });

  const watchedText = watch("reportText") || "";
  const watchedHours = watch("hoursWorked") || 0;
  const charCount = watchedText.length;
  const hoursNum = parseFloat(watchedHours) || 0;
  const hoursColor = getHoursColor(hoursNum);
  const segments = getHourSegments(hoursNum);

  /** Load projects */
  useEffect(() => {
    if (isOpen || inline) {
      const fetchProjects = async () => {
        try {
          setLoadingProjects(true);
          const res = await projectService.getProjects();
          setProjects(res?.data || []);
        } catch (err) {
          console.error("Error loading projects:", err);
        } finally {
          setLoadingProjects(false);
        }
      };
      fetchProjects();
    }
  }, [isOpen, inline]);

  /** Pre-fill for edit */
  useEffect(() => {
    if ((isOpen || inline) && report) {
      reset({
        reportText: report.reportText || "",
        hoursWorked: report.hoursWorked?.toString() || "",
        projectId: typeof report.projectId === "object" ? report.projectId._id : report.projectId || "",
        date: toInputDate(report.date),
      });
    } else if ((isOpen || inline) && !report) {
      reset({
        reportText: "",
        hoursWorked: "",
        projectId: "",
        date: toInputDate(new Date()),
      });
    }
  }, [isOpen, inline, report, reset]);

  /** Submit handler */
  const onSubmit = async (data) => {
    try {
      setSubmitting(true);

      const payload = {
        ...data,
        hoursWorked: parseFloat(data.hoursWorked) || 0,
      };

      if (isEdit) {
        await reportService.updateReport(report._id, payload);
        toast.success("Report updated successfully! ✨");
      } else {
        await reportService.submitReport(payload);
        toast.success("Daily report submitted! 🎉");
      }

      onSuccess?.();
      if (!inline) onClose?.();
    } catch (error) {
      const msg = error.response?.data?.message || `Failed to ${isEdit ? "update" : "submit"} report`;
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

  /* ── Form content ───────────────────────────────────────── */
  const formContent = (
    <form
      id="report-form"
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
    >
      {/* ── Project Selector ──────────────────────────────── */}
      <div>
        <label htmlFor="report-project" className={labelClass}>
          Project
        </label>
        <div className="relative">
          <select
            id="report-project"
            className={`${inputClass} appearance-none pr-10`}
            {...register("projectId")}
          >
            <option value="" className="bg-[#1e293b] text-slate-400">
              Select project (optional)
            </option>
            {projects.map((p) => (
              <option key={p._id} value={p._id} className="bg-[#1e293b] text-slate-200">
                {p.projectName}
              </option>
            ))}
          </select>
          <Icons.ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        </div>
      </div>

      {/* ── Report Text ───────────────────────────────────── */}
      <div>
        <label htmlFor="report-text" className={labelClass}>
          Report <span className="text-red-400">*</span>
        </label>

        {/* Motivational prompt */}
        {!watchedText && (
          <div className="flex items-center gap-2 mb-2 px-1">
            <Icons.Sparkles className="w-3.5 h-3.5 text-green-400/60 flex-shrink-0" />
            <span className="text-[11px] text-slate-500 italic">{PROMPTS[promptIndex]}</span>
          </div>
        )}

        <div className="relative">
          <textarea
            id="report-text"
            rows={6}
            placeholder="Write about your progress, accomplishments, blockers, and plans..."
            className={`
              ${inputClass} h-auto py-3 resize-none scrollbar-thin
              ${errors.reportText ? "border-red-500/40 focus:border-red-500/40 focus:ring-red-500/20" : ""}
            `}
            maxLength={MAX_CHARS}
            {...register("reportText", {
              required: "Report text is required",
              minLength: { value: 10, message: "Report must be at least 10 characters" },
              maxLength: { value: MAX_CHARS, message: `Must be less than ${MAX_CHARS} characters` },
            })}
          />

          {/* Character counter */}
          <div className="absolute bottom-2.5 right-3 flex items-center gap-1.5">
            <span
              className={`
                text-[10px] tabular-nums
                ${charCount > MAX_CHARS * 0.9 ? "text-red-400" : charCount > MAX_CHARS * 0.7 ? "text-amber-400" : "text-slate-600"}
              `}
            >
              {charCount}/{MAX_CHARS}
            </span>
          </div>
        </div>
        {errors.reportText && <p className={errorClass}>{errors.reportText.message}</p>}
      </div>

      {/* ── Hours Worked + Date (side by side) ─────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Hours worked */}
        <div>
          <label htmlFor="report-hours" className={labelClass}>
            Hours Worked <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <Icons.Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              id="report-hours"
              type="number"
              min="0"
              max="24"
              step="0.5"
              placeholder="0"
              className={`
                ${inputClass} pl-10 pr-14
                [appearance:textfield]
                [&::-webkit-outer-spin-button]:appearance-none
                [&::-webkit-inner-spin-button]:appearance-none
                ${errors.hoursWorked ? "border-red-500/40" : ""}
              `}
              {...register("hoursWorked", {
                required: "Hours worked is required",
                min: { value: 0.5, message: "Must be at least 0.5 hours" },
                max: { value: 24, message: "Cannot exceed 24 hours" },
              })}
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-500">hrs</span>
          </div>
          {errors.hoursWorked && <p className={errorClass}>{errors.hoursWorked.message}</p>}

          {/* Hour segments visual */}
          {hoursNum > 0 && (
            <div className="mt-2.5 space-y-1.5">
              <div className="flex items-center gap-1">
                {Array.from({ length: segments.total }).map((_, i) => (
                  <div
                    key={i}
                    className={`
                      h-1.5 flex-1 rounded-full transition-all duration-300
                      ${i < Math.ceil(segments.filled) ? hoursColor.fill : "bg-white/[0.06]"}
                      ${i < Math.ceil(segments.filled) ? "opacity-100" : "opacity-50"}
                    `}
                    style={{ transitionDelay: `${i * 30}ms` }}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-medium ${hoursColor.text}`}>
                  {hoursNum}h logged
                </span>
                <span className="text-[10px] text-slate-600">
                  {hoursNum >= 8 ? "Full day 🔥" : hoursNum >= 5 ? "Good progress" : hoursNum >= 3 ? "Keep going!" : ""}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Date */}
        <div>
          <label htmlFor="report-date" className={labelClass}>
            Date <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <Icons.Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              id="report-date"
              type="date"
              className={`
                ${inputClass} pl-10 [color-scheme:dark]
                ${errors.date ? "border-red-500/40" : ""}
              `}
              {...register("date", { required: "Date is required" })}
            />
          </div>
          {errors.date && <p className={errorClass}>{errors.date.message}</p>}
        </div>
      </div>

      {/* ── Quick hours preset buttons ────────────────────── */}
      <div>
        <span className="text-[10px] text-slate-600 block mb-1.5">Quick set hours:</span>
        <div className="flex flex-wrap gap-1.5">
          {[2, 4, 6, 8, 10, 12].map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => {
                const el = document.getElementById("report-hours");
                if (el) {
                  // Update React Hook Form value
                  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
                  nativeInputValueSetter.call(el, h.toString());
                  el.dispatchEvent(new Event("input", { bubbles: true }));
                }
              }}
              className={`
                px-2.5 py-1 rounded-lg text-[11px] font-medium
                border transition-all duration-150
                ${
                  hoursNum === h
                    ? `${hoursColor.bg} ${hoursColor.text} border-current/20`
                    : "bg-white/[0.02] text-slate-500 border-white/[0.06] hover:bg-white/[0.04] hover:text-white"
                }
              `}
            >
              {h}h
            </button>
          ))}
        </div>
      </div>

      {/* ── Inline submit (when not in modal) ─────────────── */}
      {inline && (
        <button
          type="submit"
          disabled={submitting}
          className="
            w-full h-11 rounded-xl
            bg-gradient-to-r from-green-500 to-emerald-600
            text-sm font-semibold text-white
            shadow-lg shadow-green-500/25
            hover:shadow-xl hover:shadow-green-500/30
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
            flex items-center justify-center gap-2
          "
        >
          {submitting ? (
            <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : (
            <Icons.Check className="w-4 h-4" />
          )}
          {isEdit ? "Update Report" : "Submit Report"}
        </button>
      )}
    </form>
  );

  /* ── Inline mode (no modal) ─────────────────────────────── */
  if (inline) {
    return (
      <div className="
        p-5 rounded-2xl
        bg-[#1e293b]/60 backdrop-blur-xl
        border border-white/[0.06]
        shadow-lg
      ">
        <div className="flex items-center gap-2 mb-4">
          <Icons.FileText className="w-5 h-5 text-green-400" />
          <h3 className="text-sm font-semibold text-white">
            {isEdit ? "Edit Report" : "Submit Daily Report"}
          </h3>
        </div>
        {formContent}
      </div>
    );
  }

  /* ── Modal mode ─────────────────────────────────────────── */
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
        form="report-form"
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
        {isEdit ? "Update Report" : "Submit Report"}
      </button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={submitting ? undefined : onClose}
      title={
        <span className="flex items-center gap-2">
          <Icons.FileText className="w-5 h-5 text-green-400" />
          {isEdit ? "Edit Report" : "Submit Daily Report"}
        </span>
      }
      size="md"
      footer={footer}
    >
      {formContent}
    </Modal>
  );
};

export default ReportForm;