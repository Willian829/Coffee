import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { Plus, Trash2, ShieldCheck, Minus, TriangleAlert, Moon } from "lucide-react";
import { PageHero, Reveal, Section, NextChapter, SourceNote, ChartCard, Legend, Callout } from "../components/ui";
import LineChart from "../components/charts/LineChart";
import BarList from "../components/charts/BarList";
import { caffeineFacts, caffeineItems, evidence, halfLifeFactors, limits } from "../data/health";
import { fmtInt } from "../lib/format";
import { useLocalState } from "../lib/hooks";

function CaffeineMolecule() {
  const atom = (x: number, y: number, label: string, color = "var(--ink)") => (
    <g transform={`translate(${x},${y})`}>
      <circle r="13" fill="var(--bg)" />
      <text textAnchor="middle" dy="0.36em" fontSize="15" fontWeight="600" fill={color}>
        {label}
      </text>
    </g>
  );
  const bond = (x1: number, y1: number, x2: number, y2: number, double = false, inner?: [number, number]) => {
    const lines = [<line key="a" x1={x1} y1={y1} x2={x2} y2={y2} />];
    if (double) {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const len = Math.hypot(dx, dy);
      let nx = -dy / len;
      let ny = dx / len;
      if (inner) {
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;
        if ((inner[0] - mx) * nx + (inner[1] - my) * ny < 0) {
          nx = -nx;
          ny = -ny;
        }
      }
      const o = 7;
      const s = 0.14;
      lines.push(<line key="b" x1={x1 + nx * o + dx * s} y1={y1 + ny * o + dy * s} x2={x2 + nx * o - dx * s} y2={y2 + ny * o - dy * s} />);
    }
    return lines;
  };
  const C6: [number, number] = [140, 112];
  const C5: [number, number] = [181.6, 136];
  const C4: [number, number] = [181.6, 184];
  const N3: [number, number] = [140, 208];
  const C2: [number, number] = [98.4, 184];
  const N1: [number, number] = [98.4, 136];
  const N7: [number, number] = [227, 121];
  const C8: [number, number] = [255, 160];
  const N9: [number, number] = [227, 199];
  const hex: [number, number] = [140, 160];
  const pent: [number, number] = [214, 160];
  return (
    <svg viewBox="30 40 280 268" className="mx-auto h-auto w-full max-w-[420px]" role="img" aria-label="Fórmula estrutural da cafeína, C8H10N4O2">
      <motion.g
        stroke="var(--ink-2)"
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {bond(...C6, ...C5)}
        {bond(...C5, ...C4, true, hex)}
        {bond(...C4, ...N3)}
        {bond(...N3, ...C2)}
        {bond(...C2, ...N1)}
        {bond(...N1, ...C6)}
        {bond(...C5, ...N7)}
        {bond(...N7, ...C8)}
        {bond(...C8, ...N9, true, pent)}
        {bond(...N9, ...C4)}
        {bond(140, 112, 140, 70, true, [160, 90])}
        {bond(98.4, 184, 62, 205, true, [90, 215])}
        {bond(...N1, 62, 115)}
        {bond(...N3, 140, 250)}
        {bond(...N7, 240, 80)}
      </motion.g>
      {atom(140, 66, "O", "var(--accent)")}
      {atom(58, 208, "O", "var(--accent)")}
      {atom(...N1, "N", "var(--s2)")}
      {atom(...N3, "N", "var(--s2)")}
      {atom(...N7, "N", "var(--s2)")}
      {atom(...N9, "N", "var(--s2)")}
      {atom(56, 112, "CH₃")}
      {atom(140, 256, "CH₃")}
      {atom(246, 72, "CH₃")}
      <text x="276" y="166" fontSize="14" fill="var(--ink-3)">
        H
      </text>
      <text x="170" y="292" textAnchor="middle" fontSize="13" fill="var(--ink-3)" fontFamily="var(--font-mono)">
        C₈H₁₀N₄O₂ · 1,3,7-trimetilxantina
      </text>
    </svg>
  );
}

type Drink = { id: number; item: string; hour: number };

const ka = Math.LN2 / 0.25; // absorção: meia-vida de ~15 min

function CaffeineSimulator() {
  const [drinks, setDrinks] = useLocalState<Drink[]>("atlas-cafeina", [
    { id: 1, item: "coado", hour: 8 },
    { id: 2, item: "espresso", hour: 13.5 },
    { id: 3, item: "cappuccino", hour: 16 },
  ]);
  const [halfLife, setHalfLife] = useState(limits.halfLifeHours);
  const [bed, setBed] = useState(23);
  const [newItem, setNewItem] = useState("coado");
  const [newHour, setNewHour] = useState(10);

  const ke = Math.LN2 / halfLife;
  const mgOf = (id: string) => caffeineItems.find((c) => c.id === id)?.mg ?? 0;
  const amountAt = (h: number) =>
    drinks.reduce((sum, d) => {
      const t = h - d.hour;
      if (t <= 0) return sum;
      const D = mgOf(d.item);
      return sum + ((D * ka) / (ka - ke)) * (Math.exp(-ke * t) - Math.exp(-ka * t));
    }, 0);

  const series = useMemo(() => {
    const pts = [];
    for (let h = 6; h <= 30; h += 0.1) pts.push({ x: h, y: amountAt(h) });
    return [{ id: "c", label: "Cafeína no corpo", color: "var(--s1)", values: pts }];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drinks, halfLife]);

  const total = drinks.reduce((s, d) => s + mgOf(d.item), 0);
  const atBed = amountAt(bed);
  const peak = Math.max(...series[0].values.map((p) => p.y));
  // horário-limite para que um coado (95 mg) deixe < 25 mg na hora de dormir
  const cutoff = bed - Math.log(95 / 25) / ke;
  const hh = (h: number) => {
    const n = ((h % 24) + 24) % 24;
    return `${String(Math.floor(n)).padStart(2, "0")}:${String(Math.round((n % 1) * 60)).padStart(2, "0")}`;
  };
  const pct = Math.min(1.25, total / limits.adult);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
      <div className="card p-6">
        <p className="kicker">Seu dia de café</p>
        <ul className="mt-4 space-y-2">
          <AnimatePresence initial={false}>
            {[...drinks]
              .sort((a, b) => a.hour - b.hour)
              .map((d) => {
                const it = caffeineItems.find((c) => c.id === d.item);
                return (
                  <motion.li key={d.id} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="flex items-center gap-3 rounded-xl bg-surface-2 px-3 py-2">
                    <span className="num w-12 font-mono text-sm text-ink-3">{hh(d.hour)}</span>
                    <span className="flex-1 text-sm text-ink">{it?.name}</span>
                    <span className="num text-sm text-ink-2">{it?.mg} mg</span>
                    <button type="button" onClick={() => setDrinks((ds) => ds.filter((x) => x.id !== d.id))} className="text-ink-3 hover:text-accent" aria-label={`Remover ${it?.name}`}>
                      <Trash2 size={15} />
                    </button>
                  </motion.li>
                );
              })}
          </AnimatePresence>
        </ul>
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
          <select value={newItem} onChange={(e) => setNewItem(e.target.value)} className="h-10 flex-1 rounded-full border border-line bg-surface px-3 text-sm" aria-label="Bebida">
            {caffeineItems.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.mg} mg)
              </option>
            ))}
          </select>
          <select value={newHour} onChange={(e) => setNewHour(Number(e.target.value))} className="h-10 rounded-full border border-line bg-surface px-3 text-sm" aria-label="Horário">
            {Array.from({ length: 37 }, (_, i) => 6 + i * 0.5).map((h) => (
              <option key={h} value={h}>
                {hh(h)}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn btn-primary px-4! py-2!"
            onClick={() => setDrinks((ds) => [...ds, { id: Date.now(), item: newItem, hour: newHour }])}
            disabled={drinks.length >= 12}
          >
            <Plus size={15} /> Adicionar
          </button>
        </div>
        <div className="mt-6">
          <div className="mb-1.5 flex justify-between text-sm">
            <span className="text-ink-2">Total do dia</span>
            <span className={`num font-semibold ${total > limits.adult ? "text-accent" : "text-ink"}`}>
              {fmtInt(total)} / {limits.adult} mg
            </span>
          </div>
          <div className="relative h-3 overflow-hidden rounded-full bg-surface-3">
            <motion.div className="h-full rounded-full" style={{ background: total > limits.adult ? "var(--accent)" : total > limits.adult * 0.75 ? "var(--s3)" : "var(--leaf)" }} animate={{ width: `${Math.min(100, (pct / 1.25) * 100)}%` }} />
            <span className="absolute inset-y-0 w-px bg-ink" style={{ left: `${(1 / 1.25) * 100}%` }} />
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-3">
            {total > limits.adult ? <TriangleAlert size={13} className="text-accent" /> : <ShieldCheck size={13} className="text-leaf" />}
            {total > limits.adult ? "Acima do limite de 400 mg/dia sugerido pela EFSA para adultos saudáveis." : "Dentro do limite de 400 mg/dia (EFSA) para adultos saudáveis."}
          </p>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block text-ink-3">Metabolismo</span>
            <select value={halfLife} onChange={(e) => setHalfLife(Number(e.target.value))} className="h-10 w-full rounded-full border border-line bg-surface px-3" aria-label="Meia-vida da cafeína">
              {halfLifeFactors.map((f) => (
                <option key={f.label} value={f.hours}>
                  {f.label} (~{f.hours} h)
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 flex justify-between text-ink-3">
              Hora de dormir <span className="text-ink">{hh(bed)}</span>
            </span>
            <input type="range" min={20} max={26} step={0.5} value={bed} onChange={(e) => setBed(Number(e.target.value))} className="mt-2 w-full" />
          </label>
        </div>
      </div>
      <ChartCard
        title="Cafeína circulando no corpo ao longo do dia"
        subtitle={`Modelo farmacocinético simples · meia-vida de ${halfLife} h`}
      >
        <LineChart
          key={`${halfLife}-${bed}`}
          series={series}
          height={300}
          xFormat={(x) => hh(x)}
          xTickFormat={(x) => hh(x).slice(0, 2) + "h"}
          xTicks={[6, 9, 12, 15, 18, 21, 24, 27, 30]}
          yFormat={(v) => `${fmtInt(v)} mg`}
          area
          annotations={[{ x: bed, label: "dormir" }]}
          ariaLabel="Curva da quantidade de cafeína no organismo ao longo de 24 horas"
        />
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-surface-2 p-3">
            <p className="text-xs text-ink-3">Pico no dia</p>
            <p className="font-display text-2xl">{fmtInt(peak)} mg</p>
          </div>
          <div className="rounded-xl bg-surface-2 p-3">
            <p className="flex items-center gap-1 text-xs text-ink-3">
              <Moon size={12} /> Na hora de dormir
            </p>
            <p className={`font-display text-2xl ${atBed > 50 ? "text-accent" : "text-ink"}`}>{fmtInt(atBed)} mg</p>
          </div>
          <div className="rounded-xl bg-surface-2 p-3">
            <p className="text-xs text-ink-3">Último coado “seguro”</p>
            <p className="font-display text-2xl">até {hh(cutoff)}</p>
          </div>
        </div>
        <SourceNote>
          Ilustração educativa: absorção com meia-vida de ~15 min e eliminação de primeira ordem. A sensibilidade varia muito entre pessoas. O “último coado” considera um café de 95 mg
          que deixe menos de 25 mg na hora de dormir.
        </SourceNote>
      </ChartCard>
    </div>
  );
}

const dirStyle = {
  "menor risco": { cls: "bg-leaf-soft text-leaf", icon: ShieldCheck },
  "sem efeito claro": { cls: "bg-surface-3 text-ink-2", icon: Minus },
  atenção: { cls: "bg-accent-soft text-accent", icon: TriangleAlert },
} as const;

export default function Saude() {
  const sorted = [...caffeineItems].sort((a, b) => b.mg - a.mg);
  return (
    <>
      <PageHero
        path="/saude"
        title={
          <>
            Café, cafeína <span className="italic text-ink-2">&</span> você
          </>
        }
        lead="O café é uma das bebidas mais estudadas da medicina. Veja como a cafeína age, quanto há em cada xícara, quais são os limites seguros e o que dizem as grandes revisões científicas."
        aside={<CaffeineMolecule />}
      />

      <Section kicker="Mecanismo" title="O que a cafeína faz no corpo">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {caffeineFacts.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 0.06}>
              <div className="card h-full p-6">
                <h3 className="font-display text-2xl">{f.title}</h3>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-2">{f.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section kicker="Simulador" title="Quanto de cafeína ainda tem em você?" intro="Monte seu dia, escolha o tipo de metabolismo e veja a curva de cafeína no organismo. A lista fica salva só neste navegador.">
        <CaffeineSimulator />
      </Section>

      <Section kicker="Em cada xícara" title="Cafeína por bebida">
        <Reveal>
          <ChartCard
            title="Teor típico de cafeína (mg por porção)"
            subtitle="Valores médios; a variação real é grande"
            controls={
              <Legend
                items={[
                  { label: "Cafés", color: "var(--s1)", shape: "square" },
                  { label: "Outras bebidas", color: "var(--s2)", shape: "square" },
                ]}
              />
            }
          >
            <BarList
              rows={sorted.map((c) => ({ id: c.id, label: `${c.name} · ${c.serving}`, values: { [c.kind === "café" ? "cafe" : "outro"]: c.mg } as Record<string, number>, note: c.range }))}
              keys={[
                { key: "cafe", label: "Café", color: "var(--s1)" },
                { key: "outro", label: "Outra bebida", color: "var(--s2)" },
              ]}
              format={(v) => `${fmtInt(v)} mg`}
              labelWidth={260}
              ariaLabel="Cafeína por bebida"
            />
            <SourceNote>USDA FoodData Central, EFSA (2015) e Mayo Clinic. Um coado de 240 ml tem ~95 mg; o limite diário de 400 mg equivale a ~4 xícaras.</SourceNote>
          </ChartCard>
        </Reveal>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {[
            { v: `${limits.adult} mg`, l: "por dia para adultos saudáveis", n: "EFSA, 2015" },
            { v: `${limits.singleDose} mg`, l: "por dose única, sem preocupação", n: "≈ 2 espressos" },
            { v: `${limits.pregnancy} mg`, l: "por dia na gestação e amamentação", n: "EFSA, 2015" },
            { v: `${limits.teenPerKg} mg/kg`, l: "por dia para crianças e adolescentes", n: "EFSA, 2015" },
          ].map((x, i) => (
            <Reveal key={x.l} delay={i * 0.05}>
              <div className="card h-full p-5">
                <p className="display text-4xl text-accent">{x.v}</p>
                <p className="mt-2 text-sm text-ink">{x.l}</p>
                <p className="mt-1 text-xs text-ink-3">{x.n}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section kicker="Evidências" title="O que a ciência diz" intro="A maior parte das evidências vem de estudos observacionais: mostram associações, não provam causa. Mesmo assim, o quadro geral para o consumo moderado é favorável.">
        <div className="grid gap-3 md:grid-cols-2">
          {evidence.map((e, i) => {
            const st = dirStyle[e.direction];
            const Icon = st.icon;
            return (
              <Reveal key={e.outcome} delay={(i % 2) * 0.05}>
                <div className="card flex h-full gap-4 p-5">
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${st.cls}`}>
                    <Icon size={18} />
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-ink">{e.outcome}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[0.68rem] font-semibold uppercase tracking-wider ${st.cls}`}>{e.direction}</span>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{e.text}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
        <div className="mt-8">
          <Callout title="Aviso importante" tone="accent">
            Este capítulo é informativo e não substitui orientação médica. Pessoas com arritmias, hipertensão não controlada, ansiedade, refluxo, gestantes e quem usa certos
            medicamentos devem conversar com um profissional de saúde sobre o consumo de cafeína.
          </Callout>
        </div>
      </Section>

      <NextChapter path="/saude" />
    </>
  );
}
