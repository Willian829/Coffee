import { useMemo, useRef, useState } from "react";
import { scaleLinear } from "d3-scale";
import { line as d3line, area as d3area, curveMonotoneX } from "d3-shape";
import { bisector, extent, max as d3max } from "d3-array";
import { useElementWidth } from "../../lib/hooks";

export type LinePoint = { x: number; y: number | null };
export type LineSeries = { id: string; label: string; color: string; values: LinePoint[] };
export type Annotation = { x: number; label: string };

type Props = {
  series: LineSeries[];
  height?: number;
  xFormat: (x: number) => string;
  xTickFormat?: (x: number) => string;
  xTicks?: number[];
  yFormat: (y: number) => string;
  yTickFormat?: (y: number) => string;
  annotations?: Annotation[];
  area?: boolean;
  ariaLabel: string;
  yMinZero?: boolean;
  markers?: { x: number; y: number; color: string; label?: string }[];
};

export default function LineChart({
  series,
  height = 380,
  xFormat,
  xTickFormat,
  xTicks,
  yFormat,
  yTickFormat,
  annotations = [],
  area = false,
  ariaLabel,
  yMinZero = true,
  markers = [],
}: Props) {
  const [wrapRef, width] = useElementWidth<HTMLDivElement>(800);
  const [hover, setHover] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const narrow = width < 560;
  const m = { top: annotations.length ? 34 : 14, right: narrow ? 14 : 64, bottom: 30, left: narrow ? 38 : 48 };
  const iw = Math.max(10, width - m.left - m.right);
  const ih = height - m.top - m.bottom;

  const allX = series[0]?.values.map((v) => v.x) ?? [];
  const [xMin, xMax] = extent(allX) as [number, number];
  const yMax = d3max(series.flatMap((s) => s.values.map((v) => v.y ?? 0))) ?? 1;
  const yMin = yMinZero ? 0 : (Math.min(...series.flatMap((s) => s.values.filter((v) => v.y != null).map((v) => v.y as number))) ?? 0);

  const x = useMemo(() => scaleLinear().domain([xMin, xMax]).range([0, iw]), [xMin, xMax, iw]);
  const y = useMemo(() => scaleLinear().domain([yMin, yMax * 1.06]).nice(5).range([ih, 0]), [yMin, yMax, ih]);

  const lineGen = d3line<LinePoint>()
    .defined((d) => d.y != null)
    .x((d) => x(d.x))
    .y((d) => y(d.y as number))
    .curve(curveMonotoneX);
  const areaGen = d3area<LinePoint>()
    .defined((d) => d.y != null)
    .x((d) => x(d.x))
    .y0(ih)
    .y1((d) => y(d.y as number))
    .curve(curveMonotoneX);

  const ticksY = y.ticks(narrow ? 4 : 5);
  const ticksX = xTicks ?? x.ticks(narrow ? 4 : 8);
  const bis = bisector<LinePoint, number>((d) => d.x).center;

  const onMove = (e: React.PointerEvent) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const px = e.clientX - rect.left - m.left;
    const xv = x.invert(Math.max(0, Math.min(iw, px)));
    setHover(bis(series[0].values, xv));
  };

  const hx = hover != null ? series[0].values[hover]?.x : null;
  const tooltipLeft = hx != null ? m.left + x(hx) : 0;
  const flip = tooltipLeft > width * 0.62;

  // anotações escalonadas em duas alturas para evitar colisões
  const ann = annotations
    .filter((a) => a.x >= xMin && a.x <= xMax)
    .map((a, i) => ({ ...a, px: x(a.x), row: i % 2 }));

  return (
    <div ref={wrapRef} className="relative w-full select-none" style={{ touchAction: "pan-y" }}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        role="img"
        aria-label={ariaLabel}
        onPointerMove={onMove}
        onPointerDown={onMove}
        onPointerLeave={() => setHover(null)}
        className="block overflow-visible"
      >
        <g transform={`translate(${m.left},${m.top})`}>
          {ticksY.map((t) => (
            <g key={t} transform={`translate(0,${y(t)})`}>
              <line x1={0} x2={iw} stroke={t === y.domain()[0] ? "var(--axis)" : "var(--grid)"} />
              <text x={-8} dy="0.32em" textAnchor="end" fontSize="11" fill="var(--ink-3)" className="num">
                {(yTickFormat ?? yFormat)(t)}
              </text>
            </g>
          ))}
          {ticksX.map((t) => (
            <text key={t} x={x(t)} y={ih + 20} textAnchor="middle" fontSize="11" fill="var(--ink-3)" className="num">
              {(xTickFormat ?? xFormat)(t)}
            </text>
          ))}
          {ann.map((a) => (
            <g key={a.label} transform={`translate(${a.px},0)`}>
              <line y1={a.row ? -6 : -20} y2={ih} stroke="var(--axis)" strokeOpacity="0.55" />
              {!narrow && (
                <text y={a.row ? -10 : -24} textAnchor="middle" fontSize="10.5" fill="var(--ink-3)">
                  {a.label}
                </text>
              )}
            </g>
          ))}
          {area &&
            series.slice(0, 1).map((s) => <path key={`a-${s.id}`} d={areaGen(s.values) ?? ""} fill={s.color} opacity={0.1} />)}
          {series.map((s) => (
            <path key={s.id} d={lineGen(s.values) ?? ""} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          ))}
          {markers.map((mk, i) => (
            <circle key={i} cx={x(mk.x)} cy={y(mk.y)} r={4.5} fill={mk.color} stroke="var(--chart-surface)" strokeWidth={2} />
          ))}
          {!narrow &&
            hover == null &&
            series.map((s) => {
              const last = [...s.values].reverse().find((v) => v.y != null);
              if (!last) return null;
              return (
                <g key={`end-${s.id}`} transform={`translate(${x(last.x)},${y(last.y as number)})`}>
                  <circle r={4.5} fill={s.color} stroke="var(--chart-surface)" strokeWidth={2} />
                  <text x={9} dy="0.32em" fontSize="11.5" fill="var(--ink-2)" className="num">
                    {yFormat(last.y as number)}
                  </text>
                </g>
              );
            })}
          {hx != null && (
            <g>
              <line x1={x(hx)} x2={x(hx)} y1={0} y2={ih} stroke="var(--ink-3)" strokeOpacity="0.6" />
              {series.map((s) => {
                const v = s.values[hover!];
                if (!v || v.y == null) return null;
                return <circle key={s.id} cx={x(v.x)} cy={y(v.y)} r={5} fill={s.color} stroke="var(--chart-surface)" strokeWidth={2} />;
              })}
            </g>
          )}
          <rect width={iw} height={ih} fill="transparent" />
        </g>
      </svg>
      {hx != null && (
        <div
          className="tooltip"
          style={{
            left: flip ? undefined : tooltipLeft + 14,
            right: flip ? width - tooltipLeft + 14 : undefined,
            top: m.top + 4,
          }}
        >
          <p className="mb-1 font-semibold text-ink">{xFormat(hx)}</p>
          {series.map((s) => {
            const v = s.values[hover!];
            return (
              <p key={s.id} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-ink-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                  {s.label}
                </span>
                <span className="num font-medium text-ink">{v?.y != null ? yFormat(v.y) : "—"}</span>
              </p>
            );
          })}
        </div>
      )}
    </div>
  );
}
