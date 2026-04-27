import { useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { Map as MapIcon, Plus, Minus, RotateCcw } from "lucide-react";
import { TrafficHeatmap } from "./TrafficHeatmap";
import { Legend } from "recharts";
import { useCountryMapData, useTrafficHeatmap } from "@/hooks/useApi";
import { Card } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface OverviewGeoTrafficProps {
  projectId: string;
}

const GEO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

function normalizeCountryName(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function OverviewGeoTraffic({ projectId }: OverviewGeoTrafficProps) {
  const { data: countryMapData, isLoading: countryMapLoading } =
    useCountryMapData(projectId);

  const { data: heatmapData, isLoading: heatmapLoading } =
    useTrafficHeatmap(projectId);
  const [hoveredCountry, setHoveredCountry] = useState<{
    name: string;
    count: number;
  } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([0, 20]);
  const [mapLoading, setMapLoading] = useState(true);

  const maxCount = Math.max(countryMapData?.max_count || 1, 1);

  if (countryMapLoading || heatmapLoading) {
    return (
      <div className="grid gap-4 xl:grid-cols-[2fr_1fr] items-stretch">
        <Card className="p-2 sm:p-3 overflow-hidden h-128 flex flex-col">
          <div className="mb-2 flex items-center justify-between px-1 sm:px-2">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground/90">
              <MapIcon className="h-4 w-4 text-primary" />
              <span>World Traffic</span>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <LoadingSpinner />
          </div>
        </Card>

        <Card className="p-4 sm:p-5 h-128 flex flex-col overflow-hidden">
          <h3 className="text-3xl font-semibold tracking-tight mb-4">
            Traffic
          </h3>
          <div className="border-t border-border mb-4" />
          <div className="flex-1 flex items-center justify-center">
            <LoadingSpinner />
          </div>
        </Card>
      </div>
    );
  }

  function getCountryData(geo: any) {
    const props = geo.properties;

    const name =
      props.NAME || props.NAME_LONG || props.ADMIN || props.name || "";

    const iso2 = props.ISO_A2 || props.ISO2 || props.iso_a2 || "";

    const code = String(iso2).toUpperCase();

    const info =
      countryMapData?.by_code?.[code] ||
      countryMapData?.by_name?.[normalizeCountryName(name)];

    const count = info?.count ?? 0;
    const intensity = count > 0 ? count / maxCount : 0;

    return {
      name: info?.name || name,
      count,
      intensity,
    };
  }

  return (
    <section className="grid xl:grid-cols-[2fr_1fr] border-y border-border/60">
      <div className="flex flex-col border-r border-border/60">
        <div className="px-4 md:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium">
            <MapIcon className="h-4 w-4 text-muted-foreground" />
            <span>World Traffic</span>
          </div>

          <div className="flex items-center gap-1">
            <IconBtn onClick={() => setZoom((z) => Math.max(1, z - 0.25))}>
              <Minus className="h-3.5 w-3.5" />
            </IconBtn>

            <IconBtn onClick={() => setZoom((z) => Math.min(5, z + 0.25))}>
              <Plus className="h-3.5 w-3.5" />
            </IconBtn>

            <IconBtn
              onClick={() => {
                setZoom(1);
                setCenter([0, 20]);
              }}
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </IconBtn>
          </div>
        </div>
        <div className="relative flex-1 min-h-105">
          {mapLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/70 z-10">
              <LoadingSpinner />
            </div>
          )}

          <ComposableMap
            width={980}
            height={400}
            projectionConfig={{
              rotate: [-10, 0, 0],
              scale: 250,
            }}
            className="w-full h-full"
          >
            <ZoomableGroup
              zoom={zoom}
              center={center}
              onMoveEnd={({ coordinates, zoom: nextZoom }) => {
                setCenter(coordinates as [number, number]);
                setZoom(nextZoom);
              }}
              minZoom={1}
              maxZoom={5}
            >
              <Geographies geography={GEO_URL}>
                {({ geographies }) => {
                  if (geographies.length && mapLoading) {
                    setMapLoading(false);
                  }

                  return geographies.map((geo) => {
                    const { name, count, intensity } = getCountryData(geo);

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        onMouseEnter={() => {
                          if (count > 0) {
                            setHoveredCountry({ name, count });
                          }
                        }}
                        onMouseLeave={() => setHoveredCountry(null)}
                        className={getGeoClass(intensity)}
                        strokeWidth={count > 0 ? 0.8 : 0.4}
                      />
                    );
                  });
                }}
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>
        </div>

        <div className="px-4 md:px-6 py-3 border-t border-border/60 flex items-center justify-between text-xs">
          <div className="text-muted-foreground min-h-4">
            {hoveredCountry
              ? `${hoveredCountry.name}: ${hoveredCountry.count.toLocaleString()}`
              : "Hover a country"}
          </div>

          <Legend />
        </div>
      </div>

      <TrafficHeatmap data={heatmapData} />
    </section>
  );
}

type IconBtnProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

function IconBtn({ children, ...props }: IconBtnProps) {
  return (
    <button
      {...props}
      className="
        h-7 w-7 flex items-center justify-center
        border border-border/60
        hover:bg-muted/20 transition
      "
    >
      {children}
    </button>
  );
}

function getGeoClass(intensity: number) {
  if (intensity === 0) {
    return "fill-muted hover:fill-muted/40 transition";
  }

  return `
    fill-primary/50
    hover:fill-primary/80
    stroke-primary/60
    transition
    cursor-pointer
  `;
}
