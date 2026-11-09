import { useEffect, useState } from "react";

/** Formato de public/data/live.json (gerado por scripts/update-data.mjs). */
export type CepeaIndicator = { date: string; brl: number; usd: number | null; dayPct: number; monthPct: number | null; history: [string, number][]; via?: string };

export type LiveData = {
  generatedAt: string;
  arabicaFutures?: {
    price: number;
    prevClose: number;
    change: number;
    changePct: number;
    contract: { month: number; year: number } | null;
    time: string;
    unit: string;
    history: [string, number][];
  };
  cepea?: { arabica: CepeaIndicator; robusta: CepeaIndicator };
  dollar?: { brl: number; changePct: number | null; time: string; source: string };
  worldBank?: { lastModified: string; url: string; unit: string; rows: [number, number, number, number][] };
  status?: Record<string, { ok: boolean; at: string; error?: string; lastOk?: string }>;
};

/** Libras-peso em uma saca de 60 kg. */
export const LB_PER_BAG = 132.277;

const REFRESH_MS = 30 * 60 * 1000;
let cache: LiveData | null = null;
let inflight: Promise<LiveData | null> | null = null;
let fetchedAt = 0;

export function loadLive(force = false): Promise<LiveData | null> {
  if (!force && inflight && Date.now() - fetchedAt < REFRESH_MS) return inflight;
  fetchedAt = Date.now();
  // o parâmetro muda a cada 10 min e evita cópias antigas em caches intermediários
  inflight = fetch(`${import.meta.env.BASE_URL}data/live.json?v=${Math.floor(Date.now() / 600000)}`, { cache: "no-store" })
    .then((r) => (r.ok ? (r.json() as Promise<LiveData>) : null))
    .then((d) => {
      if (d) cache = d;
      return cache;
    })
    .catch(() => cache);
  return inflight;
}

/** Dados vivos do Atlas; recarrega sozinho a cada 30 minutos enquanto a página estiver aberta. */
export function useLive() {
  const [data, setData] = useState<LiveData | null>(cache);
  useEffect(() => {
    let alive = true;
    loadLive().then((d) => alive && setData(d));
    const id = window.setInterval(() => loadLive(true).then((d) => alive && setData(d)), REFRESH_MS);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, []);
  return data;
}

const tz = "America/Sao_Paulo";
const dtf = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: tz });
const df = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeZone: "UTC" });

/** "09/11/2026, 10:05" no horário de Brasília. */
export const fmtDateTime = (iso: string) => dtf.format(new Date(iso));

/** Datas sem hora (AAAA-MM-DD) → "06/11/2026". */
export const fmtDay = (isoDay: string) => df.format(new Date(`${isoDay}T12:00:00Z`));

/** "há 12 min", "há 3 h", "há 2 dias". */
export function timeAgo(iso: string, now = Date.now()) {
  const min = Math.max(0, Math.round((now - Date.parse(iso)) / 60000));
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const h = Math.round(min / 60);
  if (h < 48) return `há ${h} h`;
  return `há ${Math.round(h / 24)} dias`;
}

const monthsPt = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
export const contractLabel = (c: { month: number; year: number } | null | undefined) => (c ? `${monthsPt[c.month - 1]}/${String(c.year).slice(2)}` : "");
