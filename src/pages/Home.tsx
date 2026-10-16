import { AnimatePresence, motion, useInView, useScroll, useTransform } from "motion/react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router";
import { ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";
import { chapters, groups } from "../data/nav";
import { Bean, CherrySection, CoffeeBranch, SteamingCup } from "../components/illustrations";
import { Reveal, Section, Stat, Topo } from "../components/ui";
import WorldMap from "../components/map/WorldMap";
import { productionTotal, worldProduction, latestYearIndex, icoPricesSep2026, worldConsumption } from "../data/production";
import { annualPrices } from "../data/prices";
import { fmt, fmtMiBags } from "../lib/format";
import { scaleThreshold } from "d3-scale";
import { line as d3line, curveMonotoneX } from "d3-shape";

const ticker = [
  `Produção mundial 2026/27: ${fmtMiBags(worldProduction[latestYearIndex])} de sacas (recorde)`,
  `Brasil: ${fmtMiBags(71900)} de sacas — ~38% do mundo`,
  `Vietnã: ${fmtMiBags(32500)} · Colômbia: ${fmtMiBags(13400)} · Etiópia: ${fmtMiBags(12100)}`,
  `Indicador composto OIC (set/26): ${fmt(icoPricesSep2026.composite, 1)} ¢/lb`,
  `Arábica Nova York (set/26): ${fmt(icoPricesSep2026.nyFutures, 1)} ¢/lb`,
  `Robusta Londres (set/26): ${fmt(icoPricesSep2026.londonFutures, 1)} ¢/lb`,
  `Consumo mundial 2026/27: ${fmtMiBags(worldConsumption[latestYearIndex])} de sacas`,
  "Safra brasileira 2026 (Conab): 67,6 mi de sacas",
];

function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yBranch = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const yBean1 = useTransform(scrollYProgress, [0, 1], [0, -180]);
  const yBean2 = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const rot = useTransform(scrollYProgress, [0, 1], [0, 40]);

  return (
    <section ref={ref} className="relative flex min-h-[100svh] flex-col overflow-hidden pt-24">
      <Topo className="pointer-events-none absolute inset-0 h-full w-full" />
      <div className="pointer-events-none absolute right-[-10%] top-[8%] h-[70vmin] w-[70vmin] rounded-full bg-accent opacity-[0.10] blur-[90px]" />
      <div className="wrap relative grid flex-1 items-center gap-6 pb-10 lg:grid-cols-[1.15fr_1fr]">
        <div className="relative z-10">
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="kicker mb-6 flex items-center gap-2">
            <Sparkles size={13} className="text-accent" /> Um atlas interativo · dados de 2026
          </motion.p>
          <h1 className="display text-[clamp(3.6rem,12vw,9.6rem)]">
            {["Atlas", "do", "Café"].map((w, i) => (
              <motion.span
                key={w}
                className={`inline-block ${i === 1 ? "italic text-ink-2" : ""} ${i < 2 ? "mr-[0.18em]" : ""}`}
                initial={{ opacity: 0, y: "0.4em", rotate: 3 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                transition={{ duration: 1.1, delay: 0.1 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              >
                {w}
              </motion.span>
            ))}
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="lead mt-7 max-w-xl text-pretty"
          >
            Da floresta etíope à sua xícara: história, botânica, plantio, colheita, processamento, torra, preparo, mercado mundial e o futuro de
            uma das culturas mais importantes do planeta — com mapas, simuladores e dados oficiais.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.65 }} className="mt-9 flex flex-wrap gap-3">
            <Link to="/historia" className="btn btn-primary">
              Começar a jornada <ArrowRight size={17} />
            </Link>
            <Link to="/mundo" className="btn btn-ghost">
              Explorar o mapa mundial
            </Link>
          </motion.div>
        </div>
        <div className="relative mx-auto aspect-square w-full max-w-[560px]">
          <motion.div style={{ y: yBranch }} className="absolute inset-0">
            <motion.div initial={{ opacity: 0, scale: 0.9, rotate: -6 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}>
              <CoffeeBranch className="h-full w-full drop-shadow-[0_30px_40px_rgba(0,0,0,0.25)]" />
            </motion.div>
          </motion.div>
          <motion.div style={{ y: yBean1, rotate: rot }} className="absolute -left-4 top-6 animate-floaty">
            <Bean color="#5d3a20" size={74} />
          </motion.div>
          <motion.div style={{ y: yBean2 }} className="absolute bottom-10 right-0 animate-floaty [animation-delay:-3s]">
            <Bean color="#8a5a33" size={56} rotate={40} />
          </motion.div>
          <motion.div style={{ y: yBean1 }} className="absolute bottom-[30%] left-[8%] animate-floaty [animation-delay:-5s]">
            <Bean color="#9aa063" size={42} rotate={10} />
          </motion.div>
        </div>
      </div>
      <div className="relative border-y border-line bg-surface/60 py-3.5 backdrop-blur" aria-label="Destaques">
        <div className="flex w-max animate-marquee gap-12 whitespace-nowrap pl-12 text-sm text-ink-2">
          {[...ticker, ...ticker].map((t, i) => (
            <span key={i} className="flex items-center gap-12">
              {t}
              <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────── Jornada (scrollytelling) ───────────── */

type Step = { kicker: string; title: string; text: string; to: string; visual: ReactNode };

const ThreeBeans = () => (
  <div className="flex h-full items-center justify-center gap-2">
    <Bean color="#9aa063" size={140} rotate={-30} />
    <Bean color="#a87645" size={150} rotate={-10} />
    <Bean color="#3a2213" size={160} rotate={20} gloss={0.8} />
  </div>
);

const steps: Step[] = [
  {
    kicker: "01 · Florada",
    title: "Tudo começa com uma flor",
    text: "Após a primeira chuva forte depois da seca, o cafezal floresce de uma vez: flores brancas, perfumadas como jasmim, que duram só dois ou três dias.",
    to: "/cultivo",
    visual: <CoffeeBranch stage="flor" className="h-full w-full" seed={3} />,
  },
  {
    kicker: "02 · Frutos",
    title: "Sete a nove meses de espera",
    text: "As flores viram 'chumbinhos' verdes que crescem e enchem durante o verão. Cada fruto guarda, quase sempre, duas sementes — os grãos.",
    to: "/botanica",
    visual: <CoffeeBranch stage="verde" className="h-full w-full" seed={5} />,
  },
  {
    kicker: "03 · Colheita",
    title: "Cerejas maduras, uma a uma — ou de uma vez",
    text: "No ponto de cereja, o fruto está doce e pronto. Pode ser colhido à mão, seletivamente, ou por derriça e colhedoras mecânicas.",
    to: "/colheita",
    visual: <CoffeeBranch stage="maduro" className="h-full w-full" seed={7} />,
  },
  {
    kicker: "04 · Pós-colheita",
    title: "Polpa, mucilagem, pergaminho, grão",
    text: "Natural, lavado ou honey: a forma de retirar as camadas do fruto e secar a semente molda boa parte do sabor final.",
    to: "/processamento",
    visual: (
      <div className="mx-auto h-full max-w-[420px]">
        <CherrySection active={null} onHover={() => {}} />
      </div>
    ),
  },
  {
    kicker: "05 · Torra",
    title: "Do verde ao chocolate em 12 minutos",
    text: "A 200 °C, centenas de reações químicas criam mais de 800 compostos aromáticos. O grão estala, dobra de volume e perde ~15% do peso.",
    to: "/torra",
    visual: <ThreeBeans />,
  },
  {
    kicker: "06 · Xícara",
    title: "Água, moagem, tempo — e você",
    text: "Espresso, coado, prensa, cold brew: cada método extrai uma faceta diferente do mesmo grão. O último passo da jornada é o seu.",
    to: "/preparo",
    visual: <SteamingCup className="h-full w-full" />,
  },
];

function JourneyStep({ step, index, onActive }: { step: Step; index: number; onActive: (i: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.6 });
  useEffect(() => {
    if (inView) onActive(index);
  }, [inView, index, onActive]);
  return (
    <div ref={ref} className="flex min-h-[64vh] flex-col justify-center py-10 lg:min-h-[78vh]">
      <div className="mb-8 aspect-[4/3] w-full max-w-md lg:hidden">{step.visual}</div>
      <p className="kicker mb-4 text-accent">{step.kicker}</p>
      <h3 className="display text-balance text-[clamp(2.2rem,4.6vw,3.8rem)]">{step.title}</h3>
      <p className="lead mt-5 max-w-lg">{step.text}</p>
      <Link to={step.to} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-ink hover:text-accent">
        Ler o capítulo <ArrowRight size={15} />
      </Link>
    </div>
  );
}

function Journey() {
  const [active, setActive] = useState(0);
  return (
    <section className="relative border-y border-line bg-bg-2">
      <div className="wrap grid gap-10 lg:grid-cols-2">
        <div className="relative hidden lg:block">
          <div className="sticky top-0 flex h-screen items-center">
            <div className="relative aspect-square w-full max-w-[540px]">
              <div className="absolute inset-[8%] rounded-full bg-surface" />
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  className="absolute inset-0 p-8"
                  initial={{ opacity: 0, scale: 0.92, rotate: -4 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 1.04, rotate: 3 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  {steps[active].visual}
                </motion.div>
              </AnimatePresence>
              <div className="absolute -bottom-2 left-1/2 flex -translate-x-1/2 gap-2" aria-hidden>
                {steps.map((_, i) => (
                  <span key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === active ? "w-8 bg-accent" : "w-1.5 bg-line-strong"}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="py-10 lg:py-[11vh]">
          <Reveal>
            <p className="kicker">A jornada</p>
            <h2 className="mt-4 text-[clamp(2.2rem,4.6vw,3.6rem)]">Da semente à xícara</h2>
            <p className="lead mt-4 max-w-md">Role para acompanhar, em seis paradas, o caminho de um grão de café.</p>
          </Reveal>
          {steps.map((s, i) => (
            <JourneyStep key={s.kicker} step={s} index={i} onActive={setActive} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────── Capítulos ───────────── */

function Chapters() {
  return (
    <Section kicker="O Atlas" title="17 capítulos para entender o café por inteiro" intro="Leia na ordem, como um livro, ou salte direto para o que interessa. Use Ctrl + K para buscar qualquer coisa.">
      <div className="space-y-12">
        {groups.map((g) => (
          <div key={g.id}>
            <Reveal className="mb-4 flex items-baseline justify-between border-b border-line pb-3">
              <h3 className="font-display text-2xl">{g.label}</h3>
              <span className="text-sm text-ink-3">{g.blurb}</span>
            </Reveal>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {chapters
                .filter((c) => c.group === g.id)
                .map((c, i) => {
                  const Icon = c.icon;
                  const n = chapters.indexOf(c) + 1;
                  const tone = c.tone === "accent" ? "bg-accent-soft text-accent" : c.tone === "gold" ? "bg-gold-soft text-gold" : "bg-leaf-soft text-leaf";
                  return (
                    <Reveal key={c.path} delay={i * 0.06}>
                      <Link to={c.path} className="card card-hover group flex h-full flex-col p-6">
                        <div className="flex items-start justify-between">
                          <span className={`grid h-11 w-11 place-items-center rounded-2xl ${tone}`}>
                            <Icon size={20} />
                          </span>
                          <span className="font-mono text-xs text-ink-3">{String(n).padStart(2, "0")}</span>
                        </div>
                        <h4 className="mt-6 font-display text-[1.6rem] leading-tight">{c.title}</h4>
                        <p className="mt-2 flex-1 text-[0.92rem] leading-relaxed text-ink-2">{c.description}</p>
                        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-3 transition-colors group-hover:text-accent">
                          Abrir <ArrowUpRight size={15} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        </span>
                      </Link>
                    </Reveal>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ───────────── Teasers ───────────── */

const prodThresholds = [500, 1500, 3000, 6000, 12000, 30000];
const seqVars = ["var(--seq-0)", "var(--seq-1)", "var(--seq-2)", "var(--seq-3)", "var(--seq-4)", "var(--seq-5)", "var(--seq-6)"];

function MapTeaser() {
  const values = useMemo(() => new Map(productionTotal.map((r) => [r.iso, r.values[latestYearIndex]])), []);
  const color = scaleThreshold<number, string>().domain(prodThresholds).range(seqVars);
  const top = productionTotal.slice(0, 6);
  return (
    <Section kicker="Mapa mundial" title="Mais de 70 países, um cinturão em volta do planeta" intro="O café cresce entre os trópicos de Câncer e Capricórnio. Brasil e Vietnã, sozinhos, colhem mais da metade do café do mundo.">
      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <Reveal className="card overflow-hidden p-2 sm:p-4">
          <WorldMap
            values={values}
            colorFor={(v) => (v ? color(v) : "var(--map-empty)")}
            tooltip={(iso, name) => {
              const r = productionTotal.find((p) => p.iso === iso);
              return (
                <>
                  <p className="font-semibold">{r?.name ?? name}</p>
                  <p className="text-ink-2">{r ? `${fmtMiBags(r.values[latestYearIndex])} de sacas (2026/27)` : "Sem produção relevante"}</p>
                </>
              );
            }}
            ariaLabel="Mapa da produção de café por país em 2026/27"
          />
        </Reveal>
        <Reveal delay={0.1} className="flex flex-col">
          <ol className="space-y-3">
            {top.map((r, i) => (
              <li key={r.iso} className="flex items-baseline gap-4 border-b border-line pb-3">
                <span className="font-mono text-xs text-ink-3">{String(i + 1).padStart(2, "0")}</span>
                <span className="flex-1 font-display text-2xl">{r.name}</span>
                <span className="num text-ink-2">{fmtMiBags(r.values[latestYearIndex])}</span>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-xs text-ink-3">Milhões de sacas de 60 kg · previsão USDA 2026/27</p>
          <Link to="/mundo" className="btn btn-primary mt-8 self-start">
            Abrir o mapa interativo <ArrowRight size={17} />
          </Link>
        </Reveal>
      </div>
    </Section>
  );
}

function PriceTeaser() {
  const w = 600;
  const h = 180;
  const pts = annualPrices.map(([y, a]) => [y, a] as [number, number]);
  const maxY = Math.max(...pts.map((p) => p[1]));
  const sx = (y: number) => ((y - 1960) / (2025 - 1960)) * w;
  const sy = (v: number) => h - (v / maxY) * (h - 14) - 4;
  const d = d3line<[number, number]>()
    .x((p) => sx(p[0]))
    .y((p) => sy(p[1]))
    .curve(curveMonotoneX)(pts);
  const last = pts[pts.length - 1];
  return (
    <Section tight>
      <Reveal>
        <Link to="/mercado" className="card card-hover group grid items-center gap-8 overflow-hidden p-6 sm:p-10 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="kicker">Mercado</p>
            <h3 className="display mt-3 text-[clamp(2rem,4.4vw,3.4rem)]">2025: o café mais caro da história</h3>
            <p className="mt-4 text-ink-2">
              O arábica chegou a US$ 4,38 por libra em Nova York e o indicador da OIC bateu o recorde de 1977. Veja 66 anos de preços, o balanço
              global e para onde vai o dinheiro da sua xícara.
            </p>
            <span className="mt-6 inline-flex items-center gap-2 font-semibold text-accent">
              Ver o capítulo de mercado <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </span>
          </div>
          <svg viewBox={`0 0 ${w} ${h + 24}`} className="h-auto w-full" role="img" aria-label="Preço médio anual do arábica, 1960–2025">
            {[1960, 1980, 2000, 2025].map((y) => (
              <text key={y} x={sx(y)} y={h + 18} fontSize="12" textAnchor={y === 2025 ? "end" : y === 1960 ? "start" : "middle"} fill="var(--ink-3)">
                {y}
              </text>
            ))}
            <line x1="0" x2={w} y1={h} y2={h} stroke="var(--axis)" />
            <motion.path
              d={d ?? ""}
              fill="none"
              stroke="var(--s1)"
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 2.2, ease: "easeInOut" }}
            />
            <circle cx={sx(last[0])} cy={sy(last[1])} r="5" fill="var(--s1)" stroke="var(--surface)" strokeWidth="2" />
            <text x={sx(last[0]) - 10} y={sy(last[1]) + 4} textAnchor="end" fontSize="12.5" fill="var(--ink-2)">
              US$ {fmt(last[1], 2)}/kg em 2025
            </text>
          </svg>
        </Link>
      </Reveal>
    </Section>
  );
}

const facts = [
  { t: "O grão é uma semente", d: "O fruto do café é uma drupa — como a cereja ou a azeitona. O 'grão' é a semente que fica no centro." },
  { t: "Cafeína é defesa", d: "Na planta, a cafeína age como pesticida natural: é tóxica para muitos insetos e inibe a germinação de concorrentes." },
  { t: "Finlândia no topo", d: "Os finlandeses consomem cerca de 12 kg de café por pessoa ao ano — mais que o dobro da média europeia." },
  { t: "60 grãos por xícara", d: "Segundo seu secretário, Beethoven contava 60 grãos para preparar cada xícara." },
  { t: "Um pé, ~50 xícaras", d: "Com a produtividade brasileira de 2026 (34,6 sacas/ha), cada cafeeiro rende algo como 0,4–0,7 kg de café beneficiado por ano." },
  { t: "Um contêiner, 320 sacas", d: "Um contêiner de 20 pés transporta cerca de 19,2 toneladas de café verde." },
  { t: "US$ 30 mil por quilo", d: "Em 2025, um Geisha lavado do Panamá foi leiloado por US$ 30.204/kg — o recorde mundial." },
  { t: "121 destinos", d: "Em 2025, o café brasileiro foi exportado para 121 países (Cecafé)." },
];

function Facts() {
  return (
    <Section kicker="Você sabia?" title="Curiosidades de bolso">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {facts.map((f, i) => (
          <Reveal key={f.t} delay={(i % 4) * 0.06}>
            <div className="card h-full p-6">
              <p className="font-display text-xl leading-snug">{f.t}</p>
              <p className="mt-3 text-sm leading-relaxed text-ink-2">{f.d}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

function Numbers() {
  return (
    <Section kicker="O café em números" title="Uma cadeia que alimenta o mundo — e milhões de famílias">
      <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
        <Reveal>
          <Stat value={189.7} digits={1} suffix=" mi" label="sacas de 60 kg produzidas" note="Previsão recorde da USDA para 2026/27" big />
        </Reveal>
        <Reveal delay={0.08}>
          <Stat value={2.5} digits={1} suffix=" bi" label="xícaras por dia, aproximadamente" note="Estimativa: consumo OIC 2025/26 e 10 g de café torrado por xícara" big />
        </Reveal>
        <Reveal delay={0.16}>
          <Stat value={12.5} digits={1} suffix=" mi" label="fazendas de café no mundo" note="95% com menos de 5 hectares (Enveritas)" big />
        </Reveal>
        <Reveal delay={0.24}>
          <Stat value={133} suffix="" label="espécies de Coffea conhecidas" note="Após a revisão botânica de 2025 (Nature Plants)" big />
        </Reveal>
      </div>
    </Section>
  );
}

function Quote() {
  return (
    <section className="py-20 sm:py-28">
      <div className="wrap-narrow text-center">
        <Reveal>
          <p className="display text-balance text-[clamp(2rem,5vw,3.6rem)]">
            “Uma xícara de café vale <span className="italic text-accent">quarenta anos</span> de amizade.”
          </p>
          <p className="kicker mt-6">Provérbio turco</p>
        </Reveal>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Hero />
      <Numbers />
      <Journey />
      <MapTeaser />
      <PriceTeaser />
      <Chapters />
      <Facts />
      <Quote />
    </>
  );
}
