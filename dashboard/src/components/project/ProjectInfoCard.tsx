import { useState } from "react";
import { Edit, Save, X, Copy, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { useUpdateProject } from "../../hooks/useApi";
import type { Project } from "../../types";

interface ProjectInfoCardProps {
  project: Project;
}

export function ProjectInfoCard({ project }: ProjectInfoCardProps) {
  const updateProjectMutation = useUpdateProject(project.id);
  const [copied, setCopied] = useState("");
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editName, setEditName] = useState(project.name);
  const [editDomains, setEditDomains] = useState(
    (project.domains || []).join(", "),
  );
  const [hasInfoChanges, setHasInfoChanges] = useState(false);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(""), 2000);
  };

  const handleUpdateProjectInfo = async () => {
    try {
      const domainList = editDomains
        .split(",")
        .map((d) => d.trim())
        .filter((d) => d.length > 0);

      await updateProjectMutation.mutateAsync({
        name: editName,
        domains: domainList,
      });
      setIsEditingInfo(false);
      setHasInfoChanges(false);
    } catch (error) {
      console.error("Failed to update project info:", error);
    }
  };

  const handleCancelEdit = () => {
    setEditName(project.name);
    setEditDomains((project.domains || []).join(", "));
    setIsEditingInfo(false);
    setHasInfoChanges(false);
  };

  const handleNameChange = (value: string) => {
    setEditName(value);
    setHasInfoChanges(
      value !== project.name ||
        editDomains !== (project.domains || []).join(", "),
    );
  };

  const handleDomainsChange = (value: string) => {
    setEditDomains(value);
    setHasInfoChanges(
      editName !== project.name || value !== (project.domains || []).join(", "),
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Project Information</CardTitle>
          {!isEditingInfo ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditingInfo(true)}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelEdit}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleUpdateProjectInfo}
                disabled={!hasInfoChanges || updateProjectMutation.isPending}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {updateProjectMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">
              Project Name
            </Label>
            {isEditingInfo ? (
              <Input
                value={editName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Enter project name"
              />
            ) : (
              <p className="text-lg font-medium">{project.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">
              Created
            </Label>
            <p className="text-sm">
              {new Date(project.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">
            Allowed Domains
          </Label>
          {isEditingInfo ? (
            <div className="space-y-2">
              <Input
                value={editDomains}
                onChange={(e) => handleDomainsChange(e.target.value)}
                placeholder="example.com, www.example.com"
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated list of domains where analytics will be
                collected
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {(project.domains || []).map((domain, index) => (
                <Badge key={index} variant="secondary">
                  {domain}
                </Badge>
              ))}
              {(project.domains || []).length === 0 && (
                <span className="text-sm text-muted-foreground">
                  No domains configured
                </span>
              )}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">
            API Key
          </Label>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 bg-muted rounded-md text-sm font-mono">
              {project.api_key}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopy(project.api_key, "api-key")}
            >
              {copied === "api-key" ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
