// Coleta os dados "vivos" do Atlas do Café e grava public/data/live.json.
// Roda de hora em hora no GitHub Actions (ver .github/workflows/deploy.yml) e pode ser
// executado localmente com `npm run data`. Cada fonte é independente: se uma falhar,
// o valor anterior (publicado no site ou já salvo no arquivo) é mantido.
import { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { unzipSync, strFromU8 } from "fflate";

const OUT = fileURLToPath(new URL("../public/data/live.json", import.meta.url));
const SITE_URL = (process.env.SITE_URL || "https://willian829.github.io/Coffee/").replace(/\/?$/, "/");
const UA = "Mozilla/5.0 (compatible; AtlasDoCafe/1.0; +https://github.com/Willian829/Coffee)";
const SNAPSHOT_DAYS = 25;

const log = (...a) => console.log("[dados]", ...a);

async function get(url, { type = "text", timeout = 25000, headers = {} } = {}) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeout);
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA, ...headers }, signal: ctl.signal, redirect: "follow" });
    if (!res.ok) throw new Error(`HTTP ${res.status} em ${url}`);
    if (type === "json") return await res.json();
    if (type === "bytes") return new Uint8Array(await res.arrayBuffer());
    if (type === "head") return res;
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}

const brNum = (s) => Number(String(s).replace(/\./g, "").replace(",", ".").replace("%", "").trim());
const round = (v, d = 2) => Math.round(v * 10 ** d) / 10 ** d;
const monthsEn = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 };

/* ───────────── Arábica — ICE Nova York (contrato C, 1º vencimento) ───────────── */
async function arabicaFutures() {
  let data;
  for (const host of ["query1", "query2"]) {
    try {
      data = await get(`https://${host}.finance.yahoo.com/v8/finance/chart/KC=F?range=3mo&interval=1d`, { type: "json" });
      break;
    } catch (e) {
      log("Yahoo", host, "falhou:", e.message);
    }
  }
  const r = data?.chart?.result?.[0];
  if (!r) throw new Error("resposta sem dados");
  const closes = r.indicators.quote[0].close;
  const history = r.timestamp
    .map((t, i) => [new Date(t * 1000).toISOString().slice(0, 10), closes[i]])
    .filter(([, c]) => c != null)
    .map(([d, c]) => [d, round(c)]);
  if (history.length < 2) throw new Error("histórico curto");
  const price = round(r.meta.regularMarketPrice ?? history[history.length - 1][1]);
  const prevClose = history[history.length - 2][1];
  const m = /([A-Z][a-z]{2})\s+(\d{2})/.exec(r.meta.shortName || "");
  return {
    price,
    prevClose,
    change: round(price - prevClose),
    changePct: round(((price - prevClose) / prevClose) * 100),
    contract: m ? { month: monthsEn[m[1]], year: 2000 + Number(m[2]) } : null,
    time: new Date((r.meta.regularMarketTime ?? Date.now() / 1000) * 1000).toISOString(),
    unit: "US¢/lb",
    history: history.slice(-66),
  };
}

/* ───────────── Indicadores CEPEA/ESALQ (arábica e robusta, R$/saca) ───────────── */
async function cepea() {
  const html = await get("https://www.cepea.org.br/br/indicador/cafe.aspx");
  const table = (id) => {
    const t = new RegExp(`<table[^>]*id="${id}"[\\s\\S]*?</table>`).exec(html)?.[0];
    if (!t) throw new Error(`tabela ${id} não encontrada`);
    const rows = [...t.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)]
      .map((m) => [...m[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((c) => c[1].replace(/<[^>]+>/g, "").trim()))
      .filter((c) => /^\d{2}\/\d{2}\/\d{4}$/.test(c[0] ?? ""));
    if (!rows.length) throw new Error(`tabela ${id} vazia`);
    const iso = (d) => d.split("/").reverse().join("-");
    const [latest] = rows;
    return {
      date: iso(latest[0]),
      brl: brNum(latest[1]),
      dayPct: brNum(latest[2]),
      monthPct: brNum(latest[3]),
      usd: brNum(latest[4]),
      history: rows.map((c) => [iso(c[0]), brNum(c[1])]).reverse(),
    };
  };
  return { arabica: table("imagenet-indicador1"), robusta: table("imagenet-indicador2") };
}

/* ───────────── Dólar comercial ───────────── */
async function dollar() {
  try {
    const j = await get("https://economia.awesomeapi.com.br/json/last/USD-BRL", { type: "json" });
    const q = j.USDBRL;
    return { brl: round(Number(q.bid), 4), changePct: round(Number(q.pctChange)), time: new Date(Number(q.timestamp) * 1000).toISOString(), source: "AwesomeAPI" };
  } catch (e) {
    log("AwesomeAPI falhou:", e.message);
    const j = await get("https://api.frankfurter.app/latest?from=USD&to=BRL", { type: "json" });
    return { brl: round(j.rates.BRL, 4), changePct: null, time: new Date(`${j.date}T16:00:00Z`).toISOString(), source: "Frankfurter (BCE)" };
  }
}

/* ───────────── Banco Mundial — série mensal (só baixa quando o arquivo muda) ───────────── */
function readXlsxSheet(bytes, sheetName) {
  const files = unzipSync(bytes, { filter: (f) => f.name.startsWith("xl/") && !f.name.startsWith("xl/media") });
  const text = (n) => (files[n] ? strFromU8(files[n]) : "");
  const decode = (s) => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&");
  const shared = [...text("xl/sharedStrings.xml").matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) =>
    decode([...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((t) => t[1]).join("")),
  );
  const rid = new RegExp(`<sheet[^>]*name="${sheetName}"[^>]*r:id="([^"]+)"`).exec(text("xl/workbook.xml"))?.[1];
  const target = new RegExp(`<Relationship[^>]*Id="${rid}"[^>]*Target="([^"]+)"`).exec(text("xl/_rels/workbook.xml.rels"))?.[1];
  if (!target) throw new Error(`planilha ${sheetName} não encontrada`);
  const xml = text(`xl/${target.replace(/^\/?xl\//, "")}`);
  const rows = [];
  for (const rm of xml.matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)) {
    const row = {};
    for (const cm of rm[1].matchAll(/<c r="([A-Z]+)\d+"([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const [, col, attrs, inner = ""] = cm;
      const v = /<v>([\s\S]*?)<\/v>/.exec(inner)?.[1];
      const inline = /<t[^>]*>([\s\S]*?)<\/t>/.exec(inner)?.[1];
      if (/t="s"/.test(attrs) && v != null) row[col] = shared[Number(v)];
      else if (inline != null) row[col] = decode(inline);
      else if (v != null) row[col] = /t="str"/.test(attrs) ? decode(v) : Number(v);
    }
    rows.push(row);
  }
  return rows;
}

async function worldBankMonthly(prev) {
  const page = await get("https://www.worldbank.org/en/research/commodity-markets");
  const url = /https?:\/\/[^"' ]*CMO-Historical-Data-Monthly\.xlsx/.exec(page)?.[0];
  if (!url) throw new Error("link da planilha mensal não encontrado");
  const head = await get(url, { type: "head", headers: { Range: "bytes=0-0" } });
  const lastModified = head.headers.get("last-modified") || "";
  if (prev?.lastModified && prev.lastModified === lastModified && prev.rows?.length) {
    log("Banco Mundial sem mudanças desde", lastModified);
    return prev;
  }
  const rows = readXlsxSheet(await get(url, { type: "bytes", timeout: 60000 }), "Monthly Prices");
  const header = rows.find((r) => Object.values(r).some((v) => v === "Coffee, Arabica"));
  const col = (name) => Object.entries(header ?? {}).find(([, v]) => v === name)?.[0];
  const ca = col("Coffee, Arabica");
  const cr = col("Coffee, Robusta");
  if (!ca || !cr) throw new Error("colunas de café não encontradas");
  const out = [];
  for (const r of rows) {
    const m = /^(\d{4})M(\d{2})$/.exec(String(r.A ?? ""));
    if (!m || Number(m[1]) < 2015) continue;
    const a = Number(r[ca]);
    const b = Number(r[cr]);
    if (Number.isFinite(a) && Number.isFinite(b) && a > 0) out.push([Number(m[1]), Number(m[2]), round(a), round(b)]);
  }
  if (out.length < 12) throw new Error("série mensal curta");
  return { lastModified, url, unit: "US$/kg", rows: out };
}

/* ───────────── Execução ───────────── */
async function loadPrevious() {
  let local = null;
  if (existsSync(OUT)) {
    try {
      local = JSON.parse(readFileSync(OUT, "utf8"));
    } catch {
      /* arquivo inválido */
    }
  }
  let remote = null;
  try {
    remote = await get(`${SITE_URL}data/live.json?t=${Date.now()}`, { type: "json", timeout: 15000 });
  } catch (e) {
    log("sem dados publicados anteriores:", e.message);
  }
  const newer = [local, remote].filter(Boolean).sort((x, y) => (y.generatedAt || "").localeCompare(x.generatedAt || ""))[0];
  return { prev: newer ?? {}, committedAt: local?.generatedAt };
}

const { prev, committedAt } = await loadPrevious();
const now = new Date().toISOString();
const data = { ...prev, generatedAt: now, status: {} };

const tasks = {
  arabicaFutures: () => arabicaFutures(),
  cepea: () => cepea(),
  dollar: () => dollar(),
  worldBank: () => worldBankMonthly(prev.worldBank),
};

for (const [key, fn] of Object.entries(tasks)) {
  try {
    data[key] = await fn();
    data.status[key] = { ok: true, at: now };
    log(key, "ok");
  } catch (e) {
    data.status[key] = { ok: false, at: now, error: String(e.message || e), lastOk: prev.status?.[key]?.ok ? prev.status[key].at : prev.status?.[key]?.lastOk };
    log(key, "FALHOU — mantendo valor anterior:", e.message);
  }
}

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(data));
log("gravado", OUT);

// Snapshot mensal: avisa o workflow para versionar o arquivo (mantém o repositório "ativo"
// e evita que o GitHub pause os agendamentos após 60 dias sem atividade).
const ageDays = committedAt ? (Date.now() - Date.parse(committedAt)) / 86400000 : Infinity;
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `snapshot=${ageDays > SNAPSHOT_DAYS}\n`);
