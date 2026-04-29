import type { TrafficHeatmapData } from "@/types";

interface TrafficHeatmapProps {
  data?: TrafficHeatmapData;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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

export function TrafficHeatmap({ data }: TrafficHeatmapProps) {
  const dayGrid =
    data?.day_hour || Array.from({ length: 7 }, () => Array(24).fill(0));

  const stats = {
    today: data?.stats?.today || 0,
    weeklyAvg: data?.stats?.weekly_avg || 0,
    monthlyAvg: data?.stats?.monthly_avg || 0,
  };

  const max = Math.max(...dayGrid.flat(), 0) || 1;
  const hoursTop = Array.from({ length: 12 }, (_, i) => i);
  const hoursBottom = Array.from({ length: 12 }, (_, i) => i + 12);

  return (
    <section className="flex flex-col relative">
      <div className="px-4 md:px-6 py-3">
        <p className="text-sm font-medium">Traffic</p>
      </div>

      <div className="px-4 md:px-6 py-4 relative">
        <div className="flex flex-col gap-4 overflow-auto">
          <GridBlock hours={hoursTop} dayGrid={dayGrid} max={max} />
          <GridBlock hours={hoursBottom} dayGrid={dayGrid} max={max} />
        </div>
      </div>

      <div className="px-4 md:px-6 py-4 border-t border-border/60 space-y-3 relative">
        <HeatmapLegend />

        <div className="grid grid-cols-3 text-sm">
          <Stat label="Today" value={stats.today} />
          <Stat label="Weekly" value={stats.weeklyAvg} />
          <Stat label="Monthly" value={stats.monthlyAvg} />
        </div>
      </div>
    </section>
  );
}

function GridBlock({
  hours,
  dayGrid,
  max,
}: {
  hours: number[];
  dayGrid: number[][];
  max: number;
}) {
  return (
    <div className="space-y-2 relative">
      <div className="grid grid-cols-[40px_repeat(12,1fr)] gap-1.5 text-[10px] text-muted-foreground">
        <div />
        {hours.map((h) => (
          <div key={h} className="text-center">
            {hourLabel(h)}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[40px_repeat(12,1fr)] gap-1.5">
        {dayGrid.map((row, rowIndex) => (
          <div key={rowIndex} className="contents">
            <div className="text-xs text-muted-foreground text-right pr-1 flex items-center">
              {DAYS[rowIndex].slice(0, 3)}
            </div>

            {hours.map((hour) => {
              const value = row?.[hour] || 0;
              const intensity = value / max;

              return (
                <div
                  key={hour}
                  title={`${DAYS[rowIndex]} ${hourLabel(hour)}: ${value.toLocaleString()}`}
                  className={`
                    aspect-square rounded-sm transition
                    hover:scale-105
                    ${cellToneClass(intensity)}
                  `}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function HeatmapLegend() {
  return (
    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
      <span>Low</span>

      <Tone color="bg-muted/30" />
      <Tone color="bg-primary/25" />
      <Tone color="bg-primary/45" />
      <Tone color="bg-primary/70" />
      <Tone color="bg-primary" />

      <span>High</span>
    </div>
  );
}

function Tone({ color }: { color: string }) {
  return <span className={`h-3 w-5 ${color}`} />;
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="px-3 py-2 border border-border/60">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium mt-1">{value.toLocaleString()}</p>
    </div>
  );
}
