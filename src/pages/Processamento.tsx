import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Clock, Droplets, MapPin, TriangleAlert } from "lucide-react";
import { PageHero, Reveal, Section, NextChapter, SourceNote, Dots, Callout } from "../components/ui";
import { CherrySection } from "../components/illustrations";
import { cobTypes, defects, dryingMethods, dryMill, processes } from "../data/processing";

const tone: Record<string, string> = {
  accent: "var(--s1)",
  s2: "var(--s2)",
  gold: "var(--s3)",
  leaf: "var(--s5)",
  s4: "var(--s4)",
};

/** Tendências sensoriais típicas (1–5) — generalizações didáticas. */
const sensory: Record<string, { body: number; acidity: number; sweet: number; clarity: number }> = {
  natural: { body: 5, acidity: 2, sweet: 5, clarity: 2 },
  lavado: { body: 2, acidity: 5, sweet: 3, clarity: 5 },
  honey: { body: 3, acidity: 3, sweet: 4, clarity: 3 },
  giling: { body: 5, acidity: 1, sweet: 2, clarity: 2 },
  anaerobico: { body: 4, acidity: 3, sweet: 4, clarity: 2 },
  carbonica: { body: 3, acidity: 4, sweet: 4, clarity: 3 },
};

function ProcessExplorer() {
  const [sel, setSel] = useState(processes[0].id);
  const p = processes.find((x) => x.id === sel)!;
  const color = tone[p.color];
  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2" role="tablist" aria-label="Métodos de processamento">
        {processes.map((x) => (
          <button key={x.id} type="button" role="tab" aria-selected={x.id === sel} className="chip" aria-pressed={x.id === sel} onClick={() => setSel(x.id)}>
            <span className="h-2 w-2 rounded-full" style={{ background: tone[x.color] }} />
            {x.name}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={p.id}
          role="tabpanel"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35 }}
          className="card grid gap-10 overflow-hidden p-6 sm:p-10 lg:grid-cols-[1.3fr_1fr]"
        >
          <div>
            <p className="kicker">{p.aka}</p>
            <h3 className="display mt-3 text-[clamp(2.4rem,5vw,3.8rem)]">{p.name}</h3>
            <ol className="relative mt-8 space-y-6">
              <span className="absolute bottom-3 left-[15px] top-3 w-px bg-line-strong" aria-hidden />
              {p.steps.map((s, i) => (
                <motion.li
                  key={s.title}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.12, duration: 0.45 }}
                  className="relative flex gap-4"
                >
                  <span className="relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full font-mono text-xs text-white" style={{ background: color }}>
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-ink">{s.title}</p>
                    <p className="mt-0.5 text-[0.95rem] leading-relaxed text-ink-2">{s.text}</p>
                  </div>
                </motion.li>
              ))}
            </ol>
          </div>
          <div className="space-y-5 rounded-2xl bg-surface-2 p-6">
            <div>
              <p className="kicker">Perfil na xícara</p>
              <p className="mt-2 font-display text-xl leading-snug">{p.flavor}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 border-t border-line pt-5 text-sm">
              {(
                [
                  ["Corpo", sensory[p.id].body],
                  ["Acidez", sensory[p.id].acidity],
                  ["Doçura", sensory[p.id].sweet],
                  ["Clareza", sensory[p.id].clarity],
                ] as [string, number][]
              ).map(([k, v]) => (
                <div key={k}>
                  <p className="mb-1 text-ink-3">{k}</p>
                  <Dots value={v} label={k} />
                </div>
              ))}
            </div>
            <ul className="space-y-3 border-t border-line pt-5 text-sm text-ink-2">
              <li className="flex items-center gap-2">
                <Droplets size={16} className="text-s2" /> Uso de água: <strong className="text-ink">{["baixo", "médio", "alto"][p.water - 1]}</strong>
              </li>
              <li className="flex items-center gap-2">
                <TriangleAlert size={16} className="text-gold" /> Risco de defeitos: <strong className="text-ink">{["baixo", "médio", "alto"][p.risk - 1]}</strong>
              </li>
              <li className="flex items-center gap-2">
                <Clock size={16} className="text-ink-3" /> {p.time}
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 shrink-0 text-ink-3" /> {p.where}
              </li>
            </ul>
          </div>
        </motion.div>
      </AnimatePresence>
      <SourceNote>Perfis sensoriais são tendências gerais: variedade, maturação, fermentação e secagem podem produzir naturais limpos e lavados encorpados.</SourceNote>
    </div>
  );
}

function Moisture() {
  const [m, setM] = useState(11);
  const status = m > 13 ? { t: "Úmido demais: risco de mofo, fermentação e ocratoxina.", c: "text-accent" } : m < 9.5 ? { t: "Seco demais: o grão fica quebradiço e perde sabor.", c: "text-gold" } : { t: "Faixa ideal para armazenar e exportar.", c: "text-leaf" };
  return (
    <div className="card p-6 sm:p-8">
      <p className="kicker">Umidade do grão</p>
      <div className="mt-3 flex items-end gap-3">
        <span className="display text-6xl">{m.toString().replace(".", ",")}%</span>
      </div>
      <input type="range" min={8} max={20} step={0.5} value={m} onChange={(e) => setM(Number(e.target.value))} className="mt-5 w-full" aria-label="Umidade do grão" />
      <div className="relative mt-2 h-2 rounded-full bg-surface-3">
        <span className="absolute inset-y-0 rounded-full bg-leaf" style={{ left: `${((10 - 8) / 12) * 100}%`, width: `${(2 / 12) * 100}%` }} />
      </div>
      <div className="mt-1 flex justify-between text-xs text-ink-3">
        <span>8%</span>
        <span>ideal 10–12%</span>
        <span>20%</span>
      </div>
      <p className={`mt-4 text-sm font-medium ${status.c}`}>{status.t}</p>
      <p className="mt-2 text-xs text-ink-3">Um fruto recém-colhido tem ~60–65% de umidade; o café em coco seco, ~11–12%.</p>
    </div>
  );
}

export default function Processamento() {
  return (
    <>
      <PageHero
        path="/processamento"
        title={
          <>
            Onde nasce <span className="italic text-ink-2">o sabor</span>
          </>
        }
        lead="Entre a colheita e o saco de café verde, o fruto precisa perder casca, polpa, mucilagem e água. Cada caminho — natural, lavado, honey, fermentações controladas — deixa uma assinatura na xícara."
        aside={
          <div className="mx-auto w-full max-w-[380px]">
            <CherrySection active={null} onHover={() => {}} />
          </div>
        }
      />

      <Section kicker="Métodos" title="Seis formas de transformar fruto em grão">
        <ProcessExplorer />
      </Section>

      <Section kicker="Secagem" title="A arte de secar devagar" intro="A secagem precisa ser lenta e uniforme. Rápida demais 'cozinha' o grão; lenta demais abre espaço para mofo e fermentações indesejadas.">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            {dryingMethods.map((d, i) => (
              <Reveal key={d.name} delay={(i % 2) * 0.06}>
                <div className="card h-full p-6">
                  <h3 className="font-display text-2xl">{d.name}</h3>
                  <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-2">{d.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.1}>
            <Moisture />
          </Reveal>
        </div>
      </Section>

      <Section kicker="Beneficiamento" title="Do armazém ao saco de juta">
        <ol className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
          {dryMill.map((s, i) => (
            <Reveal key={s.name} delay={i * 0.06} as="li">
              <div className="card h-full p-5">
                <span className="font-mono text-xs text-accent">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-2 font-display text-xl">{s.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-2">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </Section>

      <Section kicker="Classificação" title="Defeitos, tipos e o que é 'especial'">
        <div className="grid gap-8 lg:grid-cols-2">
          <Reveal>
            <div className="card p-6 sm:p-8" style={{ background: "var(--chart-surface)" }}>
              <h3 className="text-lg font-semibold">Classificação Oficial Brasileira (COB)</h3>
              <p className="mt-1 text-sm text-ink-3">Número máximo de defeitos em uma amostra de 300 g</p>
              <div className="mt-6 space-y-2.5">
                {cobTypes.map((t, i) => (
                  <div key={t.type} className="grid grid-cols-[64px_1fr] items-center gap-3">
                    <span className="text-sm text-ink-2">{t.type}</span>
                    <div className="flex items-center gap-2">
                      <motion.div
                        className="h-[16px] rounded-r-[4px]"
                        style={{ background: i < 2 ? "var(--s5)" : i < 4 ? "var(--s3)" : "var(--s1)" }}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(Math.log10(t.defects + 1) / Math.log10(361)) * 82}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: i * 0.06 }}
                      />
                      <span className="num text-xs text-ink-2">{t.defects}</span>
                    </div>
                  </div>
                ))}
              </div>
              <SourceNote>Escala logarítmica. Na COB, defeitos têm equivalências: 1 grão preto = 1 defeito; 2 ardidos = 1; 5 verdes = 1; 5 quebrados = 1.</SourceNote>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="overflow-hidden rounded-[22px] border border-line">
              <table className="table-atlas">
                <thead>
                  <tr>
                    <th>Defeito</th>
                    <th>Causa</th>
                    <th>Efeito na xícara</th>
                  </tr>
                </thead>
                <tbody>
                  {defects.map((d) => (
                    <tr key={d.name}>
                      <td className="font-medium text-ink">
                        {d.name}
                        {d.primary && <span className="ml-1.5 align-middle text-[0.65rem] uppercase tracking-wider text-accent">grave</span>}
                      </td>
                      <td>{d.cause}</td>
                      <td>{d.effect}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Callout title="Café especial (SCA)" tone="leaf">
            Em 350 g de café verde: nenhum defeito primário e no máximo 5 defeitos completos; umidade entre 9% e 13%; e nota de 80 pontos ou mais na prova de xícara.
          </Callout>
          <Callout title="Peneiras" tone="gold">
            O tamanho é medido em 1/64 de polegada. No Brasil, 'peneira 17/18' indica grãos graúdos; o grão moca é separado em peneiras de furos oblongos.
          </Callout>
          <Callout title="Bebida" tone="accent">
            A classificação brasileira também avalia a bebida: estritamente mole, mole, apenas mole, dura, riado, rio e rio zona — do mais suave ao mais 'iodado'.
          </Callout>
        </div>
      </Section>

      <NextChapter path="/processamento" />
    </>
  );
}
