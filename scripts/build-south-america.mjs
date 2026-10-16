// Gera src/data/south-america.json: recorte leve (GeoJSON) da América do Sul a partir do world-atlas 50m.
import { readFileSync, writeFileSync } from "node:fs";
import { feature } from "topojson-client";

const topo = JSON.parse(readFileSync(new URL("../node_modules/world-atlas/countries-50m.json", import.meta.url), "utf8"));
const fc = feature(topo, topo.objects.countries);
const box = { minX: -92, maxX: -26, minY: -58, maxY: 16 };
const inBox = (ring) => ring.some(([x, y]) => x >= box.minX && x <= box.maxX && y >= box.minY && y <= box.maxY);
const round = (ring) => ring.map(([x, y]) => [Math.round(x * 1000) / 1000, Math.round(y * 1000) / 1000]);

const out = [];
for (const f of fc.features) {
  const g = f.geometry;
  if (!g) continue;
  const polys = g.type === "Polygon" ? [g.coordinates] : g.type === "MultiPolygon" ? g.coordinates : [];
  const kept = polys.filter((p) => inBox(p[0])).map((p) => p.map(round));
  if (!kept.length) continue;
  out.push({ type: "Feature", id: f.id, properties: { name: f.properties.name }, geometry: { type: "MultiPolygon", coordinates: kept } });
}
writeFileSync(new URL("../src/data/south-america.json", import.meta.url), JSON.stringify({ type: "FeatureCollection", features: out }));
console.log(out.length, "features");
