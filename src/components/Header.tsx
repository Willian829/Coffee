import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { ChevronDown, Menu, Monitor, Moon, Search, Sun, X } from "lucide-react";
import { chapters, groups, type GroupId } from "../data/nav";
import { useTheme, type ThemePref } from "../lib/hooks";
import { stopScroll } from "../lib/smooth";

export function LogoMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <rect width="64" height="64" rx="18" fill="var(--ink)" />
      <g transform="rotate(-28 32 32)">
        <ellipse cx="32" cy="32" rx="14" ry="20" fill="var(--accent)" />
        <path d="M32 13c-6 7 6 12 0 19s6 12 0 19" fill="none" stroke="var(--ink)" strokeWidth="3.4" strokeLinecap="round" />
      </g>
    </svg>
  );
}

const themeOrder: ThemePref[] = ["system", "light", "dark"];
const themeLabel: Record<ThemePref, string> = { system: "Tema do sistema", light: "Tema claro", dark: "Tema escuro" };

function ThemeToggle() {
  const { pref, setPref } = useTheme();
  const Icon = pref === "light" ? Sun : pref === "dark" ? Moon : Monitor;
  const next = themeOrder[(themeOrder.indexOf(pref) + 1) % themeOrder.length];
  return (
    <button
      type="button"
      onClick={() => setPref(next)}
      className="grid h-10 w-10 place-items-center rounded-full border border-line text-ink-2 transition-colors hover:border-line-strong hover:text-ink"
      aria-label={`${themeLabel[pref]} — mudar para ${themeLabel[next].toLowerCase()}`}
      title={themeLabel[pref]}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={pref}
          initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.25 }}
        >
          <Icon size={17} />
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

export function openSearch() {
  window.dispatchEvent(new CustomEvent("atlas:search"));
}

export default function Header() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [openGroup, setOpenGroup] = useState<GroupId | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimer = useRef<number | undefined>(undefined);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpenGroup(null);
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    stopScroll(mobileOpen);
    return () => stopScroll(false);
  }, [mobileOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenGroup(null);
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const enter = (g: GroupId) => {
    window.clearTimeout(closeTimer.current);
    setOpenGroup(g);
  };
  const leave = () => {
    closeTimer.current = window.setTimeout(() => setOpenGroup(null), 160);
  };

  const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background,box-shadow,border-color] duration-500 no-print ${
          scrolled || openGroup ? "glass border-b border-line" : "border-b border-transparent"
        }`}
      >
        <div className="wrap flex h-[68px] items-center gap-4">
          <Link to="/" className="group flex shrink-0 items-center gap-2.5" aria-label="Atlas do Café — início">
            <span className="transition-transform duration-500 group-hover:-rotate-12">
              <LogoMark />
            </span>
            <span className="font-display text-[1.28rem] leading-none tracking-tight">
              Atlas <span className="italic text-ink-2">do</span> Café
            </span>
          </Link>

          <nav className="ml-2 hidden items-center gap-0.5 lg:flex xl:ml-6 xl:gap-1" aria-label="Capítulos">
            {groups.map((g) => {
              const active = chapters.some((c) => c.group === g.id && location.pathname.startsWith(c.path));
              return (
                <div key={g.id} className="relative" onMouseEnter={() => enter(g.id)} onMouseLeave={leave}>
                  <button
                    type="button"
                    className={`flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-2 text-[0.9rem] font-medium transition-colors xl:px-3.5 ${
                      active || openGroup === g.id ? "text-ink" : "text-ink-2 hover:text-ink"
                    }`}
                    aria-expanded={openGroup === g.id}
                    onClick={() => setOpenGroup((o) => (o === g.id ? null : g.id))}
                    onFocus={() => enter(g.id)}
                  >
                    {g.label}
                    <ChevronDown size={14} className={`transition-transform ${openGroup === g.id ? "rotate-180" : ""}`} />
                    {active && <span className="absolute inset-x-3.5 -bottom-0.5 h-0.5 rounded-full bg-accent" />}
                  </button>
                  <AnimatePresence>
                    {openGroup === g.id && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.98 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute left-1/2 top-full z-50 w-[min(560px,90vw)] -translate-x-1/2 pt-3"
                      >
                        <div className="card overflow-hidden p-2 shadow-lift" style={{ background: "var(--surface)" }}>
                          <p className="kicker px-3 pb-1 pt-2">{g.blurb}</p>
                          <div className="grid gap-1 sm:grid-cols-2">
                            {chapters
                              .filter((c) => c.group === g.id)
                              .map((c) => {
                                const Icon = c.icon;
                                return (
                                  <NavLink
                                    key={c.path}
                                    to={c.path}
                                    className={({ isActive }) =>
                                      `group/item flex gap-3 rounded-2xl p-3 transition-colors hover:bg-surface-2 ${isActive ? "bg-surface-2" : ""}`
                                    }
                                  >
                                    <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent transition-transform group-hover/item:scale-110">
                                      <Icon size={17} />
                                    </span>
                                    <span>
                                      <span className="block text-[0.92rem] font-semibold text-ink">{c.title}</span>
                                      <span className="mt-0.5 block text-[0.8rem] leading-snug text-ink-3">{c.description}</span>
                                    </span>
                                  </NavLink>
                                );
                              })}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={openSearch}
              className="flex h-10 items-center gap-2 whitespace-nowrap rounded-full border border-line pl-3 pr-3 text-sm text-ink-3 transition-colors hover:border-line-strong hover:text-ink xl:min-w-[200px] xl:pl-3.5 xl:pr-2"
              aria-label="Buscar no Atlas"
            >
              <Search size={16} />
              <span className="hidden sm:inline lg:hidden xl:inline">Buscar no Atlas…</span>
              <kbd className="ml-auto hidden rounded-md border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-[0.68rem] text-ink-3 xl:inline">
                {isMac ? "⌘" : "Ctrl"} K
              </kbd>
            </button>
            <ThemeToggle />
            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-full border border-line lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menu"
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
        <motion.div className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-accent" style={{ scaleX: progress }} aria-hidden />
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-[60] flex flex-col bg-bg lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
          >
            <div className="wrap flex h-[68px] shrink-0 items-center justify-between">
              <Link to="/" className="flex items-center gap-2.5">
                <LogoMark />
                <span className="font-display text-xl">Atlas do Café</span>
              </Link>
              <button type="button" className="grid h-10 w-10 place-items-center rounded-full border border-line" onClick={() => setMobileOpen(false)} aria-label="Fechar menu">
                <X size={18} />
              </button>
            </div>
            <div className="wrap flex-1 overflow-y-auto pb-10" data-lenis-prevent>
              {groups.map((g, gi) => (
                <motion.div
                  key={g.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 * gi, duration: 0.4 }}
                  className="border-b border-line py-5"
                >
                  <p className="kicker mb-3">{g.label}</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {chapters
                      .filter((c) => c.group === g.id)
                      .map((c) => (
                        <NavLink
                          key={c.path}
                          to={c.path}
                          className={({ isActive }) => `py-1.5 font-display text-[1.35rem] leading-tight ${isActive ? "text-accent" : "text-ink"}`}
                        >
                          {c.short}
                        </NavLink>
                      ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
