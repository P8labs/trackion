import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlusIcon, SearchIcon } from "lucide-react";
import { Button, TextInput } from "@mantine/core";

import { ErrorBanner } from "@/components/core/error-banner";
import { projectHooks } from "@/hooks/queries/use-project";
import { LoadingView } from "@/Loader";

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
    return <LoadingView />;
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
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
