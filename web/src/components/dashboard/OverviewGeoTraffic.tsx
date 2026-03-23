import { useMemo, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { Map as MapIcon, Plus, Minus, RotateCcw } from "lucide-react";
import { useCountryData, useRecentEventsFormatted } from "../../hooks/useApi";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { LoadingSpinner } from "../LoadingSpinner";

interface OverviewGeoTrafficProps {
  projectId: string;
}

const GEO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function hourLabel(hour: number): string {
  if (hour === 0) return "12am";
  if (hour < 12) return `${hour}am`;
  if (hour === 12) return "12pm";
  return `${hour - 12}pm`;
}

// Enhanced country matching function following React Simple Maps best practices
function matchCountry(
  countryData: Array<{ name: string; count: number }>,
  geoCountryName: string,
  iso2: string,
): number {
  if (!countryData || countryData.length === 0) return 0;

  // Normalize inputs - handle potential undefined values
  const geoName = (geoCountryName || "").toLowerCase().trim();
  const geoIso = (iso2 || "").toLowerCase().trim();

  // Try direct matching with API data
  for (const country of countryData) {
    const apiName = country.name.toLowerCase().trim();

    // Direct exact match
    if (apiName === geoName) return country.count;

    // ISO code matching
    if (geoIso && apiName === geoIso) return country.count;

    // Enhanced country variations matching
    const isMatch =
      // United States variations
      (["united states", "usa", "us", "america"].includes(apiName) &&
        (geoName.includes("united states") ||
          geoName.includes("america") ||
          geoIso === "us")) ||
      // United Kingdom variations
      (["united kingdom", "uk", "great britain", "britain"].includes(apiName) &&
        (geoName.includes("kingdom") ||
          geoName.includes("britain") ||
          geoIso === "gb")) ||
      // Common country matches with better pattern matching
      (apiName === "russia" &&
        (geoName.includes("russia") ||
          geoName.includes("federation") ||
          geoIso === "ru")) ||
      (apiName === "china" &&
        (geoName.includes("china") ||
          geoName.includes("peoples") ||
          geoIso === "cn")) ||
      (apiName === "india" && (geoName.includes("india") || geoIso === "in")) ||
      (apiName === "germany" &&
        (geoName.includes("germany") || geoIso === "de")) ||
      (apiName === "france" &&
        (geoName.includes("france") || geoIso === "fr")) ||
      (apiName === "italy" && (geoName.includes("italy") || geoIso === "it")) ||
      (apiName === "spain" && (geoName.includes("spain") || geoIso === "es")) ||
      (apiName === "canada" &&
        (geoName.includes("canada") || geoIso === "ca")) ||
      // Additional common patterns
      (apiName.includes("korea") &&
        geoName.includes("korea") &&
        !geoName.includes("north")) ||
      (apiName.includes("south africa") && geoName.includes("south africa")) ||
      (apiName === "australia" &&
        (geoName.includes("australia") || geoIso === "au")) ||
      (apiName === "brazil" &&
        (geoName.includes("brazil") || geoIso === "br")) ||
      (apiName === "japan" && (geoName.includes("japan") || geoIso === "jp")) ||
      (apiName === "netherlands" &&
        (geoName.includes("netherlands") || geoIso === "nl"));

    if (isMatch) {
      return country.count;
    }
  }

  return 0;
}

export function OverviewGeoTraffic({ projectId }: OverviewGeoTrafficProps) {
  const { data: countries, isLoading: countriesLoading } =
    useCountryData(projectId);
  const { data: events, isLoading: eventsLoading } = useRecentEventsFormatted(
    projectId,
    1000,
  );
  const [hoveredCountry, setHoveredCountry] = useState<{
    name: string;
    count: number;
  } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([0, 20]);
  const [mapLoading, setMapLoading] = useState(true);

  const maxCount = useMemo(() => {
    if (!countries || countries.length === 0) return 1;
    return Math.max(...countries.map((c) => c.count), 1);
  }, [countries]);

  const trafficMatrix = useMemo(() => {
    const grid = Array.from({ length: 24 }, () => Array(7).fill(0));

    for (const event of events || []) {
      const date = new Date(event.created_at);
      const day = date.getDay();
      const hour = date.getHours();
      grid[hour][day] += 1;
    }

    let maxValue = 0;
    for (const row of grid) {
      for (const value of row) {
        if (value > maxValue) maxValue = value;
      }
    }

    return { grid, maxValue };
  }, [events]);

  if (countriesLoading || eventsLoading) {
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

  return (
    <div className="grid gap-4 xl:grid-cols-[2fr_1fr] items-stretch">
      <Card className="p-2 sm:p-3 overflow-hidden h-128 flex flex-col">
        <div className="mb-2 flex items-center justify-between px-1 sm:px-2">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground/90">
            <MapIcon className="h-4 w-4 text-primary" />
            <span>World Traffic</span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => setZoom((prev) => Math.max(1, prev - 0.25))}
            >
              <Minus className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => setZoom((prev) => Math.min(5, prev + 0.25))}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => {
                setZoom(1);
                setCenter([0, 20]);
              }}
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 rounded-xl border border-border/70 bg-background dark:bg-card overflow-hidden min-h-87.5 relative">
          {mapLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 dark:bg-background/90 z-10">
              <div className="flex flex-col items-center gap-2">
                <LoadingSpinner />
                <span className="text-sm text-muted-foreground">
                  Loading world map...
                </span>
              </div>
            </div>
          )}

          <ComposableMap
            width={980}
            height={400}
            projectionConfig={{
              rotate: [-10, 0, 0],
            }}
            className="w-full h-full"
            style={{ minHeight: "350px" }}
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
                  if (geographies.length > 0 && mapLoading) {
                    setMapLoading(false);
                  }

                  if (mapLoading || geographies.length === 0) {
                    return (
                      <g>
                        <rect
                          x="0"
                          y="0"
                          width="980"
                          height="400"
                          className="fill-muted/10 stroke-border"
                          strokeWidth="1"
                        />
                        <circle
                          cx="490"
                          cy="200"
                          r="20"
                          fill="none"
                          className="stroke-primary"
                          strokeWidth="3"
                        >
                          <animate
                            attributeName="stroke-dasharray"
                            values="0 125;31 125;62 125;94 125"
                            dur="2s"
                            repeatCount="indefinite"
                          />
                        </circle>
                        <text
                          x="490"
                          y="240"
                          textAnchor="middle"
                          className="fill-muted-foreground"
                          fontSize="14"
                        >
                          Loading world map...
                        </text>
                      </g>
                    );
                  }

                  return geographies.map((geo) => {
                    const { properties } = geo;
                    const countryName =
                      properties.NAME ||
                      properties.NAME_LONG ||
                      properties.ADMIN ||
                      properties.name ||
                      "";
                    const iso2 =
                      properties.ISO_A2 ||
                      properties.ISO2 ||
                      properties.iso_a2 ||
                      "";

                    const count = matchCountry(
                      countries || [],
                      countryName,
                      iso2,
                    );
                    const intensity = count > 0 ? count / maxCount : 0;
                    const isActive = count > 0;

                    const getFillClass = () => {
                      if (!isActive) return "fill-muted dark:fill-muted";

                      if (intensity >= 0.8)
                        return "fill-primary/90 dark:fill-primary/80";
                      if (intensity >= 0.6)
                        return "fill-primary/75 dark:fill-primary/70";
                      if (intensity >= 0.4)
                        return "fill-primary/60 dark:fill-primary/55";
                      if (intensity >= 0.2)
                        return "fill-primary/45 dark:fill-primary/40";
                      return "fill-primary/30 dark:fill-primary/25";
                    };

                    const getStrokeClass = () => {
                      if (!isActive)
                        return "stroke-border/50 dark:stroke-border/40";
                      return intensity >= 0.5
                        ? "stroke-primary/80 dark:stroke-primary/70"
                        : "stroke-primary/60 dark:stroke-primary/50";
                    };

                    const getStrokeWidth = () => {
                      if (!isActive) return 0.4;
                      return intensity >= 0.5 ? 1 : 0.7;
                    };

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        onMouseEnter={() => {
                          if (isActive) {
                            setHoveredCountry({ name: countryName, count });
                          }
                        }}
                        onMouseLeave={() => setHoveredCountry(null)}
                        className={`${getFillClass()} ${getStrokeClass()} transition-all duration-150 ease-in-out outline-none ${
                          isActive
                            ? "cursor-pointer hover:fill-primary/95 dark:hover:fill-primary/90 hover:stroke-primary dark:hover:stroke-primary/90 hover:opacity-95"
                            : "cursor-default hover:fill-muted/30 dark:hover:fill-muted/20"
                        }`}
                        strokeWidth={getStrokeWidth()}
                      />
                    );
                  });
                }}
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>
        </div>

        <div className="mt-2 px-1 text-xs">
          <div className="flex items-center justify-between">
            <div className="text-muted-foreground min-h-5">
              {hoveredCountry
                ? `${hoveredCountry.name}: ${hoveredCountry.count.toLocaleString()} events`
                : "Hover a highlighted country to see event volume"}
            </div>

            {countries && countries.length > 0 && (
              <div className="hidden sm:flex items-center gap-2 text-[10px] text-muted-foreground">
                <span>Traffic:</span>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-2 rounded-sm bg-primary/30 dark:bg-primary/25"></div>
                  <span>Low</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-2 rounded-sm bg-primary/60 dark:bg-primary/55"></div>
                  <span>Med</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-2 rounded-sm bg-primary/90 dark:bg-primary/80"></div>
                  <span>High</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-4 sm:p-5 h-128 flex flex-col overflow-hidden">
        <h3 className="text-3xl font-semibold tracking-tight mb-4">Traffic</h3>
        <div className="border-t border-border mb-4" />

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-[44px_repeat(7,minmax(0,1fr))] gap-x-2 gap-y-1.5 text-sm">
            <div />
            {DAYS.map((day) => (
              <div
                key={day}
                className="text-center font-semibold text-foreground/90"
              >
                {day}
              </div>
            ))}

            {Array.from({ length: 24 }).map((_, hour) => (
              <div key={`row-${hour}`} className="contents">
                <div
                  key={`label-${hour}`}
                  className="text-muted-foreground text-right pr-1"
                >
                  {hourLabel(hour)}
                </div>
                {Array.from({ length: 7 }).map((__, day) => {
                  const value = trafficMatrix.grid[hour][day];
                  const intensity =
                    trafficMatrix.maxValue > 0
                      ? value / trafficMatrix.maxValue
                      : 0;

                  let dotClass = "bg-muted/40";
                  if (intensity > 0.75) dotClass = "bg-primary";
                  else if (intensity > 0.45) dotClass = "bg-primary/75";
                  else if (intensity > 0.15) dotClass = "bg-primary/45";
                  else if (intensity > 0) dotClass = "bg-primary/25";

                  return (
                    <div
                      key={`${hour}-${day}`}
                      className="flex items-center justify-center"
                    >
                      <span className={`h-4 w-4 rounded-full ${dotClass}`} />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
