import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { Minus, Pause, Play, Plus, RotateCcw, Thermometer, Timer, Droplets, Scale, Coffee } from "lucide-react";
import { PageHero, Reveal, Section, NextChapter, SourceNote, Dots, Callout } from "../components/ui";
import { BrewIcon, DrinkGlass, SteamingCup } from "../components/illustrations";
import { brewMethods, drinks, goldenCup, grindScale, waterStandard, type BrewMethod } from "../data/brew";
import { fmt, fmtInt } from "../lib/format";

const fmtClock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

function BrewTimer({ method, coffee, water }: { method: BrewMethod; coffee: number; water: number }) {
  const steps = useMemo(() => method.steps?.(coffee, water) ?? [], [method, coffee, water]);
  const total = steps.length ? steps[steps.length - 1].at : 0;
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const baseRef = useRef(0);
  const elapsedRef = useRef(0);
  const epochRef = useRef(0);
  const limit = total + 30;

  const reset = () => {
    epochRef.current += 1;
    baseRef.current = 0;
    elapsedRef.current = 0;
    setElapsed(0);
    setRunning(false);
  };

  useEffect(reset, [method.id]);

  useEffect(() => {
    if (!running) return;
    const epoch = epochRef.current;
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      if (epoch !== epochRef.current) return;
      const e = Math.min(limit, baseRef.current + (now - t0) / 1000);
      elapsedRef.current = e;
      setElapsed(e);
      if (e >= limit) {
        baseRef.current = e;
        setRunning(false);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      if (epoch === epochRef.current) baseRef.current = elapsedRef.current;
    };
  }, [running, limit]);

  if (!steps.length) {
    return (
      <div className="grid h-full place-items-center rounded-2xl border border-dashed border-line-strong p-8 text-center text-sm text-ink-3">
        Este método não precisa de cronômetro passo a passo — siga as dicas ao lado.
      </div>
    );
  }

  const currentIdx = steps.reduce((acc, s, i) => (elapsed >= s.at ? i : acc), 0);
  const next = steps[currentIdx + 1];
  const progress = Math.min(1, elapsed / total);
  const R = 70;
  const C = 2 * Math.PI * R;
  const done = elapsed >= total;

  return (
    <div className="rounded-2xl bg-surface-2 p-5">
      <div className="flex items-center gap-5">
        <div className="relative h-40 w-40 shrink-0">
          <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
            <circle cx="80" cy="80" r={R} fill="none" stroke="var(--surface-3)" strokeWidth="8" />
            <circle cx="80" cy="80" r={R} fill="none" stroke="var(--accent)" strokeWidth="8" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - progress)} style={{ transition: "stroke-dashoffset .2s linear" }} />
            {steps.map((s) => {
              const a = (s.at / total) * Math.PI * 2;
              return <circle key={s.at} cx={80 + Math.cos(a) * R} cy={80 + Math.sin(a) * R} r="3.5" fill={elapsed >= s.at ? "var(--accent)" : "var(--ink-3)"} />;
            })}
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <p className="num font-display text-4xl">{fmtClock(elapsed)}</p>
              <p className="text-xs text-ink-3">de {fmtClock(total)}</p>
            </div>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <AnimatePresence mode="wait">
            <motion.div key={done ? "done" : currentIdx} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
              <p className="kicker text-accent">{done ? "Concluído" : `Etapa ${currentIdx + 1} de ${steps.length}`}</p>
              <p className="mt-1 font-display text-2xl leading-tight">{done ? "Bom café! ☕" : steps[currentIdx].label}</p>
              <p className="mt-1 text-sm text-ink-2">{done ? "Prove em diferentes temperaturas." : steps[currentIdx].detail}</p>
              {!done && steps[currentIdx].pourTo && (
                <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-sm font-semibold text-accent">
                  <Scale size={14} /> balança em {fmtInt(steps[currentIdx].pourTo!)} g
                </p>
              )}
            </motion.div>
          </AnimatePresence>
          {next && !done && <p className="mt-3 text-xs text-ink-3">Próximo: {next.label} em {fmtClock(Math.max(0, next.at - elapsed))}</p>}
        </div>
      </div>
      <div className="mt-5 flex gap-2">
        <button
          type="button"
          className="btn btn-primary flex-1"
          onClick={() => {
            if (done && !running) reset();
            setRunning((r) => !r);
          }}
        >
          {running ? <Pause size={16} /> : <Play size={16} />} {running ? "Pausar" : elapsed > 0 && !done ? "Continuar" : "Começar"}
        </button>
        <button
          type="button"
          className="grid h-11 w-11 place-items-center rounded-full border border-line hover:bg-surface"
          onClick={reset}
          aria-label="Zerar cronômetro"
        >
          <RotateCcw size={16} />
        </button>
      </div>
    </div>
  );
}

function Calculator() {
  const [params, setParams] = useSearchParams();
  const initial = brewMethods.find((m) => m.id === params.get("metodo")) ?? brewMethods[1];
  const [method, setMethod] = useState<BrewMethod>(initial);
  const [servings, setServings] = useState(1);
  const [strength, setStrength] = useState(0); // -2..2

  useEffect(() => {
    const m = brewMethods.find((x) => x.id === params.get("metodo"));
    if (m) setMethod(m);
  }, [params]);

  const choose = (m: BrewMethod) => {
    setMethod(m);
    setStrength(0);
    const next = new URLSearchParams(params);
    next.set("metodo", m.id);
    setParams(next, { replace: true });
  };

  const ratio = method.ratio * (1 - strength * 0.06);
  const isEspresso = method.id === "espresso";
  const water = isEspresso ? Math.round(method.dose * servings * ratio) : Math.round(method.serving * servings * (method.id === "coldbrew" ? 1 : 1.12));
  const coffee = isEspresso ? method.dose * servings : Math.round((water / ratio) * 10) / 10;
  const caffeine = coffee * 8;

  return (
    <div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5" role="radiogroup" aria-label="Método de preparo">
        {brewMethods.map((m) => (
          <button
            key={m.id}
            type="button"
            role="radio"
            aria-checked={method.id === m.id}
            onClick={() => choose(m)}
            className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all ${
              method.id === m.id ? "border-accent bg-accent-soft text-ink" : "border-line bg-surface text-ink-2 hover:border-line-strong"
            }`}
          >
            <span className={method.id === m.id ? "text-accent" : ""}>
              <BrewIcon id={m.id} size={38} />
            </span>
            <span className="text-sm font-medium leading-tight">{m.name}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={method.id}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="card mt-5 grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.1fr_1fr]"
        >
          <div>
            <p className="kicker">{method.family}</p>
            <h3 className="display mt-2 text-5xl">{method.name}</h3>
            <p className="mt-3 text-ink-2">{method.description}</p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-sm text-ink-3">{isEspresso ? "Doses" : "Porções"}</p>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setServings((s) => Math.max(1, s - 1))} className="grid h-10 w-10 place-items-center rounded-full border border-line hover:bg-surface-2" aria-label="Menos">
                    <Minus size={16} />
                  </button>
                  <span className="num w-10 text-center font-display text-3xl">{servings}</span>
                  <button type="button" onClick={() => setServings((s) => Math.min(12, s + 1))} className="grid h-10 w-10 place-items-center rounded-full border border-line hover:bg-surface-2" aria-label="Mais">
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              <label className="block">
                <span className="mb-2 flex justify-between text-sm text-ink-3">
                  Intensidade <span className="text-ink">{["bem suave", "suave", "padrão", "forte", "bem forte"][strength + 2]}</span>
                </span>
                <input type="range" min={-2} max={2} step={1} value={strength} onChange={(e) => setStrength(Number(e.target.value))} className="w-full" />
              </label>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-surface-2 p-4">
                <p className="flex items-center gap-1.5 text-xs text-ink-3">
                  <Coffee size={13} /> Café moído
                </p>
                <p className="num mt-1 font-display text-4xl">{fmt(coffee, coffee % 1 ? 1 : 0)} g</p>
              </div>
              <div className="rounded-2xl bg-surface-2 p-4">
                <p className="flex items-center gap-1.5 text-xs text-ink-3">
                  <Droplets size={13} /> {isEspresso ? "Bebida na xícara" : "Água"}
                </p>
                <p className="num mt-1 font-display text-4xl">{fmtInt(water)} {isEspresso ? "g" : "ml"}</p>
              </div>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-ink-3">Proporção</dt>
                <dd className="font-medium text-ink">1:{fmt(ratio, 1)}</dd>
              </div>
              <div>
                <dt className="text-ink-3">Moagem</dt>
                <dd className="font-medium text-ink">{method.grind}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-1 text-ink-3">
                  <Thermometer size={12} /> Água
                </dt>
                <dd className="font-medium text-ink">{method.temp}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-1 text-ink-3">
                  <Timer size={12} /> Tempo
                </dt>
                <dd className="font-medium text-ink">{method.time}</dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-ink-3">
              Cafeína estimada: ~{fmtInt(caffeine)} mg no total (≈ 8 mg por grama de arábica; robusta tem quase o dobro). Faixa recomendada: {method.ratioRange}.
            </p>
            <div className="mt-5 grid grid-cols-3 gap-3 border-t border-line pt-5 text-xs text-ink-3">
              <div>
                Corpo
                <div className="mt-1">
                  <Dots value={method.body} label="Corpo" />
                </div>
              </div>
              <div>
                Clareza
                <div className="mt-1">
                  <Dots value={method.clarity} label="Clareza" />
                </div>
              </div>
              <div>
                Dificuldade
                <div className="mt-1">
                  <Dots value={method.difficulty} label="Dificuldade" />
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-5">
            <BrewTimer method={method} coffee={coffee} water={water} />
            <div>
              <p className="kicker mb-2">Dicas</p>
              <ul className="space-y-2 text-sm text-ink-2">
                {method.tips.map((t) => (
                  <li key={t} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" /> {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

const compass = [
  ["Fraco e azedo", "Fraco e equilibrado", "Fraco e amargo"],
  ["Azedo, salgado, curto", "Ideal ✨", "Amargo, seco, adstringente"],
  ["Forte e azedo", "Forte e equilibrado", "Forte e amargo"],
];
const compassFix = [
  ["Use mais café e moa mais fino.", "Use mais café (ou menos água).", "Use mais café e moa mais grosso."],
  ["Moa mais fino, use água mais quente ou estenda o tempo.", "Anote a receita e repita!", "Moa mais grosso, reduza o tempo ou a temperatura."],
  ["Use menos café e moa mais fino.", "Use menos café (ou mais água).", "Use menos café e moa mais grosso."],
];

function ExtractionCompass() {
  const [sel, setSel] = useState<[number, number]>([1, 1]);
  return (
    <div className="grid items-center gap-8 lg:grid-cols-[1fr_1fr]">
      <div className="relative mx-auto w-full max-w-[460px] pl-8 pb-8">
        <span className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-ink-3">força (TDS) →</span>
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xs text-ink-3">extração →</span>
        <div className="grid grid-cols-3 gap-1.5">
          {[2, 1, 0].map((row) =>
            [0, 1, 2].map((col) => {
              const active = sel[0] === row && sel[1] === col;
              const center = row === 1 && col === 1;
              return (
                <button
                  key={`${row}-${col}`}
                  type="button"
                  onClick={() => setSel([row, col])}
                  className={`aspect-square rounded-xl border p-2 text-[0.72rem] leading-tight transition-all sm:text-xs ${
                    active ? "border-ink bg-ink text-bg" : center ? "border-leaf bg-leaf-soft text-ink" : "border-line bg-surface text-ink-2 hover:border-line-strong"
                  }`}
                >
                  {compass[row][col]}
                </button>
              );
            }),
          )}
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={sel.join()} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
          <p className="kicker">Diagnóstico</p>
          <p className="display mt-2 text-4xl">{compass[sel[0]][sel[1]]}</p>
          <p className="mt-4 text-lg text-ink-2">{compassFix[sel[0]][sel[1]]}</p>
          <p className="mt-4 text-sm text-ink-3">
            Extração é quanto do pó se dissolve (ideal 18–22%); força é a concentração da bebida (TDS de 1,15–1,35% num coado). Ajuste a moagem para mudar a extração e a proporção
            para mudar a força.
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function Preparo() {
  return (
    <>
      <PageHero
        path="/preparo"
        title={
          <>
            A última <span className="italic text-ink-2">milha</span> do café
          </>
        }
        lead="Um café é 98% água. Proporção, moagem, temperatura e tempo decidem o que sai da xícara. Escolha um método, ajuste a receita e use o cronômetro guiado."
        aside={<SteamingCup className="mx-auto h-auto w-full max-w-[380px]" />}
      />

      <Section kicker="Receitas" title="Calculadora e cronômetro" intro="Selecione o método, o número de porções e a intensidade. As etapas do cronômetro se ajustam às quantidades.">
        <Calculator />
      </Section>

      <Section kicker="Moagem" title="Do pó de café turco ao sal grosso">
        <div className="card overflow-hidden p-6 sm:p-8">
          <div className="grid gap-6 sm:grid-cols-7">
            {grindScale.map((g, i) => (
              <Reveal key={g.level} delay={i * 0.05}>
                <div className="flex h-full flex-col items-center text-center">
                  <div className="grid h-20 place-items-center">
                    <div className="flex flex-wrap justify-center gap-[3px]" style={{ width: 56 }}>
                      {Array.from({ length: Math.max(3, 18 - i * 2) }, (_, k) => (
                        <span key={k} className="rounded-full bg-[var(--seq-4)]" style={{ width: 2 + i * 2.2, height: 2 + i * 2.2, opacity: 0.6 + ((k * 37) % 40) / 100 }} />
                      ))}
                    </div>
                  </div>
                  <p className="mt-3 font-semibold text-ink">{g.name}</p>
                  <p className="font-mono text-[0.7rem] text-ink-3">{g.microns}</p>
                  <p className="mt-2 text-xs text-ink-2">{g.example}</p>
                  <p className="text-xs text-ink-3">como {g.like}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <SourceNote>Faixas aproximadas; cada moedor tem sua escala. Moedores de mó (burr) produzem partículas mais uniformes que os de lâmina.</SourceNote>
        </div>
      </Section>

      <Section kicker="Diagnóstico" title="Bússola de extração" intro="Seu café ficou azedo? Amargo? Ralo? Clique no quadrante que descreve a xícara.">
        <ExtractionCompass />
      </Section>

      <Section kicker="Água" title="98% da xícara merece atenção">
        <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <Reveal className="overflow-hidden rounded-[22px] border border-line">
            <table className="table-atlas">
              <thead>
                <tr>
                  <th>Parâmetro (SCA)</th>
                  <th>Alvo</th>
                  <th>Faixa aceitável</th>
                </tr>
              </thead>
              <tbody>
                {waterStandard.map((w) => (
                  <tr key={w.name}>
                    <td className="font-medium text-ink">{w.name}</td>
                    <td>{w.target}</td>
                    <td>{w.range}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Reveal>
          <Reveal delay={0.08} className="space-y-4">
            <Callout title="Filtrada, não destilada" tone="leaf">
              Minerais como cálcio e magnésio ajudam a extrair sabores. Água destilada deixa o café chato; água muito dura, amargo e calcário na máquina.
            </Callout>
            <Callout title="Golden Cup (SCA)" tone="gold">
              Proporção {goldenCup.ratio}, extração de {goldenCup.extraction}, TDS de {goldenCup.tds} e água entre {goldenCup.temp}.
            </Callout>
          </Reveal>
        </div>
      </Section>

      <Section kicker="Cardápio" title="Anatomia das bebidas" intro="Proporções aproximadas de espresso, leite, espuma e outros ingredientes nas bebidas mais pedidas.">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {drinks.map((d, i) => (
            <Reveal key={d.id} delay={(i % 5) * 0.05}>
              <div className="card flex h-full flex-col p-4">
                <DrinkGlass layers={d.layers} />
                <p className="mt-3 font-display text-xl leading-tight">{d.name}</p>
                <p className="text-[0.7rem] uppercase tracking-wider text-ink-3">
                  {d.origin} · {d.volume}
                </p>
                <p className="mt-2 text-sm leading-snug text-ink-2">{d.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <NextChapter path="/preparo" />
    </>
  );
}
