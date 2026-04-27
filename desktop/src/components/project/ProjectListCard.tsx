import { CalendarDays, ExternalLink, Globe, Trash2 } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import type { Project } from "../../types";

interface ProjectListCardProps {
  project: Project;
  onOpen: (projectId: string) => void;
  onDelete: (projectId: string) => void;
}

export function ProjectListCard({
  project,
  onOpen,
  onDelete,
}: ProjectListCardProps) {
  const domains = project.domains || [];

  return (
    <Card
      className="group h-full cursor-pointer border-foreground/10 py-0 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
      onClick={() => onOpen(project.id)}
    >
      <CardContent className="space-y-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-lg font-semibold">{project.name}</h3>
              <Badge variant="outline" className="shrink-0 text-[10px]">
                Active
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" />
              <span>
                Created{" "}
                {new Date(project.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(project.id);
            }}
            className="text-muted-foreground hover:text-destructive"
            aria-label={`Delete ${project.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="rounded-lg border bg-muted/20 p-3">
          <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Globe className="h-3.5 w-3.5" />
            Domains
          </div>
          <div className="flex flex-wrap gap-1.5">
            {domains.length === 0 && (
              <Badge variant="secondary" className="text-xs">
                No domain yet
              </Badge>
            )}
            {domains.slice(0, 3).map((domain) => (
              <Badge key={domain} variant="secondary" className="text-xs">
                {domain}
              </Badge>
            ))}
            {domains.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{domains.length - 3} more
              </Badge>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="mt-auto justify-between border-t bg-transparent py-3 text-xs text-muted-foreground">
        <span>{domains.length} allowed domain(s)</span>
        <span className="inline-flex items-center gap-1 font-medium text-foreground">
          Open details
          <ExternalLink className="h-3.5 w-3.5" />
        </span>
      </CardFooter>
    </Card>
  );
}
