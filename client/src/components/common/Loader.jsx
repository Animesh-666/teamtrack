/**
 * Loader.jsx
 * ─────────────────────────────────────────────────────────────
 * Full-screen and inline loading indicators for TeamTrack.
 *
 * Features:
 *  - Full-screen overlay variant (default)
 *  - Inline / embedded variant via `inline` prop
 *  - Animated concentric rings with green glow
 *  - Pulsing dot trail animation
 *  - Optional custom message
 */

const Loader = ({ inline = false, message = "Loading...", size = "default" }) => {
  /** Size presets */
  const sizes = {
    small:   { ring: "w-8 h-8",  dot: "w-1.5 h-1.5", text: "text-xs" },
    default: { ring: "w-14 h-14", dot: "w-2 h-2",     text: "text-sm" },
    large:   { ring: "w-20 h-20", dot: "w-2.5 h-2.5", text: "text-base" },
  };
  const s = sizes[size] || sizes.default;

  /** Spinner element */
  const spinner = (
    <div className="flex flex-col items-center gap-4">
      {/* Animated rings */}
      <div className="relative flex items-center justify-center">
        {/* Outer glow */}
        <div className={`absolute ${s.ring} rounded-full bg-green-500/10 blur-xl animate-pulse`} />

        {/* Outer ring */}
        <div
          className={`
            ${s.ring} rounded-full
            border-2 border-white/[0.08]
            border-t-green-400 border-r-green-400/40
            animate-spin
          `}
          style={{ animationDuration: "1s" }}
        />

        {/* Inner ring (counter-rotate) */}
        <div
          className={`
            absolute
            ${size === "small" ? "w-5 h-5" : size === "large" ? "w-12 h-12" : "w-8 h-8"}
            rounded-full
            border-2 border-white/[0.06]
            border-b-emerald-400 border-l-emerald-400/40
            animate-spin
          `}
          style={{ animationDuration: "1.5s", animationDirection: "reverse" }}
        />

        {/* Center dot */}
        <div className={`
          absolute ${s.dot} rounded-full
          bg-green-400 shadow-[0_0_10px_rgba(34,197,94,0.6)]
          animate-pulse
        `} />
      </div>

      {/* Pulsing dot trail */}
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`
              ${s.dot} rounded-full bg-green-400/80
              animate-bounce
            `}
            style={{
              animationDelay: `${i * 0.15}s`,
              animationDuration: "0.6s",
            }}
          />
        ))}
      </div>

      {/* Message */}
      {message && (
        <p className={`${s.text} font-medium text-slate-400 animate-pulse`}>
          {message}
        </p>
      )}
    </div>
  );

  /* ── Inline mode ────────────────────────────────────────── */
  if (inline) {
    return (
      <div className="flex items-center justify-center py-12">
        {spinner}
      </div>
    );
  }

  /* ── Full-screen overlay mode ───────────────────────────── */
  return (
    <div
      id="loader-overlay"
      className="
        fixed inset-0 z-[100]
        flex items-center justify-center
        bg-[#0f172a]/90 backdrop-blur-md
      "
    >
      {/* Ambient glow blobs */}
      <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-green-500/5 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute bottom-1/3 right-1/3 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "0.5s" }}
      />

      {spinner}
    </div>
  );
};

export default Loader;
