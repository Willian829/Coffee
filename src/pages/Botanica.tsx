import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { Search, ShieldCheck, ShieldAlert, Shield } from "lucide-react";
import { PageHero, Reveal, Section, NextChapter, Dots, SourceNote, Callout } from "../components/ui";
import { Bean, CherrySection } from "../components/illustrations";
import { fruitLayers, lineages, species, varieties, type Variety } from "../data/botany";
import { norm } from "../lib/format";
import { scrollToEl } from "../lib/smooth";

function HeroBeans() {
  return (
    <div className="relative grid grid-cols-2 gap-6">
      {[
        { name: "Arábica", sci: "Coffea arabica", color: "#a1784f", rot: -18, size: 150, note: "oval, fenda em S", round: false },
        { name: "Robusta", sci: "Coffea canephora", color: "#8d6a45", rot: 12, size: 128, note: "redondo, fenda reta", round: true },
      ].map((b, i) => (
        <motion.div
          key={b.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + i * 0.15, duration: 0.9 }}
          className="card flex flex-col items-center p-6 text-center"
        >
          <div className="grid h-40 place-items-center">
            <Bean color={b.color} size={b.size} rotate={b.rot} round={b.round} />
          </div>
          <p className="mt-2 font-display text-2xl">{b.name}</p>
          <p className="text-xs italic text-ink-3">{b.sci}</p>
          <p className="mt-2 text-xs text-ink-2">{b.note}</p>
        </motion.div>
      ))}
    </div>
  );
}

const compareRows: { label: string; arabica: number; robusta: number; unit: string; fmt: (v: number) => string }[] = [
  { label: "Cafeína (% do grão)", arabica: 1.2, robusta: 2.4, unit: "%", fmt: (v) => `${v.toString().replace(".", ",")}%` },
  { label: "Lipídios (% do grão)", arabica: 16, robusta: 10, unit: "%", fmt: (v) => `${v}%` },
  { label: "Sacarose (% do grão)", arabica: 7, robusta: 4, unit: "%", fmt: (v) => `${v}%` },
  { label: "Cromossomos", arabica: 44, robusta: 22, unit: "", fmt: (v) => `${v}` },
  { label: "Participação na produção (2025/26)", arabica: 56.9, robusta: 43.1, unit: "%", fmt: (v) => `${v.toString().replace(".", ",")}%` },
];

function SpeciesSection() {
  const [sel, setSel] = useState(species[0].id);
  const sp = species.find((s) => s.id === sel)!;
  return (
    <Section
      kicker="Espécies"
      title="Um gênero, 133 espécies — duas dominam o mundo"
      intro="O gênero Coffea pertence à família Rubiaceae, a mesma da gardênia. Quase todo o café bebido no planeta vem de duas espécies; outras três ganham atenção como apostas contra o aquecimento global."
    >
      <div className="mb-6 flex flex-wrap gap-2">
        {species.map((s) => (
          <button key={s.id} type="button" className="chip" aria-pressed={s.id === sel} onClick={() => setSel(s.id)}>
            {s.common}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={sp.id}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35 }}
          className="card grid gap-8 p-6 sm:p-10 lg:grid-cols-[1fr_1.4fr]"
        >
          <div>
            <p className="font-mono text-xs text-accent">{sp.share}</p>
            <h3 className="display mt-3 text-[clamp(2.4rem,5vw,3.8rem)]">{sp.common}</h3>
            <p className="mt-1 italic text-ink-3">{sp.name}</p>
            <p className="mt-6 text-ink-2">{sp.flavor}</p>
            <p className="mt-3 text-sm text-ink-2">
              <strong className="text-ink">Ponto forte:</strong> {sp.strengths}
            </p>
          </div>
          <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
            {[
              ["Origem", sp.origin],
              ["Genética", sp.ploidy],
              ["Polinização", sp.pollination],
              ["Altitude", sp.altitude],
              ["Clima", sp.temperature],
              ["Cafeína", sp.caffeine],
              ["Grão", sp.bean],
            ].map(([k, v]) => (
              <div key={k} className="border-t border-line pt-3">
                <dt className="kicker">{k}</dt>
                <dd className="mt-1.5 text-[0.95rem] text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </motion.div>
      </AnimatePresence>

      <Reveal className="mt-10">
        <div className="card p-6 sm:p-8" style={{ background: "var(--chart-surface)" }}>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-semibold">Arábica × robusta, lado a lado</h3>
            <ul className="flex gap-5 text-sm text-ink-2">
              <li className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-s1" /> Arábica
              </li>
              <li className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-s2" /> Robusta
              </li>
            </ul>
          </div>
          <div className="space-y-6">
            {compareRows.map((r) => {
              const max = Math.max(r.arabica, r.robusta);
              return (
                <div key={r.label} className="grid gap-2 sm:grid-cols-[220px_1fr] sm:items-center">
                  <p className="text-sm text-ink-2">{r.label}</p>
                  <div className="space-y-1.5">
                    {(["arabica", "robusta"] as const).map((k) => (
                      <div key={k} className="flex items-center gap-2">
                        <motion.div
                          className={`h-[14px] rounded-r-[4px] ${k === "arabica" ? "bg-s1" : "bg-s2"}`}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${(r[k] / max) * 80}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                        />
                        <span className="num text-xs text-ink-2">{r.fmt(r[k])}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <SourceNote>Valores médios típicos (Farah, 2012; Embrapa); participação na produção: OIC, set/2026. A composição varia com a variedade, o clima e a maturação.</SourceNote>
        </div>
      </Reveal>
    </Section>
  );
}

function Anatomy() {
  const [active, setActive] = useState<string | null>(null);
  return (
    <Section kicker="Anatomia" title="Dentro de uma cereja de café" intro="Passe o mouse (ou toque) nas camadas. O 'grão' que torramos é a semente — e normalmente há duas por fruto, com as faces planas voltadas uma para a outra.">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <Reveal className="mx-auto w-full max-w-[460px]">
          <CherrySection active={active} onHover={setActive} />
        </Reveal>
        <Reveal delay={0.1}>
          <ol className="space-y-2">
            {fruitLayers.map((l, i) => (
              <li key={l.id}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(l.id)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(l.id)}
                  onBlur={() => setActive(null)}
                  className={`w-full rounded-2xl border p-4 text-left transition-all duration-300 ${
                    active === l.id ? "border-line-strong bg-surface shadow-soft" : "border-transparent hover:bg-surface"
                  }`}
                >
                  <span className="flex items-baseline gap-3">
                    <span className="font-mono text-xs text-ink-3">{String(i + 1).padStart(2, "0")}</span>
                    <span className="font-display text-xl">{l.name}</span>
                  </span>
                  <span className="mt-1 block pl-8 text-sm leading-relaxed text-ink-2">{l.text}</span>
                </button>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-sm text-ink-2">
            <strong className="text-ink">Grão moca (peaberry):</strong> em ~5–10% dos frutos só uma semente se desenvolve, arredondada. Alguns produtores a separam e vendem
            como lote especial.
          </p>
        </Reveal>
      </div>
    </Section>
  );
}

function Genetics() {
  return (
    <Section kicker="Genética" title="A arábica é filha de um encontro improvável">
      <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
        <Reveal>
          <svg viewBox="0 0 600 330" className="h-auto w-full" role="img" aria-label="Diagrama: Coffea canephora e Coffea eugenioides cruzaram-se naturalmente e originaram Coffea arabica">
            {[
              { x: 110, label: "C. canephora", sub: "2n = 22 · robusta", color: "var(--s2)" },
              { x: 490, label: "C. eugenioides", sub: "2n = 22 · baixa cafeína", color: "var(--s5)" },
            ].map((n) => (
              <g key={n.label}>
                <circle cx={n.x} cy="70" r="46" fill={n.color} opacity="0.16" />
                <circle cx={n.x} cy="70" r="46" fill="none" stroke={n.color} strokeWidth="2" />
                <text x={n.x} y="66" textAnchor="middle" fontSize="15" fontStyle="italic" fill="var(--ink)">
                  {n.label}
                </text>
                <text x={n.x} y="86" textAnchor="middle" fontSize="11" fill="var(--ink-3)">
                  {n.sub}
                </text>
              </g>
            ))}
            <motion.path
              d="M150 104 C 220 190, 260 200, 300 222 M450 104 C 380 190, 340 200, 300 222"
              fill="none"
              stroke="var(--axis)"
              strokeWidth="2"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.4 }}
            />
            <text x="300" y="168" textAnchor="middle" fontSize="12" fill="var(--ink-3)">
              hibridização natural + duplicação do genoma
            </text>
            <text x="300" y="186" textAnchor="middle" fontSize="12" fill="var(--ink-3)">
              há ~350–610 mil anos
            </text>
            <circle cx="300" cy="262" r="56" fill="var(--s1)" opacity="0.16" />
            <circle cx="300" cy="262" r="56" fill="none" stroke="var(--s1)" strokeWidth="2.5" />
            <text x="300" y="258" textAnchor="middle" fontSize="17" fontStyle="italic" fill="var(--ink)">
              C. arabica
            </text>
            <text x="300" y="278" textAnchor="middle" fontSize="11" fill="var(--ink-3)">
              2n = 44 · tetraploide
            </text>
          </svg>
        </Reveal>
        <Reveal delay={0.1} className="prose-atlas">
          <p>
            A arábica é <strong>alotetraploide</strong>: carrega dois genomas completos, herdados da robusta (<em>C. canephora</em>) e de <em>C. eugenioides</em>. Um estudo
            publicado na <em>Nature Genetics</em> em 2024 situou esse cruzamento entre 350 e 610 mil anos atrás, no sudoeste da Etiópia.
          </p>
          <p>
            Por se autopolinizar e ter passado por vários “gargalos” populacionais, a arábica cultivada tem <strong>diversidade genética muito baixa</strong>: boa parte do café das
            Américas descende de poucas plantas levadas do Iêmen. Por isso as florestas da Etiópia — e os bancos de germoplasma — são tão valiosos para o futuro.
          </p>
        </Reveal>
      </div>
    </Section>
  );
}

const tree = {
  nodes: [
    { id: "etiopia", label: "Landraces etíopes", x: 210, y: 30 },
    { id: "robusta", label: "C. canephora (robusta)", x: 520, y: 30 },
    { id: "geisha", label: "Gesha", x: 50, y: 120 },
    { id: "typica", label: "Typica", x: 160, y: 120 },
    { id: "bourbon", label: "Bourbon", x: 320, y: 120 },
    { id: "timor", label: "Híbrido de Timor", x: 520, y: 120 },
    { id: "maragogipe", label: "Maragogipe", x: 60, y: 220 },
    { id: "mundonovo", label: "Mundo Novo", x: 170, y: 220 },
    { id: "caturra", label: "Caturra", x: 275, y: 220 },
    { id: "pacas", label: "Pacas", x: 360, y: 220 },
    { id: "villasarchi", label: "Villa Sarchi", x: 455, y: 220 },
    { id: "sl28", label: "SL28 · SL34", x: 570, y: 220 },
    { id: "catuai", label: "Catuaí", x: 130, y: 320 },
    { id: "pacamara", label: "Pacamara", x: 240, y: 320 },
    { id: "catimor", label: "Catimor", x: 360, y: 320 },
    { id: "sarchimor", label: "Sarchimor", x: 500, y: 320 },
    { id: "castillo", label: "Castillo", x: 330, y: 420 },
    { id: "obata", label: "Obatã · Marsellesa", x: 505, y: 420 },
    { id: "arara", label: "Arara", x: 330, y: 500 },
  ],
  links: [
    ["etiopia", "geisha"],
    ["etiopia", "typica"],
    ["etiopia", "bourbon"],
    ["robusta", "timor"],
    ["bourbon", "sl28"],
    ["typica", "maragogipe"],
    ["typica", "mundonovo"],
    ["bourbon", "mundonovo"],
    ["bourbon", "caturra"],
    ["bourbon", "pacas"],
    ["bourbon", "villasarchi"],
    ["mundonovo", "catuai"],
    ["caturra", "catuai"],
    ["pacas", "pacamara"],
    ["maragogipe", "pacamara"],
    ["caturra", "catimor"],
    ["timor", "catimor"],
    ["villasarchi", "sarchimor"],
    ["timor", "sarchimor"],
    ["catimor", "castillo"],
    ["sarchimor", "obata"],
    ["obata", "arara"],
    ["catuai", "arara"],
  ] as [string, string][],
};

function FamilyTree() {
  const pos = new Map(tree.nodes.map((n) => [n.id, n]));
  return (
    <Reveal className="card mt-10 overflow-hidden p-4 sm:p-8" >
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-lg font-semibold">Árvore genealógica simplificada</h3>
        <p className="text-sm text-ink-3">Linhas = cruzamento ou seleção · em verde: com genes de robusta</p>
      </div>
      <div className="scroll-x" data-lenis-prevent-wheel>
        <svg viewBox="-20 0 680 530" className="mx-auto h-auto w-full min-w-[620px] max-w-[820px]" role="img" aria-label="Árvore genealógica das principais variedades de arábica">
          {tree.links.map(([a, b]) => {
            const p = pos.get(a)!;
            const q = pos.get(b)!;
            const my = (p.y + q.y) / 2;
            return <path key={a + b} d={`M${p.x},${p.y + 12} C${p.x},${my} ${q.x},${my} ${q.x},${q.y - 12}`} fill="none" stroke="var(--axis)" strokeWidth="1.5" />;
          })}
          {tree.nodes.map((n) => {
            const introgressed = ["robusta", "timor", "catimor", "sarchimor", "castillo", "obata", "arara"].includes(n.id);
            return (
              <g key={n.id} transform={`translate(${n.x},${n.y})`}>
                <rect x={-n.label.length * 3.4 - 10} y={-13} width={n.label.length * 6.8 + 20} height={26} rx={13} fill="var(--surface)" stroke={introgressed ? "var(--leaf)" : "var(--line-strong)"} strokeWidth={introgressed ? 1.8 : 1} />
                <text textAnchor="middle" dy="0.34em" fontSize="12" fill="var(--ink)">
                  {n.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </Reveal>
  );
}

const rustIcon = { suscetível: ShieldAlert, tolerante: Shield, resistente: ShieldCheck };
const rustColor = { suscetível: "text-accent", tolerante: "text-gold", resistente: "text-leaf" };

function VarietyCard({ v, highlight }: { v: Variety; highlight: boolean }) {
  const Icon = rustIcon[v.rust];
  return (
    <motion.article
      layout
      id={`var-${norm(v.name).replace(/[^a-z0-9]+/g, "-")}`}
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.3 }}
      className={`card flex flex-col p-5 transition-shadow ${highlight ? "ring-2 ring-accent" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-display text-[1.45rem] leading-tight">{v.name}</h4>
          <p className="text-xs text-ink-3">
            {v.origin} · {v.year}
          </p>
        </div>
        <span className="chip py-0.5! text-[0.7rem]!">{v.species}</span>
      </div>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-2">{v.note}</p>
      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4 text-xs">
        <div>
          <p className="mb-1 text-ink-3">Produtividade</p>
          <Dots value={v.yield} max={4} label="Produtividade" />
        </div>
        <div>
          <p className="mb-1 text-ink-3">Potencial de qualidade</p>
          <Dots value={v.quality} max={5} label="Qualidade" />
        </div>
        <p className="flex items-center gap-1.5 text-ink-2">
          <Icon size={14} className={rustColor[v.rust]} /> Ferrugem: {v.rust}
        </p>
        <p className="text-ink-2">Porte {v.stature}</p>
      </div>
      <p className="mt-3 text-[0.7rem] uppercase tracking-wider text-ink-3">{v.lineage}</p>
    </motion.article>
  );
}

function Catalog() {
  const [params] = useSearchParams();
  const focus = params.get("variedade");
  const [q, setQ] = useState("");
  const [lineage, setLineage] = useState("todas");
  const [rust, setRust] = useState("todas");
  const [sort, setSort] = useState<"nome" | "qualidade" | "produtividade">("nome");

  useEffect(() => {
    if (!focus) return;
    const id = `var-${norm(focus).replace(/[^a-z0-9]+/g, "-")}`;
    const t = window.setTimeout(() => scrollToEl(document.getElementById(id), -140), 500);
    return () => window.clearTimeout(t);
  }, [focus]);

  const list = useMemo(() => {
    const n = norm(q);
    const out = varieties.filter(
      (v) =>
        (lineage === "todas" || v.lineage === lineage) &&
        (rust === "todas" || v.rust === rust) &&
        (!n || norm(`${v.name} ${v.origin} ${v.note}`).includes(n)),
    );
    return out.sort((a, b) => (sort === "nome" ? a.name.localeCompare(b.name) : sort === "qualidade" ? b.quality - a.quality : b.yield - a.yield));
  }, [q, lineage, rust, sort]);

  return (
    <Section
      id="variedades"
      kicker="Catálogo"
      title="Variedades: de Typica a híbridos F1"
      intro="Cada variedade equilibra produtividade, resistência e sabor. Filtre por linhagem genética ou resistência à ferrugem, a doença mais temida dos cafezais."
    >
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center">
        <label className="flex h-11 flex-1 items-center gap-2 rounded-full border border-line bg-surface px-4 focus-within:border-line-strong">
          <Search size={16} className="text-ink-3" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar variedade, país…" className="h-full flex-1 bg-transparent outline-none placeholder:text-ink-3" aria-label="Buscar variedade" />
        </label>
        <select value={lineage} onChange={(e) => setLineage(e.target.value)} className="h-11 rounded-full border border-line bg-surface px-4 text-sm" aria-label="Linhagem">
          <option value="todas">Todas as linhagens</option>
          {lineages.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
        <select value={rust} onChange={(e) => setRust(e.target.value)} className="h-11 rounded-full border border-line bg-surface px-4 text-sm" aria-label="Resistência à ferrugem">
          <option value="todas">Qualquer resistência</option>
          <option value="resistente">Resistente</option>
          <option value="tolerante">Tolerante</option>
          <option value="suscetível">Suscetível</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="h-11 rounded-full border border-line bg-surface px-4 text-sm" aria-label="Ordenar">
          <option value="nome">Ordem alfabética</option>
          <option value="qualidade">Maior potencial de qualidade</option>
          <option value="produtividade">Maior produtividade</option>
        </select>
      </div>
      <p className="mb-5 text-sm text-ink-3">{list.length} variedades</p>
      <motion.div layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {list.map((v) => (
            <VarietyCard key={v.name} v={v} highlight={!!focus && norm(focus) === norm(v.name)} />
          ))}
        </AnimatePresence>
      </motion.div>
      <SourceNote>
        Classificações qualitativas baseadas no catálogo de variedades da World Coffee Research e em instituições de pesquisa (IAC, Procafé, Cenicafé, CIRAD). O desempenho
        real depende de altitude, clima e manejo.
      </SourceNote>
      <FamilyTree />
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <Callout title="Por que tantas variedades 'com robusta'?" tone="leaf">
          A resistência à ferrugem veio do Híbrido de Timor, um cruzamento natural com robusta. Programas de melhoramento combinaram essa resistência com a qualidade do
          arábica — às vezes com algum custo de sabor, cada vez menor nas variedades novas.
        </Callout>
        <Callout title="Híbridos F1: o próximo salto" tone="gold">
          Cruzar linhagens geneticamente distantes gera plantas mais vigorosas (heterose): produtividade 30–40% maior, resistência e boa qualidade. O desafio é multiplicá-las
          em escala.
        </Callout>
      </div>
    </Section>
  );
}

export default function Botanica() {
  return (
    <>
      <PageHero
        path="/botanica"
        title={
          <>
            A planta <span className="italic text-ink-2">por trás</span> do grão
          </>
        }
        lead="Um arbusto de folhas lustrosas, flores de jasmim e frutos vermelhos: conheça as espécies do gênero Coffea, a anatomia da cereja e as variedades que definem o sabor da sua xícara."
        aside={<HeroBeans />}
      />
      <SpeciesSection />
      <Anatomy />
      <Genetics />
      <Catalog />
      <NextChapter path="/botanica" />
    </>
  );
}
