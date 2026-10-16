import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { scaleThreshold } from "d3-scale";
import { X } from "lucide-react";
import { PageHero, Reveal, Section, NextChapter, SourceNote, Seg, ChartCard, Legend } from "../components/ui";
import WorldMap from "../components/map/WorldMap";
import BarList from "../components/charts/BarList";
import {
  arabicaByCountry,
  beanExports,
  consumption,
  euMembers,
  marketYears,
  population2025,
  productionTotal,
  robustaByCountry,
  worldProduction,
  latestYearIndex,
  icoBalance,
} from "../data/production";
import { countryProfiles, monthsShort, profileByIso, ptNames } from "../data/countries";
import { fmt, fmtInt, fmtMiBags } from "../lib/format";
import { scrollToEl } from "../lib/smooth";

type Metric = "producao" | "exportacao" | "consumo" | "percapita";
type SpeciesFilter = "total" | "arabica" | "robusta";

const seqVars = ["var(--seq-0)", "var(--seq-1)", "var(--seq-2)", "var(--seq-3)", "var(--seq-4)", "var(--seq-5)", "var(--seq-6)"];

const metricInfo: Record<Metric, { label: string; thresholds: number[]; fmt: (v: number) => string; unit: string; legendFmt: (v: number) => string }> = {
  producao: { label: "Produção", thresholds: [500, 1500, 3000, 6000, 12000, 30000], fmt: (v) => `${fmtMiBags(v, v < 1000 ? 2 : 1)} sacas`, unit: "milhões de sacas", legendFmt: (v) => fmt(v / 1000, v < 1000 ? 1 : 0) },
  exportacao: { label: "Exportação", thresholds: [500, 1500, 3000, 6000, 12000, 30000], fmt: (v) => `${fmtMiBags(v, v < 1000 ? 2 : 1)} sacas`, unit: "milhões de sacas (grão verde)", legendFmt: (v) => fmt(v / 1000, v < 1000 ? 1 : 0) },
  consumo: { label: "Consumo", thresholds: [1000, 2000, 3500, 5000, 10000, 25000], fmt: (v) => `${fmtMiBags(v, 1)} sacas`, unit: "milhões de sacas", legendFmt: (v) => fmt(v / 1000, v < 10000 ? 1 : 0) },
  percapita: { label: "Per capita", thresholds: [0.5, 1, 2, 3, 4.5, 6], fmt: (v) => `${fmt(v, 1)} kg/pessoa`, unit: "kg de café verde por pessoa/ano", legendFmt: (v) => fmt(v, 1) },
};

const name = (iso: string) => profileByIso.get(iso)?.name ?? ptNames[iso] ?? productionTotal.find((r) => r.iso === iso)?.name ?? consumption.find((r) => r.iso === iso)?.name;

/** Divide a produção entre espécies; quando a USDA não discrimina, a parcela fica "sem divisão". */
function split(iso: string, yi: number, total: number) {
  let ar = arabicaByCountry[iso]?.[yi];
  let ro = robustaByCountry[iso]?.[yi];
  if (ar == null && ro == null) return { arabica: 0, robusta: 0, nd: total };
  if (ar == null) ar = Math.max(0, total - (ro ?? 0));
  if (ro == null) ro = Math.max(0, total - ar);
  return { arabica: ar, robusta: ro, nd: 0 };
}

function useMetricValues(metric: Metric, yi: number, sp: SpeciesFilter) {
  return useMemo(() => {
    const m = new Map<string, number>();
    if (metric === "producao") {
      productionTotal.forEach((r) => {
        const s = split(r.iso, yi, r.values[yi]);
        const v = sp === "total" ? r.values[yi] : sp === "arabica" ? s.arabica : s.robusta;
        if (v > 0) m.set(r.iso, v);
      });
    } else if (metric === "exportacao") beanExports.forEach((r) => m.set(r.iso, r.values[yi]));
    else {
      consumption.forEach((r) => {
        const v = metric === "consumo" ? r.values[yi] : (r.values[yi] * 60) / (population2025[r.iso] * 1000);
        if (r.iso === "EU") euMembers.forEach((iso) => m.set(iso, v));
        else m.set(r.iso, v);
      });
    }
    return m;
  }, [metric, yi, sp]);
}

function MiniCalendar({ main, secondary }: { main: number[]; secondary?: number[] }) {
  return (
    <div className="grid grid-cols-12 gap-[3px]">
      {monthsShort.map((mo, i) => {
        const on = main.includes(i + 1);
        const sec = secondary?.includes(i + 1);
        return (
          <div key={mo} className="text-center">
            <div className="h-5 rounded-[3px]" style={{ background: on ? "var(--seq-5)" : sec ? "var(--seq-2)" : "var(--surface-3)" }} title={mo} />
            <span className="mt-1 block text-[0.6rem] text-ink-3">{mo[0]}</span>
          </div>
        );
      })}
    </div>
  );
}

function Sparkline({ values }: { values: number[] }) {
  const w = 220;
  const h = 46;
  const max = Math.max(...values);
  const min = Math.min(...values) * 0.9;
  const pts = values.map((v, i) => [(i / (values.length - 1)) * w, h - ((v - min) / (max - min || 1)) * (h - 8) - 4]);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-12 w-full" aria-hidden>
      <polyline points={pts.map((p) => p.join(",")).join(" ")} fill="none" stroke="var(--s1)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="4" fill="var(--s1)" stroke="var(--chart-surface)" strokeWidth="2" />
    </svg>
  );
}

function CountryPanel({ iso, yi, onClose }: { iso: string; yi: number; onClose: () => void }) {
  const p = profileByIso.get(iso);
  const prod = productionTotal.find((r) => r.iso === iso);
  const exp = beanExports.find((r) => r.iso === iso);
  const cons = consumption.find((r) => r.iso === iso) ?? (euMembers.includes(iso) ? consumption.find((r) => r.iso === "EU") : undefined);
  const isEU = euMembers.includes(iso);
  const pc = cons ? (cons.values[yi] * 60) / (population2025[cons.iso] * 1000) : null;
  const ar = arabicaByCountry[iso]?.[yi];
  const ro = robustaByCountry[iso]?.[yi];
  const share = prod ? (prod.values[yi] / worldProduction[yi]) * 100 : null;

  return (
    <motion.div
      key={iso}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex h-full flex-col"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="kicker">{p?.region ?? (isEU ? "Europa · União Europeia" : "País")}</p>
          <h3 className="display mt-2 text-4xl">{name(iso) ?? "—"}</h3>
        </div>
        <button type="button" onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line hover:bg-surface-2" aria-label="Fechar detalhes">
          <X size={16} />
        </button>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-3">
        {prod && (
          <div className="rounded-xl bg-surface-2 p-3">
            <dt className="text-xs text-ink-3">Produção {marketYears[yi]}</dt>
            <dd className="mt-1 font-display text-2xl">{fmtMiBags(prod.values[yi], 2)}</dd>
            <dd className="text-xs text-ink-3">{fmt(share ?? 0, 1)}% do mundo</dd>
          </div>
        )}
        {exp && (
          <div className="rounded-xl bg-surface-2 p-3">
            <dt className="text-xs text-ink-3">Exportação (grão)</dt>
            <dd className="mt-1 font-display text-2xl">{fmtMiBags(exp.values[yi], 2)}</dd>
          </div>
        )}
        {cons && (
          <div className="rounded-xl bg-surface-2 p-3">
            <dt className="text-xs text-ink-3">Consumo{isEU ? " (UE inteira)" : ""}</dt>
            <dd className="mt-1 font-display text-2xl">{fmtMiBags(cons.values[yi], 2)}</dd>
          </div>
        )}
        {pc != null && (
          <div className="rounded-xl bg-surface-2 p-3">
            <dt className="text-xs text-ink-3">Per capita{isEU ? " (média UE)" : ""}</dt>
            <dd className="mt-1 font-display text-2xl">{fmt(pc, 1)} kg</dd>
          </div>
        )}
      </dl>

      {(ar || ro) && prod && (
        <div className="mt-4">
          <div className="flex h-3 overflow-hidden rounded-full">
            {ar ? <div style={{ width: `${(ar / prod.values[yi]) * 100}%`, background: "var(--s1)" }} /> : null}
            {ar && ro ? <div className="w-[2px] bg-[var(--chart-surface)]" /> : null}
            {ro ? <div className="flex-1" style={{ background: "var(--s2)" }} /> : null}
          </div>
          <div className="mt-1.5 flex justify-between text-xs text-ink-2">
            <span>Arábica {ar ? fmtMiBags(ar, 2) : "—"}</span>
            <span>Robusta {ro ? fmtMiBags(ro, 2) : "—"}</span>
          </div>
        </div>
      )}

      {prod && (
        <div className="mt-4">
          <p className="text-xs text-ink-3">Produção 2021/22 → 2026/27</p>
          <Sparkline values={prod.values} />
        </div>
      )}

      {p ? (
        <div className="mt-4 space-y-4 border-t border-line pt-4 text-sm">
          <p className="font-display text-lg leading-snug text-ink">{p.flavor}</p>
          <div>
            <p className="mb-2 text-xs text-ink-3">Calendário de colheita</p>
            <MiniCalendar main={p.harvest.main} secondary={p.harvest.secondary} />
          </div>
          <p className="text-ink-2">
            <strong className="text-ink">Espécies:</strong> {p.species}
          </p>
          <p className="text-ink-2">
            <strong className="text-ink">Altitude:</strong> {p.altitude}
          </p>
          <p className="text-ink-2">
            <strong className="text-ink">Processos:</strong> {p.processes.join(", ")}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {p.regions.map((r) => (
              <span key={r} className="chip py-0.5! text-xs!">
                {r}
              </span>
            ))}
          </div>
          <p className="rounded-xl bg-accent-soft p-3 text-ink-2">💡 {p.fact}</p>
        </div>
      ) : (
        !prod &&
        !cons && <p className="mt-6 text-sm text-ink-3">Sem produção ou consumo destacados nas séries da USDA. Explore os países coloridos no mapa.</p>
      )}
    </motion.div>
  );
}

export default function Mundo() {
  const [params, setParams] = useSearchParams();
  const [metric, setMetric] = useState<Metric>("producao");
  const [yi, setYi] = useState(latestYearIndex);
  const [sp, setSp] = useState<SpeciesFilter>("total");
  const selected = params.get("pais");
  const setSelected = (iso: string | null) => {
    const next = new URLSearchParams(params);
    if (iso) next.set("pais", iso);
    else next.delete("pais");
    setParams(next, { replace: true });
  };

  useEffect(() => {
    if (selected) {
      const t = window.setTimeout(() => scrollToEl(document.getElementById("mapa"), -80), 350);
      return () => window.clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const info = metricInfo[metric];
  const values = useMetricValues(metric, yi, sp);
  const color = useMemo(() => scaleThreshold<number, string>().domain(info.thresholds).range(seqVars), [info]);

  const ranking = useMemo(() => {
    if (metric === "producao") {
      return productionTotal
        .map((r) => {
          const s = split(r.iso, yi, r.values[yi]);
          const values = sp === "total" ? s : sp === "arabica" ? { arabica: s.arabica } : { robusta: s.robusta };
          return { id: r.iso, label: r.name, values: values as Record<string, number> };
        })
        .filter((r) => Object.values(r.values).reduce((a, b) => a + b, 0) > 0)
        .sort((a, b) => Object.values(b.values).reduce((x, y) => x + y, 0) - Object.values(a.values).reduce((x, y) => x + y, 0))
        .slice(0, 15);
    }
    if (metric === "exportacao") return beanExports.map((r) => ({ id: r.iso, label: r.name, values: { v: r.values[yi] } }));
    if (metric === "consumo") return [...consumption].sort((a, b) => b.values[yi] - a.values[yi]).slice(0, 15).map((r) => ({ id: r.iso, label: r.name, values: { v: r.values[yi] } }));
    return consumption
      .map((r) => ({ id: r.iso, label: r.name, values: { v: (r.values[yi] * 60) / (population2025[r.iso] * 1000) } }))
      .sort((a, b) => b.values.v - a.values.v)
      .slice(0, 15);
  }, [metric, yi, sp]);

  const legendStops = [0, ...info.thresholds];

  return (
    <>
      <PageHero
        path="/mundo"
        title={
          <>
            O mundo <span className="italic text-ink-2">em</span> grãos
          </>
        }
        lead="Mais de 70 países cultivam café, quase todos no Cinturão do Café, entre os trópicos. Explore produção, exportação e consumo por país, ano a ano, com os dados mais recentes da USDA (julho de 2026)."
        aside={
          <div className="card p-8 text-center">
            <p className="kicker">Produção mundial 2026/27</p>
            <p className="display mt-4 text-7xl">
              {fmt(worldProduction[latestYearIndex] / 1000, 1)}
              <span className="text-3xl text-ink-3"> mi</span>
            </p>
            <p className="mt-2 text-ink-2">sacas de 60 kg — recorde histórico</p>
            <div className="mt-6 flex h-3 overflow-hidden rounded-full">
              <div className="bg-s1" style={{ width: "55.8%" }} />
              <div className="w-[2px] bg-[var(--surface)]" />
              <div className="flex-1 bg-s2" />
            </div>
            <div className="mt-2 flex justify-between text-sm text-ink-2">
              <span>Arábica 105,9 mi</span>
              <span>Robusta 83,8 mi</span>
            </div>
          </div>
        }
      />

      <section id="mapa" className="pb-10">
        <div className="wrap">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <Seg
              label="Indicador"
              value={metric}
              onChange={setMetric}
              options={[
                { value: "producao", label: "Produção" },
                { value: "exportacao", label: "Exportação" },
                { value: "consumo", label: "Consumo" },
                { value: "percapita", label: "Per capita" },
              ]}
            />
            {metric === "producao" && (
              <Seg
                label="Espécie"
                value={sp}
                onChange={setSp}
                options={[
                  { value: "total", label: "Total" },
                  { value: "arabica", label: "Arábica" },
                  { value: "robusta", label: "Robusta" },
                ]}
              />
            )}
            {metric !== "percapita" ? (
              <label className="ml-auto flex items-center gap-3 text-sm text-ink-2">
                Ano-safra
                <input type="range" min={0} max={5} value={yi} onChange={(e) => setYi(Number(e.target.value))} className="w-36" aria-label="Ano-safra" />
                <span className="num w-16 font-semibold text-ink">{marketYears[yi]}</span>
              </label>
            ) : (
              <span className="ml-auto text-sm text-ink-3">Base {marketYears[yi]} · população 2025</span>
            )}
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_360px] lg:items-start">
            <div className="card relative overflow-hidden p-2 sm:p-3" style={{ background: "var(--chart-surface)" }}>
              <WorldMap
                values={values}
                selected={selected}
                onSelect={setSelected}
                aspect={0.56}
                dimOthers
                colorFor={(v) => (v != null && v > 0 ? color(v) : "var(--map-empty)")}
                tooltip={(iso, nm) => {
                  const v = values.get(iso);
                  return (
                    <>
                      <p className="font-semibold">{name(iso) ?? nm}</p>
                      <p className="text-ink-2">{v != null ? info.fmt(v) : "Sem dado destacado"}</p>
                      {euMembers.includes(iso) && (metric === "consumo" || metric === "percapita") && <p className="text-xs text-ink-3">Valor da União Europeia como bloco</p>}
                      <p className="mt-1 text-xs text-ink-3">Clique para detalhes</p>
                    </>
                  );
                }}
                ariaLabel={`Mapa-múndi de ${info.label.toLowerCase()} de café por país`}
              />
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-2 pb-2 pt-1">
                <span className="text-xs text-ink-3">{info.unit}</span>
                <div className="flex items-center">
                  {legendStops.map((s, i) => (
                    <div key={s} className="flex flex-col items-start">
                      <span className="h-2.5 w-9 first:rounded-l-full last:rounded-r-full" style={{ background: seqVars[i] }} />
                      <span className="num mt-1 text-[0.65rem] text-ink-3">{i === 0 ? "0" : `${info.legendFmt(s)}+`}</span>
                    </div>
                  ))}
                </div>
                <span className="flex items-center gap-1.5 text-xs text-ink-3">
                  <span className="h-2.5 w-5 rounded-sm" style={{ background: "var(--accent)", opacity: 0.25 }} /> Cinturão do Café
                </span>
                <span className="ml-auto text-xs text-ink-3">Arraste para mover · Ctrl + rolagem ou botões para zoom</span>
              </div>
            </div>

            <div className="card p-5 lg:max-h-[min(78vh,600px)] lg:overflow-y-auto" data-lenis-prevent>
              <AnimatePresence mode="wait">
                {selected ? (
                  <CountryPanel key={selected} iso={selected} yi={yi} onClose={() => setSelected(null)} />
                ) : (
                  <motion.div key="rank" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <p className="kicker">Ranking · {info.label}</p>
                    <p className="mt-1 text-sm text-ink-3">Clique em um país no mapa ou na lista.</p>
                    <ol className="mt-4 space-y-1">
                      {ranking.slice(0, 12).map((r, i) => {
                        const v = Object.values(r.values).reduce((s, x) => s + x, 0);
                        return (
                          <li key={r.id}>
                            <button
                              type="button"
                              onClick={() => r.id !== "EU" && setSelected(r.id)}
                              className="flex w-full items-baseline gap-3 rounded-lg px-2 py-2 text-left hover:bg-surface-2"
                            >
                              <span className="w-5 font-mono text-xs text-ink-3">{i + 1}</span>
                              <span className="flex-1 text-ink">{r.label}</span>
                              <span className="num text-sm text-ink-2">{metric === "percapita" ? `${fmt(v, 1)} kg` : fmtMiBags(v, 1)}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ol>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <SourceNote>
            USDA FAS, “Coffee: World Markets and Trade” (jul/2026). Anos-safra variam por país (Brasil: jul–jun; Colômbia: out–set; Indonésia: abr–mar). Exportação = café em
            grão verde dos 10 maiores exportadores listados. Per capita = consumo doméstico × 60 kg ÷ população estimada de 2025 (ONU/Eurostat/IBGE); na UE, média do bloco.
          </SourceNote>
        </div>
      </section>

      <Section kicker="Ranking" title={`Quem lidera em ${info.label.toLowerCase()}`} tight>
        <Reveal>
          <ChartCard
            title={`${info.label} — ${metric === "percapita" ? "kg por pessoa/ano" : marketYears[yi]}`}
            subtitle={metric === "producao" ? "Milhões de sacas de 60 kg, por espécie" : info.unit}
            controls={
              metric === "producao" ? (
                <Legend
                  items={[
                    { label: "Arábica", color: "var(--s1)", shape: "square" },
                    { label: "Robusta", color: "var(--s2)", shape: "square" },
                    { label: "Sem divisão", color: "var(--axis)", shape: "square" },
                  ]}
                />
              ) : undefined
            }
          >
            <BarList
              rows={ranking}
              keys={
                metric === "producao"
                  ? [
                      { key: "arabica", label: "Arábica", color: "var(--s1)" },
                      { key: "robusta", label: "Robusta", color: "var(--s2)" },
                      { key: "nd", label: "Sem divisão por espécie", color: "var(--axis)" },
                    ]
                  : [{ key: "v", label: info.label, color: "var(--s1)" }]
              }
              format={(v) => (metric === "percapita" ? `${fmt(v, 1)} kg` : fmt(v / 1000, 2))}
              onSelect={(id) => {
                if (id === "EU") return;
                setSelected(id);
                scrollToEl(document.getElementById("mapa"), -80);
              }}
              selected={selected}
              ariaLabel={`Ranking de ${info.label.toLowerCase()}`}
            />
          </ChartCard>
        </Reveal>
      </Section>

      <Section kicker="Regiões" title="A geografia da oferta e da demanda" intro="Pela OIC, a América do Sul produz quase metade do café do mundo, enquanto a Europa é o maior bloco consumidor.">
        <div className="grid gap-6 lg:grid-cols-2">
          {(
            [
              ["Produção por região — 2025/26", icoBalance.productionByRegion],
              ["Consumo por região — 2025/26", icoBalance.consumptionByRegion],
            ] as [string, Record<string, number[]>][]
          ).map(([title, data]) => {
            const rows = Object.entries(data)
              .map(([k, v]) => ({ id: k, label: k, values: { v: v[5] * 1000 } }))
              .sort((a, b) => b.values.v - a.values.v);
            return (
              <Reveal key={title}>
                <ChartCard title={title} subtitle="Milhões de sacas — OIC, set/2026">
                  <BarList rows={rows} keys={[{ key: "v", label: "Volume", color: "var(--s5)" }]} format={(v) => fmt(v / 1000, 1)} ariaLabel={title} labelWidth={170} />
                </ChartCard>
              </Reveal>
            );
          })}
        </div>
      </Section>

      <Section kicker="Perfis" title="Origens em detalhe" intro={`${countryProfiles.length} países com regiões, altitudes, processos, perfil sensorial e calendário de colheita.`}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {countryProfiles.map((c, i) => (
            <Reveal key={c.iso} delay={(i % 4) * 0.04}>
              <button
                type="button"
                onClick={() => {
                  setSelected(c.iso);
                  scrollToEl(document.getElementById("mapa"), -80);
                }}
                className="card card-hover flex h-full w-full flex-col p-5 text-left"
              >
                <span className="kicker">{c.region}</span>
                <span className="mt-2 font-display text-2xl">{c.name}</span>
                <span className="mt-2 line-clamp-3 flex-1 text-sm text-ink-2">{c.flavor}</span>
                <span className="mt-3 text-xs text-ink-3">
                  {(() => {
                    const r = productionTotal.find((x) => x.iso === c.iso);
                    return r ? `${fmtMiBags(r.values[latestYearIndex], 2)} sacas em 2026/27` : `Altitude ${c.altitude}`;
                  })()}
                </span>
              </button>
            </Reveal>
          ))}
        </div>
        <p className="mt-6 text-sm text-ink-3">
          Total mundial 2026/27: {fmtInt(worldProduction[latestYearIndex])} mil sacas · os 25 países listados pela USDA somam {fmt((productionTotal.reduce((s, r) => s + r.values[latestYearIndex], 0) / worldProduction[latestYearIndex]) * 100, 1)}%
          do total.
        </p>
      </Section>

      <NextChapter path="/mundo" />
    </>
  );
}
