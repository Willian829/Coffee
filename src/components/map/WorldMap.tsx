import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { geoEqualEarth, geoPath, type GeoProjection } from "d3-geo";
import { zoom as d3zoom, zoomIdentity, type ZoomBehavior } from "d3-zoom";
import { select } from "d3-selection";
import "d3-transition";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { countries, TROPIC } from "../../lib/geo";
import { useElementWidth } from "../../lib/hooks";

export type MapProps = {
  /** valor por ISO numérico */
  values?: Map<string, number>;
  colorFor?: (v: number | undefined, iso: string) => string;
  selected?: string | null;
  onSelect?: (iso: string | null) => void;
  tooltip?: (iso: string, name: string) => ReactNode;
  belt?: boolean;
  aspect?: number;
  /** elementos extras desenhados sobre o mapa (recebem a projeção) */
  overlay?: (projection: GeoProjection, k: number) => ReactNode;
  ariaLabel: string;
  interactiveCountries?: boolean;
  dimOthers?: boolean;
};

export default function WorldMap({
  values,
  colorFor,
  selected,
  onSelect,
  tooltip,
  belt = true,
  aspect = 0.5,
  overlay,
  ariaLabel,
  interactiveCountries = true,
  dimOthers = false,
}: MapProps) {
  const [wrapRef, width] = useElementWidth<HTMLDivElement>(900);
  const height = Math.round(width * aspect);
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const zoomRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const [k, setK] = useState(1);
  const [hover, setHover] = useState<{ iso: string; name: string; x: number; y: number } | null>(null);
  const clipId = `sphere-${useId().replace(/:/g, "")}`;

  const projection = useMemo(() => geoEqualEarth().fitExtent([[4, 4], [width - 4, height - 4]], countries), [width, height]);
  const path = useMemo(() => geoPath(projection), [projection]);
  const sphere = path({ type: "Sphere" }) ?? "";
  const yTop = projection([0, TROPIC])?.[1] ?? 0;
  const yBot = projection([0, -TROPIC])?.[1] ?? 0;

  const shapes = useMemo(
    () => countries.features.map((f) => ({ iso: String(f.id ?? ""), name: f.properties.name, d: path(f) ?? "" })),
    [path],
  );

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const z = d3zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8])
      .translateExtent([
        [0, 0],
        [width, height],
      ])
      .filter((event: Event) => {
        if (event.type === "wheel") return (event as WheelEvent).ctrlKey || (event as WheelEvent).metaKey;
        if (event.type.startsWith("touch")) return (event as TouchEvent).touches.length > 1;
        return !(event as MouseEvent).button;
      })
      .on("zoom", (e) => {
        gRef.current?.setAttribute("transform", e.transform.toString());
        setK(e.transform.k);
      });
    zoomRef.current = z;
    select(svg).call(z).on("dblclick.zoom", null);
    return () => {
      select(svg).on(".zoom", null);
    };
  }, [width, height]);

  const zoomBy = (f: number) => {
    const svg = svgRef.current;
    if (svg && zoomRef.current) select(svg).transition().duration(450).call(zoomRef.current.scaleBy, f);
  };
  const reset = () => {
    const svg = svgRef.current;
    if (svg && zoomRef.current) select(svg).transition().duration(500).call(zoomRef.current.transform, zoomIdentity);
  };

  const onMove = (e: React.PointerEvent, iso: string, name: string) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    setHover({ iso, name, x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div ref={wrapRef} className="relative w-full">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        role="img"
        aria-label={ariaLabel}
        className="block cursor-grab active:cursor-grabbing"
        style={{ touchAction: "pan-y" }}
        onClick={(e) => {
          if (e.target === svgRef.current) onSelect?.(null);
        }}
      >
        <defs>
          <clipPath id={clipId}>
            <path d={sphere} />
          </clipPath>
        </defs>
        <g ref={gRef}>
          <path d={sphere} fill="var(--surface-2)" opacity="0.55" />
          {belt && (
            <g clipPath={`url(#${clipId})`}>
              <rect x={0} y={yTop} width={width} height={yBot - yTop} fill="var(--accent)" opacity="0.07" />
              <line x1={0} x2={width} y1={yTop} y2={yTop} stroke="var(--accent)" strokeOpacity="0.45" strokeWidth={1 / k} />
              <line x1={0} x2={width} y1={yBot} y2={yBot} stroke="var(--accent)" strokeOpacity="0.45" strokeWidth={1 / k} />
            </g>
          )}
          {shapes.map((s) => {
            const v = values?.get(s.iso);
            const fill = colorFor ? colorFor(v, s.iso) : "var(--map-empty)";
            const isSel = selected === s.iso;
            const isHover = hover?.iso === s.iso;
            return (
              <path
                key={s.iso + s.name}
                d={s.d}
                fill={fill}
                stroke={isSel || isHover ? "var(--ink)" : "var(--map-stroke)"}
                strokeWidth={(isSel ? 1.6 : isHover ? 1.1 : 0.5) / k}
                opacity={dimOthers && selected && !isSel ? 0.55 : 1}
                style={{ transition: "fill .5s ease, opacity .3s" }}
                className={interactiveCountries ? "cursor-pointer" : undefined}
                onPointerMove={interactiveCountries ? (e) => onMove(e, s.iso, s.name) : undefined}
                onPointerLeave={interactiveCountries ? () => setHover(null) : undefined}
                onClick={
                  interactiveCountries
                    ? (e) => {
                        e.stopPropagation();
                        onSelect?.(s.iso === selected ? null : s.iso);
                      }
                    : undefined
                }
              />
            );
          })}
          {overlay?.(projection, k)}
        </g>
      </svg>

      <div className="absolute bottom-3 right-3 flex flex-col gap-1.5">
        <button type="button" onClick={() => zoomBy(1.6)} className="grid h-9 w-9 place-items-center rounded-full border border-line bg-surface text-ink-2 shadow-soft hover:text-ink" aria-label="Aproximar">
          <Plus size={16} />
        </button>
        <button type="button" onClick={() => zoomBy(1 / 1.6)} className="grid h-9 w-9 place-items-center rounded-full border border-line bg-surface text-ink-2 shadow-soft hover:text-ink" aria-label="Afastar">
          <Minus size={16} />
        </button>
        {k > 1.01 && (
          <button type="button" onClick={reset} className="grid h-9 w-9 place-items-center rounded-full border border-line bg-surface text-ink-2 shadow-soft hover:text-ink" aria-label="Restaurar zoom">
            <RotateCcw size={15} />
          </button>
        )}
      </div>

      {hover && tooltip && (
        <div
          className="tooltip"
          style={{
            left: hover.x > width * 0.65 ? undefined : hover.x + 14,
            right: hover.x > width * 0.65 ? width - hover.x + 14 : undefined,
            top: Math.max(4, hover.y - 10),
          }}
        >
          {tooltip(hover.iso, hover.name)}
        </div>
      )}
    </div>
  );
}
