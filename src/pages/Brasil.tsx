import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import { geoMercator, geoPath } from "d3-geo";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import { Award, Factory, MapPin, Ship, TrendingUp, Wheat } from "lucide-react";
import { PageHero, Reveal, Section, NextChapter, SourceNote, Seg, ChartCard, Legend, Stat, Callout } from "../components/ui";
import BarList from "../components/charts/BarList";
import { brRegions, conab2026, consumptionBr, exports2025, mgRegions, stateProduction, type BrRegion } from "../data/brazil";
import { useElementWidth } from "../lib/hooks";
import southAmericaJson from "../data/south-america.json";
import { fmt, fmtInt, signed } from "../lib/format";

type Countries = FeatureCollection<Geometry, { name: string }>;

const stateCentroids: Record<string, [number, number]> = {
  MG: [-44.6, -18.4],
  ES: [-40.6, -19.5],
  SP: [-48.6, -22.3],
  BA: [-41.7, -12.4],
  RO: [-62.8, -10.9],
  PR: [-51.6, -24.6],
  RJ: [-42.6, -22.2],
  GO: [-49.6, -16.0],
  MT: [-55.9, -12.9],
  AM: [-64.7, -4.2],
};

/** Recorte leve da América do Sul (gerado por scripts/build-south-america.mjs a partir do world-atlas 50m). */
const southAmerica = southAmericaJson as unknown as Countries;
const useSouthAmerica = () => southAmerica;

function BrazilMap({ layer, selected, onSelect }: { layer: "regioes" | "estados"; selected: string | null; onSelect: (id: string | null) => void }) {
  const data = useSouthAmerica();
  const [ref, width] = useElementWidth<HTMLDivElement>(640);
  const height = Math.round(width * 0.92);
  const [hover, setHover] = useState<string | null>(null);

  const brazil = useMemo(() => data?.features.find((f) => String(f.id) === "076") as Feature<Geometry> | undefined, [data]);
  const projection = useMemo(() => {
    const p = geoMercator();
    if (brazil) p.fitExtent([[16, 16], [width - 16, height - 16]], brazil);
    return p;
  }, [brazil, width, height]);
  const path = geoPath(projection);
  const maxState = Math.max(...stateProduction.map((s) => s.y2026));

  return (
    <div ref={ref} className="relative w-full">
      {!data && <div className="grid aspect-square place-items-center text-sm text-ink-3">Carregando mapa…</div>}
      {data && (
        <svg width={width} height={height} role="img" aria-label="Mapa do Brasil com regiões produtoras de café" className="block">
          <defs>
            <clipPath id="br-clip">
              <rect width={width} height={height} rx="18" />
            </clipPath>
          </defs>
          <g clipPath="url(#br-clip)">
            {data.features.map((f) => {
              const isBr = String(f.id) === "076";
              return <path key={String(f.id) + f.properties.name} d={path(f) ?? ""} fill={isBr ? "var(--seq-1)" : "var(--surface-2)"} stroke={isBr ? "var(--seq-3)" : "var(--map-stroke)"} strokeWidth={isBr ? 1.2 : 0.6} opacity={isBr ? 0.9 : 0.55} />;
            })}
            {Object.entries(stateCentroids).map(([uf, c]) => {
              const p = projection(c);
              if (!p) return null;
              return (
                <text key={uf} x={p[0]} y={p[1]} textAnchor="middle" fontSize="10" fill="var(--ink-3)" opacity={layer === "estados" ? 0 : 0.7} fontFamily="var(--font-mono)">
                  {uf}
                </text>
              );
            })}
            {layer === "estados" &&
              stateProduction.map((s) => {
                const p = projection(stateCentroids[s.uf]);
                if (!p) return null;
                const r = 6 + Math.sqrt(s.y2026 / maxState) * (width * 0.11);
                const conilon = /conilon|robusta/i.test(s.type) && !/arábica \(quase/i.test(s.type);
                return (
                  <g key={s.uf} onMouseEnter={() => setHover(s.uf)} onMouseLeave={() => setHover(null)}>
                    <motion.circle
                      cx={p[0]}
                      cy={p[1]}
                      initial={{ r: 0 }}
                      animate={{ r }}
                      transition={{ type: "spring", stiffness: 90, damping: 14 }}
                      fill={conilon ? "var(--s2)" : "var(--s1)"}
                      fillOpacity={hover === s.uf ? 0.85 : 0.6}
                      stroke="var(--chart-surface)"
                      strokeWidth="2"
                    />
                    <text x={p[0]} y={p[1]} textAnchor="middle" dy="0.35em" fontSize={r > 24 ? 12 : 9.5} fontWeight="600" fill="#fff" pointerEvents="none">
                      {s.uf}
                    </text>
                  </g>
                );
              })}
            {layer === "regioes" &&
              brRegions.map((r) => {
                const p = projection(r.coords);
                if (!p) return null;
                const isSel = selected === r.id;
                return (
                  <g
                    key={r.id}
                    transform={`translate(${p[0]},${p[1]})`}
                    onClick={() => onSelect(isSel ? null : r.id)}
                    onMouseEnter={() => setHover(r.id)}
                    onMouseLeave={() => setHover(null)}
                    style={{ cursor: "pointer" }}
                    role="button"
                    tabIndex={0}
                    aria-label={r.name}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") onSelect(isSel ? null : r.id);
                    }}
                  >
                    {isSel && (
                      <circle r="16" fill={r.species === "conilon" ? "var(--s2)" : "var(--s1)"} opacity="0.25">
                        <animate attributeName="r" from="8" to="22" dur="1.6s" repeatCount="indefinite" />
                        <animate attributeName="opacity" from="0.5" to="0" dur="1.6s" repeatCount="indefinite" />
                      </circle>
                    )}
                    <circle r={isSel || hover === r.id ? 8 : 6} fill={r.species === "conilon" ? "var(--s2)" : "var(--s1)"} stroke="var(--chart-surface)" strokeWidth="2" style={{ transition: "r .2s" }} />
                    {(hover === r.id || isSel) && (
                      <text x="12" y="4" fontSize="12" fontWeight="600" fill="var(--ink)" stroke="var(--chart-surface)" strokeWidth="3" style={{ paintOrder: "stroke" }}>
                        {r.name}
                      </text>
                    )}
                  </g>
                );
              })}
          </g>
        </svg>
      )}
      {layer === "estados" && hover && stateProduction.find((s) => s.uf === hover) && (
        <div className="tooltip left-4 top-4">
          {(() => {
            const s = stateProduction.find((x) => x.uf === hover)!;
            return (
              <>
                <p className="font-semibold">{s.name}</p>
                <p className="text-ink-2">{fmt(s.y2026 / 1000, 2)} mi sacas em 2026</p>
                <p className="text-xs text-ink-3">{s.type}</p>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}

function RegionCard({ r }: { r: BrRegion }) {
  return (
    <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
      <p className="kicker">
        {r.uf} · {r.species === "conilon" ? "Conilon / robusta" : "Arábica"}
      </p>
      <h3 className="display mt-2 text-4xl">{r.name}</h3>
      {r.gi && (
        <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-gold-soft px-3 py-1 text-xs font-medium text-gold">
          <Award size={13} /> Indicação Geográfica: {r.gi}
        </p>
      )}
      <p className="mt-4 text-ink-2">{r.text}</p>
      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-surface-2 p-3">
          <dt className="text-xs text-ink-3">Altitude</dt>
          <dd className="mt-1 font-medium text-ink">{r.altitude}</dd>
        </div>
        <div className="rounded-xl bg-surface-2 p-3">
          <dt className="text-xs text-ink-3">Perfil típico</dt>
          <dd className="mt-1 text-ink">{r.profile}</dd>
        </div>
      </dl>
    </motion.div>
  );
}

function StatesChart() {
  const rows = stateProduction.map((s) => ({ ...s, change: ((s.y2026 - s.y2025) / s.y2025) * 100 }));
  const max = Math.max(...rows.map((r) => Math.max(r.y2025, r.y2026)));
  return (
    <ChartCard
      title="Produção por estado — safra 2025 × 2026"
      subtitle="Milhões de sacas de café beneficiado · Conab, 3º levantamento (set/2026)"
      controls={
        <Legend
          items={[
            { label: "2025", color: "var(--s2)", shape: "square" },
            { label: "2026", color: "var(--s1)", shape: "square" },
          ]}
        />
      }
    >
      <div className="space-y-4">
        {rows.map((r, i) => (
          <div key={r.uf} className="grid grid-cols-[110px_1fr_64px] items-center gap-3 sm:grid-cols-[150px_1fr_72px]">
            <div>
              <p className="text-sm font-medium text-ink">{r.name}</p>
              <p className="text-[0.7rem] text-ink-3">{r.type}</p>
            </div>
            <div className="space-y-[2px]">
              {(["y2025", "y2026"] as const).map((k) => (
                <div key={k} className="flex items-center gap-2">
                  <motion.div
                    className="h-[11px] rounded-r-[4px]"
                    style={{ background: k === "y2025" ? "var(--s2)" : "var(--s1)" }}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${Math.max(0.6, (r[k] / max) * 88)}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                  />
                  <span className="num text-[0.7rem] text-ink-3">{fmt(r[k] / 1000, 2)}</span>
                </div>
              ))}
            </div>
            <span className={`num text-right text-sm font-semibold ${r.change >= 0 ? "text-leaf" : "text-accent"}`}>
              {r.change >= 0 ? "▲" : "▼"} {fmt(Math.abs(r.change), 1)}%
            </span>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}

const gis = [
  { name: "Cerrado Mineiro", type: "DO", year: "2013 (IP 2005)", uf: "MG" },
  { name: "Mantiqueira de Minas", type: "DO", year: "2020 (IP 2011)", uf: "MG" },
  { name: "Caparaó", type: "DO", year: "2021", uf: "MG/ES" },
  { name: "Matas de Rondônia", type: "DO", year: "2021", uf: "RO" },
  { name: "Norte Pioneiro do Paraná", type: "IP", year: "2012", uf: "PR" },
  { name: "Alta Mogiana", type: "IP", year: "2013", uf: "SP" },
  { name: "Região de Pinhal", type: "IP", year: "2016", uf: "SP" },
  { name: "Oeste da Bahia", type: "IP", year: "2019", uf: "BA" },
  { name: "Matas de Minas", type: "IP", year: "2020", uf: "MG" },
];

export default function Brasil() {
  const [layer, setLayer] = useState<"regioes" | "estados">("regioes");
  const [sel, setSel] = useState<string | null>("cerrado");
  const region = brRegions.find((r) => r.id === sel) ?? null;

  return (
    <>
      <PageHero
        path="/brasil"
        title={
          <>
            O país <span className="italic text-ink-2">do</span> café
          </>
        }
        lead="Maior produtor e exportador do planeta há mais de 150 anos e segundo maior consumidor, o Brasil colhe em 2026 a maior safra de sua história — de chapadões mecanizados no Cerrado a montanhas de colheita manual e robustas amazônicos."
        aside={
          <div className="card p-8">
            <p className="kicker">Safra 2026 · Conab (set/2026)</p>
            <p className="display mt-4 text-7xl">
              {fmt(conab2026.total, 1)}
              <span className="text-3xl text-ink-3"> mi</span>
            </p>
            <p className="mt-1 text-ink-2">sacas de 60 kg — recorde histórico</p>
            <p className="mt-1 text-sm text-leaf">▲ {fmt(conab2026.change, 1)}% sobre 2025</p>
            <div className="mt-6 flex h-3 overflow-hidden rounded-full">
              <div className="bg-s1" style={{ width: `${(conab2026.arabica / (conab2026.arabica + conab2026.conilon)) * 100}%` }} />
              <div className="w-[2px] bg-[var(--surface)]" />
              <div className="flex-1 bg-s2" />
            </div>
            <div className="mt-2 flex justify-between text-sm text-ink-2">
              <span>Arábica {fmt(conab2026.arabica, 1)} mi</span>
              <span>Conilon {fmt(conab2026.conilon, 1)} mi</span>
            </div>
          </div>
        }
      />

      <Section tight>
        <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          <Reveal>
            <Stat value={conab2026.areaTotalHa} digits={2} suffix=" mi ha" label="área de café (produção + formação)" note="+4,4% sobre 2025 (Conab)" />
          </Reveal>
          <Reveal delay={0.06}>
            <Stat value={conab2026.productivity} digits={1} suffix=" sc/ha" label="produtividade média nacional" note={`Arábica ${fmt(conab2026.productivityArabica, 1)} · conilon ${fmt(conab2026.productivityConilon, 1)}`} />
          </Reveal>
          <Reveal delay={0.12}>
            <Stat value={exports2025.revenueUsdBn} digits={1} prefix="US$ " suffix=" bi" label="receita de exportação em 2025 (recorde)" note={`${fmt(exports2025.bags, 1)} mi de sacas para ${exports2025.countries} países (Cecafé)`} />
          </Reveal>
          <Reveal delay={0.18}>
            <Stat value={consumptionBr.bags} digits={1} suffix=" mi" label="sacas consumidas no país" note="2º maior consumidor do mundo (ABIC, nov/24–out/25)" />
          </Reveal>
        </div>
      </Section>

      <Section kicker="Mapa" title="Onde o Brasil planta café" intro="O café é cultivado em mais de 15 estados. Alterne entre as principais regiões produtoras e o volume colhido por estado.">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <Reveal className="card overflow-hidden p-3 sm:p-4" >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3 px-1">
              <Seg
                label="Camada do mapa"
                value={layer}
                onChange={setLayer}
                options={[
                  { value: "regioes", label: "Regiões produtoras" },
                  { value: "estados", label: "Produção por estado" },
                ]}
              />
              <Legend
                items={[
                  { label: "Arábica", color: "var(--s1)" },
                  { label: "Conilon", color: "var(--s2)" },
                ]}
              />
            </div>
            <BrazilMap layer={layer} selected={sel} onSelect={setSel} />
          </Reveal>
          <Reveal delay={0.08} className="card p-6 sm:p-8">
            {layer === "regioes" ? (
              <>
                <AnimatePresence mode="wait">{region ? <RegionCard key={region.id} r={region} /> : <p className="text-ink-3">Clique em uma região no mapa.</p>}</AnimatePresence>
                <div className="mt-6 flex flex-wrap gap-1.5 border-t border-line pt-5">
                  {brRegions.map((r) => (
                    <button key={r.id} type="button" className="chip text-xs!" aria-pressed={sel === r.id} onClick={() => setSel(r.id)}>
                      <span className="h-2 w-2 rounded-full" style={{ background: r.species === "conilon" ? "var(--s2)" : "var(--s1)" }} />
                      {r.name}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div>
                <p className="kicker">Minas Gerais por região (mil sacas)</p>
                <p className="mt-2 text-ink-2">
                  Minas responde por <strong className="text-ink">{fmt((35594.6 / 67606) * 100, 1)}%</strong> da safra nacional. O Triângulo e Alto Paranaíba quase dobraram a
                  produção em 2026.
                </p>
                <div className="mt-6">
                  <BarList
                    rows={mgRegions.map((m) => ({ id: m.name, label: m.name, values: { v: m.y2026 } }))}
                    keys={[{ key: "v", label: "2026", color: "var(--s1)" }]}
                    format={(v) => fmtInt(v)}
                    labelWidth={190}
                    ariaLabel="Produção de Minas Gerais por região em 2026"
                  />
                </div>
              </div>
            )}
          </Reveal>
        </div>
      </Section>

      <Section kicker="Safra 2026" title="Uma safra recorde, puxada pelo arábica" intro="Bienalidade positiva, chuvas na hora certa durante a florada e novas áreas em produção levaram o arábica a +35%. O conilon caiu 6,6% com o frio que prejudicou a florada no Espírito Santo.">
        <Reveal>
          <StatesChart />
        </Reveal>
        <SourceNote>Conab — Acompanhamento da Safra Brasileira de Café, v.13, nº 3 (setembro de 2026). A USDA, com metodologia própria, estima 71,9 milhões de sacas para o ano-safra 2026/27.</SourceNote>
      </Section>

      <Section kicker="Exportação" title="Do porto de Santos para 121 países">
        <div className="grid gap-6 lg:grid-cols-2">
          <Reveal>
            <ChartCard title="Principais destinos em 2025" subtitle="Milhões de sacas · Cecafé">
              <BarList
                rows={exports2025.destinations.map((d) => ({ id: d.name, label: d.name, values: { v: d.bags * 1000 } }))}
                keys={[{ key: "v", label: "Sacas", color: "var(--s1)" }]}
                format={(v) => fmt(v / 1000, 2)}
                ariaLabel="Principais destinos do café brasileiro em 2025"
              />
              <p className="mt-5 text-sm text-ink-2">
                Pela primeira vez, a <strong className="text-ink">Alemanha superou os EUA</strong> como principal destino — efeito da tarifa de 50% imposta pelos americanos entre
                agosto e novembro de 2025, quando os embarques para lá caíram 55%.
              </p>
            </ChartCard>
          </Reveal>
          <Reveal delay={0.08}>
            <ChartCard title="Por onde sai o café" subtitle="Participação nos embarques de 2025 · Cecafé">
              <div className="flex h-5 overflow-hidden rounded-full">
                {exports2025.ports.map((p, i) => (
                  <div
                    key={p.name}
                    style={{ width: `${p.share}%`, background: ["var(--s1)", "var(--s2)", "var(--s3)", "var(--axis)"][i], marginRight: i < exports2025.ports.length - 1 ? 2 : 0 }}
                  />
                ))}
              </div>
              <ul className="mt-5 space-y-2.5">
                {exports2025.ports.map((p, i) => (
                  <li key={p.name} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-ink-2">
                      <span className="h-3 w-3 rounded-[3px]" style={{ background: ["var(--s1)", "var(--s2)", "var(--s3)", "var(--axis)"][i] }} />
                      {p.name}
                    </span>
                    <span className="num font-medium text-ink">{fmt(p.share, 1)}%</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 grid grid-cols-2 gap-3 border-t border-line pt-5 text-sm">
                <div>
                  <p className="text-ink-3">Volume 2025</p>
                  <p className="font-display text-2xl">{fmt(exports2025.bags, 1)} mi sacas</p>
                  <p className="text-xs text-accent">{signed(exports2025.changeVolume, 1)}% vs 2024</p>
                </div>
                <div>
                  <p className="text-ink-3">Receita 2025</p>
                  <p className="font-display text-2xl">US$ {fmt(exports2025.revenueUsdBn, 1)} bi</p>
                  <p className="text-xs text-leaf">{signed(exports2025.changeRevenue, 1)}% — recorde desde 1990</p>
                </div>
              </div>
            </ChartCard>
          </Reveal>
        </div>
      </Section>

      <Section kicker="Consumo" title="O brasileiro e seu cafezinho">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: TrendingUp, v: `${fmt(consumptionBr.bags, 1)} mi`, l: "sacas consumidas (nov/24–out/25)", n: `${signed(consumptionBr.change, 2)}% — primeira queda desde 2022` },
            { icon: Wheat, v: `${fmt(consumptionBr.perCapitaRoasted, 2)} kg`, l: "de café torrado por pessoa/ano", n: `${fmt(consumptionBr.perCapitaGreen, 2)} kg em café verde` },
            { icon: MapPin, v: `~${fmtInt(consumptionBr.cupsPerYear)}`, l: "xícaras por pessoa ao ano", n: "Estimativa da ABIC" },
            { icon: Factory, v: `R$ ${fmt(consumptionBr.industryRevenueBrlBn, 1)} bi`, l: "faturamento da indústria de torrefação", n: `Preço no varejo +${consumptionBr.retailPrice5y}% em 5 anos` },
          ].map((c, i) => {
            const Icon = c.icon;
            return (
              <Reveal key={c.l} delay={i * 0.06}>
                <div className="card h-full p-6">
                  <Icon size={20} className="text-accent" />
                  <p className="display mt-4 text-4xl">{c.v}</p>
                  <p className="mt-2 text-sm text-ink">{c.l}</p>
                  <p className="mt-1 text-xs text-ink-3">{c.n}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
        <SourceNote>ABIC — Indicadores da Indústria de Café 2025 (jan/2026). A ABIC associa a queda aos preços recordes de 2024–2025.</SourceNote>
      </Section>

      <Section kicker="Qualidade" title="Indicações geográficas e cafés especiais" intro="O café é o produto com mais Indicações Geográficas no Brasil — 18 registros no INPI até janeiro de 2025 (11 Indicações de Procedência e 7 Denominações de Origem).">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {gis.map((g, i) => (
            <Reveal key={g.name} delay={(i % 3) * 0.05}>
              <div className="card flex h-full items-center gap-4 p-5">
                <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl font-mono text-sm font-semibold ${g.type === "DO" ? "bg-gold-soft text-gold" : "bg-leaf-soft text-leaf"}`}>{g.type}</span>
                <div>
                  <p className="font-display text-xl leading-tight">{g.name}</p>
                  <p className="text-xs text-ink-3">
                    {g.uf} · {g.year}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Callout title="Cup of Excellence nasceu aqui" tone="gold">
            Em 1999, o Brasil sediou o primeiro Cup of Excellence do mundo — concurso com júri internacional e leilão online que hoje acontece em mais de dez países.
          </Callout>
          <Callout title="Robustas amazônicos" tone="leaf">
            Em Rondônia, clones da Embrapa e famílias de agricultores — inclusive indígenas — mostram que canéfora também pode ser café especial.
          </Callout>
          <Callout title="IP × DO" tone="accent">
            A Indicação de Procedência reconhece a fama de uma região; a Denominação de Origem exige que as qualidades do produto se devam ao meio geográfico.
          </Callout>
        </div>
      </Section>

      <Section tight>
        <Reveal className="card flex flex-wrap items-center justify-between gap-6 p-8">
          <div className="flex items-center gap-4">
            <Ship className="text-accent" size={28} />
            <p className="max-w-xl text-ink-2">
              Quer saber como o café chegou até aqui? A história começa em 1727, com Francisco de Melo Palheta — e o Brasil celebra 300 anos de café em 2027.
            </p>
          </div>
          <Link to="/historia" className="btn btn-ghost">
            Ver a linha do tempo
          </Link>
        </Reveal>
      </Section>

      <NextChapter path="/brasil" />
    </>
  );
}
