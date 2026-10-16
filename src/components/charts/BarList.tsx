import { motion } from "motion/react";
import { useState } from "react";

export type BarKey = { key: string; label: string; color: string };
export type BarRow = { id: string; label: string; values: Record<string, number>; note?: string };

type Props = {
  rows: BarRow[];
  keys: BarKey[];
  format: (v: number) => string;
  max?: number;
  onSelect?: (id: string) => void;
  selected?: string | null;
  ariaLabel: string;
  labelWidth?: number;
};

/** Barras horizontais (simples ou empilhadas) em HTML — nítidas e responsivas. */
export default function BarList({ rows, keys, format, max, onSelect, selected, ariaLabel, labelWidth = 128 }: Props) {
  const [hover, setHover] = useState<string | null>(null);
  const total = (r: BarRow) => keys.reduce((s, k) => s + (r.values[k.key] ?? 0), 0);
  const top = max ?? Math.max(...rows.map(total));

  return (
    <div role="list" aria-label={ariaLabel} className="space-y-2.5">
      {rows.map((r, i) => {
        const t = total(r);
        const isActive = hover === r.id || selected === r.id;
        const segs = keys.filter((k) => (r.values[k.key] ?? 0) > 0);
        return (
          <div
            key={r.id}
            role="listitem"
            className={`group relative grid items-center gap-x-3 rounded-lg ${onSelect ? "cursor-pointer" : ""}`}
            style={{ gridTemplateColumns: `minmax(84px, ${labelWidth}px) 1fr` }}
            onMouseEnter={() => setHover(r.id)}
            onMouseLeave={() => setHover(null)}
            onClick={() => onSelect?.(r.id)}
            onKeyDown={(e) => {
              if (onSelect && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                onSelect(r.id);
              }
            }}
            tabIndex={onSelect ? 0 : undefined}
          >
            <span className={`truncate text-[0.85rem] transition-colors ${isActive ? "font-semibold text-ink" : "text-ink-2"}`}>{r.label}</span>
            <div className="relative flex h-[22px] items-center">
              <div className="flex h-[18px] items-stretch" style={{ width: `${(t / top) * 100}%`, minWidth: 2 }}>
                {segs.map((k, si) => {
                  const v = r.values[k.key] ?? 0;
                  const last = si === segs.length - 1;
                  return (
                    <motion.div
                      key={k.key}
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.9, delay: i * 0.035, ease: [0.16, 1, 0.3, 1] }}
                      style={{
                        width: `${(v / t) * 100}%`,
                        background: k.color,
                        originX: 0,
                        borderRadius: last ? "0 4px 4px 0" : 0,
                        marginRight: last ? 0 : 2,
                        opacity: hover && !isActive ? 0.45 : 1,
                        transition: "opacity .2s",
                      }}
                    />
                  );
                })}
              </div>
              <span className="num ml-2 shrink-0 text-[0.8rem] text-ink-2">{format(t)}</span>
            </div>
            {hover === r.id && segs.length > 1 && (
              <div className="tooltip left-1/3 top-full mt-1">
                <p className="mb-1 font-semibold">{r.label}</p>
                {segs.map((k) => (
                  <p key={k.key} className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-1.5 text-ink-2">
                      <span className="h-2 w-2 rounded-sm" style={{ background: k.color }} />
                      {k.label}
                    </span>
                    <span className="num font-medium">{format(r.values[k.key] ?? 0)}</span>
                  </p>
                ))}
                {r.note && <p className="mt-1 text-ink-3">{r.note}</p>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
