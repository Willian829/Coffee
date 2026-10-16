const nf = (min: number, max: number) =>
  new Intl.NumberFormat("pt-BR", { minimumFractionDigits: min, maximumFractionDigits: max });

const cache = new Map<string, Intl.NumberFormat>();
const getNf = (min: number, max: number) => {
  const key = `${min}-${max}`;
  let f = cache.get(key);
  if (!f) {
    f = nf(min, max);
    cache.set(key, f);
  }
  return f;
};

/** 12345.6 → "12.346" */
export const fmtInt = (n: number) => getNf(0, 0).format(n);

/** Número com casas fixas: fmt(3.14159, 1) → "3,1" */
export const fmt = (n: number, digits = 1) => getNf(digits, digits).format(n);

/** Número com até N casas, sem zeros à direita. */
export const fmtMax = (n: number, digits = 1) => getNf(0, digits).format(n);

/** Milhares de sacas → "71,9 mi" */
export const fmtMiBags = (thousandBags: number, digits = 1) => `${fmt(thousandBags / 1000, digits)} mi`;

/** Milhares de sacas → texto com unidade */
export const fmtBagsLong = (thousandBags: number) =>
  thousandBags >= 1000 ? `${fmt(thousandBags / 1000, 1)} milhões de sacas` : `${fmtInt(thousandBags)} mil sacas`;

export const fmtPct = (n: number, digits = 1) => `${fmt(n, digits)}%`;

export const signed = (n: number, digits = 1) => `${n > 0 ? "+" : n < 0 ? "−" : ""}${fmt(Math.abs(n), digits)}`;

/** US$/kg → US¢/lb */
export const kgToCentsLb = (usdPerKg: number) => (usdPerKg / 2.20462) * 100;

export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Interpola linearmente uma série [x, y] ordenada por x. */
export const interpSeries = (series: [number, number][], x: number) => {
  if (x <= series[0][0]) return series[0][1];
  for (let i = 1; i < series.length; i++) {
    const [x1, y1] = series[i];
    if (x <= x1) {
      const [x0, y0] = series[i - 1];
      return lerp(y0, y1, (x - x0) / (x1 - x0));
    }
  }
  return series[series.length - 1][1];
};

/** Interpola cores hex. */
export const mixHex = (a: string, b: string, t: number) => {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const r = Math.round(lerp((pa >> 16) & 255, (pb >> 16) & 255, t));
  const g = Math.round(lerp((pa >> 8) & 255, (pb >> 8) & 255, t));
  const bl = Math.round(lerp(pa & 255, pb & 255, t));
  return `#${((1 << 24) | (r << 16) | (g << 8) | bl).toString(16).slice(1)}`;
};

export const colorAt = (stops: [number, string][], x: number) => {
  if (x <= stops[0][0]) return stops[0][1];
  for (let i = 1; i < stops.length; i++) {
    if (x <= stops[i][0]) {
      const [x0, c0] = stops[i - 1];
      const [x1, c1] = stops[i];
      return mixHex(c0, c1, (x - x0) / (x1 - x0));
    }
  }
  return stops[stops.length - 1][1];
};

/** Normaliza texto para busca (sem acentos, minúsculas). */
export const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
