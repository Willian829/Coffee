import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { hierarchy, partition, type HierarchyRectangularNode } from "d3-hierarchy";
import { arc as d3arc } from "d3-shape";
import { ChevronRight, RotateCcw } from "lucide-react";
import { PageHero, Reveal, Section, NextChapter, SourceNote, Callout } from "../components/ui";
import { cuppingAttributes, cuppingProtocol, flavorWheel, scoreBands, type FlavorNode } from "../data/flavor";
import { fmt } from "../lib/format";

type Node = HierarchyRectangularNode<FlavorNode>;

const categoryNotes: Record<string, string> = {
  Floral: "Jasmim, rosa, chá preto: típico de etíopes lavados e de Geishas.",
  Frutado: "Frutas vermelhas, cítricos e frutas secas: naturais etíopes, quenianos, cafés de altitude.",
  "Ácido / Fermentado": "Acidez cítrica e málica quando agradável; notas vinosas e alcoólicas em fermentações longas.",
  "Verde / Vegetal": "Ervas, feno e vagem: muitas vezes sinal de grãos imaturos ou torra curta.",
  Outros: "Papel, mofo, químicos: geralmente defeitos de armazenamento, processamento ou água.",
  Torrado: "Cereais, tabaco e defumado: vêm principalmente da torra, das claras às escuras.",
  Especiarias: "Canela, cravo, pimenta: comuns em cafés indonésios e em alguns fermentados.",
  "Nozes / Cacau": "Chocolate, amêndoa, avelã: a assinatura clássica de muitos cafés brasileiros.",
  Doce: "Caramelo, mel, melaço e baunilha: doçura que vem da maturação e da torra bem feita.",
};

const luminance = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};

type Coords = { x0: number; x1: number; y0: number; y1: number };

function FlavorWheel() {
  const size = 620;
  const radius = size / 2;
  const ringW = radius / 4.15;
  const root = useMemo(() => {
    const h = hierarchy<FlavorNode>(flavorWheel).sum((d) => (d.children ? 0 : 1));
    return partition<FlavorNode>().size([2 * Math.PI, h.height + 1])(h);
  }, []);
  const nodes = useMemo(() => root.descendants().slice(1), [root]);
  const [focus, setFocus] = useState<Node>(root);
  const [hover, setHover] = useState<Node | null>(null);
  const target = (n: Node, f: Node): Coords => ({
    x0: Math.max(0, Math.min(1, (n.x0 - f.x0) / (f.x1 - f.x0))) * 2 * Math.PI,
    x1: Math.max(0, Math.min(1, (n.x1 - f.x0) / (f.x1 - f.x0))) * 2 * Math.PI,
    y0: Math.max(0, n.y0 - f.depth),
    y1: Math.max(0, n.y1 - f.depth),
  });
  const [coords, setCoords] = useState<Map<Node, Coords>>(() => new Map(nodes.map((n) => [n, target(n, root)])));
  const coordsRef = useRef(coords);
  coordsRef.current = coords;

  useEffect(() => {
    const from = coordsRef.current;
    const to = new Map(nodes.map((n) => [n, target(n, focus)]));
    const t0 = performance.now();
    const dur = 750;
    let raf = 0;
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);
    const tick = (now: number) => {
      const p = ease(Math.min(1, (now - t0) / dur));
      const next = new Map<Node, Coords>();
      nodes.forEach((n) => {
        const a = from.get(n)!;
        const b = to.get(n)!;
        next.set(n, { x0: a.x0 + (b.x0 - a.x0) * p, x1: a.x1 + (b.x1 - a.x1) * p, y0: a.y0 + (b.y0 - a.y0) * p, y1: a.y1 + (b.y1 - a.y1) * p });
      });
      setCoords(next);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus]);

  const arcGen = d3arc<Coords>()
    .startAngle((d) => d.x0)
    .endAngle((d) => d.x1)
    .padAngle((d) => Math.min((d.x1 - d.x0) / 2, 0.004))
    .padRadius(radius * 1.2)
    .innerRadius((d) => d.y0 * ringW)
    .outerRadius((d) => Math.max(d.y0 * ringW, d.y1 * ringW - 1.5));

  const topColor = (n: Node) => {
    let a: Node = n;
    while (a.depth > 1 && a.parent) a = a.parent;
    return a.data.color ?? "#999";
  };
  const visible = (c: Coords) => c.y1 <= 4.01 && c.y0 >= 0.99 && c.x1 - c.x0 > 0.0005;
  const labelVisible = (c: Coords) => visible(c) && (c.y1 - c.y0) * ((c.x1 - c.x0) * (c.y0 + c.y1) * 0.5) * ringW > 13;

  const active = hover ?? (focus.depth > 0 ? focus : null);
  const path = active ? active.ancestors().reverse().slice(1) : [];
  const top = active ? (active.depth === 1 ? active : active.ancestors().find((a) => a.depth === 1)) : null;

  return (
    <div className="grid items-center gap-10 lg:grid-cols-[1.25fr_1fr]">
      <div className="relative mx-auto w-full max-w-[620px]">
        <svg viewBox={`${-radius} ${-radius} ${size} ${size}`} className="h-auto w-full" role="img" aria-label="Roda de sabores do café, interativa">
          {nodes.map((n) => {
            const c = coords.get(n)!;
            if (!visible(c)) return null;
            const depthRel = c.y0;
            const col = topColor(n);
            return (
              <path
                key={n.ancestors().map((a) => a.data.name).join("/")}
                d={arcGen(c) ?? ""}
                fill={col}
                fillOpacity={depthRel < 1.5 ? 1 : depthRel < 2.5 ? 0.72 : 0.5}
                stroke={hover === n ? "var(--ink)" : "none"}
                strokeWidth={1.5}
                style={{ cursor: n.children ? "pointer" : "default" }}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(null)}
                onClick={() => n.children && setFocus(n)}
              />
            );
          })}
          {nodes.map((n) => {
            const c = coords.get(n)!;
            if (!labelVisible(c)) return null;
            const a = ((c.x0 + c.x1) / 2) * (180 / Math.PI);
            const r = ((c.y0 + c.y1) / 2) * ringW;
            const flip = a > 180;
            const col = topColor(n);
            const inner = c.y0 < 1.5;
            const fill = inner ? (luminance(col) > 0.38 ? "#1b120c" : "#fff") : "var(--ink)";
            return (
              <text
                key={`t-${n.ancestors().map((x) => x.data.name).join("/")}`}
                transform={`rotate(${a - 90}) translate(${r},0) rotate(${flip ? 180 : 0})`}
                textAnchor="middle"
                dy="0.35em"
                fontSize={inner ? 11.5 : 10}
                fontWeight={inner ? 600 : 400}
                fill={fill}
                pointerEvents="none"
              >
                {n.data.name.length > (inner ? 19 : 15) ? n.data.name.slice(0, inner ? 18 : 14) + "…" : n.data.name}
              </text>
            );
          })}
          <g style={{ cursor: focus.depth > 0 ? "pointer" : "default" }} onClick={() => focus.parent && setFocus(focus.parent)}>
            <circle r={ringW - 4} fill="var(--surface)" stroke="var(--line)" />
            <text textAnchor="middle" dy={focus.depth > 0 ? "-0.3em" : "0.35em"} fontSize="15" fontFamily="var(--font-display)" fill="var(--ink)">
              {focus.depth > 0 ? focus.data.name : "Sabores"}
            </text>
            {focus.depth > 0 && (
              <text textAnchor="middle" dy="1.3em" fontSize="10.5" fill="var(--ink-3)">
                ← voltar
              </text>
            )}
          </g>
        </svg>
      </div>
      <div>
        <div className="flex min-h-[28px] flex-wrap items-center gap-1 text-sm text-ink-3">
          <button type="button" onClick={() => setFocus(root)} className="hover:text-ink">
            Roda
          </button>
          {path.map((p) => (
            <span key={p.data.name + p.depth} className="flex items-center gap-1">
              <ChevronRight size={13} />
              <button type="button" onClick={() => p.children && setFocus(p)} className={p === active ? "font-semibold text-ink" : "hover:text-ink"}>
                {p.data.name}
              </button>
            </span>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={top?.data.name ?? "root"} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="mt-4">
            {top ? (
              <>
                <span className="inline-block h-3 w-10 rounded-full" style={{ background: top.data.color }} />
                <p className="display mt-3 text-5xl">{top.data.name}</p>
                <p className="mt-3 text-lg text-ink-2">{categoryNotes[top.data.name]}</p>
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {top.leaves().map((l) => (
                    <span key={l.data.name + l.parent?.data.name} className={`chip text-xs! ${l === hover ? "border-ink! text-ink!" : ""}`}>
                      {l.data.name}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <>
                <p className="display text-4xl">9 famílias, ~110 descritores</p>
                <p className="mt-3 text-lg text-ink-2">
                  Clique numa fatia para ampliar. Comece pelo centro, onde estão as categorias amplas, e vá para fora em busca de notas específicas — é assim que os provadores usam a
                  roda.
                </p>
              </>
            )}
          </motion.div>
        </AnimatePresence>
        {focus.depth > 0 && (
          <button type="button" onClick={() => setFocus(root)} className="btn btn-ghost mt-6">
            <RotateCcw size={15} /> Ver a roda inteira
          </button>
        )}
      </div>
    </div>
  );
}

const attrKeys = ["Fragrância / Aroma", "Sabor", "Retrogosto", "Acidez", "Corpo", "Equilíbrio", "Nota global"];
const cupKeys = ["Uniformidade", "Xícara limpa", "Doçura"];

function ScoreCalculator() {
  const [vals, setVals] = useState<Record<string, number>>(() => Object.fromEntries([...attrKeys.map((k) => [k, 7.75]), ...cupKeys.map((k) => [k, 10])]));
  const [defects, setDefects] = useState(0);
  const total = Object.values(vals).reduce((a, b) => a + b, 0) - defects;
  const band = scoreBands.find((b) => total >= b.min && total <= b.max) ?? scoreBands[scoreBands.length - 1];
  const pct = Math.max(0, Math.min(1, (total - 60) / 40));

  return (
    <div className="card grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.4fr_1fr]">
      <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
        {attrKeys.map((k) => (
          <label key={k} className="block">
            <span className="mb-1 flex justify-between text-sm">
              <span className="text-ink-2">{k}</span>
              <span className="num font-semibold text-ink">{fmt(vals[k], 2)}</span>
            </span>
            <input type="range" min={6} max={10} step={0.25} value={vals[k]} onChange={(e) => setVals((v) => ({ ...v, [k]: Number(e.target.value) }))} className="w-full" />
          </label>
        ))}
        {cupKeys.map((k) => (
          <label key={k} className="block">
            <span className="mb-1 flex justify-between text-sm">
              <span className="text-ink-2">{k} (xícaras ok × 2)</span>
              <span className="num font-semibold text-ink">{vals[k]}</span>
            </span>
            <input type="range" min={0} max={10} step={2} value={vals[k]} onChange={(e) => setVals((v) => ({ ...v, [k]: Number(e.target.value) }))} className="w-full" />
          </label>
        ))}
        <label className="block">
          <span className="mb-1 flex justify-between text-sm">
            <span className="text-ink-2">Defeitos (−2 leve / −4 grave por xícara)</span>
            <span className="num font-semibold text-accent">−{defects}</span>
          </span>
          <input type="range" min={0} max={20} step={2} value={defects} onChange={(e) => setDefects(Number(e.target.value))} className="w-full" />
        </label>
      </div>
      <div className="flex flex-col justify-center rounded-2xl bg-surface-2 p-6 text-center">
        <p className="kicker">Pontuação final</p>
        <motion.p key={Math.round(total * 4)} initial={{ scale: 0.92, opacity: 0.6 }} animate={{ scale: 1, opacity: 1 }} className="display mt-2 text-7xl">
          {fmt(total, 2)}
        </motion.p>
        <p className={`mt-2 font-display text-2xl ${total >= 80 ? "text-leaf" : "text-accent"}`}>{band.label}</p>
        <p className="mt-1 text-sm text-ink-2">{band.text}</p>
        <div className="relative mt-6 h-3 rounded-full" style={{ background: "linear-gradient(90deg, var(--surface-3) 0%, var(--surface-3) 50%, var(--seq-3) 50%, var(--seq-4) 62.5%, var(--seq-6) 75%, var(--seq-6) 100%)" }}>
          <motion.span className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--surface)] bg-ink" animate={{ left: `${pct * 100}%` }} />
        </div>
        <div className="mt-1.5 flex justify-between text-[0.7rem] text-ink-3">
          <span>60</span>
          <span>80</span>
          <span>85</span>
          <span>90</span>
          <span>100</span>
        </div>
      </div>
    </div>
  );
}

export default function Sabor() {
  return (
    <>
      <PageHero
        path="/sabor"
        title={
          <>
            Provar <span className="italic text-ink-2">é</span> uma língua
          </>
        }
        lead="Jasmim, groselha, caramelo, chocolate amargo: o café tem mais compostos aromáticos que o vinho. Aprenda o vocabulário dos provadores, o ritual do cupping e como funciona a famosa escala de 100 pontos."
        aside={
          <div className="grid grid-cols-3 gap-2">
            {flavorWheel.children!.map((c, i) => (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.06 }}
                className="grid aspect-square place-items-center rounded-2xl p-2 text-center text-sm font-semibold"
                style={{ background: c.color, color: luminance(c.color!) > 0.38 ? "#1b120c" : "#fff" }}
              >
                {c.name}
              </motion.div>
            ))}
          </div>
        }
      />

      <Section kicker="Roda de sabores" title="Do geral ao específico" intro="A roda da SCA e da World Coffee Research (2016) organiza os descritores do café em três níveis. Cada termo tem uma referência física padronizada no Léxico Sensorial da WCR.">
        <FlavorWheel />
        <SourceNote>Estrutura da Coffee Taster's Flavor Wheel (SCA & WCR, 2016), em tradução livre. As cores seguem a inspiração da roda original.</SourceNote>
      </Section>

      <Section kicker="Cupping" title="O ritual da prova de xícara" intro="Profissionais do mundo inteiro avaliam cafés do mesmo jeito, para que uma nota dada no Brasil signifique o mesmo no Japão.">
        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
          {cuppingProtocol.map((c, i) => (
            <Reveal key={c.step} delay={i * 0.05}>
              <div className="card h-full p-5">
                <span className="font-mono text-xs text-accent">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-2 font-display text-xl">{c.step}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-2">{c.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="mt-10 grid gap-x-10 gap-y-5 sm:grid-cols-2 lg:grid-cols-5">
          {cuppingAttributes.map((a, i) => (
            <Reveal key={a.name} delay={(i % 5) * 0.04}>
              <p className="font-semibold text-ink">{a.name}</p>
              <p className="mt-1 text-sm text-ink-2">{a.text}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section kicker="Pontuação" title="Calcule a nota de um café" intro="No formulário clássico da SCA, sete atributos valem de 6 a 10; uniformidade, xícara limpa e doçura somam 2 pontos por xícara aprovada; defeitos são descontados.">
        <ScoreCalculator />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Callout title="Q Grader" tone="gold">
            Provadores certificados pelo Coffee Quality Institute passam por cerca de 20 testes — de identificação de aromas a acidez e calibração de notas.
          </Callout>
          <Callout title="Novo sistema CVA" tone="leaf">
            A SCA lançou o Coffee Value Assessment, que separa a descrição objetiva (o que se sente) da avaliação afetiva (quanto se gosta) e a origem e o processo do café.
          </Callout>
          <Callout title="Prove em casa" tone="accent">
            Faça dois cafés lado a lado, mesma receita. Comparar é o melhor treino: diferenças que somem sozinhas saltam aos olhos (e ao nariz) em paralelo.
          </Callout>
        </div>
      </Section>

      <NextChapter path="/sabor" />
    </>
  );
}
