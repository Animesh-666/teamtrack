/**
 * Modal.jsx
 * ─────────────────────────────────────────────────────────────
 * Reusable modal dialog for TeamTrack.
 *
 * Features:
 *  - Backdrop blur overlay
 *  - Slide-up + fade-in animation
 *  - Escape key to close
 *  - Click-outside to close
 *  - Customizable title, size, and footer
 *  - Scroll lock on body when open
 *  - Portal-ready (renders in place, but can be wrapped in a portal)
 */

import { useEffect, useRef, useCallback } from "react";

/* ── Close icon ───────────────────────────────────────────── */
const CloseIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

/* ── Size presets ─────────────────────────────────────────── */
const SIZE_MAP = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-6xl",
};

/* ── Component ────────────────────────────────────────────── */

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  showClose = true,
  closeOnOverlay = true,
  closeOnEscape = true,
  className = "",
}) => {
  const contentRef = useRef(null);

  /** Lock body scroll when modal is open */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  /** Close on Escape key */
  const handleKeyDown = useCallback(
    (e) => {
      if (closeOnEscape && e.key === "Escape") {
        onClose?.();
      }
    },
    [closeOnEscape, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleKeyDown]);

  /** Close on overlay click */
  const handleOverlayClick = (e) => {
    if (closeOnOverlay && contentRef.current && !contentRef.current.contains(e.target)) {
      onClose?.();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="modal-overlay"
      className="
        fixed inset-0 z-[60]
        flex items-center justify-center p-4
        bg-black/60 backdrop-blur-sm
        animate-fade-in
      "
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* ── Modal content ───────────────────────────────────── */}
      <div
        ref={contentRef}
        className={`
          w-full ${SIZE_MAP[size] || SIZE_MAP.md}
          bg-[#1e293b]/95 backdrop-blur-xl
          border border-white/[0.08]
          rounded-2xl shadow-2xl shadow-black/50
          animate-slide-up
          flex flex-col max-h-[90vh]
          ${className}
        `}
      >
        {/* ── Header ────────────────────────────────────────── */}
        {(title || showClose) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
            {title && (
              <h2
                id="modal-title"
                className="text-lg font-semibold text-white truncate pr-4"
              >
                {title}
              </h2>
            )}

            {showClose && (
              <button
                id="modal-close-btn"
                onClick={onClose}
                className="
                  flex items-center justify-center w-8 h-8 rounded-lg
                  text-slate-400 hover:text-white hover:bg-white/[0.08]
                  transition-colors duration-150 flex-shrink-0
                "
                aria-label="Close modal"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* ── Body ──────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 scrollbar-thin">
          {children}
        </div>

        {/* ── Footer ────────────────────────────────────────── */}
        {footer && (
          <div className="px-6 py-4 border-t border-white/[0.06] flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
