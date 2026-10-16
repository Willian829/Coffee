import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { PageHero, Reveal, Section, NextChapter } from "../components/ui";
import WorldMap from "../components/map/WorldMap";
import { rituals } from "../data/culture";
import { scrollToEl } from "../lib/smooth";

function Postcard() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setI((x) => (x + 1) % rituals.length), 4200);
    return () => window.clearInterval(t);
  }, []);
  const r = rituals[i];
  return (
    <div className="relative mx-auto aspect-[4/5] w-full max-w-[360px]">
      <div className="absolute inset-0 rotate-[-4deg] rounded-[28px] border border-line bg-surface-2" />
      <div className="absolute inset-0 rotate-[3deg] rounded-[28px] border border-line bg-surface-3" />
      <div className="card absolute inset-0 overflow-hidden p-7 shadow-lift">
        <AnimatePresence mode="wait">
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.45 }} className="flex h-full flex-col">
            <p className="kicker">{r.country}</p>
            <p className="display mt-4 text-[2.6rem] leading-[1]">{r.name}</p>
            <p className="mt-5 flex-1 text-ink-2">{r.text}</p>
            <div className="flex items-center justify-between border-t border-line pt-4 text-xs text-ink-3">
              <span>
                {String(i + 1).padStart(2, "0")} / {rituals.length}
              </span>
              <span className="font-mono">
                {Math.abs(r.coords[1]).toFixed(1)}°{r.coords[1] >= 0 ? "N" : "S"} {Math.abs(r.coords[0]).toFixed(1)}°{r.coords[0] >= 0 ? "L" : "O"}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function Cultura() {
  const [sel, setSel] = useState(0);
  const r = rituals[sel];
  return (
    <>
      <PageHero
        path="/cultura"
        title={
          <>
            Um grão, <span className="italic text-ink-2">mil</span> rituais
          </>
        }
        lead="Cerimônia de três rodadas na Etiópia, cardamomo no Golfo, espresso de pé na Itália, fika na Suécia, cafezinho no Brasil: cada cultura inventou seu jeito de servir — e de conviver em torno — do café."
        aside={<Postcard />}
      />

      <Section id="rituais" kicker="Volta ao mundo" title="Onde e como se bebe café" intro="Clique nos pontos do mapa ou nos nomes abaixo.">
        <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
          <Reveal className="card overflow-hidden p-2 sm:p-3" >
            <WorldMap
              belt={false}
              aspect={0.52}
              interactiveCountries={false}
              colorFor={() => "var(--map-empty)"}
              ariaLabel="Mapa com rituais de café pelo mundo"
              overlay={(projection, k) =>
                rituals.map((x, i) => {
                  const p = projection(x.coords);
                  if (!p) return null;
                  const on = i === sel;
                  return (
                    <g
                      key={x.name}
                      transform={`translate(${p[0]},${p[1]})`}
                      onClick={() => setSel(i)}
                      style={{ cursor: "pointer" }}
                      role="button"
                      tabIndex={0}
                      aria-label={`${x.country}: ${x.name}`}
                      onKeyDown={(e) => e.key === "Enter" && setSel(i)}
                    >
                      {on && (
                        <circle r={14 / k} fill="var(--accent)" opacity="0.3">
                          <animate attributeName="r" from={`${6 / k}`} to={`${20 / k}`} dur="1.5s" repeatCount="indefinite" />
                          <animate attributeName="opacity" from="0.5" to="0" dur="1.5s" repeatCount="indefinite" />
                        </circle>
                      )}
                      <circle r={(on ? 6.5 : 4.5) / k} fill={on ? "var(--accent)" : "var(--gold)"} stroke="var(--chart-surface)" strokeWidth={1.8 / k} />
                    </g>
                  );
                })
              }
            />
          </Reveal>
          <Reveal delay={0.08} className="card p-7">
            <AnimatePresence mode="wait">
              <motion.div key={sel} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.3 }}>
                <div className="flex items-center gap-2">
                  <p className="kicker">{r.country}</p>
                  {r.tag && <span className="chip py-0.5! text-[0.65rem]!">{r.tag}</span>}
                </div>
                <h3 className="display mt-3 text-4xl">{r.name}</h3>
                <p className="mt-4 text-ink-2">{r.text}</p>
                <p className="mt-4 rounded-xl bg-surface-2 p-4 text-sm text-ink-2">{r.detail}</p>
              </motion.div>
            </AnimatePresence>
            <div className="mt-6 flex items-center justify-between">
              <button type="button" className="btn btn-ghost px-4! py-2! text-sm" onClick={() => setSel((s) => (s - 1 + rituals.length) % rituals.length)}>
                ← Anterior
              </button>
              <span className="text-xs text-ink-3">
                {sel + 1} / {rituals.length}
              </span>
              <button type="button" className="btn btn-ghost px-4! py-2! text-sm" onClick={() => setSel((s) => (s + 1) % rituals.length)}>
                Próximo →
              </button>
            </div>
          </Reveal>
        </div>
      </Section>

      <Section kicker="Todos os rituais" title="Um dicionário de costumes">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rituals.map((x, i) => (
            <Reveal key={x.name} delay={(i % 3) * 0.05}>
              <button type="button" onClick={() => { setSel(i); scrollToEl(document.getElementById("rituais")); }} className="card card-hover h-full w-full p-6 text-left">
                <p className="kicker">{x.country}</p>
                <p className="mt-2 font-display text-2xl leading-tight">{x.name}</p>
                <p className="mt-3 text-sm leading-relaxed text-ink-2">{x.text}</p>
              </button>
            </Reveal>
          ))}
        </div>
      </Section>

      <NextChapter path="/cultura" />
    </>
  );
}
