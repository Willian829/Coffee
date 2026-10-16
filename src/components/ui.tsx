import { motion, useInView } from "motion/react";
import { useId, useRef, type ReactNode } from "react";
import { Link } from "react-router";
import { ArrowRight, Info } from "lucide-react";
import { chapters } from "../data/nav";
import { useCountUp } from "../lib/hooks";
import { fmt, fmtInt } from "../lib/format";

const ease = [0.16, 1, 0.3, 1] as const;

export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article";
}) {
  const M = motion[as];
  return (
    <M
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.9, ease, delay }}
    >
      {children}
    </M>
  );
}

export function Section({
  id,
  kicker,
  title,
  intro,
  children,
  className = "",
  tight = false,
}: {
  id?: string;
  kicker?: string;
  title?: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
  className?: string;
  tight?: boolean;
}) {
  return (
    <section id={id} className={`${tight ? "py-12 sm:py-16" : "py-16 sm:py-24"} ${className}`}>
      <div className="wrap">
        {(kicker || title || intro) && (
          <Reveal className="mb-10 max-w-3xl sm:mb-14">
            {kicker && <p className="kicker mb-4">{kicker}</p>}
            {title && <h2 className="text-balance text-[clamp(2rem,4.4vw,3.4rem)]">{title}</h2>}
            {intro && <div className="lead mt-5 text-pretty">{intro}</div>}
          </Reveal>
        )}
        {children}
      </div>
    </section>
  );
}

export function PageHero({
  path,
  title,
  lead,
  aside,
  children,
}: {
  path: string;
  title: ReactNode;
  lead: ReactNode;
  aside?: ReactNode;
  children?: ReactNode;
}) {
  const idx = chapters.findIndex((c) => c.path === path);
  const chapter = chapters[idx];
  const Icon = chapter?.icon;
  return (
    <header className="relative overflow-hidden pt-28 pb-14 sm:pt-36 sm:pb-20">
      <Topo className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.5]" />
      <div className="wrap relative grid items-center gap-10 lg:grid-cols-[1.25fr_1fr]">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
            className="mb-6 flex items-center gap-3"
          >
            {Icon && (
              <span className="grid h-9 w-9 place-items-center rounded-full border border-line bg-surface text-accent">
                <Icon size={17} />
              </span>
            )}
            <span className="kicker">
              Capítulo {String(idx + 1).padStart(2, "0")} · {chapter?.short}
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease, delay: 0.05 }}
            className="display text-balance text-[clamp(2.9rem,8.2vw,6.6rem)]"
          >
            {title}
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease, delay: 0.15 }}
            className="lead mt-7 max-w-2xl text-pretty"
          >
            {lead}
          </motion.div>
          {children && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease, delay: 0.25 }}
              className="mt-8"
            >
              {children}
            </motion.div>
          )}
        </div>
        {aside && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease, delay: 0.1 }}
            className="relative mx-auto w-full max-w-md"
          >
            {aside}
          </motion.div>
        )}
      </div>
    </header>
  );
}

/** Linhas topográficas decorativas (evocam altitude e terroir). */
export function Topo({ className = "" }: { className?: string }) {
  const uid = useId().replace(/:/g, "");
  const lines = Array.from({ length: 14 }, (_, i) => i);
  return (
    <svg className={className} viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <radialGradient id={`tf${uid}`} cx="78%" cy="38%" r="70%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <mask id={`tm${uid}`}>
          <rect width="1200" height="600" fill={`url(#tf${uid})`} />
        </mask>
      </defs>
      <g mask={`url(#tm${uid})`} fill="none" stroke="var(--ink)" strokeWidth="1.1">
        {lines.map((i) => {
          const r = 40 + i * 34;
          const cx = 930;
          const cy = 230;
          const wob = (k: number) => Math.sin(i * 0.9 + k) * (10 + i * 2.2);
          const d = `M ${cx - r} ${cy + wob(0)} C ${cx - r} ${cy - r * 0.8 + wob(1)}, ${cx - r * 0.2} ${cy - r * 0.75 + wob(2)}, ${cx + r * 0.3} ${cy - r * 0.62 + wob(3)} S ${cx + r * 1.05} ${cy - r * 0.1 + wob(4)}, ${cx + r * 0.92} ${cy + r * 0.38 + wob(5)} S ${cx + r * 0.1} ${cy + r * 0.72 + wob(6)}, ${cx - r * 0.42} ${cy + r * 0.6 + wob(7)} S ${cx - r} ${cy + r * 0.25 + wob(8)}, ${cx - r} ${cy + wob(0)} Z`;
          return <path key={i} d={d} opacity={1 - i * 0.045} />;
        })}
      </g>
    </svg>
  );
}

export function Stat({
  value,
  digits = 0,
  prefix = "",
  suffix = "",
  label,
  note,
  big = false,
}: {
  value: number;
  digits?: number;
  prefix?: string;
  suffix?: string;
  label: string;
  note?: string;
  big?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const v = useCountUp(value, inView);
  return (
    <div ref={ref}>
      <div className={`font-display tracking-tight ${big ? "text-[clamp(2.6rem,6vw,4.6rem)]" : "text-[clamp(2rem,4vw,3rem)]"} leading-none`}>
        {prefix}
        {digits ? fmt(v, digits) : fmtInt(v)}
        <span className="text-accent">{suffix}</span>
      </div>
      <p className="mt-3 text-sm font-medium text-ink">{label}</p>
      {note && <p className="mt-1 text-xs text-ink-3">{note}</p>}
    </div>
  );
}

export function SourceNote({ children }: { children: ReactNode }) {
  return (
    <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-ink-3">
      <Info size={13} className="mt-0.5 shrink-0" aria-hidden />
      <span>{children}</span>
    </p>
  );
}

export function Callout({ title, children, tone = "accent" }: { title: string; children: ReactNode; tone?: "accent" | "gold" | "leaf" }) {
  const bg = tone === "accent" ? "bg-accent-soft" : tone === "gold" ? "bg-gold-soft" : "bg-leaf-soft";
  const bar = tone === "accent" ? "bg-accent" : tone === "gold" ? "bg-gold" : "bg-leaf";
  return (
    <div className={`relative overflow-hidden rounded-2xl ${bg} p-5 pl-6 sm:p-6 sm:pl-7`}>
      <span className={`absolute inset-y-0 left-0 w-1 ${bar}`} aria-hidden />
      <p className="font-display text-lg text-ink">{title}</p>
      <div className="mt-2 text-[0.95rem] leading-relaxed text-ink-2">{children}</div>
    </div>
  );
}

export function Seg<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div className="seg" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={o.value === value} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Dots({ value, max = 5, label }: { value: number; max?: number; label: string }) {
  return (
    <span className="inline-flex items-center gap-1" role="img" aria-label={`${label}: ${value} de ${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={`h-1.5 w-4 rounded-full ${i < value ? "bg-accent" : "bg-surface-3"}`} />
      ))}
    </span>
  );
}

export function NextChapter({ path }: { path: string }) {
  const idx = chapters.findIndex((c) => c.path === path);
  const next = chapters[(idx + 1) % chapters.length];
  const prev = idx > 0 ? chapters[idx - 1] : null;
  const Icon = next.icon;
  return (
    <section className="wrap pb-20 pt-6">
      <Reveal>
        <Link
          to={next.path}
          className="group relative block overflow-hidden rounded-[28px] border border-line bg-surface p-8 transition-colors hover:border-line-strong sm:p-12"
        >
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-accent-soft blur-2xl transition-transform duration-700 group-hover:scale-125" />
          <p className="kicker relative">Próximo capítulo</p>
          <div className="relative mt-4 flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <h3 className="display text-[clamp(2.2rem,5.5vw,4.2rem)]">{next.title}</h3>
              <p className="mt-3 text-ink-2">{next.description}</p>
            </div>
            <span className="grid h-16 w-16 place-items-center rounded-full bg-accent text-on-accent transition-transform duration-500 group-hover:translate-x-1 group-hover:-rotate-12">
              <Icon size={24} />
            </span>
          </div>
        </Link>
        {prev && (
          <Link to={prev.path} className="mt-4 inline-flex items-center gap-2 text-sm text-ink-3 hover:text-ink">
            <ArrowRight size={14} className="rotate-180" /> Voltar para {prev.title}
          </Link>
        )}
      </Reveal>
    </section>
  );
}

export function Legend({ items }: { items: { label: string; color: string; shape?: "dot" | "line" | "square" }[] }) {
  return (
    <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-2">
      {items.map((it) => (
        <li key={it.label} className="flex items-center gap-2">
          {it.shape === "line" ? (
            <span className="h-0.5 w-5 rounded-full" style={{ background: it.color }} />
          ) : (
            <span className={`h-3 w-3 ${it.shape === "square" ? "rounded-[3px]" : "rounded-full"}`} style={{ background: it.color }} />
          )}
          {it.label}
        </li>
      ))}
    </ul>
  );
}

export function ChartCard({
  title,
  subtitle,
  controls,
  children,
  footer,
  className = "",
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  controls?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`card p-5 sm:p-7 ${className}`} style={{ background: "var(--chart-surface)" }}>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-sans text-lg font-semibold tracking-tight text-ink">{title}</h3>
          {subtitle && <p className="mt-1 text-sm text-ink-3">{subtitle}</p>}
        </div>
        {controls && <div className="flex flex-wrap items-center gap-2">{controls}</div>}
      </div>
      {children}
      {footer}
    </div>
  );
}
