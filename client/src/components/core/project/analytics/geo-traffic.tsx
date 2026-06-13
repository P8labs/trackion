import { useEffect, useState } from "react";
import { Group, Stack, Text } from "@mantine/core";
import { analyticsHooks } from "@/hooks/queries/use-analytics";
import { LoadingBanner } from "@/components/core/loading-banner";
import { ErrorBanner } from "@/components/core/error-banner";
import { ChoroplethMap } from "mantine-choropleth";
import type { CountryMapData } from "@/types";

interface OverviewGeoTrafficProps {
  projectId: string;
}

export function GeoTraffic({ projectId }: OverviewGeoTrafficProps) {
  const { data, isLoading, error } =
    analyticsHooks.useCountryMapData(projectId);

  const [geoJson, setGeoJson] = useState<any | null>();

  function transformdata(data: CountryMapData) {
    // to  { id: 'United States of America', value: 100, label: 'United States of America' },
    const transformed: { id: string; value: number; label: string }[] = [];

    for (const country of data.countries) {
      transformed.push({
        id: country.name,
        value: country.count,
        label: country.name,
      });
    }
    return transformed;
  }

  useEffect(() => {
    // Load world GeoJSON
    // fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson')
    // fetch(
    //   "https://raw.githubusercontent.com/johan/world.geo.json/refs/heads/master/countries.geo.json",
    // )
    fetch(
      "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson",
    )
      .then((res) => res.json())
      .then((data) => setGeoJson(data));
  }, []);
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
      </Group>

      <div className="px-2 md:px-4">
        {data && (
          <ChoroplethMap
            mapData={geoJson}
            data={transformdata(data)}
            propertyKey="NAME_EN"
            height={500}
            projection="naturalEarth1"
            zoomEnabled
            tooltipMode="combined"
            animated
            legend={{
              show: true,
              position: "bottom-right",
              title: "Visitors",
              ticks: 5,
            }}
          />
        )}
      </div>
    </Stack>
  );
}
