import { PieChart, Pie, Cell } from "recharts";
import { Monitor, Globe } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "../ui/chart";
import { LoadingSpinner } from "../LoadingSpinner";
import { useDeviceAnalytics, useTrafficSources } from "../../hooks/useApi";

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

function DeviceChart({
  data,
}: {
  data: Array<{ name: string; count: number }>;
}) {
  const chartData = data.map((item, index) => ({
    ...item,
    fill: DEVICE_COLORS[index % DEVICE_COLORS.length],
  }));

  const chartConfig = data.reduce((config, item, index) => {
    config[item.name] = {
      label: item.name,
      color: DEVICE_COLORS[index % DEVICE_COLORS.length],
    };
    return config;
  }, {} as ChartConfig);
  return (
    <ChartContainer config={chartConfig} className="min-h-75 w-full">
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={120}
          paddingAngle={5}
          dataKey="count"
          nameKey="name"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
      </PieChart>
    </ChartContainer>
  );
}

function TrafficSourcesList({
  data,
}: {
  data: Array<{ name: string; count: number }>;
}) {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="space-y-2">
      {data.slice(0, 6).map((source, index) => {
        const percentage = total > 0 ? (source.count / total) * 100 : 0;
        return (
          <div key={source.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: DEVICE_COLORS[index % DEVICE_COLORS.length],
                }}
              />
              <span className="text-sm font-medium">{source.name}</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">{source.count}</div>
              <div className="text-xs text-muted-foreground">
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
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            Device Analytics
          </CardTitle>
          <CardDescription>Breakdown by device and browser</CardDescription>
        </CardHeader>
        <CardContent>
          {deviceLoading ? (
            <div className="h-75 flex items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : (
            <Tabs defaultValue="devices" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="devices">Devices</TabsTrigger>
                <TabsTrigger value="browsers">Browsers</TabsTrigger>
              </TabsList>
              <TabsContent value="devices" className="mt-4">
                {deviceData?.devices && deviceData.devices.length > 0 ? (
                  <DeviceChart data={deviceData.devices} />
                ) : (
                  <div className="h-62.5 flex items-center justify-center text-muted-foreground">
                    No device data available
                  </div>
                )}
              </TabsContent>
              <TabsContent value="browsers" className="mt-4">
                {deviceData?.browsers && deviceData.browsers.length > 0 ? (
                  <DeviceChart data={deviceData.browsers} />
                ) : (
                  <div className="h-62.5 flex items-center justify-center text-muted-foreground">
                    No browser data available
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Traffic Sources
          </CardTitle>
          <CardDescription>Where your visitors come from</CardDescription>
        </CardHeader>
        <CardContent>
          {trafficLoading ? (
            <div className="h-75 flex items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : (
            <Tabs defaultValue="referrers" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="referrers">Referrers</TabsTrigger>
                <TabsTrigger value="utm_sources">UTM Source</TabsTrigger>
                <TabsTrigger value="utm_mediums">UTM Medium</TabsTrigger>
              </TabsList>
              <TabsContent value="referrers" className="mt-4">
                {trafficData?.referrers && trafficData.referrers.length > 0 ? (
                  <TrafficSourcesList data={trafficData.referrers} />
                ) : (
                  <div className="h-62.5 flex items-center justify-center text-muted-foreground">
                    No referrer data available
                  </div>
                )}
              </TabsContent>
              <TabsContent value="utm_sources" className="mt-4">
                {trafficData?.utm_sources &&
                trafficData.utm_sources.length > 0 ? (
                  <TrafficSourcesList data={trafficData.utm_sources} />
                ) : (
                  <div className="h-62.5 flex items-center justify-center text-muted-foreground">
                    No UTM source data available
                  </div>
                )}
              </TabsContent>
              <TabsContent value="utm_mediums" className="mt-4">
                {trafficData?.utm_mediums &&
                trafficData.utm_mediums.length > 0 ? (
                  <TrafficSourcesList data={trafficData.utm_mediums} />
                ) : (
                  <div className="h-62.5 flex items-center justify-center text-muted-foreground">
                    No UTM medium data available
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
