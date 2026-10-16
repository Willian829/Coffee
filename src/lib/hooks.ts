import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

export type ThemePref = "system" | "light" | "dark";
const THEME_KEY = "atlas-theme";

const readPref = (): ThemePref => {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return "system";
  }
};

const darkQuery = () => window.matchMedia("(prefers-color-scheme: dark)");

/** Preferência de tema (sistema/claro/escuro) + tema efetivo. */
export function useTheme() {
  const [pref, setPrefState] = useState<ThemePref>(readPref);
  const systemDark = useMediaQuery("(prefers-color-scheme: dark)");

  useEffect(() => {
    const root = document.documentElement;
    if (pref === "system") delete root.dataset.theme;
    else root.dataset.theme = pref;
    try {
      if (pref === "system") localStorage.removeItem(THEME_KEY);
      else localStorage.setItem(THEME_KEY, pref);
    } catch {
      /* armazenamento indisponível */
    }
    const resolved = pref === "system" ? (darkQuery().matches ? "dark" : "light") : pref;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", resolved === "dark" ? "#110c09" : "#f6efe5");
  }, [pref, systemDark]);

  const resolved: "light" | "dark" = pref === "system" ? (systemDark ? "dark" : "light") : pref;
  return { pref, setPref: setPrefState, resolved };
}

export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(query);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export const usePrefersReducedMotion = () => useMediaQuery("(prefers-reduced-motion: reduce)");

/** Mede a largura de um elemento (ResizeObserver). */
export function useElementWidth<T extends HTMLElement>(initial = 800) {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(initial);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setWidth(Math.round(w));
    });
    ro.observe(el);
    setWidth(Math.round(el.getBoundingClientRect().width) || initial);
    return () => ro.disconnect();
  }, [initial]);
  return [ref, width] as const;
}

/** Estado persistido no localStorage (só conveniências por visitante). */
export function useLocalState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  const set = useCallback(
    (v: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const next = typeof v === "function" ? (v as (p: T) => T)(prev) : v;
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch {
          /* ignorado */
        }
        return next;
      });
    },
    [key],
  );
  return [value, set] as const;
}

/** Valor animado de 0 → alvo quando `start` vira true. */
export function useCountUp(target: number, start: boolean, duration = 1600) {
  const [v, setV] = useState(0);
  const reduced = usePrefersReducedMotion();
  useEffect(() => {
    if (!start) return;
    if (reduced) {
      setV(target);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 4);
      setV(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, start, duration, reduced]);
  return v;
}
