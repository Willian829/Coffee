import { useMemo } from "react";
import { motion } from "motion/react";
import { RefreshCw } from "lucide-react";
import { useLive, fmtDateTime, fmtDay, timeAgo, contractLabel, LB_PER_BAG, type CepeaIndicator, type LiveData } from "../lib/live";
import { fmt, signed } from "../lib/format";

function Change({ pct, suffix = "" }: { pct: number | null | undefined; suffix?: string }) {
  if (pct == null || !Number.isFinite(pct)) return null;
  const up = pct > 0;
  const flat = pct === 0;
  return (
    <span className={`num inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${flat ? "bg-surface-3 text-ink-2" : up ? "bg-leaf-soft text-leaf" : "bg-accent-soft text-accent"}`}>
      {flat ? "■" : up ? "▲" : "▼"} {signed(pct, 2)}%{suffix}
    </span>
  );
}

function Spark({ values, height = 56 }: { values: number[]; height?: number }) {
  const w = 240;
  const h = height;
  const path = useMemo(() => {
    if (values.length < 2) return { line: "", area: "", last: [0, 0] as [number, number] };
    const min = Math.min(...values);
    const max = Math.max(...values);
    const pad = (max - min) * 0.12 || 1;
    const x = (i: number) => (i / (values.length - 1)) * (w - 8) + 2;
    const y = (v: number) => h - 4 - ((v - (min - pad)) / (max - min + pad * 2)) * (h - 8);
    const pts = values.map((v, i) => [x(i), y(v)] as [number, number]);
    const line = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join("");
    return { line, area: `${line}L${pts[pts.length - 1][0]},${h}L${pts[0][0]},${h}Z`, last: pts[pts.length - 1] };
  }, [values, h]);
  if (!path.line) return null;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="block w-full" style={{ height }} aria-hidden preserveAspectRatio="none">
      <path d={path.area} fill="var(--s1)" opacity="0.1" />
      <path d={path.line} fill="none" stroke="var(--s1)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <circle cx={path.last[0]} cy={path.last[1]} r="3.5" fill="var(--s1)" stroke="var(--chart-surface)" strokeWidth="1.5" />
    </svg>
  );
}

function Card({ kicker, children, note }: { kicker: string; children: React.ReactNode; note?: React.ReactNode }) {
  return (
    <div className="card flex h-full flex-col p-5" style={{ background: "var(--chart-surface)" }}>
      <p className="kicker">{kicker}</p>
      <div className="mt-3 flex-1">{children}</div>
      {note && <p className="mt-3 border-t border-line pt-3 text-xs leading-relaxed text-ink-3">{note}</p>}
    </div>
  );
}

function CepeaCard({ title, ind }: { title: string; ind: CepeaIndicator }) {
  return (
    <Card kicker={title} note={`Indicador de ${fmtDay(ind.date)} · variação no mês ${signed(ind.monthPct, 2)}%`}>
      <p className="display text-[2.4rem] leading-none">
        <span className="text-xl text-ink-3">R$ </span>
        {fmt(ind.brl, 2)}
      </p>
      <p className="mt-1 text-sm text-ink-2">por saca de 60 kg · US$ {fmt(ind.usd, 2)}</p>
      <div className="mt-3">
        <Change pct={ind.dayPct} suffix=" no dia" />
      </div>
    </Card>
  );
}

export function LiveUpdated({ data }: { data: LiveData }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs text-ink-3">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-leaf opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-leaf" />
      </span>
      Atualizado a cada hora · última coleta {fmtDateTime(data.generatedAt)} ({timeAgo(data.generatedAt)})
    </span>
  );
}

/** Painel "Mercado agora": bolsa de NY, indicadores CEPEA e dólar. */
export default function LiveMarket({ compact = false }: { compact?: boolean }) {
  const data = useLive();
  if (!data) {
    return (
      <div className="card flex items-center gap-3 p-6 text-sm text-ink-3">
        <RefreshCw size={16} className="animate-spin" /> Carregando cotações…
      </div>
    );
  }
  const kc = data.arabicaFutures;
  const usd = data.dollar;
  const bagBrl = kc && usd ? (kc.price / 100) * LB_PER_BAG * usd.brl : null;

  return (
    <div>
      <div className={`grid gap-4 ${compact ? "sm:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-4"}`}>
        {!compact && kc && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card
              kicker={`Arábica · Bolsa de Nova York`}
              note={`Contrato C, vencimento ${contractLabel(kc.contract)} · cotação de ${fmtDateTime(kc.time)} (com atraso)`}
            >
              <p className="display text-[2.4rem] leading-none">
                {fmt(kc.price, 2)}
                <span className="text-xl text-ink-3"> ¢/lb</span>
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Change pct={kc.changePct} />
                <span className="text-xs text-ink-3">ant. {fmt(kc.prevClose, 2)}</span>
              </div>
              <div className="mt-3">
                <Spark values={kc.history.map((h) => h[1])} />
                <p className="mt-1 flex justify-between text-[0.68rem] text-ink-3">
                  <span>{fmtDay(kc.history[0][0])}</span>
                  <span>últimos 3 meses</span>
                </p>
              </div>
              {bagBrl != null && <p className="mt-2 text-sm text-ink-2">≈ R$ {fmt(bagBrl, 0)} por saca (conversão direta)</p>}
            </Card>
          </motion.div>
        )}
        {data.cepea && (
          <>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.06 }}>
              <CepeaCard title="Arábica · Indicador CEPEA/ESALQ" ind={data.cepea.arabica} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.12 }}>
              <CepeaCard title="Robusta · Indicador CEPEA/ESALQ" ind={data.cepea.robusta} />
            </motion.div>
          </>
        )}
        {usd && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.18 }}>
            <Card kicker="Dólar comercial" note={`Fonte: ${usd.source} · ${fmtDateTime(usd.time)}`}>
              <p className="display text-[2.4rem] leading-none">
                <span className="text-xl text-ink-3">R$ </span>
                {fmt(usd.brl, 4)}
              </p>
              <p className="mt-1 text-sm text-ink-2">por US$ 1</p>
              <div className="mt-3">
                <Change pct={usd.changePct} suffix=" no dia" />
              </div>
            </Card>
          </motion.div>
        )}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <LiveUpdated data={data} />
        <span className="text-xs text-ink-3">
          Fontes: ICE via Yahoo Finance · CEPEA/ESALQ (CC BY-NC 4.0) · {usd?.source ?? "AwesomeAPI"}
        </span>
      </div>
    </div>
  );
}
