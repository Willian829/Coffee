import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { geoPath, geoInterpolate } from "d3-geo";
import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { PageHero, Reveal, Section, NextChapter, Callout } from "../components/ui";
import WorldMap from "../components/map/WorldMap";
import { eras, routeLegs, routeStops, timeline, type Era } from "../data/history";

const stopById = new Map(routeStops.map((s) => [s.id, s]));

function YearBadge() {
  return (
    <div className="relative mx-auto grid aspect-square w-full max-w-[360px] place-items-center">
      <div className="absolute inset-0 animate-spin-slow rounded-full border border-dashed border-line-strong" />
      <div className="absolute inset-6 rounded-full bg-surface shadow-lift" />
      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full animate-spin-slow" aria-hidden>
        <defs>
          <path id="circ" d="M100,100 m-82,0 a82,82 0 1,1 164,0 a82,82 0 1,1 -164,0" />
        </defs>
        <text fontSize="9" letterSpacing="2.4" fill="var(--ink-3)" fontFamily="var(--font-mono)">
          <textPath href="#circ">ETIÓPIA · IÊMEN · ISTAMBUL · VENEZA · JAVA · PARIS · BELÉM · </textPath>
        </text>
      </svg>
      <div className="relative text-center">
        <p className="display text-[5.2rem] leading-none text-accent">1727</p>
        <p className="mt-2 max-w-[11rem] text-sm text-ink-2">o café chega ao Brasil pelas mãos de Palheta</p>
      </div>
    </div>
  );
}

function RouteMap() {
  const [step, setStep] = useState(routeLegs.length);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    if (step >= routeLegs.length) {
      setPlaying(false);
      return;
    }
    const t = window.setTimeout(() => setStep((s) => s + 1), 1500);
    return () => window.clearTimeout(t);
  }, [playing, step]);

  const play = () => {
    if (step >= routeLegs.length) setStep(0);
    setPlaying(true);
  };

  const current = step > 0 ? routeLegs[Math.min(step, routeLegs.length) - 1] : null;
  const visibleStops = useMemo(() => {
    const ids = new Set<string>(["kaffa"]);
    routeLegs.slice(0, step).forEach((l) => {
      ids.add(l.from);
      ids.add(l.to);
    });
    return ids;
  }, [step]);

  return (
    <div className="card overflow-hidden" style={{ background: "var(--chart-surface)" }}>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line p-5">
        <div>
          <p className="font-semibold text-ink">A rota do café pelo mundo</p>
          <p className="text-sm text-ink-3">Da Etiópia ao Brasil em {routeLegs.length} etapas (séculos XV–XVIII)</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="grid h-10 w-10 place-items-center rounded-full border border-line hover:bg-surface-2" onClick={() => { setPlaying(false); setStep((s) => Math.max(0, s - 1)); }} aria-label="Etapa anterior">
            <SkipBack size={16} />
          </button>
          <button type="button" className="btn btn-primary px-4! py-2!" onClick={() => (playing ? setPlaying(false) : play())}>
            {playing ? <Pause size={16} /> : <Play size={16} />} {playing ? "Pausar" : step >= routeLegs.length ? "Reproduzir rota" : "Continuar"}
          </button>
          <button type="button" className="grid h-10 w-10 place-items-center rounded-full border border-line hover:bg-surface-2" onClick={() => { setPlaying(false); setStep((s) => Math.min(routeLegs.length, s + 1)); }} aria-label="Próxima etapa">
            <SkipForward size={16} />
          </button>
        </div>
      </div>
      <div className="relative">
        <WorldMap
          aspect={0.52}
          belt
          interactiveCountries={false}
          colorFor={() => "var(--map-empty)"}
          ariaLabel="Mapa animado da dispersão do café da Etiópia até o Brasil"
          overlay={(projection, k) => {
            const path = geoPath(projection);
            return (
              <g>
                {routeLegs.map((leg, i) => {
                  const a = stopById.get(leg.from)!;
                  const b = stopById.get(leg.to)!;
                  const interp = geoInterpolate(a.coords, b.coords);
                  const coords = Array.from({ length: 33 }, (_, j) => interp(j / 32));
                  const d = path({ type: "LineString", coordinates: coords }) ?? "";
                  const shown = i < step;
                  const isCurrent = i === step - 1;
                  return (
                    <motion.path
                      key={`${leg.from}-${leg.to}`}
                      d={d}
                      fill="none"
                      stroke={isCurrent ? "var(--accent)" : "var(--gold)"}
                      strokeWidth={(isCurrent ? 2.6 : 1.6) / k}
                      strokeLinecap="round"
                      strokeDasharray={isCurrent ? undefined : `${4 / k} ${4 / k}`}
                      initial={false}
                      animate={{ pathLength: shown ? 1 : 0, opacity: shown ? 1 : 0 }}
                      transition={{ duration: shown ? 1.1 : 0.3, ease: "easeInOut" }}
                    />
                  );
                })}
                {routeStops.map((s) => {
                  const p = projection(s.coords);
                  if (!p) return null;
                  const on = visibleStops.has(s.id);
                  const isHere = current && (current.to === s.id);
                  return (
                    <g key={s.id} transform={`translate(${p[0]},${p[1]})`} opacity={on ? 1 : 0.0} style={{ transition: "opacity .5s" }}>
                      {isHere && (
                        <circle r={12 / k} fill="var(--accent)" opacity="0.25">
                          <animate attributeName="r" from={`${4 / k}`} to={`${16 / k}`} dur="1.4s" repeatCount="indefinite" />
                          <animate attributeName="opacity" from="0.5" to="0" dur="1.4s" repeatCount="indefinite" />
                        </circle>
                      )}
                      <circle r={(isHere ? 5 : 3.6) / k} fill={isHere ? "var(--accent)" : "var(--ink)"} stroke="var(--chart-surface)" strokeWidth={1.5 / k} />
                      <text
                        x={(s.lp?.[0] ?? 7) / k}
                        y={(s.lp?.[1] ?? -6) / k}
                        textAnchor={s.lp?.[2] ?? "start"}
                        fontSize={11 / k}
                        fill="var(--ink-2)"
                        style={{ paintOrder: "stroke" }}
                        stroke="var(--chart-surface)"
                        strokeWidth={3 / k}
                      >
                        {s.name}
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          }}
        />
        <AnimatePresence mode="wait">
          {current && (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35 }}
              className="pointer-events-none absolute left-4 top-4 max-w-[min(300px,70%)] rounded-2xl border border-line bg-surface/90 p-4 shadow-soft backdrop-blur"
            >
              <p className="font-mono text-xs text-accent">{current.year}</p>
              <p className="mt-1 font-display text-xl leading-tight">
                {stopById.get(current.from)!.name.split(",")[0]} → {stopById.get(current.to)!.name.split(",")[0]}
              </p>
              <p className="mt-1 text-sm text-ink-2">{current.note}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="flex gap-1 border-t border-line p-3" aria-hidden>
        {routeLegs.map((_, i) => (
          <span key={i} className={`h-1 flex-1 rounded-full transition-colors duration-500 ${i < step ? "bg-accent" : "bg-surface-3"}`} />
        ))}
      </div>
    </div>
  );
}

function Timeline() {
  const [era, setEra] = useState<Era | "todas">("todas");
  const [onlyBrazil, setOnlyBrazil] = useState(false);
  const items = timeline.filter((t) => (era === "todas" || t.era === era) && (!onlyBrazil || t.brazil));

  return (
    <>
      <div className="mb-10 flex flex-wrap items-center gap-2">
        <button type="button" className="chip" aria-pressed={era === "todas"} onClick={() => setEra("todas")}>
          Todas as épocas
        </button>
        {eras.map((e) => (
          <button key={e.id} type="button" className="chip" aria-pressed={era === e.id} onClick={() => setEra(e.id)}>
            {e.label} <span className="opacity-60">{e.range}</span>
          </button>
        ))}
        <label className="ml-auto flex cursor-pointer items-center gap-2 text-sm text-ink-2">
          <input type="checkbox" checked={onlyBrazil} onChange={(e) => setOnlyBrazil(e.target.checked)} className="h-4 w-4" />
          Só marcos do Brasil
        </label>
      </div>
      <ol className="relative">
        <span className="absolute bottom-0 left-[15px] top-0 w-px bg-line-strong md:left-1/2" aria-hidden />
        <AnimatePresence initial={false}>
          {items.map((t, i) => {
            const right = i % 2 === 1;
            return (
              <motion.li
                key={t.title}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="relative mb-8 pl-12 md:grid md:grid-cols-2 md:gap-14 md:pl-0"
              >
                <span
                  className={`absolute left-[9px] top-6 h-3.5 w-3.5 rounded-full border-2 border-bg md:left-1/2 md:-translate-x-1/2 ${t.brazil ? "bg-leaf" : t.legend ? "bg-gold" : "bg-accent"}`}
                  aria-hidden
                />
                <div className={`${right ? "md:col-start-2" : "md:text-right"}`}>
                  <Reveal y={16}>
                    <article className="card card-hover p-6">
                      <div className={`flex flex-wrap items-center gap-2 ${right ? "" : "md:justify-end"}`}>
                        <span className="font-mono text-sm font-medium text-accent">{t.year}</span>
                        {t.place && <span className="chip py-0.5! text-xs!">{t.place}</span>}
                        {t.legend && <span className="chip py-0.5! text-xs! text-gold!">lenda / tradição</span>}
                        {t.brazil && <span className="chip py-0.5! text-xs! text-leaf!">Brasil</span>}
                      </div>
                      <h3 className="mt-3 font-display text-[1.65rem] leading-tight">{t.title}</h3>
                      <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-2">{t.text}</p>
                    </article>
                  </Reveal>
                </div>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ol>
    </>
  );
}

export default function Historia() {
  return (
    <>
      <PageHero
        path="/historia"
        title={
          <>
            Seis séculos <span className="italic text-ink-2">numa</span> xícara
          </>
        }
        lead="O café saiu das florestas da Etiópia, ganhou as casas de café do mundo islâmico, financiou impérios coloniais, moldou o Brasil e hoje move um mercado de bilhões. Esta é a sua história — das lendas aos recordes de 2025."
        aside={<YearBadge />}
      />

      <Section kicker="Dispersão" title="Como uma planta etíope conquistou o planeta" intro="O cultivo foi, durante séculos, um segredo guardado a sete chaves. Sementes contrabandeadas, mudas presenteadas a reis e diplomatas espertos levaram o café a todos os continentes tropicais.">
        <Reveal>
          <RouteMap />
        </Reveal>
      </Section>

      <Section kicker="Linha do tempo" title="Marcos da história do café" intro="Filtre por época ou veja só os capítulos brasileiros. Eventos marcados como lenda vêm da tradição oral e não têm comprovação documental.">
        <Timeline />
      </Section>

      <Section kicker="Brasil" title="O ciclo do café e a formação do país">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <Reveal className="prose-atlas">
            <p>
              Depois de chegar a Belém em 1727, o café levou quase um século para encontrar seu lugar. Foi no <strong>Vale do Paraíba</strong>, entre Rio e São Paulo, que a
              cultura explodiu no século XIX — com fazendas imensas sustentadas pelo <strong>trabalho de pessoas escravizadas</strong>. Na década de 1840, o Brasil já era o
              maior produtor do mundo.
            </p>
            <p>
              Com o solo esgotado, a fronteira cafeeira avançou para o <strong>Oeste Paulista</strong>. O café puxou ferrovias, fez de Santos o maior porto exportador e,
              após a abolição (1888), atraiu centenas de milhares de imigrantes europeus e, depois, japoneses. O dinheiro do café financiou bancos, indústrias e a própria
              cidade de São Paulo.
            </p>
            <p>
              Na República Velha, a <em>política do café com leite</em> alternava paulistas e mineiros no poder, e o Estado comprava excedentes para segurar os preços. A
              crise de 1929 derrubou esse modelo: o país chegou a queimar cerca de 78 milhões de sacas. Ainda assim, o Brasil nunca deixou o topo — e, em 2027, completa{" "}
              <strong>300 anos de café</strong>.
            </p>
          </Reveal>
          <Reveal delay={0.1} className="space-y-4">
            <Callout title="Por que o 'cafezinho'?" tone="gold">
              O diminutivo carinhoso virou sinônimo de hospitalidade: oferecer um café é a forma mais brasileira de dizer “fique à vontade”.
            </Callout>
            <Callout title="Café e escravidão" tone="accent">
              A riqueza do ciclo cafeeiro foi construída sobre a escravidão. O Brasil foi o último país das Américas a abolir o trabalho escravo, em 1888 — e as fazendas de café
              estavam entre as que mais resistiram ao fim do sistema.
            </Callout>
          </Reveal>
        </div>
      </Section>

      <NextChapter path="/historia" />
    </>
  );
}
