import { Link, useNavigate } from "react-router-dom";

const Icons = {
  Home: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  ArrowLeft: (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  ),
};

const FLOATING_ELEMENTS = [
  { size: "w-72 h-72", position: "top-[10%] left-[5%]", color: "bg-green-500/[0.03]", delay: "0s", duration: "8s" },
  { size: "w-96 h-96", position: "top-[60%] right-[8%]", color: "bg-emerald-500/[0.03]", delay: "2s", duration: "10s" },
  { size: "w-64 h-64", position: "bottom-[15%] left-[20%]", color: "bg-cyan-500/[0.02]", delay: "4s", duration: "12s" },
  { size: "w-48 h-48", position: "top-[25%] right-[25%]", color: "bg-purple-500/[0.02]", delay: "1s", duration: "9s" },
  { size: "w-56 h-56", position: "bottom-[30%] right-[35%]", color: "bg-blue-500/[0.02]", delay: "3s", duration: "11s" },
];

const GridDots = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage: "radial-gradient(circle, #94a3b8 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }}
    />
  </div>
);

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-[#0f172a] flex items-center justify-center overflow-hidden px-4">
      <GridDots />

      {FLOATING_ELEMENTS.map((el, i) => (
        <div
          key={i}
          className={`absolute ${el.size} ${el.position} ${el.color} rounded-full blur-3xl pointer-events-none`}
          style={{
            animation: `notfound-float ${el.duration} ease-in-out infinite`,
            animationDelay: el.delay,
          }}
        />
      ))}

      <div className="absolute w-[500px] h-[500px] rounded-full border border-white/[0.02] pointer-events-none"
        style={{ animation: "notfound-spin 30s linear infinite" }}
      >
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-green-500/20" />
      </div>
      <div className="absolute w-[700px] h-[700px] rounded-full border border-white/[0.015] pointer-events-none"
        style={{ animation: "notfound-spin 45s linear infinite reverse" }}
      >
        <div className="absolute -bottom-1 right-1/4 w-2 h-2 rounded-full bg-emerald-400/15" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-lg animate-fade-in-up">
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-48 h-48 bg-green-500/[0.08] rounded-full blur-3xl animate-pulse" />
          </div>

          <h1
            className="relative text-[10rem] sm:text-[12rem] font-black leading-none tracking-tighter select-none"
            style={{
              background: "linear-gradient(135deg, #22c55e 0%, #10b981 30%, #06b6d4 60%, #8b5cf6 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "notfound-gradient 6s ease-in-out infinite",
              backgroundSize: "200% 200%",
            }}
          >
            404
          </h1>

          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-8 rounded-full"
            style={{
              background: "radial-gradient(ellipse, rgba(34,197,94,0.1) 0%, transparent 70%)",
            }}
          />
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight">
          Page Not Found
        </h2>

        <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-md mb-8">
          The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>

        <div className="w-16 h-px bg-gradient-to-r from-transparent via-green-500/30 to-transparent mb-8" />

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Link
            to="/dashboard"
            className="
              group inline-flex items-center justify-center gap-2.5
              w-full sm:w-auto px-7 h-12 rounded-xl
              bg-gradient-to-r from-green-500 to-emerald-600
              text-sm font-semibold text-white
              shadow-lg shadow-green-500/25
              hover:shadow-xl hover:shadow-green-500/35
              hover:-translate-y-0.5
              active:translate-y-0
              transition-all duration-200
            "
          >
            <Icons.Home className="w-4.5 h-4.5 group-hover:scale-110 transition-transform duration-200" />
            Go Back Home
          </Link>

          <button
            onClick={() => navigate(-1)}
            className="
              group inline-flex items-center justify-center gap-2.5
              w-full sm:w-auto px-7 h-12 rounded-xl
              bg-[#1e293b]/60 backdrop-blur-xl
              border border-white/[0.08]
              text-sm font-semibold text-slate-300
              hover:bg-[#1e293b] hover:text-white hover:border-white/[0.12]
              hover:-translate-y-0.5
              active:translate-y-0
              transition-all duration-200
            "
          >
            <Icons.ArrowLeft className="w-4.5 h-4.5 group-hover:-translate-x-0.5 transition-transform duration-200" />
            Go Back
          </button>
        </div>

        <p className="mt-8 text-xs text-slate-600">
          Need help?{" "}
          <Link
            to="/dashboard"
            className="text-slate-400 hover:text-green-400 underline underline-offset-2 transition-colors duration-200"
          >
            Contact support
          </Link>
        </p>
      </div>

      <style>{`
        @keyframes notfound-float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        @keyframes notfound-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes notfound-gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  );
};

export default NotFoundPage;