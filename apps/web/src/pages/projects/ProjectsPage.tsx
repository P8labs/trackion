import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlusIcon, Search, SearchIcon } from "lucide-react";

import { PlusDecor } from "@trackion/ui/decoration";
import { Input } from "@trackion/ui/input";
import { Skeleton } from "@trackion/ui/skeleton";

import { ErrorBanner } from "@/components/core/error-banner";
import { projectHooks } from "@/hooks/queries/use-project";
import { Button, TextInput } from "@mantine/core";

export function ProjectsPage() {
  const navigate = useNavigate();

  const { data: projects = [], isLoading, error } = projectHooks.useProjects();

  const [searchTerm, setSearchTerm] = useState("");

  const filteredProjects = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) {
      return projects;
    }
    return projects.filter((project) => {
      const matchName = project.name.toLowerCase().includes(search);
      const matchDomain = (project.domains || []).some((domain) =>
        domain.toLowerCase().includes(search),
      );

      return matchName || matchDomain;
    });
  }, [projects, searchTerm]);

  if (isLoading) {
    return (
      <div className="relative mx-auto w-full max-w-5xl px-4 md:px-6">
        <div className="pointer-events-none absolute inset-y-0 left-4 border-l border-border/60 md:left-6" />
        <div className="pointer-events-none absolute inset-y-0 right-4 border-l border-border/60 md:right-6" />

        <div className="relative border-x border-border/60 py-5">
          <div className="space-y-3 border-b border-border/60 px-4 pb-5 md:px-6">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-80" />
          </div>

          <div className="border-b border-border/60 px-4 py-4 md:px-6">
            <div className="flex gap-6">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>

          <div className="border-b border-border/60 px-4 py-4 md:px-6">
            <Skeleton className="h-10 w-full max-w-xl" />
          </div>

          <div>
            {Array.from({ length: 7 }).map((_, idx) => (
              <div
                key={idx}
                className="border-b border-border/60 px-4 py-4 md:px-6"
              >
                <Skeleton className="h-5 w-40" />
                <Skeleton className="mt-2 h-4 w-56" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="max-w-4xl mx-auto py-4 h-full flex flex-col w-full">
      <div className="px-2 flex items-center w-full">
        <TextInput
          leftSectionPointerEvents="none"
          leftSection={<SearchIcon />}
          placeholder="Search projects or domains"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
          classNames={{
            input: "rounded-r-none!",
          }}
        />
        <Button className="rounded-l-none!">
          <PlusIcon />
        </Button>
      </div>

      {error && (
        <ErrorBanner
          error={error}
          label="Failed to load projects. Please try again later."
        />
      )}

      {projects.length === 0 ? (
        <div className="px-4 md:px-6 py-16 text-center text-sm text-muted-foreground">
          No projects yet
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="px-4 md:px-6 py-10 text-sm text-muted-foreground">
          No results for "{searchTerm}"
        </div>
      ) : (
        <div className="relative">
          {filteredProjects.map((project) => {
            const domain = project.domains?.[0] || "No domain";

            const enabledFeatures = Object.entries(project.settings)
              .filter(([_, v]) => v)
              .map(([k]) => k);

            const created = new Date(project.created_at);
            const createdLabel = created.toLocaleDateString();

            return (
              <div
                key={project.id}
                onClick={() => {
                  navigate(`/projects/${project.id}/overview`);
                }}
                className="px-4 md:px-6 py-4 border-b border-border/60 cursor-pointer transition hover:bg-muted/20 relative"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {project.name}
                    </p>

                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="px-2 py-0.5 text-[11px] rounded border border-border/60 text-muted-foreground">
                        {domain}
                      </span>

                      <span className="px-2 py-0.5 text-[11px] rounded border border-border/60 text-muted-foreground">
                        {createdLabel}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    {enabledFeatures.slice(0, 3).map((feature) => (
                      <span
                        key={feature}
                        className="px-2 py-0.5 text-[11px] rounded bg-muted/30 border border-border/50 text-muted-foreground"
                      >
                        {feature}
                      </span>
                    ))}

                    {enabledFeatures.length > 3 && (
                      <span className="text-[11px] text-muted-foreground">
                        +{enabledFeatures.length - 3}
                      </span>
                    )}

                    <span className="ml-1 flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    </span>
                  </div>
                </div>

                <PlusDecor position="bottom" />
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
