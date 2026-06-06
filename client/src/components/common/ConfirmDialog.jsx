/**
 * ConfirmDialog.jsx
 * ─────────────────────────────────────────────────────────────
 * Confirmation dialog for destructive / important actions.
 *
 * Features:
 *  - Animated warning icon with glow
 *  - Customizable title, message, confirm label & variant
 *  - Built on top of the Modal component
 *  - Loading state for async confirmations
 *  - Keyboard accessible (Enter = confirm, Escape = cancel)
 */

import { useEffect, useCallback } from "react";
import Modal from "./Modal";

/* ── Variant styles ───────────────────────────────────────── */
const VARIANTS = {
  danger: {
    iconBg:    "bg-red-500/10",
    iconColor: "text-red-400",
    iconGlow:  "shadow-red-500/20",
    btnBg:     "bg-red-500 hover:bg-red-600",
    btnShadow: "shadow-red-500/25",
  },
  warning: {
    iconBg:    "bg-amber-500/10",
    iconColor: "text-amber-400",
    iconGlow:  "shadow-amber-500/20",
    btnBg:     "bg-amber-500 hover:bg-amber-600",
    btnShadow: "shadow-amber-500/25",
  },
  info: {
    iconBg:    "bg-blue-500/10",
    iconColor: "text-blue-400",
    iconGlow:  "shadow-blue-500/20",
    btnBg:     "bg-blue-500 hover:bg-blue-600",
    btnShadow: "shadow-blue-500/25",
  },
};

/* ── Icon components ──────────────────────────────────────── */

const WarningIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const InfoIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

/* ── Component ────────────────────────────────────────────── */

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  loading = false,
}) => {
  const v = VARIANTS[variant] || VARIANTS.danger;
  const IconComponent = variant === "info" ? InfoIcon : WarningIcon;

  /** Enter key = confirm */
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && isOpen && !loading) {
        e.preventDefault();
        onConfirm?.();
      }
    },
    [isOpen, loading, onConfirm]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleKeyDown]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={loading ? undefined : onClose}
      size="sm"
      showClose={false}
      closeOnOverlay={!loading}
    >
      <div className="flex flex-col items-center text-center py-2">
        {/* ── Animated icon ──────────────────────────────────── */}
        <div
          className={`
            relative flex items-center justify-center
            w-16 h-16 rounded-2xl mb-5
            ${v.iconBg}
            shadow-lg ${v.iconGlow}
            animate-bounce-subtle
          `}
        >
          <IconComponent className={`w-8 h-8 ${v.iconColor}`} />
          {/* Glow pulse */}
          <div
            className={`absolute inset-0 rounded-2xl ${v.iconBg} animate-ping opacity-30`}
            style={{ animationDuration: "2s" }}
          />
        </div>

        {/* ── Title ──────────────────────────────────────────── */}
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>

        {/* ── Message ────────────────────────────────────────── */}
        <p className="text-sm text-slate-400 leading-relaxed max-w-sm mb-6">
          {message}
        </p>

        {/* ── Actions ────────────────────────────────────────── */}
        <div className="flex items-center gap-3 w-full">
          {/* Cancel */}
          <button
            id="confirm-dialog-cancel"
            onClick={onClose}
            disabled={loading}
            className="
              flex-1 h-11 rounded-xl
              bg-white/[0.06] border border-white/[0.08]
              text-sm font-medium text-slate-300
              hover:bg-white/[0.1] hover:text-white
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
            "
          >
            {cancelLabel}
          </button>

          {/* Confirm */}
          <button
            id="confirm-dialog-confirm"
            onClick={onConfirm}
            disabled={loading}
            className={`
              flex-1 h-11 rounded-xl
              ${v.btnBg}
              text-sm font-semibold text-white
              shadow-lg ${v.btnShadow}
              hover:shadow-xl
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
              flex items-center justify-center gap-2
            `}
          >
            {loading && (
              <div
                className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"
              />
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
