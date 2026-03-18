import { useBreakdownData } from "../../hooks/useApi";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface BreakdownSectionProps {
  projectId: string;
}

export function BreakdownSection({ projectId }: BreakdownSectionProps) {
  const { data, isLoading, error } = useBreakdownData(projectId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-border bg-card p-4 md:p-5 animate-pulse"
          >
            <div className="h-6 bg-muted rounded w-32 mb-4" />
            <div className="h-40 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive text-sm">
        Failed to load breakdown data
      </div>
    );
  }

  if (!data) return null;

  const maxDevice = Math.max(...data.devices.map((d) => d.count), 1);
  const maxReferrer = Math.max(...data.referrers.map((r) => r.count), 1);

  return (
    <>
      {/* Devices & Browsers */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Devices */}
        <section className="rounded-2xl border border-border bg-card p-4 md:p-5">
          <h3 className="text-[15px] font-semibold text-foreground mb-4">
            Traffic by Device
          </h3>
          {data.devices.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-sm text-muted-foreground">
              No device data available
            </div>
          ) : (
            <div className="space-y-3">
              {data.devices.map((device) => (
                <div key={device.name}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-foreground">{device.name}</span>
                    <span className="text-muted-foreground">
                      {device.count.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(device.count / maxDevice) * 100}%`,
                        backgroundColor: device.color || "hsl(var(--primary))",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Browsers */}
        <section className="rounded-2xl border border-border bg-card p-4 md:p-5">
          <h3 className="text-[15px] font-semibold text-foreground mb-4">
            Traffic by Browser
          </h3>
          {data.browsers.length === 0 ? (
            <div className="h-40 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.browsers}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={3}
                  >
                    {data.browsers.map((browser) => (
                      <Cell
                        key={browser.name}
                        fill={browser.color || "hsl(var(--primary))"}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      padding: "8px 12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.browsers}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={3}
                    >
                      {data.browsers.map((browser) => (
                        <Cell
                          key={browser.name}
                          fill={browser.color || "hsl(var(--primary))"}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        padding: "8px 12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 flex flex-col justify-center">
                {data.browsers.slice(0, 5).map((browser) => (
                  <div key={browser.name} className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: browser.color || "hsl(var(--primary))",
                      }}
                    />
                    <span className="text-xs text-foreground truncate">
                      {browser.name}
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {browser.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Referrers & Top Pages */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Referrers */}
        <section className="rounded-2xl border border-border bg-card p-4 md:p-5">
          <h3 className="text-[15px] font-semibold text-foreground mb-4">
            Traffic by Referrer
          </h3>
          {data.referrers.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-sm text-muted-foreground">
              No referrer data available
            </div>
          ) : (
            <div className="space-y-3">
              {data.referrers.slice(0, 6).map((referrer) => (
                <div key={referrer.name}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-foreground">{referrer.name}</span>
                    <span className="text-muted-foreground">
                      {referrer.count.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(referrer.count / maxReferrer) * 100}%`,
                        backgroundColor:
                          referrer.color || "hsl(var(--primary))",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Top Pages */}
        <section className="rounded-2xl border border-border bg-card p-4 md:p-5">
          <h3 className="text-[15px] font-semibold text-foreground mb-4">
            Top Pages
          </h3>
          {data.top_pages.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-sm text-muted-foreground">
              No page data available
            </div>
          ) : (
            <div className="space-y-2.5">
              {data.top_pages.slice(0, 6).map((page, index) => (
                <div
                  key={page.path}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-xs font-medium text-muted-foreground">
                      #{index + 1}
                    </span>
                    <span className="text-sm text-foreground truncate">
                      {page.path}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{page.count} views</span>
                    <span className="text-primary">
                      {page.unique_views} unique
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* UTM Campaigns */}
      {data.utm.length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-4 md:p-5">
          <h3 className="text-[15px] font-semibold text-foreground mb-4">
            UTM Campaigns
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b border-border">
                  <th className="pb-2 font-medium">Source</th>
                  <th className="pb-2 font-medium">Medium</th>
                  <th className="pb-2 font-medium">Campaign</th>
                  <th className="pb-2 font-medium text-right">Count</th>
                </tr>
              </thead>
              <tbody>
                {data.utm.slice(0, 10).map((utm, index) => (
                  <tr
                    key={index}
                    className="border-b border-border last:border-0"
                  >
                    <td className="py-2.5 text-sm text-foreground">
                      {utm.source}
                    </td>
                    <td className="py-2.5 text-sm text-muted-foreground">
                      {utm.medium}
                    </td>
                    <td className="py-2.5 text-sm text-muted-foreground">
                      {utm.campaign}
                    </td>
                    <td className="py-2.5 text-sm text-foreground text-right">
                      {utm.count.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}
