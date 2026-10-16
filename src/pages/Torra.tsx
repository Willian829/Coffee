import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { scaleLinear } from "d3-scale";
import { line as d3line, curveMonotoneX } from "d3-shape";
import { Pause, Play, RotateCcw, Volume2, VolumeX, Flame, Wind, Home as HomeIcon } from "lucide-react";
import { PageHero, Reveal, Section, NextChapter, SourceNote, Callout } from "../components/ui";
import { Bean } from "../components/illustrations";
import { beanColorStops, roastChemistry, roastCurve, roastLevels, roastStages } from "../data/roast";
import { clamp, colorAt, fmt, interpSeries } from "../lib/format";
import { useElementWidth } from "../lib/hooks";

const T_END = roastCurve[roastCurve.length - 1][0];
const FIRST_CRACK = 196;
const SECOND_CRACK = 224;

const lossSeries: [number, number][] = [
  [20, 0],
  [100, 2],
  [150, 6],
  [196, 11],
  [205, 12.5],
  [215, 14.5],
  [225, 16.5],
  [235, 18.5],
  [245, 21],
];
const expandSeries: [number, number][] = [
  [20, 1],
  [180, 1.04],
  [196, 1.22],
  [210, 1.5],
  [230, 1.72],
  [245, 1.8],
];
const agtronSeries: [number, number][] = [
  [196, 95],
  [200, 85],
  [205, 75],
  [210, 65],
  [218, 55],
  [225, 45],
  [232, 35],
  [240, 25],
];

const timeAtTemp = (temp: number) => {
  for (let i = 1; i < roastCurve.length; i++) if (roastCurve[i][1] >= temp) {
    const [t0, y0] = roastCurve[i - 1];
    const [t1, y1] = roastCurve[i];
    return t0 + ((temp - y0) / (y1 - y0)) * (t1 - t0);
  }
  return T_END;
};
const T_FC = timeAtTemp(FIRST_CRACK);
const T_SC = timeAtTemp(SECOND_CRACK);

/** Estalos sintetizados com Web Audio (ruído curto com decaimento). */
function useCrackSound() {
  const ctxRef = useRef<AudioContext | null>(null);
  const ensure = () => {
    if (!ctxRef.current) ctxRef.current = new AudioContext();
    if (ctxRef.current.state === "suspended") void ctxRef.current.resume();
    return ctxRef.current;
  };
  const crack = (soft = false) => {
    const ctx = ensure();
    const len = Math.floor(ctx.sampleRate * (soft ? 0.015 : 0.03));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, soft ? 6 : 3);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filt = ctx.createBiquadFilter();
    filt.type = "bandpass";
    filt.frequency.value = soft ? 4200 : 1800 + Math.random() * 1400;
    const g = ctx.createGain();
    g.gain.value = soft ? 0.25 : 0.55;
    src.connect(filt).connect(g).connect(ctx.destination);
    src.start();
  };
  return { crack, ensure };
}

function RoastChart({ t }: { t: number }) {
  const [ref, width] = useElementWidth<HTMLDivElement>(700);
  const height = 300;
  const m = { top: 16, right: 16, bottom: 30, left: 40 };
  const iw = width - m.left - m.right;
  const ih = height - m.top - m.bottom;
  const x = scaleLinear().domain([0, T_END]).range([0, iw]);
  const y = scaleLinear().domain([20, 250]).range([ih, 0]);
  const d = d3line<[number, number]>()
    .x((p) => x(p[0]))
    .y((p) => y(p[1]))
    .curve(curveMonotoneX)(roastCurve) ?? "";
  const past = d3line<[number, number]>()
    .x((p) => x(p[0]))
    .y((p) => y(p[1]))
    .curve(curveMonotoneX)([...roastCurve.filter((p) => p[0] < t), [t, interpSeries(roastCurve, t)]]) ?? "";
  const temp = interpSeries(roastCurve, t);
  const bands = roastStages;
  const bandColors = ["transparent", "var(--s5)", "var(--s3)", "var(--s1)", "var(--s1)", "var(--s4)", "var(--ink-3)"];
  return (
    <div ref={ref} className="w-full">
      <svg width={width} height={height} role="img" aria-label="Curva de temperatura do grão durante a torra">
        <g transform={`translate(${m.left},${m.top})`}>
          {bands.map((b, i) => (
            <rect key={b.id} x={0} width={iw} y={y(Math.min(250, b.to))} height={Math.max(0, y(Math.max(20, b.from)) - y(Math.min(250, b.to)))} fill={bandColors[roastStages.indexOf(b)] ?? "transparent"} opacity={0.06 + (i % 2) * 0.02} />
          ))}
          {[50, 100, 150, 200, 250].map((v) => (
            <g key={v} transform={`translate(0,${y(v)})`}>
              <line x2={iw} stroke="var(--grid)" />
              <text x={-8} dy="0.32em" textAnchor="end" fontSize="11" fill="var(--ink-3)">
                {v}°
              </text>
            </g>
          ))}
          {[0, 3, 6, 9, 12, 15].map((v) => (
            <text key={v} x={x(v)} y={ih + 20} textAnchor="middle" fontSize="11" fill="var(--ink-3)">
              {v} min
            </text>
          ))}
          {[
            { tt: T_FC, label: "1º crack" },
            { tt: T_SC, label: "2º crack" },
          ].map((c) => (
            <g key={c.label} transform={`translate(${x(c.tt)},0)`}>
              <line y1={0} y2={ih} stroke="var(--axis)" />
              <text y={10} x={5} fontSize="11" fill="var(--ink-2)">
                {c.label}
              </text>
            </g>
          ))}
          <path d={d} fill="none" stroke="var(--axis)" strokeWidth="2" strokeDasharray="0" opacity="0.6" />
          <path d={past} fill="none" stroke="var(--s1)" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx={x(t)} cy={y(temp)} r={6} fill="var(--s1)" stroke="var(--chart-surface)" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Simulator() {
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [sound, setSound] = useState(false);
  const { crack, ensure } = useCrackSound();
  const lastRef = useRef<number | null>(null);
  const [burst, setBurst] = useState(0);

  const temp = interpSeries(roastCurve, t);
  const ror = (interpSeries(roastCurve, Math.min(T_END, t + 0.25)) - interpSeries(roastCurve, Math.max(0, t - 0.25))) / (Math.min(T_END, t + 0.25) - Math.max(0, t - 0.25));
  const stage = roastStages.find((s) => temp >= s.from && temp < s.to) ?? roastStages[roastStages.length - 1];
  const color = colorAt(beanColorStops, temp);
  const loss = interpSeries(lossSeries, temp);
  const expand = interpSeries(expandSeries, temp);
  const agtron = temp >= 196 ? interpSeries(agtronSeries, temp) : null;
  const level = agtron != null ? roastLevels.reduce((a, b) => (Math.abs(b.agtron - agtron) < Math.abs(a.agtron - agtron) ? b : a)) : null;
  const dtr = t > T_FC ? ((t - T_FC) / t) * 100 : null;
  const inFirst = temp >= FIRST_CRACK && temp < 206;
  const inSecond = temp >= SECOND_CRACK && temp < 234;

  useEffect(() => {
    if (!playing) {
      lastRef.current = null;
      return;
    }
    let raf = 0;
    const tick = (now: number) => {
      const dt = lastRef.current == null ? 0 : (now - lastRef.current) / 1000;
      lastRef.current = now;
      setT((prev) => {
        const next = prev + dt * 0.72; // ~23 s para a torra completa
        if (next >= T_END) {
          setPlaying(false);
          return T_END;
        }
        return next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  // estalos: frequência proporcional ao "momento" do crack
  useEffect(() => {
    if (!playing || (!inFirst && !inSecond)) return;
    const chance = inFirst ? 0.18 : 0.3;
    if (Math.random() < chance) {
      setBurst((b) => b + 1);
      if (sound) crack(inSecond);
      if (sound && inSecond && Math.random() < 0.5) setTimeout(() => crack(true), 40);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

  const toggle = () => {
    if (sound) ensure();
    if (t >= T_END) setT(0);
    setPlaying((p) => !p);
  };

  return (
    <div className="card overflow-hidden">
      <div className="grid gap-0 lg:grid-cols-[320px_1fr]">
        <div className="relative flex flex-col items-center justify-center gap-4 border-b border-line bg-surface-2 p-8 lg:border-b-0 lg:border-r">
          <div className="relative grid h-56 w-56 place-items-center">
            <div className="absolute inset-0 rounded-full blur-3xl transition-colors duration-700" style={{ background: temp > 150 ? "rgba(224,114,74,0.18)" : "rgba(140,184,115,0.15)" }} />
            <motion.div animate={{ scale: expand, rotate: playing ? [0, -6, 4, 0] : 0 }} transition={{ scale: { type: "spring", stiffness: 80, damping: 15 }, rotate: { duration: 1.2, repeat: playing ? Infinity : 0 } }}>
              <Bean color={color} size={150} gloss={clamp((temp - 222) / 14, 0, 1)} />
            </motion.div>
            <AnimatePresence>
              {(inFirst || inSecond) && playing && (
                <motion.span
                  key={burst}
                  initial={{ opacity: 0, scale: 0.6, y: 0 }}
                  animate={{ opacity: [0, 1, 0], scale: 1.1, y: -40 }}
                  transition={{ duration: 0.6 }}
                  className="pointer-events-none absolute right-4 top-6 font-display text-xl italic text-accent"
                >
                  crack!
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <div className="text-center">
            <p className="display text-6xl">{fmt(temp, 0)}°C</p>
            <p className="mt-1 text-sm text-ink-3">temperatura do grão · {Math.floor(t)}:{String(Math.floor((t % 1) * 60)).padStart(2, "0")} min</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={toggle} className="btn btn-primary px-5!">
              {playing ? <Pause size={16} /> : <Play size={16} />} {playing ? "Pausar" : t >= T_END ? "Torrar de novo" : t > 0 ? "Continuar" : "Iniciar torra"}
            </button>
            <button type="button" onClick={() => { setPlaying(false); setT(0); }} className="grid h-11 w-11 place-items-center rounded-full border border-line hover:bg-surface" aria-label="Reiniciar">
              <RotateCcw size={16} />
            </button>
            <button
              type="button"
              onClick={() => {
                if (!sound) ensure();
                setSound((s) => !s);
              }}
              className="grid h-11 w-11 place-items-center rounded-full border border-line hover:bg-surface"
              aria-label={sound ? "Desligar som dos estalos" : "Ligar som dos estalos"}
              aria-pressed={sound}
            >
              {sound ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
          </div>
        </div>
        <div className="p-5 sm:p-7" style={{ background: "var(--chart-surface)" }}>
          <RoastChart t={t} />
          <input type="range" min={0} max={T_END} step={0.05} value={t} onChange={(e) => { setPlaying(false); setT(Number(e.target.value)); }} className="mt-2 w-full" aria-label="Tempo de torra" />
          <div className="mt-5 grid gap-4 md:grid-cols-[1.4fr_1fr]">
            <AnimatePresence mode="wait">
              <motion.div key={stage.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}>
                <p className="kicker">Fase atual</p>
                <p className="mt-1 font-display text-3xl">{stage.name}</p>
                <p className="mt-2 text-sm leading-relaxed text-ink-2">{stage.description}</p>
                <p className="mt-2 text-sm text-ink-3">Aroma: {stage.aroma}</p>
              </motion.div>
            </AnimatePresence>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              {[
                ["Taxa de aumento", `${fmt(ror, 1)} °C/min`],
                ["Perda de peso", `≈ ${fmt(loss, 1)}%`],
                ["Volume", `${fmt(expand, 2)}×`],
                ["Desenvolvimento", dtr != null ? `${fmt(dtr, 0)}% do tempo` : "—"],
                ["Agtron (estim.)", agtron != null ? fmt(agtron, 0) : "—"],
                ["Ponto", level ? level.name : "cru"],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl bg-surface-2 p-2.5">
                  <dt className="text-[0.7rem] text-ink-3">{k}</dt>
                  <dd className="num mt-0.5 font-semibold text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

function Levels() {
  const [sel, setSel] = useState(3);
  const l = roastLevels[sel];
  return (
    <div>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-8" role="radiogroup" aria-label="Pontos de torra">
        {roastLevels.map((r, i) => (
          <button
            key={r.agtron}
            type="button"
            role="radio"
            aria-checked={sel === i}
            onClick={() => setSel(i)}
            className={`group overflow-hidden rounded-2xl border text-left transition-all ${sel === i ? "border-ink shadow-lift" : "border-line hover:border-line-strong"}`}
          >
            <div className="grid h-24 place-items-center" style={{ background: r.color }}>
              <Bean color={r.color} size={56} gloss={i >= 5 ? 0.8 : 0.1} />
            </div>
            <div className="p-2.5">
              <p className="font-mono text-[0.7rem] text-ink-3">#{r.agtron}</p>
              <p className="text-sm font-semibold leading-tight text-ink">{r.name}</p>
            </div>
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={l.agtron} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="card mt-4 grid gap-4 p-6 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <p className="kicker">{l.aka}</p>
            <p className="mt-1 font-display text-3xl">{l.name}</p>
            <p className="mt-2 text-ink-2">{l.notes}</p>
          </div>
          <div>
            <p className="text-xs text-ink-3">Temperatura final</p>
            <p className="font-display text-2xl">{l.temp}</p>
          </div>
          <div>
            <p className="text-xs text-ink-3">Perda de peso</p>
            <p className="font-display text-2xl">{l.loss}</p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function Torra() {
  const heroBeans = useMemo(() => [95, 75, 55, 35].map((a) => roastLevels.find((r) => r.agtron === a)!), []);
  return (
    <>
      <PageHero
        path="/torra"
        title={
          <>
            O fogo <span className="italic text-ink-2">que</span> cria o sabor
          </>
        }
        lead="O grão verde não tem cheiro de café. São 10 a 16 minutos a mais de 200 °C que transformam açúcares, ácidos e proteínas em mais de 800 compostos aromáticos. Experimente torrar no simulador."
        aside={
          <div className="flex items-center justify-center gap-1">
            <Bean color="#8f9a5c" size={92} rotate={-30} />
            {heroBeans.map((b, i) => (
              <motion.div key={b.agtron} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.12 }}>
                <Bean color={b.color} size={100 + i * 6} rotate={-20 + i * 14} gloss={i === 3 ? 0.9 : 0.1} />
              </motion.div>
            ))}
          </div>
        }
      />

      <Section kicker="Simulador" title="Torre seu próprio café" intro="Aperte o play ou arraste a linha do tempo. Ligue o som para ouvir o primeiro e o segundo crack.">
        <Reveal>
          <Simulator />
        </Reveal>
        <SourceNote>Perfil ilustrativo de um torrador de tambor; os tempos e temperaturas variam com o equipamento, a carga e o café. Agtron e perda de peso são estimativas.</SourceNote>
      </Section>

      <Section kicker="Pontos de torra" title="Do canela ao italiano" intro="A escala Agtron, usada pela SCA, mede a cor do grão: quanto maior o número, mais clara a torra.">
        <Levels />
      </Section>

      <Section kicker="Química" title="O que acontece dentro do grão">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {roastChemistry.map((c, i) => (
            <Reveal key={c.title} delay={(i % 3) * 0.06}>
              <div className="card h-full p-6">
                <h3 className="font-display text-2xl">{c.title}</h3>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-2">{c.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section kicker="Equipamentos" title="Tambor, ar quente e frigideira">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: Flame, t: "Torrador de tambor", d: "Um cilindro giratório aquecido por gás ou eletricidade: o calor chega por condução (metal) e convecção (ar). É o padrão das torrefações." },
            { icon: Wind, t: "Leito fluidizado", d: "Jatos de ar quente fazem os grãos 'flutuarem'. Torra rápida e uniforme — o princípio das pipoqueiras e de muitos torradores industriais." },
            { icon: HomeIcon, t: "Em casa", d: "Panela de ferro, pipoqueira de ar ou torradores domésticos funcionam. Ventile bem, mexa sempre e resfrie rápido numa peneira." },
          ].map((e, i) => {
            const Icon = e.icon;
            return (
              <Reveal key={e.t} delay={i * 0.06}>
                <div className="card h-full p-6">
                  <Icon className="text-accent" size={22} />
                  <h3 className="mt-4 font-display text-2xl">{e.t}</h3>
                  <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-2">{e.d}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Callout title="Frescor importa" tone="gold">
            Os aromas começam a se perder semanas após a torra. Compre café com data de torra, guarde em pote opaco e bem fechado, longe do calor — e moa na hora de preparar.
          </Callout>
          <Callout title="Torra escura = mais forte?" tone="accent">
            Não necessariamente. Torras escuras têm mais amargor e corpo percebido, mas não mais cafeína. A “força” da xícara depende sobretudo da proporção de pó e água.
          </Callout>
        </div>
      </Section>

      <NextChapter path="/torra" />
    </>
  );
}
