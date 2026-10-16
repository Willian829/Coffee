import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import { ArrowRight, Check, X as XIcon } from "lucide-react";
import { PageHero, Reveal, Section, NextChapter, SourceNote, Legend } from "../components/ui";
import { CoffeeBranch } from "../components/illustrations";
import { harvestMethods, ripeness } from "../data/cultivation";
import { countryProfiles, monthsLong, monthsShort, type Region } from "../data/countries";

function Ripeness() {
  const [sel, setSel] = useState(2);
  const r = ripeness[sel];
  return (
    <div className="card grid items-center gap-8 p-6 sm:p-10 lg:grid-cols-[1.3fr_1fr]">
      <div>
        <div className="flex items-end justify-between gap-2 sm:gap-6" role="radiogroup" aria-label="Estágios de maturação">
          {ripeness.map((x, i) => (
            <button
              key={x.name}
              type="button"
              role="radio"
              aria-checked={sel === i}
              onClick={() => setSel(i)}
              onMouseEnter={() => setSel(i)}
              className="group flex flex-1 flex-col items-center gap-3"
            >
              <motion.span
                className="relative block aspect-square w-full max-w-[86px] rounded-full shadow-lift"
                style={{ background: `radial-gradient(circle at 34% 30%, rgba(255,255,255,.45), transparent 32%), ${x.color}` }}
                animate={{ scale: sel === i ? 1.12 : 0.92, y: sel === i ? -6 : 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
              >
                <span className="absolute bottom-[8%] left-1/2 h-[12%] w-[12%] -translate-x-1/2 rounded-full bg-black/30" />
              </motion.span>
              <span className={`text-xs font-medium sm:text-sm ${sel === i ? "text-ink" : "text-ink-3"}`}>{x.name}</span>
            </button>
          ))}
        </div>
        <div className="mt-6 h-2 rounded-full" style={{ background: `linear-gradient(90deg, ${ripeness.map((x) => x.color).join(",")})` }} aria-hidden />
        <div className="mt-2 flex justify-between text-xs text-ink-3">
          <span>imaturo</span>
          <span>ponto ideal</span>
          <span>passado</span>
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={r.name} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.3 }}>
          <p className="kicker">Estágio {sel + 1} de 5</p>
          <h3 className="display mt-2 text-5xl">{r.name}</h3>
          <p className="mt-4 text-ink-2">{r.text}</p>
          {sel === 2 && <p className="mt-3 text-sm text-leaf">✓ É o fruto que todo produtor de cafés especiais quer colher.</p>}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

const regions: (Region | "Todas")[] = ["Todas", "América do Sul", "América Central & Caribe", "América do Norte", "África", "Ásia", "Oceania", "Oriente Médio"];

function HarvestCalendar() {
  const now = new Date().getMonth() + 1;
  const [region, setRegion] = useState<Region | "Todas">("Todas");
  const [hover, setHover] = useState<{ iso: string; m: number } | null>(null);
  const [sortBy, setSortBy] = useState<"inicio" | "nome">("inicio");

  const rows = useMemo(() => {
    const list = countryProfiles.filter((c) => region === "Todas" || c.region === region);
    const start = (c: (typeof list)[number]) => {
      // início da safra principal, considerando safras que atravessam o ano
      const ms = c.harvest.main;
      for (let i = 0; i < ms.length; i++) {
        const prev = ms[i] === 1 ? 12 : ms[i] - 1;
        if (!ms.includes(prev)) return ms[i];
      }
      return ms[0];
    };
    return [...list].sort((a, b) => (sortBy === "nome" ? a.name.localeCompare(b.name) : start(a) - start(b) || a.name.localeCompare(b.name)));
  }, [region, sortBy]);

  const harvestingNow = countryProfiles.filter((c) => c.harvest.main.includes(now));

  return (
    <>
      <Reveal className="mb-8 rounded-2xl border border-line bg-surface p-5">
        <p className="kicker">Colhendo agora · {monthsLong[now - 1]}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {harvestingNow.map((c) => (
            <Link key={c.iso} to={`/mundo?pais=${c.iso}`} className="chip hover:border-line-strong">
              <span className="h-2 w-2 rounded-full bg-accent" /> {c.name}
            </Link>
          ))}
        </div>
      </Reveal>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {regions.map((r) => (
          <button key={r} type="button" className="chip text-xs!" aria-pressed={region === r} onClick={() => setRegion(r)}>
            {r}
          </button>
        ))}
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} className="ml-auto h-9 rounded-full border border-line bg-surface px-3 text-sm" aria-label="Ordenar">
          <option value="inicio">Ordenar pelo início da safra</option>
          <option value="nome">Ordem alfabética</option>
        </select>
      </div>
      <div className="card overflow-hidden p-3 sm:p-5" style={{ background: "var(--chart-surface)" }}>
        <div className="scroll-x" data-lenis-prevent-wheel>
          <table className="w-full min-w-[640px] border-separate" style={{ borderSpacing: "3px" }}>
            <thead>
              <tr>
                <th className="w-40 text-left text-xs font-medium text-ink-3">País</th>
                {monthsShort.map((m, i) => (
                  <th key={m} className={`text-center text-xs font-medium ${i + 1 === now ? "text-accent" : "text-ink-3"} ${hover?.m === i + 1 ? "text-ink" : ""}`}>
                    {m}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {rows.map((c) => (
                  <motion.tr key={c.iso} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                    <td className={`pr-2 text-sm ${hover?.iso === c.iso ? "font-semibold text-ink" : "text-ink-2"}`}>
                      <Link to={`/mundo?pais=${c.iso}`} className="hover:text-accent">
                        {c.name}
                      </Link>
                    </td>
                    {Array.from({ length: 12 }, (_, i) => {
                      const m = i + 1;
                      const main = c.harvest.main.includes(m);
                      const sec = c.harvest.secondary?.includes(m);
                      return (
                        <td
                          key={m}
                          onMouseEnter={() => setHover({ iso: c.iso, m })}
                          onMouseLeave={() => setHover(null)}
                          title={`${c.name} · ${monthsLong[i]}: ${main ? "safra principal" : sec ? "safra secundária / início ou fim" : "entressafra"}`}
                          className="h-7 rounded-[4px]"
                          style={{
                            background: main ? "var(--seq-5)" : sec ? "var(--seq-2)" : "var(--surface-2)",
                            outline: m === now ? "1.5px solid var(--accent)" : undefined,
                            outlineOffset: -1,
                            opacity: hover && hover.iso !== c.iso && hover.m !== m ? 0.55 : 1,
                            transition: "opacity .2s",
                          }}
                        />
                      );
                    })}
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-1">
          <Legend
            items={[
              { label: "Safra principal", color: "var(--seq-5)", shape: "square" },
              { label: "Safra secundária / bordas", color: "var(--seq-2)", shape: "square" },
              { label: "Entressafra", color: "var(--surface-2)", shape: "square" },
            ]}
          />
          <span className="flex items-center gap-2 text-sm text-ink-2">
            <span className="h-3 w-3 rounded-[3px] outline outline-[1.5px] outline-accent" /> mês atual
          </span>
        </div>
      </div>
      <SourceNote>
        Calendários aproximados compilados de OIC, relatórios GAIN da USDA e instituições nacionais. Países com montanhas e duas estações de chuva (Colômbia, Quênia) colhem
        em duas épocas; a época exata varia com altitude e clima.
      </SourceNote>
    </>
  );
}

function Yield() {
  const steps = [
    { v: "5–6 kg", l: "de frutos maduros (cereja)" },
    { v: "1 kg", l: "de café verde beneficiado" },
    { v: "≈ 840 g", l: "de café torrado (perda de ~16%)" },
    { v: "≈ 80–100", l: "xícaras de café coado" },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((s, i) => (
        <Reveal key={s.l} delay={i * 0.08}>
          <div className="card relative h-full p-6">
            <p className="display text-5xl text-accent">{s.v}</p>
            <p className="mt-3 text-ink-2">{s.l}</p>
            {i < steps.length - 1 && <ArrowRight className="absolute -right-3 top-1/2 hidden -translate-y-1/2 text-ink-3 lg:block" size={22} />}
          </div>
        </Reveal>
      ))}
    </div>
  );
}

export default function Colheita() {
  return (
    <>
      <PageHero
        path="/colheita"
        title={
          <>
            A hora <span className="italic text-ink-2">da</span> cereja
          </>
        }
        lead="Os frutos de um mesmo galho não amadurecem juntos. Colher na hora certa — e do jeito certo — é uma das decisões que mais influenciam a qualidade e o custo do café."
        aside={<CoffeeBranch stage="maduro" className="h-auto w-full" seed={21} />}
      />

      <Section kicker="Maturação" title="Do verde ao seco: cinco estágios" intro="Toque nos frutos. A doçura da polpa é medida em graus Brix: uma cereja madura tem tipicamente 18–24 °Brix — mais doce que uma uva.">
        <Reveal>
          <Ripeness />
        </Reveal>
      </Section>

      <Section kicker="Métodos" title="Quatro jeitos de colher café">
        <div className="grid gap-4 md:grid-cols-2">
          {harvestMethods.map((m, i) => (
            <Reveal key={m.id} delay={(i % 2) * 0.08}>
              <article className="card card-hover h-full p-7">
                <p className="kicker">{m.aka}</p>
                <h3 className="mt-3 font-display text-3xl">{m.name}</h3>
                <p className="mt-3 text-ink-2">{m.text}</p>
                <ul className="mt-5 space-y-2 text-sm">
                  <li className="flex gap-2 text-ink-2">
                    <Check size={16} className="mt-0.5 shrink-0 text-leaf" /> {m.pros}
                  </li>
                  <li className="flex gap-2 text-ink-2">
                    <XIcon size={16} className="mt-0.5 shrink-0 text-accent" /> {m.cons}
                  </li>
                </ul>
                <p className="mt-5 border-t border-line pt-4 text-sm text-ink-3">Onde: {m.where}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section kicker="Calendário mundial" title="Sempre há café sendo colhido em algum lugar" intro="Como o cinturão cafeeiro atravessa os dois hemisférios, a colheita acontece o ano todo. Passe o mouse para cruzar país e mês.">
        <HarvestCalendar />
      </Section>

      <Section kicker="Rendimento" title="Quanto fruto vira uma xícara?">
        <Yield />
        <SourceNote>Conversões aproximadas: rendimento cereja → café verde varia de ~4,5:1 a 6:1 conforme variedade, maturação e processo; 10 g de café torrado por xícara.</SourceNote>
        <Reveal className="mt-10">
          <Link to="/processamento" className="btn btn-primary">
            O que acontece depois da colheita <ArrowRight size={17} />
          </Link>
        </Reveal>
      </Section>

      <NextChapter path="/colheita" />
    </>
  );
}
