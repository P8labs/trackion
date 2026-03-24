import { useMemo } from "react";
import { Card } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { cn } from "@/lib/utils";

interface HeatmapEvent {
  created_at: string;
}

interface TrafficHeatmapProps {
  events: HeatmapEvent[];
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function hourLabel(hour: number): string {
  if (hour === 0) return "12a";
  if (hour < 12) return `${hour}a`;
  if (hour === 12) return "12p";
  return `${hour - 12}p`;
}

function cellToneClass(intensity: number): string {
  if (intensity <= 0) return "bg-muted/35";
  if (intensity <= 0.2) return "bg-primary/25";
  if (intensity <= 0.45) return "bg-primary/45";
  if (intensity <= 0.7) return "bg-primary/70";
  return "bg-primary";
}

function isSameLocalDate(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function TrafficHeatmap({ events }: TrafficHeatmapProps) {
  const dayTime = useMemo(() => {
    const grid = Array.from({ length: 7 }, () => Array(24).fill(0));
    let maxValue = 0;

    for (const event of events) {
      const date = new Date(event.created_at);
      const day = date.getDay();
      const hour = date.getHours();
      grid[day][hour] += 1;
      if (grid[day][hour] > maxValue) maxValue = grid[day][hour];
    }

    return { grid, maxValue };
  }, [events]);

  const monthDay = useMemo(() => {
    const grid = Array.from({ length: 7 }, () => Array(12).fill(0));
    let maxValue = 0;

    for (const event of events) {
      const date = new Date(event.created_at);
      const day = date.getDay();
      const month = date.getMonth();
      grid[day][month] += 1;
      if (grid[day][month] > maxValue) maxValue = grid[day][month];
    }

    return { grid, maxValue };
  }, [events]);

  const stats = useMemo(() => {
    const now = new Date();
    const todayCount = events.reduce((acc, event) => {
      const date = new Date(event.created_at);
      return acc + (isSameLocalDate(date, now) ? 1 : 0);
    }, 0);

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    const lastWeekCount = events.reduce((acc, event) => {
      const date = new Date(event.created_at);
      return acc + (date >= sevenDaysAgo ? 1 : 0);
    }, 0);

    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const lastYearCount = events.reduce((acc, event) => {
      const date = new Date(event.created_at);
      return acc + (date >= twelveMonthsAgo ? 1 : 0);
    }, 0);

    return {
      today: todayCount,
      weeklyAvg: Math.round(lastWeekCount / 7),
      monthlyAvg: Math.round(lastYearCount / 12),
    };
  }, [events]);

  return (
    <Card className="p-4 sm:p-5 h-128 flex flex-col overflow-hidden">
      <Tabs defaultValue="days" className="flex-1 min-h-0">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-3xl font-semibold tracking-tight">Traffic</h3>
          <TabsList className="grid grid-cols-2 bg-muted/60">
            <TabsTrigger value="days" className="px-3">
              Days
            </TabsTrigger>
            <TabsTrigger value="months" className="px-3">
              Months
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="days" className="mt-0 flex-1 min-h-0 flex flex-col">
          <div className="flex-1 overflow-auto rounded-lg border border-border/70 p-3">
            <div className="-ml-6 hidden xl:grid gap-2 w-full min-w-full grid-cols-[56px_repeat(7,minmax(0,1fr))] place-content-start">
              <div />
              {DAYS.map((day) => (
                <div
                  key={`desktop-day-${day}`}
                  className="text-center text-xs font-medium text-muted-foreground"
                >
                  {day}
                </div>
              ))}

              {Array.from({ length: 24 }).map((_, hour) => (
                <div key={`desktop-hour-row-${hour}`} className="contents">
                  <div className="text-xs text-muted-foreground text-right pr-1 self-center">
                    {hourLabel(hour)}
                  </div>
                  {DAYS.map((day, dayIndex) => {
                    const value = dayTime.grid[dayIndex][hour];
                    const intensity =
                      dayTime.maxValue > 0 ? value / dayTime.maxValue : 0;

                    return (
                      <div
                        key={`desktop-${hour}-${day}`}
                        title={`${day} ${hourLabel(hour)}: ${value.toLocaleString()} events`}
                        className={cn(
                          "aspect-square w-full rounded-sm transition-transform",
                          "hover:scale-105",
                          cellToneClass(intensity),
                        )}
                      />
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="grid xl:hidden gap-1.5 w-full min-w-full grid-cols-[40px_repeat(24,minmax(0,1fr))] place-content-start">
              <div />
              {Array.from({ length: 24 }).map((_, hour) => (
                <div
                  key={`mobile-hour-${hour}`}
                  className="-ml-6 text-right text-[10px] font-medium text-muted-foreground"
                >
                  {hourLabel(hour)}
                </div>
              ))}

              {DAYS.map((day, dayIndex) => (
                <div key={`mobile-day-row-${day}`} className="contents">
                  <div className="text-xs text-muted-foreground text-right pr-1 self-center">
                    {day}
                  </div>
                  {Array.from({ length: 24 }).map((__, hour) => {
                    const value = dayTime.grid[dayIndex][hour];
                    const intensity =
                      dayTime.maxValue > 0 ? value / dayTime.maxValue : 0;

                    return (
                      <div
                        key={`mobile-${dayIndex}-${hour}`}
                        title={`${day} ${hourLabel(hour)}: ${value.toLocaleString()} events`}
                        className={cn(
                          "aspect-square w-full rounded-sm transition-transform",
                          "hover:scale-105 max-xl:h-6.75!",
                          cellToneClass(intensity),
                        )}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent
          value="months"
          className="mt-0 flex-1 min-h-0 flex flex-col"
        >
          <div className="flex-1 overflow-auto rounded-lg border border-border/70 p-3">
            <div className="grid xl:hidden gap-1.5 w-full min-w-full grid-cols-[40px_repeat(12,minmax(0,2fr))] place-content-start">
              <div />
              {MONTHS.map((month) => (
                <div
                  key={`month-${month}`}
                  className="text-center text-xs font-medium text-muted-foreground"
                >
                  {month}
                </div>
              ))}

              {DAYS.map((day, dayIndex) => (
                <div key={`month-day-row-${day}`} className="contents">
                  <div className="text-xs text-muted-foreground text-right pr-1 self-center">
                    {day}
                  </div>
                  {Array.from({ length: 12 }).map((__, month) => {
                    const value = monthDay.grid[dayIndex][month];
                    const intensity =
                      monthDay.maxValue > 0 ? value / monthDay.maxValue : 0;

                    return (
                      <div
                        key={`${dayIndex}-${month}`}
                        title={`${day} ${MONTHS[month]}: ${value.toLocaleString()} events`}
                        className={cn(
                          "aspect-square w-full rounded-sm transition-transform",
                          "hover:scale-105 max-xl:h-6.75!",
                          cellToneClass(intensity),
                        )}
                      />
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="-ml-6 hidden xl:grid gap-2 w-full min-w-full grid-cols-[56px_repeat(7,minmax(0,1fr))] place-content-start">
              <div />
              {DAYS.map((day) => (
                <div
                  key={`xl-day-${day}`}
                  className="text-center text-xs font-medium text-muted-foreground"
                >
                  {day}
                </div>
              ))}

              {MONTHS.map((monthName, monthIndex) => (
                <div key={`xl-month-row-${monthName}`} className="contents">
                  <div className="text-xs text-muted-foreground text-right pr-1 self-center">
                    {monthName}
                  </div>
                  {DAYS.map((day, dayIndex) => {
                    const value = monthDay.grid[dayIndex][monthIndex];
                    const intensity =
                      monthDay.maxValue > 0 ? value / monthDay.maxValue : 0;

                    return (
                      <div
                        key={`xl-${monthIndex}-${dayIndex}`}
                        title={`${day} ${monthName}: ${value.toLocaleString()} events`}
                        className={cn(
                          "aspect-square w-full rounded-sm transition-transform",
                          "hover:scale-105",
                          cellToneClass(intensity),
                        )}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <span>Low</span>
          <span className="h-3 w-5 rounded-sm bg-muted/35" />
          <span className="h-3 w-5 rounded-sm bg-primary/25" />
          <span className="h-3 w-5 rounded-sm bg-primary/45" />
          <span className="h-3 w-5 rounded-sm bg-primary/70" />
          <span className="h-3 w-5 rounded-sm bg-primary" />
          <span>High</span>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <div className="rounded-lg border border-border/70 p-3">
            <div className="text-xs text-muted-foreground">Today</div>
            <div className="mt-1 text-xl font-semibold">
              {stats.today.toLocaleString()}
            </div>
          </div>
          <div className="rounded-lg border border-border/70 p-3">
            <div className="text-xs text-muted-foreground">Weekly average</div>
            <div className="mt-1 text-xl font-semibold">
              {stats.weeklyAvg.toLocaleString()}
            </div>
          </div>
          <div className="rounded-lg border border-border/70 p-3">
            <div className="text-xs text-muted-foreground">Monthly average</div>
            <div className="mt-1 text-xl font-semibold">
              {stats.monthlyAvg.toLocaleString()}
            </div>
          </div>
        </div>
      </Tabs>
    </Card>
  );
}
