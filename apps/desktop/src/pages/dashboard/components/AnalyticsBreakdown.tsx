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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDeviceAnalytics, useTrafficSources } from "@/hooks/useApi";
import { LoadingSpinner } from "@/components/LoadingSpinner";

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

function TrafficSourcesList({
  data,
  iconType = "traffic",
}: {
  data: Array<{ name: string; count: number }>;
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
    if (iconType === "device") {
      return getDeviceIcon(name);
    } else if (iconType === "browser") {
      return getBrowserIcon(name);
    } else if (iconType === "referrer") {
      return getReferrerIcon(name);
    } else if (iconType === "utm_source") {
      return getUtmSourceIcon(name);
    } else if (iconType === "utm_medium") {
      return getUtmMediumIcon(name);
    }
    return null;
  }

  return (
    <div className="divide-y divide-border/40 h-64">
      {data.slice(0, 6).map((source, index) => {
        const percentage = total > 0 ? (source.count / total) * 100 : 0;
        const icon = getIcon(source.name);

        return (
          <div
            key={source.name}
            className="flex items-center justify-between px-3 py-2 transition hover:bg-muted/20"
          >
            <div className="flex min-w-0 items-center gap-2">
              {icon ? (
                icon
              ) : (
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor:
                      DEVICE_COLORS[index % DEVICE_COLORS.length],
                  }}
                />
              )}
              <span className="truncate text-sm font-medium text-foreground">
                {source.name}
              </span>
            </div>
            <div className="text-right">
              <div className="font-mono text-sm text-foreground">
                {source.count}
              </div>
              <div className="text-[11px] text-muted-foreground">
                {percentage.toFixed(1)}%
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function AnalyticsBreakdown({ projectId }: AnalyticsBreakdownProps) {
  const { data: deviceData, isLoading: deviceLoading } =
    useDeviceAnalytics(projectId);
  const { data: trafficData, isLoading: trafficLoading } =
    useTrafficSources(projectId);

  return (
    <div className="grid border-b border-border/60 md:grid-cols-2">
      <section className="border-r border-border/60 h-90 flex flex-col">
        {deviceLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : (
          <Tabs defaultValue="devices" className="w-full flex flex-col flex-1">
            <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
              <div>
                <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  Device Analytics
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Breakdown by device and browser
                </p>
              </div>
              <TabsList className="h-7 bg-muted/40 p-0.5">
                <TabsTrigger value="devices" className="h-6 px-2 text-xs">
                  Devices
                </TabsTrigger>
                <TabsTrigger value="browsers" className="h-6 px-2 text-xs">
                  Browsers
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent
              value="devices"
              className="m-0 p-0 flex-1 overflow-y-auto"
            >
              {deviceData?.devices && deviceData.devices.length > 0 ? (
                <TrafficSourcesList
                  data={deviceData.devices}
                  iconType="device"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No device data available
                </div>
              )}
            </TabsContent>
            <TabsContent
              value="browsers"
              className="m-0 p-0 flex-1 overflow-y-auto"
            >
              {deviceData?.browsers && deviceData.browsers.length > 0 ? (
                <TrafficSourcesList
                  data={deviceData.browsers}
                  iconType="browser"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No browser data available
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </section>

      <section className="h-90 flex flex-col">
        {trafficLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : (
          <Tabs
            defaultValue="referrers"
            className="w-full flex flex-col flex-1"
          >
            <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
              <div>
                <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  Traffic Sources
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Where your visitors come from
                </p>
              </div>
              <TabsList className="h-7 bg-muted/40 p-0.5">
                <TabsTrigger value="referrers" className="h-6 px-2 text-xs">
                  Referrers
                </TabsTrigger>
                <TabsTrigger value="utm_sources" className="h-6 px-2 text-xs">
                  UTM Source
                </TabsTrigger>
                <TabsTrigger value="utm_mediums" className="h-6 px-2 text-xs">
                  UTM Medium
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent
              value="referrers"
              className="m-0 p-0 flex-1 overflow-y-auto"
            >
              {trafficData?.referrers && trafficData.referrers.length > 0 ? (
                <TrafficSourcesList
                  data={trafficData.referrers}
                  iconType="referrer"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No referrer data available
                </div>
              )}
            </TabsContent>
            <TabsContent
              value="utm_sources"
              className="m-0 p-0 flex-1 overflow-y-auto"
            >
              {trafficData?.utm_sources &&
              trafficData.utm_sources.length > 0 ? (
                <TrafficSourcesList
                  data={trafficData.utm_sources}
                  iconType="utm_source"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No UTM source data available
                </div>
              )}
            </TabsContent>
            <TabsContent
              value="utm_mediums"
              className="m-0 p-0 flex-1 overflow-y-auto"
            >
              {trafficData?.utm_mediums &&
              trafficData.utm_mediums.length > 0 ? (
                <TrafficSourcesList
                  data={trafficData.utm_mediums}
                  iconType="utm_medium"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No UTM medium data available
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </section>
    </div>
  );
}
