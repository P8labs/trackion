import type { LucideIcon } from "lucide-react";
import { Card } from "./ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  color?: "teal" | "amber" | "red" | "green";
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "teal",
}: StatCardProps) {
  const colorClasses = {
    teal: "text-teal-500 dark:text-teal-400",
    amber: "text-amber-500 dark:text-amber-400",
    red: "text-destructive",
    green: "text-green-600 dark:text-green-400",
  };

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            {title}
          </p>
          <p className={`mt-2 text-3xl font-bold ${colorClasses[color]}`}>
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={`${colorClasses[color]} opacity-80`}>
            <Icon size={32} />
          </div>
        )}
      </div>
    </Card>
  );
}
