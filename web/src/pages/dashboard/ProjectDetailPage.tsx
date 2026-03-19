import { useParams, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ShieldAlert,
  SlidersHorizontal,
  WandSparkles,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { Card, CardContent } from "../../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { useProject } from "../../hooks/useApi";
import { useStore } from "../../store";
import {
  ProjectIntegrationGuide,
  ProjectInfoCard,
  ProjectSettingsCard,
  ProjectDangerZone,
  ProjectDetailHeader,
} from "../../components/project";

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { serverUrl } = useStore();

  const { data: project, isLoading, error } = useProject(id!);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <Card className="py-0">
          <CardContent className="space-y-4 py-5">
            <Skeleton className="h-7 w-36" />
            <Skeleton className="h-10 w-72" />
            <div className="grid gap-3 sm:grid-cols-3">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
          </CardContent>
        </Card>
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="py-0">
            <CardContent className="space-y-3 py-5">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-28 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh]">
        <div className="text-center max-w-md">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Project not found</h2>
          <p className="text-muted-foreground mb-4">
            The project you're looking for doesn't exist or has been deleted.
          </p>
          <Button onClick={() => navigate("/projects")}>
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <ProjectDetailHeader
        project={project}
        onBack={() => navigate("/projects")}
      />

      <Tabs defaultValue="integration" className="space-y-6">
        <TabsList className="grid h-auto w-full grid-cols-3 gap-2 rounded-xl bg-transparent p-1">
          <TabsTrigger value="integration" className="gap-2 rounded-lg py-2.5">
            <WandSparkles className="h-4 w-4" />
            Integration
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2 rounded-lg py-2.5">
            <SlidersHorizontal className="h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="danger" className="gap-2 rounded-lg py-2.5">
            <ShieldAlert className="h-4 w-4" />
            Danger Zone
          </TabsTrigger>
        </TabsList>

        <TabsContent value="integration" className="space-y-6">
          <ProjectIntegrationGuide project={project} serverUrl={serverUrl} />
          <ProjectInfoCard project={project} />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <ProjectSettingsCard project={project} />
        </TabsContent>

        <TabsContent value="danger" className="space-y-6">
          <ProjectDangerZone project={project} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
