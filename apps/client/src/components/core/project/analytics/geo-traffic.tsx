import { useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";

import { ActionIcon, Group, Stack, Text } from "@mantine/core";

import { Minus, Plus, RotateCcw } from "lucide-react";

import { analyticsHooks } from "@/hooks/queries/use-analytics";
import { LoadingBanner } from "@/components/core/loading-banner";
import { ErrorBanner } from "@/components/core/error-banner";

interface OverviewGeoTrafficProps {
  projectId: string;
}

const GEO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export function GeoTraffic({ projectId }: OverviewGeoTrafficProps) {
  const { data, isLoading, error } =
    analyticsHooks.useCountryMapData(projectId);

  const [hoveredCountry, setHoveredCountry] = useState<{
    name: string;
    count: number;
  } | null>(null);

  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([0, 20]);

  const maxCount = Math.max(data?.max_count ?? 1, 1);

  function getCountryData(geo: any) {
    const props = geo.properties;

    const name =
      props.NAME || props.NAME_LONG || props.ADMIN || props.name || "";

    const iso2 = props.ISO_A2 || props.ISO2 || props.iso_a2 || "";

    const code = String(iso2).toUpperCase();

    const info =
      data?.by_code?.[code] || data?.by_name?.[normalizeCountryName(name)];

    const count = info?.count ?? 0;

    return {
      name: info?.name || name,
      count,
      intensity: count > 0 ? count / maxCount : 0,
    };
  }

  if (isLoading) {
    return <LoadingBanner label="Loading geographic traffic..." />;
  }

  if (error) {
    return (
      <ErrorBanner error={error} label="Failed to load geographic traffic." />
    );
  }

  return (
    <Stack gap={0}>
      <Group justify="space-between" className="px-5 md:px-6 py-5">
        <div>
          <Text fw={600} size="sm">
            Geographic Traffic
          </Text>

          <Text size="sm" c="dimmed">
            Visitor distribution by country
          </Text>
        </div>

        <Group gap={4}>
          <ActionIcon
            variant="subtle"
            onClick={() => setZoom((z) => Math.max(1, z - 0.25))}
          >
            <Minus size={14} />
          </ActionIcon>

          <ActionIcon
            variant="subtle"
            onClick={() => setZoom((z) => Math.min(5, z + 0.25))}
          >
            <Plus size={14} />
          </ActionIcon>

          <ActionIcon
            variant="subtle"
            onClick={() => {
              setZoom(1);
              setCenter([0, 20]);
            }}
          >
            <RotateCcw size={14} />
          </ActionIcon>
        </Group>
      </Group>

      <div className="px-2 md:px-4">
        <div
          style={{
            width: "100%",
            height: 380,
          }}
        >
          <ComposableMap
            projectionConfig={{
              rotate: [-10, 0, 0],
              scale: 400,
            }}
            style={{
              width: "100%",
              height: "100%",
            }}
          >
            <ZoomableGroup
              zoom={zoom}
              center={center}
              minZoom={1}
              maxZoom={5}
              onMoveEnd={({ coordinates, zoom }) => {
                setCenter(coordinates as [number, number]);

                setZoom(zoom);
              }}
            >
              <Geographies geography={GEO_URL}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const { name, count, intensity } = getCountryData(geo);

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        onMouseEnter={() => {
                          if (count > 0) {
                            setHoveredCountry({
                              name,
                              count,
                            });
                          }
                        }}
                        onMouseLeave={() => setHoveredCountry(null)}
                        style={{
                          default: {
                            fill:
                              intensity === 0
                                ? "var(--mantine-color-gray-3)"
                                : `rgba(34,184,207,${0.2 + intensity * 0.8})`,
                            stroke: "var(--mantine-color-gray-5)",
                            strokeWidth: count > 0 ? 0.6 : 0.3,
                            outline: "none",
                          },
                          hover: {
                            fill:
                              intensity === 0
                                ? "var(--mantine-color-gray-4)"
                                : "var(--mantine-color-cyan-6)",
                            outline: "none",
                          },
                          pressed: {
                            outline: "none",
                          },
                        }}
                      />
                    );
                  })
                }
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>
        </div>
      </div>

      <Group justify="space-between" className="px-5 md:px-6 py-4">
        <Text size="sm" c="dimmed">
          {hoveredCountry
            ? `${hoveredCountry.name} • ${hoveredCountry.count.toLocaleString()}`
            : "Hover a country"}
        </Text>

        <Group gap={8}>
          <LegendDot opacity={0.25} />
          <LegendDot opacity={0.5} />
          <LegendDot opacity={0.75} />
          <LegendDot opacity={1} />
        </Group>
      </Group>
    </Stack>
  );
}

function LegendDot({ opacity }: { opacity: number }) {
  return (
    <div
      style={{
        width: 10,
        height: 10,
        borderRadius: 2,
        background: "rgb(34,184,207)",
        opacity,
      }}
    />
  );
}

function normalizeCountryName(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
