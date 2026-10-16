import { motion } from "motion/react";
import { useId, useMemo } from "react";

/* ───────────────────────── utilidades ───────────────────────── */

/** Gerador pseudoaleatório determinístico (mulberry32). */
export const seeded = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

type Pt = [number, number];
const bez = (p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt => {
  const u = 1 - t;
  return [
    u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
    u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
  ];
};
const bezAngle = (p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number) => {
  const u = 1 - t;
  const dx = 3 * u * u * (p1[0] - p0[0]) + 6 * u * t * (p2[0] - p1[0]) + 3 * t * t * (p3[0] - p2[0]);
  const dy = 3 * u * u * (p1[1] - p0[1]) + 6 * u * t * (p2[1] - p1[1]) + 3 * t * t * (p3[1] - p2[1]);
  return (Math.atan2(dy, dx) * 180) / Math.PI;
};

/* ───────────────────────── folha e fruto ───────────────────────── */

const LEAF = "M0,0 C 22,-24 70,-30 118,-4 C 122,-2 124,0 126,0 C 120,4 116,6 112,8 C 70,30 24,24 0,0 Z";

function Leaf({ x, y, angle, scale = 1, gid, delay = 0 }: { x: number; y: number; angle: number; scale?: number; gid: string; delay?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale})`}>
      <motion.g
        animate={{ rotate: [0, 2.2, 0, -1.6, 0] }}
        transition={{ duration: 7 + delay, repeat: Infinity, ease: "easeInOut", delay }}
        style={{ originX: 0, originY: 0.5 }}
      >
        <path d={LEAF} fill={`url(#leaf-${gid})`} />
        <path d="M4,0 Q 64,-4 122,0" stroke="rgba(255,255,255,0.28)" strokeWidth="1.4" fill="none" />
        {[20, 40, 60, 80, 98].map((vx, i) => (
          <g key={i} stroke="rgba(255,255,255,0.14)" strokeWidth="1" fill="none">
            <path d={`M${vx},-1 Q ${vx + 10},-12 ${vx + 22},-${14 - i * 1.8}`} />
            <path d={`M${vx},1 Q ${vx + 10},11 ${vx + 22},${13 - i * 1.8}`} />
          </g>
        ))}
      </motion.g>
    </g>
  );
}

export function Cherry({ x, y, r = 13, color, gid }: { x: number; y: number; r?: number; color: string; gid: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="0" cy="0" rx={r} ry={r * 1.08} fill={color} />
      <ellipse cx="0" cy="0" rx={r} ry={r * 1.08} fill={`url(#shine-${gid})`} />
      <circle cx={r * 0.05} cy={r * 0.86} r={r * 0.16} fill="rgba(0,0,0,0.35)" />
    </g>
  );
}

function Flower({ x, y, s = 1, rot = 0 }: { x: number; y: number; s?: number; rot?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="0" cy="-9" rx="4.2" ry="9.5" fill="#fbf8f2" stroke="rgba(0,0,0,0.08)" transform={`rotate(${a})`} />
      ))}
      <circle r="3" fill="#f1e6c8" />
      {[0, 72, 144, 216, 288].map((a) => (
        <line key={a} x1="0" y1="0" x2="0" y2="-7" stroke="#d9b75a" strokeWidth="0.9" transform={`rotate(${a + 36})`} />
      ))}
    </g>
  );
}

export type BranchStage = "flor" | "verde" | "maduro";

/** Ramo de café com folhas opostas e frutos nas axilas — anima levemente ao vento. */
export function CoffeeBranch({ stage = "maduro", className = "", seed = 7 }: { stage?: BranchStage; className?: string; seed?: number }) {
  const gid = useId().replace(/:/g, "");
  const p0: Pt = [30, 560];
  const p1: Pt = [170, 430];
  const p2: Pt = [330, 300];
  const p3: Pt = [585, 70];
  const nodes = [0.16, 0.37, 0.58, 0.78, 0.94];

  const fruit = useMemo(() => {
    const rnd = seeded(seed);
    return nodes.map((t, ni) => {
      const [x, y] = bez(p0, p1, p2, p3, t);
      const count = ni === nodes.length - 1 ? 4 : 8 + Math.floor(rnd() * 4);
      return Array.from({ length: count }, (_, k) => {
        const a = (k / count) * Math.PI * 2 + rnd() * 0.6;
        const d = 8 + rnd() * 15;
        const ripeT = (1 - t) * 0.9 + rnd() * 0.35;
        return { x: x + Math.cos(a) * d, y: y + Math.sin(a) * d * 0.8 + 6, r: 11 + rnd() * 3.5, ripeT, rot: rnd() * 360 };
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);

  const colorFor = (ripeT: number) => {
    if (stage === "verde") return ripeT > 0.75 ? "#9bb04d" : "#6f8f3c";
    if (ripeT > 0.75) return "#b3261e";
    if (ripeT > 0.55) return "#cf3a26";
    if (ripeT > 0.4) return "#e0782c";
    if (ripeT > 0.28) return "#c9a23a";
    return "#7f9a45";
  };

  return (
    <svg viewBox="0 0 600 600" className={className} overflow="visible" role="img" aria-label={`Ramo de cafeeiro ${stage === "flor" ? "em florada" : stage === "verde" ? "com frutos verdes" : "com frutos maduros"}`}>
      <defs>
        <linearGradient id={`leaf-${gid}`} x1="0" y1="-1" x2="0" y2="1">
          <stop offset="0" stopColor="#4f7d3a" />
          <stop offset="0.5" stopColor="#2f5b2a" />
          <stop offset="1" stopColor="#1f3f1f" />
        </linearGradient>
        <radialGradient id={`shine-${gid}`} cx="0.32" cy="0.28" r="0.75">
          <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="0.25" stopColor="#fff" stopOpacity="0.12" />
          <stop offset="0.7" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.32" />
        </radialGradient>
      </defs>
      <motion.g
        animate={{ rotate: [0, -1.4, 0, 1, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        style={{ originX: "5%", originY: "93%" }}
      >
        <path
          d={`M${p0[0]},${p0[1]} C${p1[0]},${p1[1]} ${p2[0]},${p2[1]} ${p3[0]},${p3[1]}`}
          stroke="#6b4a2c"
          strokeWidth="9"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d={`M${p0[0]},${p0[1]} C${p1[0]},${p1[1]} ${p2[0]},${p2[1]} ${p3[0]},${p3[1]}`}
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          transform="translate(-2 -2)"
        />
        {nodes.map((t, i) => {
          const [x, y] = bez(p0, p1, p2, p3, t);
          const ang = bezAngle(p0, p1, p2, p3, t);
          const s = 1.5 - t * 0.55;
          return (
            <g key={i}>
              <Leaf x={x} y={y} angle={ang - 58} scale={s} gid={gid} delay={i * 0.4} />
              <Leaf x={x} y={y} angle={ang + 66} scale={s * 0.94} gid={gid} delay={i * 0.4 + 0.2} />
            </g>
          );
        })}
        {stage === "flor"
          ? nodes.map((t, i) => {
              const [x, y] = bez(p0, p1, p2, p3, t);
              const rnd = seeded(i + 3);
              return (
                <g key={i}>
                  {Array.from({ length: i === nodes.length - 1 ? 3 : 6 }, (_, k) => (
                    <Flower key={k} x={x + (rnd() - 0.5) * 44} y={y + (rnd() - 0.5) * 30} s={0.9 + rnd() * 0.45} rot={rnd() * 70} />
                  ))}
                </g>
              );
            })
          : fruit.map((cluster, ci) => (
              <g key={ci}>
                {cluster.map((c, k) => (
                  <Cherry key={k} x={c.x} y={c.y} r={stage === "verde" ? c.r * 0.82 : c.r} color={colorFor(c.ripeT)} gid={gid} />
                ))}
              </g>
            ))}
      </motion.g>
    </svg>
  );
}

/* ───────────────────────── grão ───────────────────────── */

export function Bean({
  color = "#7b4e2b",
  size = 120,
  gloss = 0,
  rotate = -24,
  className = "",
  round = false,
}: {
  color?: string;
  size?: number;
  gloss?: number;
  rotate?: number;
  className?: string;
  /** formato de robusta: mais redondo e com fenda reta */
  round?: boolean;
}) {
  const gid = useId().replace(/:/g, "");
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-hidden>
      <defs>
        <radialGradient id={`bean-${gid}`} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#fff" stopOpacity={0.18 + gloss * 0.35} />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.38" />
        </radialGradient>
      </defs>
      <g transform={`rotate(${rotate} 50 50)`}>
        <ellipse cx="50" cy="50" rx={round ? 33 : 30} ry={round ? 35 : 40} fill={color} />
        <ellipse cx="50" cy="50" rx={round ? 33 : 30} ry={round ? 35 : 40} fill={`url(#bean-${gid})`} />
        {round ? (
          <>
            <path d="M50 19 Q 52 50, 50 81" fill="none" stroke="rgba(0,0,0,0.45)" strokeWidth="4" strokeLinecap="round" />
            <path d="M51.6 20 Q 53.6 50, 51.6 80" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.2" strokeLinecap="round" />
          </>
        ) : (
          <>
            <path d="M50 12 C 40 28, 60 38, 50 50 S 60 74, 50 88" fill="none" stroke="rgba(0,0,0,0.45)" strokeWidth="4.2" strokeLinecap="round" />
            <path d="M51.5 13 C 42 28, 61.5 38, 51.5 50 S 61.5 74, 51.5 88" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.2" strokeLinecap="round" />
          </>
        )}
        {gloss > 0.4 && <ellipse cx="38" cy="32" rx="6" ry="11" fill="#fff" opacity={(gloss - 0.4) * 0.5} transform="rotate(-18 38 32)" />}
      </g>
    </svg>
  );
}

/* ───────────────────────── xícara ───────────────────────── */

export function SteamingCup({ className = "" }: { className?: string }) {
  const gid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 320 300" className={className} role="img" aria-label="Xícara de café fumegante">
      <defs>
        <linearGradient id={`cup-${gid}`} x1="0" x2="1">
          <stop offset="0" stopColor="var(--surface)" />
          <stop offset="0.55" stopColor="var(--surface-2)" />
          <stop offset="1" stopColor="var(--surface-3)" />
        </linearGradient>
        <radialGradient id={`coffee-${gid}`} cx="0.45" cy="0.4" r="0.7">
          <stop offset="0" stopColor="#8a5631" />
          <stop offset="0.6" stopColor="#4a2814" />
          <stop offset="1" stopColor="#2a160b" />
        </radialGradient>
      </defs>
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          className="animate-steam"
          style={{ animationDelay: `${i * 1.1}s`, transformOrigin: "center bottom" }}
          d={`M${130 + i * 26} 120 c -14 -18, 14 -30, 0 -50 s 14 -30, 0 -48`}
          fill="none"
          stroke="var(--ink-3)"
          strokeWidth="5"
          strokeLinecap="round"
          opacity="0"
        />
      ))}
      <ellipse cx="160" cy="262" rx="135" ry="24" fill="var(--surface-3)" />
      <ellipse cx="160" cy="256" rx="135" ry="24" fill={`url(#cup-${gid})`} stroke="var(--line-strong)" />
      <path d="M248 160 c 46 -6, 52 52, 4 62" fill="none" stroke="var(--surface-3)" strokeWidth="14" strokeLinecap="round" />
      <path d="M62 132 h196 c 0 70, -30 118, -98 118 s -98 -48, -98 -118 z" fill={`url(#cup-${gid})`} stroke="var(--line-strong)" />
      <ellipse cx="160" cy="132" rx="98" ry="18" fill="var(--surface-2)" stroke="var(--line-strong)" />
      <ellipse cx="160" cy="134" rx="86" ry="13" fill={`url(#coffee-${gid})`} />
      <ellipse cx="146" cy="131" rx="30" ry="4" fill="#c58c5a" opacity="0.45" />
    </svg>
  );
}

/* ───────────────────────── corte do fruto ───────────────────────── */

export function CherrySection({ active, onHover }: { active: string | null; onHover: (id: string | null) => void }) {
  const dim = (id: string) => (active && active !== id ? 0.28 : 1);
  const layer = (id: string) => ({
    onMouseEnter: () => onHover(id),
    onMouseLeave: () => onHover(null),
    onFocus: () => onHover(id),
    onBlur: () => onHover(null),
    tabIndex: 0,
    style: { opacity: dim(id), transition: "opacity .3s", cursor: "pointer", outline: "none" },
  });
  return (
    <svg viewBox="0 0 400 400" className="h-auto w-full" role="img" aria-label="Corte transversal do fruto do café">
      <g {...layer("exocarpo")}>
        <ellipse cx="200" cy="200" rx="170" ry="180" fill="#b8271f" />
        <ellipse cx="160" cy="130" rx="60" ry="40" fill="#fff" opacity="0.14" />
      </g>
      <g {...layer("mesocarpo")}>
        <ellipse cx="200" cy="200" rx="156" ry="166" fill="#f0b9a0" />
        <ellipse cx="200" cy="200" rx="136" ry="146" fill="#f6d6b8" opacity="0.85" />
      </g>
      <g {...layer("endocarpo")}>
        <ellipse cx="200" cy="200" rx="122" ry="132" fill="#efe2c4" stroke="#d6c294" strokeWidth="3" />
      </g>
      <g {...layer("pelicula")}>
        <ellipse cx="200" cy="200" rx="112" ry="122" fill="#dfe3e6" />
      </g>
      <g {...layer("endosperma")}>
        <path d="M198 84 C 120 86, 92 150, 92 200 C 92 262, 130 316, 198 316 Z" fill="#c9cf9a" />
        <path d="M202 84 C 280 86, 308 150, 308 200 C 308 262, 270 316, 202 316 Z" fill="#c4ca93" />
        <path d="M150 200 C 172 168, 160 140, 182 118" stroke="#a9ae76" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M250 200 C 228 232, 240 260, 218 282" stroke="#a5aa72" strokeWidth="5" fill="none" strokeLinecap="round" />
      </g>
      <g {...layer("embriao")}>
        <ellipse cx="146" cy="290" rx="10" ry="6" fill="#8b9257" transform="rotate(-30 146 290)" />
        <ellipse cx="254" cy="110" rx="10" ry="6" fill="#868d52" transform="rotate(-30 254 110)" />
      </g>
    </svg>
  );
}

/* ───────────────────────── bebidas em camadas ───────────────────────── */

const layerColor: Record<string, string> = {
  espresso: "#4a2814",
  coffee: "#5d3519",
  milk: "#ead9c2",
  foam: "#fbf6ee",
  water: "#9a6b45",
  chocolate: "#3a2116",
  cream: "#fffaf2",
  icecream: "#f4ead2",
  whiskey: "#b06a24",
  condensed: "#f2e3b8",
  ice: "#cfe3ea",
};
const layerName: Record<string, string> = {
  espresso: "espresso",
  coffee: "café",
  milk: "leite",
  foam: "espuma",
  water: "água",
  chocolate: "chocolate",
  cream: "chantilly",
  icecream: "sorvete",
  whiskey: "uísque",
  condensed: "leite condensado",
  ice: "gelo",
};

export function DrinkGlass({ layers, max = 4.3 }: { layers: { kind: string; h: number }[]; max?: number }) {
  const gid = useId().replace(/:/g, "");
  const W = 120;
  const H = 150;
  const unit = (H - 16) / max;
  let y = H;
  const rects = layers.map((l) => {
    const h = l.h * unit;
    y -= h;
    return { ...l, y, h };
  });
  return (
    <svg viewBox={`0 0 ${W + 70} ${H + 12}`} className="h-auto w-full" role="img" aria-label={`Camadas: ${layers.map((l) => layerName[l.kind]).join(", ")}`}>
      <defs>
        <clipPath id={`glass-${gid}`}>
          <path d={`M14 6 L${W - 14} 6 L${W - 22} ${H - 10} Q${W - 23} ${H} ${W - 34} ${H} L34 ${H} Q23 ${H} 22 ${H - 10} Z`} />
        </clipPath>
      </defs>
      <g clipPath={`url(#glass-${gid})`}>
        <rect x="0" y="0" width={W} height={H} fill="var(--surface-2)" />
        {rects.map((r, i) => (
          <motion.rect
            key={i}
            x="0"
            width={W}
            initial={{ y: H, height: 0 }}
            animate={{ y: r.y, height: r.h + 0.5 }}
            transition={{ duration: 0.7, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
            fill={layerColor[r.kind]}
          />
        ))}
        {rects.some((r) => r.kind === "ice") &&
          rects
            .filter((r) => r.kind === "ice")
            .map((r, i) => (
              <g key={`ice-${i}`} opacity="0.7">
                <rect x="30" y={r.y + 6} width="22" height="20" rx="4" fill="#fff" opacity="0.6" transform={`rotate(12 41 ${r.y + 16})`} />
                <rect x="62" y={r.y + 14} width="20" height="18" rx="4" fill="#fff" opacity="0.5" transform={`rotate(-10 72 ${r.y + 23})`} />
              </g>
            ))}
        <rect x="18" y="0" width="10" height={H} fill="#fff" opacity="0.16" />
      </g>
      <path
        d={`M14 6 L${W - 14} 6 L${W - 22} ${H - 10} Q${W - 23} ${H} ${W - 34} ${H} L34 ${H} Q23 ${H} 22 ${H - 10} Z`}
        fill="none"
        stroke="var(--line-strong)"
        strokeWidth="2"
      />
      {rects.map((r, i) => (
        <g key={`lbl-${i}`}>
          <line x1={W - 12} x2={W + 4} y1={r.y + r.h / 2} y2={r.y + r.h / 2} stroke="var(--axis)" />
          <text x={W + 8} y={r.y + r.h / 2 + 4} fontSize="11" fill="var(--ink-2)">
            {layerName[r.kind]}
          </text>
        </g>
      ))}
    </svg>
  );
}

/* ───────────────────────── ícones de preparo (traço) ───────────────────────── */

export function BrewIcon({ id, size = 44 }: { id: string; size?: number }) {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const icons: Record<string, React.ReactNode> = {
    espresso: (
      <>
        <path {...p} d="M8 14h26M12 14v-4h18v4M20 14v5M14 19h14l-1 4H15z" />
        <path {...p} d="M14 28h14v6a4 4 0 0 1-4 4h-6a4 4 0 0 1-4-4z M28 30h2a3 3 0 0 1 0 6h-2" />
        <path {...p} d="M21 23v3" strokeDasharray="1 2" />
      </>
    ),
    v60: (
      <>
        <path {...p} d="M8 10h28l-10 16h-8z" />
        <path {...p} d="M18 26v3h8v-3M12 34h20l-2 6H14z" />
        <path {...p} d="M15 14l4 8M22 13v9M29 14l-4 8" opacity="0.5" />
      </>
    ),
    coado: (
      <>
        <path {...p} d="M10 8h24M12 8c0 12 4 18 10 18s10-6 10-18" />
        <path {...p} d="M22 26v4M13 32h18v6a3 3 0 0 1-3 3H16a3 3 0 0 1-3-3z" />
        <path {...p} d="M34 8l6-3" />
      </>
    ),
    chemex: (
      <>
        <path {...p} d="M12 6h20l-8 16 8 16H12l8-16z" />
        <path {...p} d="M17 18h10" />
        <path {...p} d="M18 22h8" strokeWidth="4" opacity="0.5" />
      </>
    ),
    prensa: (
      <>
        <rect {...p} x="12" y="12" width="18" height="28" rx="2" />
        <path {...p} d="M30 18h4v16h-4M21 4v14M15 4h12M14 18h14" />
      </>
    ),
    aeropress: (
      <>
        <rect {...p} x="15" y="4" width="14" height="8" rx="1" />
        <rect {...p} x="13" y="12" width="18" height="22" rx="1" />
        <path {...p} d="M10 34h24M16 38h12v4H16z" />
      </>
    ),
    moka: (
      <>
        <path {...p} d="M14 22l-3 18h22l-3-18zM14 22h16" />
        <path {...p} d="M15 22l-2-14h18l-2 14M22 4v4M30 12h5l-4 6" />
      </>
    ),
    turco: (
      <>
        <path {...p} d="M12 14h16l-2 22a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3z" />
        <path {...p} d="M28 18l12-6M10 14l-2-2" />
      </>
    ),
    coldbrew: (
      <>
        <rect {...p} x="11" y="10" width="22" height="30" rx="4" />
        <path {...p} d="M13 6h18v4H13zM16 20h12M16 26h12" opacity="0.6" />
        <path {...p} d="M18 32l3-3 3 3-3 3z" />
      </>
    ),
    sifao: (
      <>
        <path {...p} d="M17 4h10v4l4 4v6H13v-6l4-4z" />
        <path {...p} d="M22 18v6" />
        <circle {...p} cx="22" cy="32" r="8" />
        <path {...p} d="M12 42h20" />
      </>
    ),
  };
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" aria-hidden>
      {icons[id] ?? icons.coado}
    </svg>
  );
}
