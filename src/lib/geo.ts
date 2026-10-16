import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import world from "world-atlas/countries-110m.json";

export type CountryFeature = Feature<Geometry, { name: string }> & { id?: string | number };

const topo = world as unknown as Topology<{ countries: GeometryCollection<{ name: string }>; land: GeometryCollection }>;

const all = feature(topo, topo.objects.countries) as FeatureCollection<Geometry, { name: string }>;

/** Países sem a Antártida (id 010). */
export const countries: FeatureCollection<Geometry, { name: string }> = {
  type: "FeatureCollection",
  features: all.features.filter((f) => String(f.id) !== "010"),
};

export const TROPIC = 23.44;
