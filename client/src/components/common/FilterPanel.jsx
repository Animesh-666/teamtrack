/**
 * FilterPanel.jsx
 * ─────────────────────────────────────────────────────────────
 * Reusable filter panel for lists (tasks, projects, reports).
 *
 * Features:
 *  - Collapsible panel with animation
 *  - Configurable filter groups via `filters` prop
 *  - Active filter badges with remove action
 *  - Reset all button
 *  - Responsive grid layout
 *  - Glassmorphism card styling
 */

import { useState, useMemo } from "react";

/* ── Icons ────────────────────────────────────────────────── */

const FilterIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

const ChevronDownIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const XIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

/* ── Component ────────────────────────────────────────────── */

/**
 * @param {Object} props
 * @param {Array}  props.filters - Array of filter configs:
 *   {
 *     key:         string,       // unique key for the filter
 *     label:       string,       // display label
 *     type:        "select" | "date",
 *     options?:    Array<{ value: string, label: string }>,  // for "select"
 *     placeholder?: string
 *   }
 * @param {Object}   props.values   - Current filter values { [key]: value }
 * @param {Function} props.onChange  - Callback (key, value) => void
 * @param {Function} props.onReset  - Callback to reset all filters
 * @param {string}   props.className
 */
const FilterPanel = ({
  filters = [],
  values = {},
  onChange,
  onReset,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  /** Count active filters */
  const activeCount = useMemo(
    () => Object.values(values).filter((v) => v !== "" && v !== null && v !== undefined).length,
    [values]
  );

  /** Active filter badges */
  const activeBadges = useMemo(() => {
    return filters
      .filter((f) => values[f.key] !== "" && values[f.key] !== null && values[f.key] !== undefined)
      .map((f) => {
        let displayValue = values[f.key];
        if (f.type === "select" && f.options) {
          const opt = f.options.find((o) => o.value === values[f.key]);
          displayValue = opt?.label || values[f.key];
        }
        return { key: f.key, label: f.label, value: displayValue };
      });
  }, [filters, values]);

  return (
    <div className={className}>
      {/* ── Toggle row ──────────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Filter toggle button */}
        <button
          id="filter-toggle"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`
            flex items-center gap-2 px-4 h-10 rounded-xl
            text-sm font-medium transition-all duration-200
            ${
              isOpen || activeCount > 0
                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                : "bg-white/[0.04] text-slate-400 border border-white/[0.08] hover:bg-white/[0.06] hover:text-white"
            }
          `}
        >
          <FilterIcon className="w-4 h-4" />
          <span>Filters</span>
          {activeCount > 0 && (
            <span className="
              ml-1 min-w-[20px] h-5 px-1.5
              flex items-center justify-center
              rounded-full bg-green-500 text-[11px] font-bold text-white
            ">
              {activeCount}
            </span>
          )}
          <ChevronDownIcon
            className={`
              w-3.5 h-3.5 transition-transform duration-200
              ${isOpen ? "rotate-180" : ""}
            `}
          />
        </button>

        {/* Active filter badges */}
        {activeBadges.map((badge) => (
          <span
            key={badge.key}
            className="
              inline-flex items-center gap-1.5 px-3 h-8
              rounded-lg bg-white/[0.06] border border-white/[0.08]
              text-xs font-medium text-slate-300
              animate-fade-in
            "
          >
            <span className="text-slate-500">{badge.label}:</span>
            <span className="text-green-400">{badge.value}</span>
            <button
              onClick={() => onChange?.(badge.key, "")}
              className="ml-0.5 text-slate-500 hover:text-white transition-colors"
              aria-label={`Remove ${badge.label} filter`}
            >
              <XIcon className="w-3 h-3" />
            </button>
          </span>
        ))}

        {/* Reset all */}
        {activeCount > 0 && (
          <button
            id="filter-reset"
            onClick={onReset}
            className="
              text-xs font-medium text-slate-500 hover:text-red-400
              transition-colors duration-150 underline underline-offset-2
            "
          >
            Reset all
          </button>
        )}
      </div>

      {/* ── Filter panel ────────────────────────────────────── */}
      <div
        className={`
          overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${isOpen ? "max-h-96 opacity-100 mt-4" : "max-h-0 opacity-0 mt-0"}
        `}
      >
        <div className="
          p-4 rounded-xl
          bg-white/[0.02] border border-white/[0.06]
          grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4
        ">
          {filters.map((filter) => (
            <div key={filter.key}>
              {/* Label */}
              <label
                htmlFor={`filter-${filter.key}`}
                className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5"
              >
                {filter.label}
              </label>

              {/* Select type */}
              {filter.type === "select" && (
                <div className="relative">
                  <select
                    id={`filter-${filter.key}`}
                    value={values[filter.key] || ""}
                    onChange={(e) => onChange?.(filter.key, e.target.value)}
                    className="
                      w-full h-10 px-3 pr-8 rounded-lg appearance-none
                      bg-white/[0.04] border border-white/[0.08]
                      text-sm text-slate-200
                      focus:outline-none focus:border-green-500/40 focus:ring-1 focus:ring-green-500/20
                      transition-all duration-200
                    "
                  >
                    <option value="" className="bg-[#1e293b] text-slate-400">
                      {filter.placeholder || `All ${filter.label}`}
                    </option>
                    {filter.options?.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-[#1e293b] text-slate-200">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                </div>
              )}

              {/* Date type */}
              {filter.type === "date" && (
                <input
                  id={`filter-${filter.key}`}
                  type="date"
                  value={values[filter.key] || ""}
                  onChange={(e) => onChange?.(filter.key, e.target.value)}
                  className="
                    w-full h-10 px-3 rounded-lg
                    bg-white/[0.04] border border-white/[0.08]
                    text-sm text-slate-200
                    focus:outline-none focus:border-green-500/40 focus:ring-1 focus:ring-green-500/20
                    transition-all duration-200
                    [color-scheme:dark]
                  "
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
