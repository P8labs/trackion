import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlusIcon, SearchIcon } from "lucide-react";

import {
  Badge,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

import { ErrorBanner } from "@/components/core/error-banner";
import { projectHooks } from "@/hooks/queries/use-project";
import { LoadingView } from "@/Loader";
import { CreateProjectModal } from "@/components/core/modals/create-project-modal";
import moment from "moment";

export function ProjectsPage() {
  const navigate = useNavigate();
  const [opened, { open, close }] = useDisclosure(false);

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
    <>
      <div className="max-w-4xl mx-auto w-full px-4 py-6">
        <Stack gap="md">
          <div>
            <Text fw={600} size="xl">
              Projects
            </Text>
            <Text c="dimmed" size="sm">
              Manage and monitor your tracked projects.
            </Text>
          </div>

          <Group gap={0}>
            <TextInput
              flex={1}
              leftSection={<SearchIcon size={16} />}
              placeholder="Search projects or domains"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              classNames={{
                input: "rounded-r-none!",
              }}
            />

            <Button
              onClick={open}
              className="rounded-l-none!"
              leftSection={<PlusIcon size={16} />}
            >
              New Project
            </Button>
          </Group>

          {error && (
            <ErrorBanner
              error={error}
              label="Failed to load projects. Please try again later."
            />
          )}

          {projects.length === 0 ? (
            <Paper p="xl">
              <Stack align="center" gap="xs">
                <Text fw={500}>No projects yet</Text>
                <Text size="sm" c="dimmed">
                  Create your first project to start tracking.
                </Text>

                <Button mt="sm" onClick={open}>
                  Create Project
                </Button>
              </Stack>
            </Paper>
          ) : filteredProjects.length === 0 ? (
            <Paper p="xl">
              <Text size="sm" c="dimmed">
                No results for "{searchTerm}"
              </Text>
            </Paper>
          ) : (
            <div>
              {filteredProjects.map((project) => {
                const domain = project.domains?.[0] || "No domain";

                return (
                  <Paper
                    key={project.id}
                    withBorder
                    p="xs"
                    className="cursor-pointer first:rounded-b-none! last:rounded-t-none! hover:bg-(--mantine-color-gray-1)! dark:hover:bg-(--mantine-color-dark-4)! transition-colors"
                    onClick={() => navigate(`/projects/${project.id}/overview`)}
                  >
                    <Group justify="space-between" align="flex-start">
                      <Stack gap={6}>
                        <Group
                          gap="xs"
                          align="start"
                          flex={1}
                          className="flex-col!"
                        >
                          <Text fw={600}>{project.name}</Text>
                          <Text size="xs" c="dimmed">
                            created {moment(project.created_at).fromNow()}
                          </Text>
                        </Group>
                      </Stack>
                      <Group gap="xs">
                        <Badge variant="default">{domain}</Badge>
                      </Group>
                    </Group>
                  </Paper>
                );
              })}
            </div>
          )}
        </Stack>
      </div>

      <CreateProjectModal opened={opened} close={close} />
    </>
  );
}
