import { useState, useEffect, useRef, useCallback } from "react";

// ── useDebounce ───────────────────────────────────────────────────────────────

/**
 * Returns a debounced version of `value` — the value only updates after
 * `delay` ms of inactivity. Use in search inputs to reduce API calls.
 *
 * @example
 * const debouncedSearch = useDebounce(searchTerm, 400);
 * useEffect(() => { fetchResults(debouncedSearch); }, [debouncedSearch]);
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// ── useLocalStorage ───────────────────────────────────────────────────────────

/**
 * Persistent state backed by localStorage.
 * Falls back to initialValue if key doesn't exist or JSON.parse fails.
 *
 * @example
 * const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (v: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T) => {
      try {
        setStoredValue(value);
        localStorage.setItem(key, JSON.stringify(value));
      } catch (err) {
        console.warn(`[useLocalStorage] Failed to persist key "${key}":`, err);
      }
    },
    [key]
  );

  return [storedValue, setValue];
}

// ── usePrevious ───────────────────────────────────────────────────────────────

/**
 * Returns the previous value of a variable (from the last render).
 * Useful for comparing before/after in effects.
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

// ── useClickOutside ───────────────────────────────────────────────────────────

/**
 * Calls `handler` when a click occurs outside of the referenced element.
 * Use for dropdowns, modals, and tooltips.
 *
 * @example
 * const ref = useRef<HTMLDivElement>(null);
 * useClickOutside(ref, () => setDropdownOpen(false));
 */
export function useClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  handler: (event: MouseEvent | TouchEvent) => void
): void {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) return;
      handler(event);
    };
    document.addEventListener("mousedown", listener, { passive: true });
    document.addEventListener("touchstart", listener, { passive: true });
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

// ── useFetch ─────────────────────────────────────────────────────────────────

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Generic data-fetching hook with automatic abort on unmount.
 * Prevents setState calls on unmounted components.
 *
 * @example
 * const { data, loading, error } = useFetch<Student[]>('/api/students');
 */
export function useFetch<T>(url: string, options?: RequestInit): FetchState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetch(url, { ...optionsRef.current, signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        return res.json() as Promise<T>;
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === "AbortError") return; // Ignore abort
        setError(err.message ?? "Terjadi kesalahan jaringan");
        setLoading(false);
      });

    return () => controller.abort();
  }, [url, trigger]);

  const refetch = useCallback(() => setTrigger((n) => n + 1), []);

  return { data, loading, error, refetch };
}
