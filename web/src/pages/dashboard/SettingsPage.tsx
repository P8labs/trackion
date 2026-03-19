import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useStore } from "../../store";
import { getCurrentUser, getUsageSummary } from "../../lib/api";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import moment from "moment";

export function SettingsPage() {
  const { serverUrl, authToken, user: storedUser } = useStore();

  const {
    data: usage,
    isLoading: usageLoading,
    isError: usageError,
  } = useQuery({
    queryKey: ["settings-usage", serverUrl],
    queryFn: () => getUsageSummary(serverUrl, authToken!),
    enabled: !!authToken,
  });

  const { data: profile } = useQuery({
    queryKey: ["current-user", serverUrl],
    queryFn: () => getCurrentUser(serverUrl, authToken!),
    enabled: !!authToken && usage?.mode === "saas",
    retry: false,
  });

  const currentUser = profile ?? storedUser;
  const userInitials = (currentUser?.name || currentUser?.email || "TR")
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");

  const usagePercent =
    usage && usage.monthly_limit > 0
      ? Math.min((usage.current_usage / usage.monthly_limit) * 100, 100)
      : 0;

  return (
    <div className="space-y-6 max-w-2xl text-foreground">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Configure your dashboard</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          {currentUser ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar data-size="lg">
                  <AvatarImage
                    src={currentUser.avatar_url}
                    alt={currentUser.name || currentUser.email || "User avatar"}
                  />
                  <AvatarFallback>{userInitials || "TR"}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-base font-semibold text-foreground">
                    {currentUser.name || "Trackion User"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {currentUser.email || "No email available"}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 text-sm md:grid-cols-2">
                <div>
                  <p className="font-medium mb-1 text-foreground">Joined</p>
                  <p className="break-all text-muted-foreground">
                    {moment(currentUser.created_at).fromNow()}
                  </p>
                </div>
                <div>
                  <p className="font-medium mb-1 text-foreground">GitHub</p>
                  <p className="text-muted-foreground">
                    {currentUser.github_id ? "Connected" : "Not connected"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              User profile details are not available for this authentication
              mode.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm text-muted-foreground">
            <div>
              <p className="font-medium mb-1 text-foreground">Version</p>
              <p>Trackion v1.0</p>
            </div>
            <div>
              <p className="font-medium mb-1 text-foreground">Built with</p>
              <p>React • TypeScript • Tailwind CSS</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data & Privacy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              All tracking data is stored on your server. Trackion does not
              collect or transmit any data externally.
            </p>
            <p>
              Event retention is set to {usage?.retention_days ?? 30} days.
              Older events are removed automatically by background maintenance.
            </p>
            <p>
              Deleted projects are kept for {usage?.delete_after_days ?? 7} days
              before final cleanup (including related events).
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usage & Billing</CardTitle>
        </CardHeader>
        <CardContent>
          {usageLoading && (
            <p className="text-sm text-muted-foreground">Loading usage...</p>
          )}

          {usageError && (
            <p className="text-sm text-destructive">
              Unable to load usage details right now.
            </p>
          )}

          {!usageLoading &&
            !usageError &&
            usage &&
            usage.mode === "selfhost" && (
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Self-hosted mode</p>
                <p>
                  You are running Trackion in self-hosted mode. Event collection
                  is unlimited and no SaaS billing limits are applied.
                </p>
              </div>
            )}

          {!usageLoading && !usageError && usage && usage.mode === "saas" && (
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">Current Plan</p>
                <p className="font-medium text-foreground capitalize">
                  {usage.plan || "free"}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">Subscription Status</p>
                <p className="font-medium text-foreground capitalize">
                  {usage.status || "active"}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-muted-foreground">
                  <p>Monthly Usage</p>
                  <p>
                    {usage.current_usage.toLocaleString()} /{" "}
                    {usage.monthly_limit.toLocaleString()} events
                  </p>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>
                <p className="text-muted-foreground">
                  {usage.remaining.toLocaleString()} events remaining this
                  month.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
