import { Crown, TrendingUp, Database, FolderOpen, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useUsage } from "@/hooks/useApi";

export function UsageWidget() {
  const { data: usage, isLoading, error } = useUsage();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !usage) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Unable to load usage data
          </p>
        </CardContent>
      </Card>
    );
  }

  const eventsProgress = (usage.events_used / usage.events_limit) * 100;
  const projectsProgress = (usage.projects_used / usage.projects_limit) * 100;
  
  const isPro = usage.plan === "pro";
  const isNearLimit = eventsProgress > 80 || projectsProgress > 80;

  return (
    <Card className={isNearLimit ? "border-orange-200 dark:border-orange-800" : ""}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Usage & Plan
          </div>
          <Badge variant={isPro ? "default" : "secondary"} className="gap-1">
            {isPro && <Crown className="h-3 w-3" />}
            {isPro ? "Pro" : "Free"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Events Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              <span>Events this month</span>
            </div>
            <span className={eventsProgress > 90 ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}>
              {usage.events_used.toLocaleString()} / {usage.events_limit.toLocaleString()}
            </span>
          </div>
          <Progress 
            value={eventsProgress} 
            className="h-2"
          />
          {eventsProgress > 90 && (
            <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
              <AlertTriangle className="h-3 w-3" />
              <span>Event limit nearly reached</span>
            </div>
          )}
        </div>

        {/* Projects Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
              <span>Projects</span>
            </div>
            <span className={projectsProgress > 90 ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}>
              {usage.projects_used} / {usage.projects_limit}
            </span>
          </div>
          <Progress 
            value={projectsProgress} 
            className="h-2"
          />
        </div>

        {/* Upgrade to Pro CTA */}
        {!isPro && (
          <div className="pt-2 border-t">
            <Button variant="outline" size="sm" className="w-full" disabled>
              <Crown className="h-4 w-4 mr-2" />
              Upgrade to Pro (Coming Soon)
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              More events, projects & advanced features
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}