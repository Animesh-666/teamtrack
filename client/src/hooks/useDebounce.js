/**
 * useDebounce.js
 * ─────────────────────────────────────────────────────────────
 * Custom React hook that debounces a value to avoid rapid updates
 * or high-frequency API requests (e.g. for text search bars).
 */

import { useState, useEffect } from "react";

export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup timeout on value or delay change
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;