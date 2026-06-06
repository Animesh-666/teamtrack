/**
 * StatCard.jsx
 * ─────────────────────────────────────────────────────────────
 * Dashboard statistic card with icon, value, label, and trend.
 *
 * Features:
 *  - Animated counting effect on value change
 *  - Icon with colored glow background
 *  - Trend indicator (up / down / neutral)
 *  - Glassmorphism card styling
 *  - Hover lift animation
 *  - Customizable accent color
 */

import { useState, useEffect, useRef } from "react";

/* ── Trend icons ──────────────────────────────────────────── */

const TrendUpIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const TrendDownIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
    <polyline points="17 18 23 18 23 12" />
  </svg>
);

/* ── Color presets ────────────────────────────────────────── */
const COLORS = {
  green:  { bg: "bg-green-500/10",  text: "text-green-400",  glow: "shadow-green-500/10",  border: "border-green-500/10"  },
  blue:   { bg: "bg-blue-500/10",   text: "text-blue-400",   glow: "shadow-blue-500/10",   border: "border-blue-500/10"   },
  purple: { bg: "bg-purple-500/10", text: "text-purple-400", glow: "shadow-purple-500/10", border: "border-purple-500/10" },
  amber:  { bg: "bg-amber-500/10",  text: "text-amber-400",  glow: "shadow-amber-500/10",  border: "border-amber-500/10"  },
  red:    { bg: "bg-red-500/10",    text: "text-red-400",    glow: "shadow-red-500/10",    border: "border-red-500/10"    },
  cyan:   { bg: "bg-cyan-500/10",   text: "text-cyan-400",   glow: "shadow-cyan-500/10",   border: "border-cyan-500/10"   },
};

/* ── Animated counter hook ────────────────────────────────── */

const useAnimatedCounter = (target, duration = 800) => {
  const [count, setCount] = useState(0);
  const frameRef = useRef(null);

  useEffect(() => {
    const start = count;
    const diff = target - start;
    if (diff === 0) return;

    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(start + diff * eased));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target]); // eslint-disable-line react-hooks/exhaustive-deps

  return count;
};

/* ── Component ────────────────────────────────────────────── */

const StatCard = ({
  icon: Icon,
  label,
  value,
  suffix = "",
  trend,          // { value: "+12%", direction: "up" | "down" }
  color = "green",
  animate = true,
  onClick,
  className = "",
}) => {
  const c = COLORS[color] || COLORS.green;
  const animatedValue = useAnimatedCounter(
    typeof value === "number" && animate ? value : 0,
    800
  );

  /** Display value: animated number or string passthrough */
  const displayValue =
    typeof value === "number" && animate
      ? animatedValue
      : value;

  return (
    <div
      id={`stat-card-${label?.toLowerCase().replace(/\s+/g, "-")}`}
      onClick={onClick}
      className={`
        group relative p-5 rounded-2xl
        bg-[#1e293b]/60 backdrop-blur-xl
        border border-white/[0.06]
        shadow-lg ${c.glow}
        hover:shadow-xl hover:border-white/[0.1]
        hover:-translate-y-0.5
        transition-all duration-300 ease-out
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
    >
      {/* ── Ambient glow (top-right) ──────────────────────── */}
      <div
        className={`
          absolute -top-6 -right-6 w-24 h-24 rounded-full
          ${c.bg} blur-2xl opacity-0 group-hover:opacity-50
          transition-opacity duration-500
        `}
      />

      <div className="relative flex items-start justify-between">
        {/* ── Left: value & label ──────────────────────────── */}
        <div className="space-y-1">
          {/* Label */}
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            {label}
          </p>

          {/* Value */}
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-white tabular-nums tracking-tight">
              {displayValue}
            </span>
            {suffix && (
              <span className="text-sm font-medium text-slate-500">{suffix}</span>
            )}
          </div>

          {/* Trend */}
          {trend && (
            <div
              className={`
                flex items-center gap-1 mt-1
                ${trend.direction === "up" ? "text-green-400" : "text-red-400"}
              `}
            >
              {trend.direction === "up" ? (
                <TrendUpIcon className="w-3.5 h-3.5" />
              ) : (
                <TrendDownIcon className="w-3.5 h-3.5" />
              )}
              <span className="text-xs font-semibold">{trend.value}</span>
              <span className="text-[10px] text-slate-500 ml-0.5">vs last week</span>
            </div>
          )}
        </div>

        {/* ── Right: icon ──────────────────────────────────── */}
        {Icon && (
          <div
            className={`
              flex items-center justify-center
              w-12 h-12 rounded-xl
              ${c.bg} ${c.border} border
              shadow-lg ${c.glow}
              group-hover:scale-110
              transition-transform duration-300
            `}
          >
            <Icon className={`w-6 h-6 ${c.text}`} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
