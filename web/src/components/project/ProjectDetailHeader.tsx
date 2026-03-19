import { ArrowLeft, CalendarDays, Globe, KeyRound } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import type { Project } from "../../types";

interface ProjectDetailHeaderProps {
  project: Project;
  onBack: () => void;
}

export function ProjectDetailHeader({
  project,
  onBack,
}: ProjectDetailHeaderProps) {
  const maskedApiKey = `${project.api_key.slice(0, 8)}...${project.api_key.slice(-4)}`;

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={onBack} className="-ml-2 gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Projects
      </Button>

      <Card className="py-0">
        <CardContent className="space-y-5 py-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              <Badge variant="outline" className="font-normal">
                Project Settings
              </Badge>
              <h1 className="text-3xl font-bold tracking-tight">
                {project.name}
              </h1>
              <p className="text-muted-foreground">
                Configure integration, tracking behavior, and data retention.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <QuickStat
              icon={<Globe className="h-4 w-4" />}
              label="Domains"
              value={`${project.domains?.length ?? 0} configured`}
            />
            <QuickStat
              icon={<KeyRound className="h-4 w-4" />}
              label="API Key"
              value={maskedApiKey}
            />
            <QuickStat
              icon={<CalendarDays className="h-4 w-4" />}
              label="Created"
              value={new Date(project.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface QuickStatProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function QuickStat({ icon, label, value }: QuickStatProps) {
  return (
    <div className="rounded-lg border bg-muted/20 p-3">
      <div className="mb-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="truncate text-sm font-medium">{value}</div>
    </div>
  );
}
