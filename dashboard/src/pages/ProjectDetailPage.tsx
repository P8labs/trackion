import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { useProject } from "../hooks/useApi";
import { useStore } from "../store";
import {
  ProjectIntegrationGuide,
  ProjectInfoCard,
  ProjectSettingsCard,
  ProjectDangerZone,
} from "../components/project";

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { serverUrl } = useStore();

  const { data: project, isLoading, error } = useProject(id!);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh]">
        <div className="text-center">
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
    <div className="space-y-6 max-w-4xl">
      <div>
        <Button
          variant="ghost"
          onClick={() => navigate("/projects")}
          className="mb-4 -ml-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Button>
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
          <p className="text-muted-foreground">
            Manage your project settings and integration
          </p>
        </div>
      </div>

      <Tabs defaultValue="integration" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="integration" className="gap-2">
            Integration
          </TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="danger">Danger Zone</TabsTrigger>
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
