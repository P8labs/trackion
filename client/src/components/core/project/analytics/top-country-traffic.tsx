import { LoadingBanner } from "@/components/core/loading-banner";
import { analyticsHooks } from "@/hooks/queries/use-analytics";
import { Center, Divider, Group, Stack, Text } from "@mantine/core";

interface TopCountriesProps {
  projectId: string;
}

function getCountryFlag(
  countryName: string,
  emoji?: string,
  countryCode?: string,
): string {
  if (emoji && emoji.trim() !== "") {
    return emoji;
  }
  if (countryName.toLowerCase() === "unknown") {
    return "?";
  }
  if (countryCode && countryCode.trim() !== "") {
    return countryCode.toUpperCase();
  }
  return "?";
}

export function TopCountries({ projectId }: TopCountriesProps) {
  const { data, isLoading, error } = analyticsHooks.useTopCountries(projectId);

  const countries = data?.slice(0, 8) ?? [];

  return (
    <Stack gap={0}>
      <div className="px-5 md:px-6 py-5">
        <Text fw={600} size="sm">
          Top Countries
        </Text>

        <Text size="sm" c="dimmed">
          Visitor origin by country
        </Text>
      </div>

      {isLoading ? (
        <Center py="xl">
          <LoadingBanner />
        </Center>
      ) : error ? (
        <EmptyState label="No country data available" />
      ) : countries.length === 0 ? (
        <EmptyState label="No visitor data yet" />
      ) : (
        <Stack gap={0}>
          {countries.map((country, index) => {
            const flag = getCountryFlag(
              country.name,
              country.emoji,
              country.country_code,
            );

            return (
              <div key={country.name}>
                <Group justify="space-between" className="px-5 md:px-6 py-3">
                  <Group gap="sm" wrap="nowrap">
                    <Text
                      size="lg"
                      style={{
                        lineHeight: 1,
                      }}
                    >
                      {flag}
                    </Text>

                    <Text size="sm" truncate>
                      {country.name}
                    </Text>
                  </Group>

                  <Text fw={600} size="sm">
                    {country.count.toLocaleString()}
                  </Text>
                </Group>

                {index !== countries.length - 1 && <Divider />}
              </div>
            );
          })}
        </Stack>
      )}
    </Stack>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <Center py="xl">
      <Text size="sm" c="dimmed">
        {label}
      </Text>
    </Center>
  );
}
