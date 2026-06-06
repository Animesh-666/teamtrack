/**
 * ProgressBar.jsx
 * ─────────────────────────────────────────────────────────────
 * Animated progress bar with gradient fill and percentage label.
 *
 * Features:
 *  - Smooth width transition animation
 *  - Dynamic gradient based on progress value
 *  - Shimmer/shine animation on the fill
 *  - Multiple size variants (xs, sm, md, lg)
 *  - Optional percentage label (inside or outside)
 *  - Custom color override
 *  - Glow effect for high completion
 */

import { useEffect, useState } from "react";

/* ── Color helpers ────────────────────────────────────────── */

/**
 * Returns a gradient class based on progress percentage.
 * Low = red/orange, Medium = yellow/amber, High = green.
 */
const getGradient = (value) => {
  if (value >= 80) return "from-green-400 to-emerald-500";
  if (value >= 50) return "from-yellow-400 to-amber-500";
  if (value >= 25) return "from-orange-400 to-amber-500";
  return "from-red-400 to-orange-500";
};

const getGlow = (value) => {
  if (value >= 80) return "shadow-green-500/30";
  if (value >= 50) return "shadow-yellow-500/20";
  return "shadow-transparent";
};

/* ── Size presets ─────────────────────────────────────────── */
const SIZES = {
  xs: { track: "h-1",   bar: "h-1",   text: "text-[10px]", showInner: false },
  sm: { track: "h-1.5", bar: "h-1.5", text: "text-[11px]", showInner: false },
  md: { track: "h-2.5", bar: "h-2.5", text: "text-xs",     showInner: false },
  lg: { track: "h-5",   bar: "h-5",   text: "text-xs",     showInner: true  },
};

/* ── Component ────────────────────────────────────────────── */

const ProgressBar = ({
  value = 0,
  max = 100,
  size = "md",
  showLabel = true,
  labelPosition = "right", // "right" | "inside" | "top"
  shimmer = true,
  customGradient,
  className = "",
  animate = true,
}) => {
  const [displayValue, setDisplayValue] = useState(animate ? 0 : value);

  /** Animate the bar on mount / value change */
  useEffect(() => {
    if (!animate) {
      setDisplayValue(value);
      return;
    }

    // Delay the animation slightly so the DOM settles
    const timer = setTimeout(() => {
      setDisplayValue(value);
    }, 100);

    return () => clearTimeout(timer);
  }, [value, animate]);

  /** Clamp percentage */
  const percentage = Math.min(100, Math.max(0, (displayValue / max) * 100));
  const rawPercentage = Math.min(100, Math.max(0, (value / max) * 100));

  const s = SIZES[size] || SIZES.md;
  const gradient = customGradient || getGradient(rawPercentage);
  const glow = getGlow(rawPercentage);

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Top label */}
      {showLabel && labelPosition === "top" && (
        <div className="w-full flex items-center justify-between mb-1">
          <span className={`${s.text} font-medium text-slate-400`}>Progress</span>
          <span className={`${s.text} font-semibold text-white`}>
            {Math.round(rawPercentage)}%
          </span>
        </div>
      )}

      {/* Track */}
      <div
        className={`
          relative flex-1 ${s.track} rounded-full overflow-hidden
          bg-white/[0.06]
        `}
      >
        {/* Fill bar */}
        <div
          className={`
            ${s.bar} rounded-full bg-gradient-to-r ${gradient}
            shadow-lg ${glow}
            transition-all duration-700 ease-out
            relative overflow-hidden
          `}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={rawPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          {/* Shimmer overlay */}
          {shimmer && percentage > 5 && (
            <div
              className="
                absolute inset-0
                bg-gradient-to-r from-transparent via-white/20 to-transparent
                animate-shimmer
              "
              style={{
                backgroundSize: "200% 100%",
              }}
            />
          )}

          {/* Inner label for lg size */}
          {s.showInner && showLabel && labelPosition === "inside" && percentage > 15 && (
            <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-white drop-shadow-sm">
              {Math.round(rawPercentage)}%
            </span>
          )}
        </div>
      </div>

      {/* Right label */}
      {showLabel && labelPosition === "right" && (
        <span className={`${s.text} font-semibold text-white tabular-nums min-w-[2.5rem] text-right`}>
          {Math.round(rawPercentage)}%
        </span>
      )}
    </div>
  );
};

export default ProgressBar;
