/**
 * EmptyState.jsx
 * ─────────────────────────────────────────────────────────────
 * Empty state placeholder when no data is available.
 *
 * Features:
 *  - Animated SVG illustration with floating elements
 *  - Preset variants (tasks, projects, reports, notifications, search, generic)
 *  - Customizable title, description, and CTA button
 *  - Subtle ambient glow animation
 *  - Responsive sizing
 */

/* ── Illustration component ───────────────────────────────── */

const EmptyIllustration = ({ variant }) => {
  const baseClasses = "transition-all duration-700";

  return (
    <div className="relative w-40 h-40 mx-auto mb-6">
      {/* Ambient glow */}
      <div className="absolute inset-0 bg-green-500/5 rounded-full blur-3xl animate-pulse" />

      <svg
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10"
      >
        {/* Base circle */}
        <circle cx="80" cy="80" r="60" fill="#1e293b" stroke="#334155" strokeWidth="1" />
        <circle cx="80" cy="80" r="60" fill="url(#emptyGradient)" opacity="0.3" />

        {variant === "tasks" && (
          <>
            {/* Checklist */}
            <rect x="50" y="50" width="60" height="60" rx="8" fill="#0f172a" stroke="#334155" strokeWidth="1.5">
              <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite" />
            </rect>
            <line x1="60" y1="68" x2="72" y2="68" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
            <line x1="60" y1="80" x2="78" y2="80" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
            <line x1="60" y1="92" x2="68" y2="92" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
            {/* Floating checkmark */}
            <g transform="translate(95, 42)">
              <circle cx="10" cy="10" r="10" fill="#22c55e" opacity="0.2">
                <animate attributeName="r" values="10;12;10" dur="2s" repeatCount="indefinite" />
              </circle>
              <polyline points="6,10 9,13 14,7" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
              </polyline>
            </g>
          </>
        )}

        {variant === "projects" && (
          <>
            {/* Folder */}
            <path d="M45 60 L45 100 Q45 105 50 105 L110 105 Q115 105 115 100 L115 65 Q115 60 110 60 L80 60 L75 55 L50 55 Q45 55 45 60Z"
              fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
            <rect x="55" y="72" width="30" height="3" rx="1.5" fill="#475569">
              <animate attributeName="width" values="30;35;30" dur="3s" repeatCount="indefinite" />
            </rect>
            <rect x="55" y="82" width="40" height="3" rx="1.5" fill="#475569" opacity="0.6" />
            <rect x="55" y="92" width="20" height="3" rx="1.5" fill="#475569" opacity="0.4" />
            {/* Star */}
            <g transform="translate(100, 40)">
              <polygon points="10,0 12.5,7 20,7 14,11.5 16.5,19 10,14 3.5,19 6,11.5 0,7 7.5,7"
                fill="#22c55e" opacity="0.3">
                <animateTransform attributeName="transform" type="rotate" values="0 10 10;360 10 10" dur="8s" repeatCount="indefinite" />
              </polygon>
            </g>
          </>
        )}

        {variant === "notifications" && (
          <>
            {/* Bell */}
            <path d="M80 55 Q65 55 62 72 L62 85 L58 90 L102 90 L98 85 L98 72 Q95 55 80 55Z"
              fill="#0f172a" stroke="#334155" strokeWidth="1.5">
              <animateTransform attributeName="transform" type="rotate" values="-3 80 55;3 80 55;-3 80 55" dur="2s" repeatCount="indefinite" />
            </path>
            <line x1="80" y1="45" x2="80" y2="55" stroke="#334155" strokeWidth="2" />
            <circle cx="80" cy="44" r="3" fill="#334155" />
            <path d="M74 92 Q77 98 80 98 Q83 98 86 92" stroke="#334155" strokeWidth="1.5" fill="none" />
            {/* Zzz */}
            <text x="100" y="55" fill="#475569" fontSize="12" fontWeight="bold" opacity="0.5">
              z
              <animate attributeName="opacity" values="0;0.5;0" dur="2s" repeatCount="indefinite" />
            </text>
            <text x="108" y="48" fill="#475569" fontSize="10" fontWeight="bold" opacity="0.3">
              z
              <animate attributeName="opacity" values="0;0.3;0" dur="2s" repeatCount="indefinite" begin="0.5s" />
            </text>
          </>
        )}

        {variant === "search" && (
          <>
            {/* Magnifying glass */}
            <circle cx="75" cy="72" r="22" fill="none" stroke="#334155" strokeWidth="2.5">
              <animate attributeName="r" values="22;24;22" dur="3s" repeatCount="indefinite" />
            </circle>
            <line x1="91" y1="88" x2="108" y2="105" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
            {/* Question mark */}
            <text x="69" y="80" fill="#475569" fontSize="22" fontWeight="bold" opacity="0.6">?</text>
          </>
        )}

        {(variant === "reports" || variant === "generic" || !variant) && (
          <>
            {/* Document */}
            <rect x="50" y="45" width="50" height="70" rx="6" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
            <rect x="60" y="58" width="30" height="3" rx="1.5" fill="#475569" />
            <rect x="60" y="68" width="25" height="3" rx="1.5" fill="#475569" opacity="0.7" />
            <rect x="60" y="78" width="20" height="3" rx="1.5" fill="#475569" opacity="0.5" />
            <rect x="60" y="88" width="28" height="3" rx="1.5" fill="#475569" opacity="0.3" />
            {/* Floating plus */}
            <g transform="translate(105, 40)">
              <circle cx="12" cy="12" r="12" fill="#22c55e" opacity="0.15">
                <animate attributeName="opacity" values="0.1;0.25;0.1" dur="2.5s" repeatCount="indefinite" />
              </circle>
              <line x1="12" y1="7" x2="12" y2="17" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
              <line x1="7" y1="12" x2="17" y2="12" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
            </g>
          </>
        )}

        {/* Gradient definition */}
        <defs>
          <radialGradient id="emptyGradient" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>

      {/* Floating dots */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-green-400/30"
          style={{
            top: `${20 + i * 25}%`,
            right: `${5 + i * 10}%`,
            animation: `float ${2 + i * 0.5}s ease-in-out infinite`,
            animationDelay: `${i * 0.3}s`,
          }}
        />
      ))}
    </div>
  );
};

/* ── Preset messages ──────────────────────────────────────── */

const PRESETS = {
  tasks: {
    title: "No tasks yet",
    description: "Create your first task to start tracking progress and boosting productivity.",
    actionLabel: "Create Task",
  },
  projects: {
    title: "No projects found",
    description: "Start a new project to organize your team's work and track milestones.",
    actionLabel: "New Project",
  },
  reports: {
    title: "No reports submitted",
    description: "Submit your daily report to keep your team updated on your progress.",
    actionLabel: "Write Report",
  },
  notifications: {
    title: "All caught up!",
    description: "You have no notifications right now. We'll let you know when something happens.",
    actionLabel: null,
  },
  search: {
    title: "No results found",
    description: "Try adjusting your search terms or clearing filters to find what you're looking for.",
    actionLabel: "Clear Search",
  },
  generic: {
    title: "Nothing here yet",
    description: "There's no data to display at the moment.",
    actionLabel: null,
  },
};

/* ── Component ────────────────────────────────────────────── */

const EmptyState = ({
  variant = "generic",
  title,
  description,
  actionLabel,
  onAction,
  icon,
  className = "",
}) => {
  const preset = PRESETS[variant] || PRESETS.generic;

  const finalTitle = title || preset.title;
  const finalDescription = description || preset.description;
  const finalActionLabel = actionLabel || preset.actionLabel;

  return (
    <div
      id="empty-state"
      className={`
        flex flex-col items-center justify-center
        py-16 px-6 text-center
        animate-fade-in
        ${className}
      `}
    >
      {/* Illustration */}
      <EmptyIllustration variant={variant} />

      {/* Title */}
      <h3 className="text-xl font-bold text-white mb-2">
        {finalTitle}
      </h3>

      {/* Description */}
      <p className="text-sm text-slate-400 max-w-sm leading-relaxed mb-6">
        {finalDescription}
      </p>

      {/* CTA Button */}
      {finalActionLabel && onAction && (
        <button
          id="empty-state-action"
          onClick={onAction}
          className="
            inline-flex items-center gap-2 px-5 h-11 rounded-xl
            bg-gradient-to-r from-green-500 to-emerald-600
            text-sm font-semibold text-white
            shadow-lg shadow-green-500/25
            hover:shadow-xl hover:shadow-green-500/30
            hover:-translate-y-0.5
            active:translate-y-0
            transition-all duration-200
          "
        >
          <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {finalActionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
