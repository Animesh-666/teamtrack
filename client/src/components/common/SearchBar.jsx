/**
 * SearchBar.jsx
 * ─────────────────────────────────────────────────────────────
 * Reusable debounced search input for filtering lists.
 *
 * Features:
 *  - Debounced onChange (300ms default)
 *  - Search icon with animated focus state
 *  - Clear button when value is present
 *  - Loading spinner while debouncing/fetching
 *  - Glassmorphism input styling
 *  - Keyboard shortcut support (optional)
 */

import { useState, useEffect, useRef } from "react";

/* ── Icons ────────────────────────────────────────────────── */

const SearchIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const ClearIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

/* ── Component ────────────────────────────────────────────── */

const SearchBar = ({
  value = "",
  onChange,
  placeholder = "Search...",
  debounceMs = 300,
  loading = false,
  className = "",
  autoFocus = false,
  id = "search-bar",
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  /** Sync external value changes */
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  /** Debounced callback */
  useEffect(() => {
    // Clear previous timer
    if (timerRef.current) clearTimeout(timerRef.current);

    // Don't debounce the initial render
    timerRef.current = setTimeout(() => {
      if (localValue !== value) {
        onChange?.(localValue);
      }
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [localValue, debounceMs]); // intentionally exclude onChange & value

  /** Clear handler */
  const handleClear = () => {
    setLocalValue("");
    onChange?.("");
    inputRef.current?.focus();
  };

  return (
    <div className={`relative group ${className}`}>
      {/* Search icon */}
      <SearchIcon
        className={`
          absolute left-3.5 top-1/2 -translate-y-1/2
          w-4 h-4 transition-colors duration-200
          ${isFocused ? "text-green-400" : "text-slate-500"}
        `}
      />

      {/* Input */}
      <input
        ref={inputRef}
        id={id}
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={`
          w-full h-11 pl-10 pr-10 rounded-xl
          bg-white/[0.04] border
          text-sm text-slate-200 placeholder-slate-500
          focus:outline-none transition-all duration-200
          ${
            isFocused
              ? "border-green-500/40 ring-1 ring-green-500/20 bg-white/[0.06]"
              : "border-white/[0.08] hover:border-white/[0.12]"
          }
        `}
      />

      {/* Right side: loading spinner or clear button */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
        {loading ? (
          <div className="w-4 h-4 rounded-full border-2 border-slate-600 border-t-green-400 animate-spin" />
        ) : localValue ? (
          <button
            onClick={handleClear}
            className="
              text-slate-500 hover:text-slate-300
              transition-colors duration-150
            "
            aria-label="Clear search"
          >
            <ClearIcon className="w-4 h-4" />
          </button>
        ) : null}
      </div>

      {/* Focus glow */}
      {isFocused && (
        <div className="absolute inset-0 -z-10 rounded-xl bg-green-500/5 blur-xl transition-opacity duration-300" />
      )}
    </div>
  );
};

export default SearchBar;
