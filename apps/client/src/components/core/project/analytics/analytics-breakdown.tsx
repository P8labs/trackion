import {
  FaAndroid,
  FaApple,
  FaEnvelope,
  FaChrome,
  FaDesktop,
  FaEdge,
  FaFirefoxBrowser,
  FaGlobe,
  FaInternetExplorer,
  FaLink,
  FaMobileAlt,
  FaOpera,
  FaSafari,
  FaSearch,
  FaShareAlt,
  FaTag,
  FaTabletAlt,
} from "react-icons/fa";
import { LoadingBanner } from "@/components/core/loading-banner";
import { analyticsHooks } from "@/hooks/queries/use-analytics";
import {
  Center,
  Divider,
  Grid,
  Group,
  Stack,
  Tabs,
  TabsList,
  TabsPanel,
  TabsTab,
  Text,
} from "@mantine/core";

interface AnalyticsBreakdownProps {
  projectId: string;
}

const DEVICE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function TrafficSourcesList({
  data,
  iconType = "traffic",
}: {
  data: Array<{
    name: string;
    count: number;
  }>;
  iconType?:
    | "traffic"
    | "device"
    | "browser"
    | "referrer"
    | "utm_source"
    | "utm_medium";
}) {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  function getIcon(name: string) {
    switch (iconType) {
      case "device":
        return getDeviceIcon(name);

      case "browser":
        return getBrowserIcon(name);

      case "referrer":
        return getReferrerIcon(name);

      case "utm_source":
        return getUtmSourceIcon(name);

      case "utm_medium":
        return getUtmMediumIcon(name);

      default:
        return null;
    }
  }

  return (
    <Stack gap={0}>
      {data.slice(0, 6).map((source, index) => {
        const percentage = total > 0 ? (source.count / total) * 100 : 0;

        const icon = getIcon(source.name);

        return (
          <div key={source.name}>
            <Group justify="space-between" className="px-5 md:px-6 py-3">
              <Group gap="sm" wrap="nowrap">
                {icon ?? (
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 999,
                      background: DEVICE_COLORS[index % DEVICE_COLORS.length],
                    }}
                  />
                )}

                <Text size="sm" truncate>
                  {source.name}
                </Text>
              </Group>

              <div
                style={{
                  textAlign: "right",
                }}
              >
                <Text fw={600} size="sm">
                  {source.count.toLocaleString()}
                </Text>

                <Text size="xs" c="dimmed">
                  {percentage.toFixed(1)}%
                </Text>
              </div>
            </Group>

            {index !== Math.min(data.length, 6) - 1 && <Divider />}
          </div>
        );
      })}
    </Stack>
  );
}

interface AnalyticsBreakdownProps {
  projectId: string;
}

export function AnalyticsBreakdown({ projectId }: AnalyticsBreakdownProps) {
  const { data: deviceData, isLoading: deviceLoading } =
    analyticsHooks.useDeviceAnalytics(projectId);

  const { data: trafficData, isLoading: trafficLoading } =
    analyticsHooks.useTrafficSources(projectId);

  return (
    <Grid>
      <Grid.Col span={{ base: 12, lg: 6 }}>
        <Tabs defaultValue="devices">
          <div className="px-5 md:px-6 py-5">
            <Text fw={600} size="sm">
              Device Analytics
            </Text>

            <Text size="sm" c="dimmed">
              Breakdown by device and browser
            </Text>

            <TabsList>
              <TabsTab value="devices">Devices</TabsTab>

              <TabsTab value="browsers">Browsers</TabsTab>
            </TabsList>
          </div>

          <TabsPanel value="devices">
            {deviceLoading ? (
              <LoadingBanner />
            ) : deviceData?.devices?.length ? (
              <TrafficSourcesList data={deviceData.devices} iconType="device" />
            ) : (
              <EmptyState label="No device data available" />
            )}
          </TabsPanel>

          <TabsPanel value="browsers">
            {deviceLoading ? (
              <LoadingBanner />
            ) : deviceData?.browsers?.length ? (
              <TrafficSourcesList
                data={deviceData.browsers}
                iconType="browser"
              />
            ) : (
              <EmptyState label="No browser data available" />
            )}
          </TabsPanel>
        </Tabs>
      </Grid.Col>

      <Grid.Col span={{ base: 12, lg: 6 }}>
        <Tabs defaultValue="referrers">
          <div className="px-5 md:px-6 py-5">
            <Text fw={600} size="sm">
              Traffic Sources
            </Text>

            <Text size="sm" c="dimmed">
              Where your visitors come from
            </Text>

            <TabsList>
              <TabsTab value="referrers">Referrers</TabsTab>

              <TabsTab value="utm_sources">UTM Source</TabsTab>

              <TabsTab value="utm_mediums">UTM Medium</TabsTab>
            </TabsList>
          </div>

          <TabsPanel value="referrers">
            {trafficLoading ? (
              <LoadingBanner />
            ) : trafficData?.referrers?.length ? (
              <TrafficSourcesList
                data={trafficData.referrers}
                iconType="referrer"
              />
            ) : (
              <EmptyState label="No referrer data available" />
            )}
          </TabsPanel>

          <TabsPanel value="utm_sources">
            {trafficLoading ? (
              <LoadingBanner />
            ) : trafficData?.utm_sources?.length ? (
              <TrafficSourcesList
                data={trafficData.utm_sources}
                iconType="utm_source"
              />
            ) : (
              <EmptyState label="No UTM source data available" />
            )}
          </TabsPanel>

          <TabsPanel value="utm_mediums">
            {trafficLoading ? (
              <LoadingBanner />
            ) : trafficData?.utm_mediums?.length ? (
              <TrafficSourcesList
                data={trafficData.utm_mediums}
                iconType="utm_medium"
              />
            ) : (
              <EmptyState label="No UTM medium data available" />
            )}
          </TabsPanel>
        </Tabs>
      </Grid.Col>
    </Grid>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <Center py="xl">
      <Stack gap={4} align="center">
        <Text size="sm" c="dimmed">
          {label}
        </Text>
      </Stack>
    </Center>
  );
}

function getDeviceIcon(deviceName: string) {
  const normalized = deviceName.toLowerCase();
  if (normalized.includes("ipad") || normalized.includes("tablet")) {
    return <FaTabletAlt className="h-4 w-4 text-muted-foreground" />;
  }
  if (normalized.includes("iphone") || normalized.includes("ios")) {
    return <FaApple className="h-4 w-4 text-muted-foreground" />;
  }
  if (normalized.includes("android")) {
    return <FaAndroid className="h-4 w-4 text-muted-foreground" />;
  }
  if (normalized.includes("mobile")) {
    return <FaMobileAlt className="h-4 w-4 text-muted-foreground" />;
  }
  return <FaDesktop className="h-4 w-4 text-muted-foreground" />;
}

function getBrowserIcon(browserName: string) {
  const normalized = browserName.toLowerCase();
  if (normalized.includes("chrome") || normalized.includes("chromium")) {
    return <FaChrome className="h-4 w-4 text-muted-foreground" />;
  }
  if (normalized.includes("firefox")) {
    return <FaFirefoxBrowser className="h-4 w-4 text-muted-foreground" />;
  }
  if (normalized.includes("safari")) {
    return <FaSafari className="h-4 w-4 text-muted-foreground" />;
  }
  if (normalized.includes("edge")) {
    return <FaEdge className="h-4 w-4 text-muted-foreground" />;
  }
  if (normalized.includes("opera")) {
    return <FaOpera className="h-4 w-4 text-muted-foreground" />;
  }
  if (normalized.includes("explorer") || normalized.includes("ie")) {
    return <FaInternetExplorer className="h-4 w-4 text-muted-foreground" />;
  }
  return <FaGlobe className="h-4 w-4 text-muted-foreground" />;
}

function getReferrerIcon(referrerName: string) {
  const normalized = referrerName.toLowerCase();
  if (normalized.includes("direct")) {
    return <FaGlobe className="h-4 w-4 text-muted-foreground" />;
  }
  if (
    normalized.includes("google") ||
    normalized.includes("bing") ||
    normalized.includes("duckduckgo") ||
    normalized.includes("yahoo")
  ) {
    return <FaSearch className="h-4 w-4 text-muted-foreground" />;
  }
  if (
    normalized.includes("facebook") ||
    normalized.includes("instagram") ||
    normalized.includes("linkedin") ||
    normalized.includes("twitter") ||
    normalized.includes("x (") ||
    normalized.includes("reddit")
  ) {
    return <FaShareAlt className="h-4 w-4 text-muted-foreground" />;
  }
  return <FaLink className="h-4 w-4 text-muted-foreground" />;
}

function getUtmSourceIcon(sourceName: string) {
  const normalized = sourceName.toLowerCase();
  if (normalized === "none" || normalized === "direct") {
    return <FaGlobe className="h-4 w-4 text-muted-foreground" />;
  }
  if (normalized.includes("email")) {
    return <FaEnvelope className="h-4 w-4 text-muted-foreground" />;
  }
  if (
    normalized.includes("facebook") ||
    normalized.includes("instagram") ||
    normalized.includes("linkedin") ||
    normalized.includes("twitter") ||
    normalized.includes("x") ||
    normalized.includes("reddit")
  ) {
    return <FaShareAlt className="h-4 w-4 text-muted-foreground" />;
  }
  if (
    normalized.includes("google") ||
    normalized.includes("bing") ||
    normalized.includes("search")
  ) {
    return <FaSearch className="h-4 w-4 text-muted-foreground" />;
  }
  return <FaTag className="h-4 w-4 text-muted-foreground" />;
}

function getUtmMediumIcon(mediumName: string) {
  const normalized = mediumName.toLowerCase();
  if (normalized === "none" || normalized === "direct") {
    return <FaGlobe className="h-4 w-4 text-muted-foreground" />;
  }
  if (normalized.includes("email")) {
    return <FaEnvelope className="h-4 w-4 text-muted-foreground" />;
  }
  if (normalized.includes("referral")) {
    return <FaLink className="h-4 w-4 text-muted-foreground" />;
  }
  if (
    normalized.includes("social") ||
    normalized.includes("paid_social") ||
    normalized.includes("social_paid")
  ) {
    return <FaShareAlt className="h-4 w-4 text-muted-foreground" />;
  }
  if (
    normalized.includes("organic") ||
    normalized.includes("search") ||
    normalized.includes("cpc") ||
    normalized.includes("ppc")
  ) {
    return <FaSearch className="h-4 w-4 text-muted-foreground" />;
  }
  return <FaTag className="h-4 w-4 text-muted-foreground" />;
}
