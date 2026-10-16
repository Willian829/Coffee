import Lenis from "lenis";

let lenis: Lenis | null = null;

/** Rolagem suave global (desativada com prefers-reduced-motion). */
export function initSmoothScroll() {
  if (lenis || typeof window === "undefined") return lenis;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return null;
  lenis = new Lenis({
    autoRaf: true,
    lerp: 0.11,
    wheelMultiplier: 1,
    smoothWheel: true,
  });
  return lenis;
}

export const getLenis = () => lenis;

export function scrollToTop(immediate = true) {
  if (lenis) lenis.scrollTo(0, { immediate, force: true });
  else window.scrollTo({ top: 0, behavior: immediate ? "auto" : "smooth" });
}

export function scrollToEl(el: HTMLElement | null, offset = -90) {
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset });
  else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + offset, behavior: "smooth" });
}

export function stopScroll(stop: boolean) {
  if (!lenis) {
    document.documentElement.style.overflow = stop ? "hidden" : "";
    return;
  }
  if (stop) lenis.stop();
  else lenis.start();
}
