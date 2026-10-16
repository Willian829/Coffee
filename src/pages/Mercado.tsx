import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import { Landmark, Scale, Ship, Leaf, Bird, Handshake, BadgeCheck, Gavel, ArrowRight } from "lucide-react";
import { PageHero, Reveal, Section, NextChapter, SourceNote, Seg, ChartCard, Legend, Callout } from "../components/ui";
import LineChart, { type Annotation, type LineSeries } from "../components/charts/LineChart";
import BarList from "../components/charts/BarList";
import { annualPrices, monthlyPrices } from "../data/prices";
import { beanExports, beanImports, icoBalance, icoPricesSep2026, latestYearIndex, worldEndingStocks, marketYears } from "../data/production";
import { fmt, kgToCentsLb, signed } from "../lib/format";
import { monthsShort } from "../data/countries";

type Period = "anual" | "mensal";
type Basis = "nominal" | "real";
type Unit = "kg" | "lb";

const annualNotes: Annotation[] = [
  { x: 1975.5, label: "Geada negra" },
  { x: 1977, label: "Pico de 1977" },
  { x: 1989.5, label: "Fim das cotas" },
  { x: 2001.5, label: "Crise do café" },
  { x: 2011, label: "Pico de 2011" },
  { x: 2025, label: "Recorde 2025" },
];
const monthlyNotes: Annotation[] = [
  { x: 2021.55, label: "Geada em MG" },
  { x: 2025.1, label: "Recorde OIC" },
  { x: 2025.6, label: "Tarifa EUA" },
  { x: 2025.88, label: "Máxima NY" },
  { x: 2026.6, label: "Safra recorde" },
];

function PriceHistory() {
  const [period, setPeriod] = useState<Period>("anual");
  const [basis, setBasis] = useState<Basis>("nominal");
  const [unit, setUnit] = useState<Unit>("lb");
  const conv = (v: number) => (unit === "kg" ? v : kgToCentsLb(v));
  const yFmt = (v: number) => (unit === "kg" ? `US$ ${fmt(v, 2)}` : `${fmt(v, 0)} ¢`);

  const series: LineSeries[] = useMemo(() => {
    if (period === "anual") {
      const ai = basis === "nominal" ? 1 : 3;
      return [
        { id: "arabica", label: "Arábica", color: "var(--s1)", values: annualPrices.map((r) => ({ x: r[0], y: conv(r[ai]) })) },
        { id: "robusta", label: "Robusta", color: "var(--s2)", values: annualPrices.map((r) => ({ x: r[0], y: conv(r[ai + 1]) })) },
      ];
    }
    const recent = monthlyPrices.filter((r) => r[0] >= 2015);
    return [
      { id: "arabica", label: "Arábica", color: "var(--s1)", values: recent.map((r) => ({ x: r[0] + (r[1] - 0.5) / 12, y: conv(r[2]) })) },
      { id: "robusta", label: "Robusta", color: "var(--s2)", values: recent.map((r) => ({ x: r[0] + (r[1] - 0.5) / 12, y: conv(r[3]) })) },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, basis, unit]);

  const xFmt = (x: number) => {
    if (period === "anual") return String(Math.round(x));
    const y = Math.floor(x);
    const m = Math.min(11, Math.max(0, Math.round((x - y) * 12 - 0.5)));
    return `${monthsShort[m]}/${y}`;
  };

  return (
    <ChartCard
      title={period === "anual" ? `Preço médio anual, 1960–2025 ${basis === "real" ? "(dólares constantes de 2010)" : "(nominal)"}` : "Preço médio mensal, jan/2015–set/2026 (nominal)"}
      subtitle={`Banco Mundial (Pink Sheet) · ${unit === "kg" ? "US$ por quilo" : "centavos de dólar por libra-peso"}`}
      controls={
        <>
          <Seg label="Período" value={period} onChange={setPeriod} options={[{ value: "anual", label: "1960–2025" }, { value: "mensal", label: "2015–2026" }]} />
          {period === "anual" && <Seg label="Base" value={basis} onChange={setBasis} options={[{ value: "nominal", label: "Nominal" }, { value: "real", label: "Real" }]} />}
          <Seg label="Unidade" value={unit} onChange={setUnit} options={[{ value: "lb", label: "¢/lb" }, { value: "kg", label: "US$/kg" }]} />
        </>
      }
    >
      <div className="mb-3">
        <Legend
          items={[
            { label: "Arábica (indicador OIC “outros suaves”)", color: "var(--s1)", shape: "line" },
            { label: "Robusta (indicador OIC “robustas”)", color: "var(--s2)", shape: "line" },
          ]}
        />
      </div>
      <LineChart
        key={`${period}-${basis}-${unit}`}
        series={series}
        height={400}
        xFormat={xFmt}
        xTickFormat={(x) => String(Math.round(x))}
        xTicks={period === "anual" ? [1960, 1970, 1980, 1990, 2000, 2010, 2020] : [2015, 2017, 2019, 2021, 2023, 2025]}
        yFormat={yFmt}
        annotations={period === "anual" ? annualNotes : monthlyNotes}
        area
        ariaLabel="Gráfico de linhas do preço do arábica e do robusta"
      />
      <SourceNote>
        {basis === "real" && period === "anual"
          ? "Em termos reais, 1976 e 1977 superam 2025: descontada a inflação, o arábica de 1977 custava ~55% mais que o de 2025. "
          : "Em valores nominais, 2025 é o ano mais caro da série. "}
        Séries do Banco Mundial atualizadas em set–out/2026. 1 kg = 2,2046 lb.
      </SourceNote>
    </ChartCard>
  );
}

function IcoIndicators() {
  const rows = [
    { id: "cm", label: "Suaves colombianos", v: icoPricesSep2026.colombianMilds },
    { id: "om", label: "Outros suaves", v: icoPricesSep2026.otherMilds },
    { id: "bn", label: "Naturais brasileiros", v: icoPricesSep2026.brazilianNaturals },
    { id: "ci", label: "Indicador composto", v: icoPricesSep2026.composite },
    { id: "ro", label: "Robustas", v: icoPricesSep2026.robustas },
  ];
  return (
    <ChartCard title="Indicadores de preço da OIC — setembro de 2026" subtitle="Média mensal, US¢/lb · todos caíram entre 7% e 10% no mês">
      <BarList rows={rows.map((r) => ({ id: r.id, label: r.label, values: { v: r.v } }))} keys={[{ key: "v", label: "US¢/lb", color: "var(--s1)" }]} format={(v) => fmt(v, 1)} labelWidth={160} ariaLabel="Indicadores de preço da OIC" />
      <SourceNote>OIC, Coffee Market Report (set/2026). Bolsa de NY (arábica): 280,68 ¢/lb; Londres (robusta): 154,28 ¢/lb.</SourceNote>
    </ChartCard>
  );
}

function Balance() {
  const [hover, setHover] = useState<number | null>(null);
  const max = 190;
  const min = 160;
  const h = 240;
  const y = (v: number) => h - ((v - min) / (max - min)) * h;
  return (
    <ChartCard
      title="Oferta × demanda global (OIC)"
      subtitle="Milhões de sacas, ano-cafeeiro out–set · eixo começa em 160 para mostrar a diferença"
      controls={
        <Legend
          items={[
            { label: "Produção", color: "var(--s5)", shape: "square" },
            { label: "Consumo", color: "var(--s4)", shape: "square" },
          ]}
        />
      }
    >
      <div className="relative">
        <div className="flex h-[280px] items-end gap-2 border-b border-[var(--axis)] pt-10 sm:gap-6">
          {icoBalance.years.map((yr, i) => {
            const p = icoBalance.production[i];
            const c = icoBalance.consumption[i];
            const d = p - c;
            return (
              <div key={yr} className="relative flex flex-1 items-end justify-center gap-[2px]" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
                <span className={`absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5 text-[0.7rem] font-semibold ${d >= 0 ? "bg-leaf-soft text-leaf" : "bg-accent-soft text-accent"}`}>
                  {signed(d, 1)}
                </span>
                {[p, c].map((v, k) => (
                  <motion.div
                    key={k}
                    className="w-full max-w-[24px] rounded-t-[4px]"
                    style={{ background: k === 0 ? "var(--s5)" : "var(--s4)", opacity: hover != null && hover !== i ? 0.45 : 1 }}
                    initial={{ height: 0 }}
                    whileInView={{ height: h - y(v) }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: i * 0.06 }}
                  />
                ))}
                {hover === i && (
                  <div className="tooltip bottom-full left-1/2 mb-10 -translate-x-1/2">
                    <p className="font-semibold">{yr}</p>
                    <p className="text-ink-2">Produção: {fmt(p, 1)} mi</p>
                    <p className="text-ink-2">Consumo: {fmt(c, 1)} mi</p>
                    <p className={d >= 0 ? "text-leaf" : "text-accent"}>{d >= 0 ? "Superávit" : "Déficit"}: {fmt(Math.abs(d), 1)} mi</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-2 flex gap-2 sm:gap-6">
          {icoBalance.years.map((yr) => (
            <span key={yr} className="flex-1 text-center text-[0.7rem] text-ink-3">
              {yr}
            </span>
          ))}
        </div>
      </div>
      <p className="mt-5 text-sm text-ink-2">
        Depois de <strong className="text-ink">quatro anos de déficit</strong>, 2025/26 deve fechar com superávit de 3 milhões de sacas — menos de uma semana de consumo mundial. A
        USDA projeta estoques finais de {fmt(worldEndingStocks[latestYearIndex] / 1000, 1)} milhões de sacas em {marketYears[latestYearIndex]}, ainda abaixo da média histórica.
      </p>
    </ChartCard>
  );
}

const valueChain = [
  { label: "Produtores", share: 20, color: "var(--s5)", note: "preço na porteira" },
  { label: "Exportação e frete", share: 5, color: "var(--s3)", note: "beneficiamento, logística" },
  { label: "Torrefação", share: 21, color: "var(--s1)", note: "torra, marca, embalagem" },
  { label: "Varejo", share: 22, color: "var(--s2)", note: "supermercados e lojas" },
  { label: "Impostos", share: 30, color: "var(--s4)", note: "IVA e imposto do café" },
];

function ValueChain() {
  const [hover, setHover] = useState<number | null>(null);
  return (
    <ChartCard title="Para onde vai o dinheiro do café no supermercado" subtitle="Distribuição de valor no mercado alemão (todas as formas de café) — estudo IDH/GCP/Solidaridad, 2024">
      <div className="flex h-14 overflow-hidden rounded-xl" role="img" aria-label="Barra empilhada da distribuição de valor">
        {valueChain.map((v, i) => (
          <motion.div
            key={v.label}
            className="relative flex items-center justify-center text-xs font-semibold text-white"
            style={{ background: v.color, marginRight: i < valueChain.length - 1 ? 2 : 0, opacity: hover != null && hover !== i ? 0.45 : 1 }}
            initial={{ width: 0 }}
            whileInView={{ width: `${v.share}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: i * 0.08 }}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          >
            {v.share >= 10 && <span>~{v.share}%</span>}
          </motion.div>
        ))}
      </div>
      <ul className="mt-5 grid gap-3 sm:grid-cols-5">
        {valueChain.map((v, i) => (
          <li key={v.label} className="text-sm" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
            <span className="flex items-center gap-2 font-medium text-ink">
              <span className="h-3 w-3 rounded-[3px]" style={{ background: v.color }} /> {v.label}
            </span>
            <span className="mt-0.5 block pl-5 text-ink-3">
              ~{v.share}% · {v.note}
            </span>
          </li>
        ))}
      </ul>
      <SourceNote>
        A Alemanha cobra um imposto específico sobre o café, o que eleva a fatia de tributos. Outros estudos estimam a parte do produtor entre 7% e 15% do preço de varejo; numa
        xícara servida em cafeteria — com aluguel, mão de obra e leite —, ela é bem menor.
      </SourceNote>
    </ChartCard>
  );
}

const certs = [
  { icon: Handshake, name: "Fairtrade", text: "Preço mínimo para cooperativas de pequenos produtores — US$ 1,80/lb para arábica lavado desde 2023, subindo para US$ 2,00/lb em 1º/12/2026 — mais um prêmio social de US$ 0,20/lb." },
  { icon: Leaf, name: "Orgânico", text: "Sem fertilizantes sintéticos nem agrotóxicos; certificação por auditoria. No Fairtrade, rende um adicional de US$ 0,40/lb." },
  { icon: BadgeCheck, name: "Rainforest Alliance", text: "Padrão socioambiental (fundido à UTZ em 2018) com foco em florestas, clima e direitos trabalhistas." },
  { icon: Scale, name: "4C", text: "Código de sustentabilidade de base, usado por grandes torrefadoras para cobrir volumes elevados." },
  { icon: Bird, name: "Bird Friendly", text: "Do Smithsonian: exige café orgânico cultivado sob sombra diversa, que abriga aves migratórias." },
  { icon: Ship, name: "Comércio direto", text: "Torrefações compram diretamente de produtores, com rastreabilidade e prêmios por qualidade — sem selo único." },
];

export default function Mercado() {
  return (
    <>
      <PageHero
        path="/mercado"
        title={
          <>
            O preço <span className="italic text-ink-2">de cada</span> xícara
          </>
        }
        lead="O café é uma das commodities agrícolas mais negociadas do mundo. Seu preço nasce em bolsas de Nova York e Londres, oscila com o clima do Brasil e chega ao produtor — e a você — passando por muitas mãos."
        aside={
          <div className="card p-7">
            <p className="kicker">Indicador composto OIC · set/2026</p>
            <p className="display mt-4 text-7xl">
              {fmt(icoPricesSep2026.composite, 0)}
              <span className="text-3xl text-ink-3"> ¢/lb</span>
            </p>
            <p className="mt-1 text-sm text-accent">▼ 8,7% em relação a agosto</p>
            <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-surface-2 p-3">
                <p className="text-ink-3">Arábica NY</p>
                <p className="font-display text-2xl">{fmt(icoPricesSep2026.nyFutures, 1)} ¢</p>
              </div>
              <div className="rounded-xl bg-surface-2 p-3">
                <p className="text-ink-3">Robusta Londres</p>
                <p className="font-display text-2xl">{fmt(icoPricesSep2026.londonFutures, 1)} ¢</p>
              </div>
            </div>
            <p className="mt-4 text-xs text-ink-3">Recorde: arábica a US$ 4,3795/lb em outubro de 2025.</p>
          </div>
        }
      />

      <Section kicker="Histórico" title="66 anos de preços em um gráfico" intro="Geadas no Brasil, o fim do sistema de cotas, crises de superprodução e, em 2025, a disparada para recordes nominais. Passe o mouse para ver cada ano.">
        <Reveal>
          <PriceHistory />
        </Reveal>
      </Section>

      <Section kicker="Agora" title="Preços em queda com a safra recorde" tight>
        <div className="grid gap-6 lg:grid-cols-2">
          <Reveal>
            <IcoIndicators />
          </Reveal>
          <Reveal delay={0.08}>
            <Balance />
          </Reveal>
        </div>
      </Section>

      <Section kicker="Comércio" title="Quem vende e quem compra" intro="Brasil e Vietnã respondem por mais da metade das exportações de café em grão; União Europeia e Estados Unidos absorvem quase 60% das importações.">
        <div className="grid gap-6 lg:grid-cols-2">
          {(
            [
              ["Maiores exportadores (grão verde)", beanExports],
              ["Maiores importadores (grão verde)", beanImports],
            ] as const
          ).map(([title, rows], k) => (
            <Reveal key={title} delay={k * 0.08}>
              <ChartCard title={title} subtitle={`Milhões de sacas · USDA, previsão ${marketYears[latestYearIndex]}`}>
                <BarList
                  rows={rows.map((r) => ({ id: r.iso, label: r.name, values: { v: r.values[latestYearIndex] } }))}
                  keys={[{ key: "v", label: "Sacas", color: k === 0 ? "var(--s1)" : "var(--s2)" }]}
                  format={(v) => fmt(v / 1000, 1)}
                  ariaLabel={title}
                />
              </ChartCard>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section kicker="Bolsas" title="Como o preço do café é formado">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { t: "ICE Nova York — Arábica 'C'", d: "Contratos de 37.500 libras (~17 t) cotados em centavos de dólar por libra-peso. Vencimentos em março, maio, julho, setembro e dezembro. É a referência mundial para o arábica lavado." },
            { t: "ICE Londres — Robusta", d: "Contratos de 10 toneladas cotados em dólares por tonelada. Vencimentos em janeiro, março, maio, julho, setembro e novembro." },
            { t: "B3 — São Paulo", d: "Contrato de café arábica 4/5 em dólares por saca de 60 kg, usado por produtores e cooperativas brasileiras para proteger preços." },
          ].map((b, i) => (
            <Reveal key={b.t} delay={i * 0.06}>
              <div className="card h-full p-6">
                <Landmark className="text-gold" size={22} />
                <h3 className="mt-4 font-display text-2xl leading-tight">{b.t}</h3>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-2">{b.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Callout title="Diferencial" tone="gold">
            O café físico é negociado como “bolsa ± diferencial”: um prêmio (ou desconto) que reflete origem, qualidade, logística e demanda por aquele tipo de café.
          </Callout>
          <Callout title="Hedge" tone="leaf">
            Produtores vendem contratos futuros para travar preços; torrefadoras compram para se proteger de altas. Especuladores dão liquidez — e às vezes amplificam os movimentos.
          </Callout>
          <Callout title="Estoques certificados" tone="accent">
            Em 15/9/2026, os estoques de arábica certificados pela ICE caíram a 217.646 sacas, o menor nível desde 1999 — sinal de oferta apertada de café lavado de qualidade.
          </Callout>
        </div>
      </Section>

      <Section kicker="Cadeia de valor" title="Quem fica com o quê">
        <Reveal>
          <ValueChain />
        </Reveal>
      </Section>

      <Section kicker="Certificações" title="Selos, preços mínimos e rastreabilidade">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {certs.map((c, i) => {
            const Icon = c.icon;
            return (
              <Reveal key={c.name} delay={(i % 3) * 0.06}>
                <div className="card h-full p-6">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-leaf-soft text-leaf">
                    <Icon size={20} />
                  </span>
                  <h3 className="mt-4 font-display text-2xl">{c.name}</h3>
                  <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-2">{c.text}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
        <SourceNote>Fairtrade International (anúncio de agosto de 2026). A partir de 30/12/2026, a lei antidesmatamento da União Europeia (EUDR) passa a exigir geolocalização das fazendas para o café vendido no bloco.</SourceNote>
      </Section>

      <Section kicker="Especiais" title="Quando o café vira artigo de luxo">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <Reveal className="card p-8">
            <Gavel className="text-accent" size={26} />
            <p className="display mt-5 text-6xl">US$ 30.204</p>
            <p className="mt-2 text-ink-2">por quilo — recorde mundial, pago em agosto de 2025 por um Geisha lavado de 98 pontos da Hacienda La Esmeralda (Panamá), no leilão Best of Panama.</p>
            <p className="mt-4 text-sm text-ink-3">Em 2026, o lote mais caro do mesmo leilão saiu a US$ 18.004/kg.</p>
          </Reveal>
          <Reveal delay={0.08} className="prose-atlas">
            <p>
              Cafés <strong>especiais</strong> — com 80 pontos ou mais na escala da SCA — são uma fatia pequena do volume, mas a que mais cresce em valor. Concursos como o{" "}
              <strong>Cup of Excellence</strong>, criado no Brasil em 1999, e leilões nacionais aproximam produtores de torrefações do mundo inteiro e pagam múltiplos do preço de bolsa.
            </p>
            <p>
              Em 2025, o mundo viveu o paradoxo inverso: o café <em>comum</em> ficou caríssimo. Secas no Brasil e no Vietnã, estoques baixos e as tarifas americanas levaram o preço do
              arábica a recordes, e o consumo caiu em vários países — inclusive no Brasil, pela primeira vez desde 2022.
            </p>
            <Link to="/sabor" className="mt-4 inline-flex items-center gap-2 font-semibold text-accent no-underline">
              Entenda a escala de 100 pontos <ArrowRight size={16} />
            </Link>
          </Reveal>
        </div>
      </Section>

      <NextChapter path="/mercado" />
    </>
  );
}
