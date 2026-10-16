import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { arc as d3arc } from "d3-shape";
import { Bug, CloudRain, Mountain, Snowflake, Sprout, Thermometer, TreePine, Waves, Compass, Layers } from "lucide-react";
import { PageHero, Reveal, Section, NextChapter, SourceNote, Callout, ChartCard } from "../components/ui";
import { CoffeeBranch } from "../components/illustrations";
import { climate, factors, lifecycle, pests } from "../data/cultivation";
import { phenology } from "../data/brazil";
import { monthsShort } from "../data/countries";
import { arabicaByCountry, marketYears } from "../data/production";
import { clamp, fmt, fmtInt } from "../lib/format";

const factorIcons = [Mountain, Compass, CloudRain, Layers, TreePine, Sprout];

/* ───────────── Simulador climático ───────────── */

const refs = [
  { name: "Sul de Minas (BR)", lat: -21.5, alt: 900, rain: 1500 },
  { name: "Cerrado Mineiro (BR)", lat: -19, alt: 1000, rain: 1600 },
  { name: "Chapada Diamantina (BR)", lat: -13, alt: 1250, rain: 1000 },
  { name: "Norte do Espírito Santo (BR)", lat: -19, alt: 150, rain: 1200 },
  { name: "Rondônia (BR)", lat: -11, alt: 200, rain: 2100 },
  { name: "Huila (Colômbia)", lat: 2, alt: 1700, rain: 1500 },
  { name: "Yirgacheffe (Etiópia)", lat: 6, alt: 1900, rain: 1400 },
  { name: "Antigua (Guatemala)", lat: 14.5, alt: 1550, rain: 1100 },
  { name: "Nyeri (Quênia)", lat: -0.4, alt: 1750, rain: 1100 },
  { name: "Boquete (Panamá)", lat: 8.8, alt: 1600, rain: 2500 },
  { name: "Đắk Lắk (Vietnã)", lat: 12.7, alt: 500, rain: 1800 },
  { name: "Gayo, Sumatra (Indonésia)", lat: 4.6, alt: 1400, rain: 2000 },
  { name: "Kona (Havaí)", lat: 19.6, alt: 450, rain: 1500 },
];

/** Modelo simplificado: temperatura média ao nível do mar cai fora da faixa equatorial; gradiente térmico de 0,55 °C/100 m. */
const estTemp = (lat: number, alt: number) => 28 - 0.3 * Math.max(0, Math.abs(lat) - 10) - 0.55 * (alt / 100);

const band = (v: number, lo: number, optLo: number, optHi: number, hi: number) => {
  if (v >= optLo && v <= optHi) return 1;
  if (v < optLo) return clamp((v - lo) / (optLo - lo), 0, 1);
  return clamp((hi - v) / (hi - optHi), 0, 1);
};

type SliderProps = { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; display: string; icon: typeof Mountain };

function Slider({ label, value, min, max, step, onChange, display, icon: Icon }: SliderProps) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 text-ink-2">
          <Icon size={15} /> {label}
        </span>
        <span className="num font-semibold text-ink">{display}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full" />
    </label>
  );
}

function Suitability() {
  const [lat, setLat] = useState(-21.5);
  const [alt, setAlt] = useState(900);
  const [rain, setRain] = useState(1500);
  const t = estTemp(lat, alt);
  const a = climate.arabica;
  const r = climate.robusta;
  const sA = Math.min(band(t, a.tempLimitLow, a.tempMin, a.tempMax, a.tempLimitHigh), band(rain, 700, a.rainMin, a.rainMax, 3000));
  const sR = Math.min(band(t, r.tempLimitLow, r.tempMin, r.tempMax, r.tempLimitHigh), band(rain, 800, r.rainMin, r.rainMax, 3600));
  const frost = Math.abs(lat) >= 22 && t <= 21.5 ? "alto" : Math.abs(lat) >= 18 && t <= 21 ? "moderado" : "baixo";
  const nearest = useMemo(() => {
    return [...refs].sort((p, q) => {
      const d = (x: typeof p) => ((x.lat - lat) / 25) ** 2 + ((x.alt - alt) / 1500) ** 2 + ((x.rain - rain) / 2500) ** 2;
      return d(p) - d(q);
    })[0];
  }, [lat, alt, rain]);

  const verdict = (s: number) => (s >= 0.85 ? "Ideal" : s >= 0.5 ? "Viável" : s > 0.15 ? "Marginal" : "Inadequado");
  const rainNote =
    rain < 1100 ? "Chuva abaixo do ideal: seria preciso irrigar, como no Oeste da Bahia." : rain > 2600 ? "Muita chuva: mais doenças fúngicas e secagem difícil." : "Chuva adequada para o cafeeiro.";


  return (
    <div className="card grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_1.1fr]">
      <div className="space-y-6">
        <Slider label="Latitude" value={lat} min={-28} max={28} step={0.5} onChange={setLat} display={`${fmt(Math.abs(lat), 1)}° ${lat < 0 ? "S" : "N"}`} icon={Compass} />
        <Slider label="Altitude" value={alt} min={0} max={2500} step={50} onChange={setAlt} display={`${fmtInt(alt)} m`} icon={Mountain} />
        <Slider label="Chuva anual" value={rain} min={500} max={3500} step={50} onChange={setRain} display={`${fmtInt(rain)} mm`} icon={CloudRain} />
        <div>
          <p className="kicker mb-2">Experimente uma região</p>
          <div className="flex flex-wrap gap-1.5">
            {refs.slice(0, 9).map((p) => (
              <button
                key={p.name}
                type="button"
                className="chip text-xs!"
                onClick={() => {
                  setLat(p.lat);
                  setAlt(p.alt);
                  setRain(p.rain);
                }}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="rounded-2xl bg-surface-2 p-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="kicker">Temperatura média estimada</p>
            <p className="display mt-2 text-6xl">
              {fmt(t, 1)}
              <span className="text-3xl text-ink-3"> °C</span>
            </p>
          </div>
          <Thermometer size={40} className="text-accent" />
        </div>
        <div className="mt-6 space-y-4">
          {[
            { name: "Arábica", s: sA, color: "var(--s1)" },
            { name: "Robusta", s: sR, color: "var(--s2)" },
          ].map((x) => (
            <div key={x.name}>
              <div className="mb-1.5 flex justify-between text-sm">
                <span className="font-semibold text-ink">{x.name}</span>
                <span className="text-ink-2">
                  {verdict(x.s)} · {Math.round(x.s * 100)}%
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-surface-3">
                <motion.div className="h-full rounded-full" style={{ background: x.color }} animate={{ width: `${Math.max(2, x.s * 100)}%` }} transition={{ type: "spring", stiffness: 120, damping: 20 }} />
              </div>
            </div>
          ))}
        </div>
        <ul className="mt-6 space-y-2 text-sm text-ink-2">
          <li className="flex gap-2">
            <Snowflake size={16} className={frost === "alto" ? "text-s2" : "text-ink-3"} /> Risco de geada: <strong className="text-ink">{frost}</strong>
          </li>
          <li className="flex gap-2">
            <Waves size={16} className="text-ink-3" /> {rainNote}
          </li>
          <li className="flex gap-2">
            <Compass size={16} className="text-ink-3" /> Clima parecido com: <strong className="text-ink">{nearest.name}</strong>
          </li>
        </ul>
      </div>
      <div className="lg:col-span-2">
      <SourceNote>
        Modelo didático simplificado: temperatura ≈ 28 °C ao nível do mar na faixa equatorial, −0,3 °C por grau de latitude além de 10° e −0,55 °C a cada 100 m de altitude.
        Faixas ideais: arábica 18–23 °C, robusta 22–28 °C (Embrapa, FAO, WCR). Não substitui o zoneamento agrícola (ZARC).
      </SourceNote>
      </div>
    </div>
  );
}

/* ───────────── Roda fenológica ───────────── */

/** Progressão que imita a cor do fruto: flor → chumbinho → verde → granação → cereja → colheita; repouso em cinza-azulado. */
const phaseColors = ["#b9a77a", "#86b35f", "#4f8a2e", "#b5a23a", "#e0782c", "#b8322a", "#6f7f99"];

function PhenologyWheel() {
  const [hover, setHover] = useState<number | null>(null);
  const size = 440;
  const c = size / 2;
  const nowMonth = new Date().getMonth() + 1;
  const angleFor = (m: number) => ((m - 1) / 12) * Math.PI * 2;
  const rings = phenology.map((p, i) => {
    const r0 = 70 + i * 19;
    const months = [...p.months];
    const start = months[0];
    const end = months[months.length - 1];
    const span = ((end - start + 12) % 12) + 1;
    return { ...p, r0, r1: r0 + 15, a0: angleFor(start), a1: angleFor(start) + (span / 12) * Math.PI * 2 };
  });
  const arcGen = d3arc<{ innerRadius: number; outerRadius: number; startAngle: number; endAngle: number }>().cornerRadius(7);
  const active = hover != null ? rings[hover] : null;
  const nowAngle = angleFor(nowMonth) + Math.PI / 12;

  return (
    <div className="grid items-center gap-10 lg:grid-cols-[1fr_1fr]">
      <Reveal className="mx-auto w-full max-w-[460px]">
        <svg viewBox={`0 0 ${size} ${size}`} className="h-auto w-full" role="img" aria-label="Calendário fenológico do cafeeiro arábica no Sudeste do Brasil">
          <g transform={`translate(${c},${c})`}>
            {monthsShort.map((m, i) => {
              const a = angleFor(i + 1) + Math.PI / 12;
              const x = Math.sin(a) * 208;
              const y = -Math.cos(a) * 208;
              return (
                <g key={m}>
                  <line x1={Math.sin(angleFor(i + 1)) * 60} y1={-Math.cos(angleFor(i + 1)) * 60} x2={Math.sin(angleFor(i + 1)) * 200} y2={-Math.cos(angleFor(i + 1)) * 200} stroke="var(--grid)" />
                  <text x={x} y={y} textAnchor="middle" dy="0.35em" fontSize="12" fontWeight={i + 1 === nowMonth ? 700 : 400} fill={i + 1 === nowMonth ? "var(--accent)" : "var(--ink-3)"}>
                    {m}
                  </text>
                </g>
              );
            })}
            {rings.map((r, i) => (
              <motion.path
                key={r.phase}
                d={arcGen({ innerRadius: r.r0, outerRadius: r.r1, startAngle: r.a0, endAngle: r.a1 }) ?? ""}
                fill={phaseColors[i]}
                opacity={hover == null || hover === i ? 1 : 0.25}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onClick={() => setHover(i)}
                style={{ cursor: "pointer", transition: "opacity .25s" }}
                initial={{ scale: 0.6, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.6 }}
              />
            ))}
            <line x1={0} y1={0} x2={Math.sin(nowAngle) * 196} y2={-Math.cos(nowAngle) * 196} stroke="var(--accent)" strokeWidth="2" strokeDasharray="3 4" />
            <circle r="56" fill="var(--surface)" stroke="var(--line)" />
            <text textAnchor="middle" y="-6" fontSize="13" fill="var(--ink-3)">
              hoje
            </text>
            <text textAnchor="middle" y="16" fontSize="20" fontFamily="var(--font-display)" fill="var(--ink)">
              {monthsShort[nowMonth - 1]}
            </text>
          </g>
        </svg>
      </Reveal>
      <Reveal delay={0.1}>
        <ul className="space-y-1.5">
          {rings.map((r, i) => (
            <li key={r.phase}>
              <button
                type="button"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                className={`flex w-full items-start gap-3 rounded-xl p-3 text-left transition-colors ${hover === i ? "bg-surface" : ""}`}
              >
                <span className="mt-1.5 h-3 w-3 shrink-0 rounded-full" style={{ background: phaseColors[i] }} />
                <span>
                  <span className="flex items-baseline gap-2">
                    <span className="font-semibold text-ink">{r.phase}</span>
                    <span className="text-xs text-ink-3">{r.months.map((m) => monthsShort[m - 1]).join(" · ")}</span>
                  </span>
                  {(hover === i || hover == null) && <span className="mt-0.5 block text-sm leading-relaxed text-ink-2">{r.text}</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>
        {active && <p className="sr-only">{active.text}</p>}
      </Reveal>
    </div>
  );
}

/* ───────────── Bienalidade ───────────── */

function Biennial() {
  const vals = arabicaByCountry["076"];
  const max = Math.max(...vals);
  return (
    <ChartCard title="Arábica do Brasil: o sobe-e-desce da bienalidade" subtitle="Milhões de sacas por ano-safra (USDA, julho de 2026)">
      <div className="flex h-56 items-end gap-3 border-b border-[var(--axis)] sm:gap-6">
        {vals.map((v, i) => (
          <div key={i} className="flex flex-1 flex-col items-center justify-end gap-2">
            <span className="num text-xs text-ink-2">{fmt(v / 1000, 1)}</span>
            <motion.div
              className="w-full max-w-[24px] rounded-t-[4px]"
              style={{ background: i > 0 && v < vals[i - 1] ? "var(--s2)" : "var(--s1)" }}
              initial={{ height: 0 }}
              whileInView={{ height: `${(v / max) * 180}px` }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-3 sm:gap-6">
        {marketYears.map((y) => (
          <span key={y} className="flex-1 text-center text-[0.7rem] text-ink-3">
            {y}
          </span>
        ))}
      </div>
      <div className="mt-4 flex gap-5 text-sm text-ink-2">
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-[3px] bg-s1" /> safra maior que a anterior
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-[3px] bg-s2" /> safra menor
        </span>
      </div>
    </ChartCard>
  );
}

export default function Cultivo() {
  return (
    <>
      <PageHero
        path="/cultivo"
        title={
          <>
            Do viveiro <span className="italic text-ink-2">ao</span> cafezal
          </>
        }
        lead="O cafeeiro é exigente: quer temperatura amena, chuva bem distribuída, uma estação seca para florir e solo profundo. Entenda onde e como ele cresce — e por que altitude, latitude e clima definem tanto do sabor."
        aside={<CoffeeBranch stage="flor" className="h-auto w-full" seed={11} />}
      />

      <Section kicker="Terroir" title="Seis fatores que decidem onde o café cresce">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {factors.map((f, i) => {
            const Icon = factorIcons[i];
            return (
              <Reveal key={f.title} delay={(i % 3) * 0.06}>
                <div className="card h-full p-6">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-leaf-soft text-leaf">
                    <Icon size={20} />
                  </span>
                  <h3 className="mt-5 font-display text-2xl">{f.title}</h3>
                  <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-2">{f.text}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Section>

      <Section kicker="Simulador" title="Daria café no seu quintal?" intro="Mova os controles para ver como latitude, altitude e chuva mudam a temperatura e a aptidão para arábica e robusta.">
        <Reveal>
          <Suitability />
        </Reveal>
      </Section>

      <Section kicker="Ciclo de vida" title="Paciência: de dois a cinco anos até a primeira boa safra">
        <div className="relative">
          <div className="absolute left-0 right-0 top-[22px] hidden h-px bg-line-strong lg:block" aria-hidden />
          <ol className="grid gap-6 lg:grid-cols-7">
            {lifecycle.map((s, i) => (
              <Reveal key={s.stage} delay={i * 0.07} as="li">
                <div className="relative">
                  <span className="relative z-10 grid h-11 w-11 place-items-center rounded-full border border-line bg-surface font-mono text-sm text-accent">{i + 1}</span>
                  <p className="mt-4 font-mono text-xs text-ink-3">{s.time}</p>
                  <h3 className="mt-1 font-display text-xl leading-tight">{s.stage}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-2">{s.text}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </Section>

      <Section kicker="Fenologia" title="O ano do cafeeiro no Brasil" intro="No arábica do Sudeste, o ciclo completo — da gema à colheita — leva dois anos. A linha tracejada marca o mês atual.">
        <PhenologyWheel />
        <SourceNote>Esquema fenológico de Camargo & Camargo (2001), adotado pela Embrapa Café. As datas variam com a região, a altitude e o clima de cada ano.</SourceNote>
      </Section>

      <Section kicker="Bienalidade" title="Um ano carregado, outro de descanso">
        <div className="grid items-center gap-10 lg:grid-cols-[1.3fr_1fr]">
          <Reveal>
            <Biennial />
          </Reveal>
          <Reveal delay={0.1} className="prose-atlas">
            <p>
              Uma safra grande esgota as reservas da planta, que no ano seguinte investe em folhas e ramos novos — e produz menos. Esse ciclo é muito marcado no Brasil, onde
              lavouras extensas e clima uniforme sincronizam as plantas.
            </p>
            <p>
              Segundo a USDA, essa oscilação pode mover a produção brasileira de arábica em <strong>5 a 10 milhões de sacas</strong> de um ano para o outro — o suficiente para
              mexer com os preços no mundo inteiro.
            </p>
          </Reveal>
        </div>
      </Section>

      <Section kicker="Sanidade" title="Pragas e doenças que tiram o sono do produtor">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pests.map((p, i) => (
            <Reveal key={p.name} delay={(i % 3) * 0.06}>
              <div className="card h-full p-6">
                <div className="flex items-center justify-between">
                  <span className="chip text-xs!">{p.kind}</span>
                  <Bug size={18} className="text-ink-3" />
                </div>
                <h3 className="mt-4 font-display text-2xl">{p.name}</h3>
                <p className="text-sm italic text-ink-3">{p.sci}</p>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-2">{p.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <Callout title="Podas que renovam" tone="leaf">
            Recepa (corte rente ao chão), esqueletamento (retira os ramos laterais) e decote (corta o topo) revigoram lavouras velhas ou danificadas por geada.
          </Callout>
          <Callout title="Água na medida" tone="gold">
            Gotejamento e pivô central permitem produzir no Cerrado e no Oeste baiano — e até programar floradas com a irrigação.
          </Callout>
          <Callout title="Manejo integrado" tone="accent">
            Controle biológico (como a vespinha-de-Uganda contra a broca), variedades resistentes e monitoramento reduzem o uso de defensivos.
          </Callout>
        </div>
      </Section>

      <NextChapter path="/cultivo" />
    </>
  );
}
