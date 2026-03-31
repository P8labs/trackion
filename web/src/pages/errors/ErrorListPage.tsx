import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Bug } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Skeleton } from "../../components/ui/skeleton";
import { useStore } from "../../store";
import { getGroupedErrors, getErrorStats } from "../../lib/api";
import type { GroupedError } from "../../types";
import { formatDistanceToNow } from "date-fns";

export function ErrorListPage() {
  const navigate = useNavigate();
  const { authToken, serverUrl, currentProject } = useStore();
  const [timeRange, setTimeRange] = useState("7d");

  const { data: errors, isLoading: errorsLoading } = useQuery({
    queryKey: ["grouped-errors", currentProject?.id, timeRange],
    queryFn: () =>
      getGroupedErrors(currentProject!.id, timeRange, serverUrl, authToken!),
    enabled: !!currentProject && !!authToken,
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["error-stats", currentProject?.id, timeRange],
    queryFn: () =>
      getErrorStats(currentProject!.id, timeRange, serverUrl, authToken!),
    enabled: !!currentProject && !!authToken,
  });

  const handleRowClick = (fingerprint: string) => {
    navigate(`/errors/${fingerprint}`);
  };

  const truncateMessage = (message: string, maxLength = 100) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + "...";
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return dateString;
    }
  };

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <Card className="p-12 text-center max-w-md">
          <div className="text-center">
            <h2 className="text-2xl font-semibold tracking-tight mb-3">
              No Project Selected
            </h2>
            <p className="text-muted-foreground mb-6">
              Please select a project to view error tracking.
            </p>
            <Button
              onClick={() => navigate("/projects")}
              className="w-full h-11 text-base"
            >
              Go to Projects
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Error Tracking</h1>
          <p className="text-muted-foreground">
            Monitor and debug errors in your application
          </p>
        </div>

        {/* Time Range Filter */}
        <div className="flex gap-2">
          {["24h", "7d", "30d"].map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Error Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          {statsLoading ? (
            <Skeleton className="h-16 w-full" />
          ) : stats ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <div>
                  <p className="text-3xl font-bold">{stats.total_errors}</p>
                  <p className="text-sm text-muted-foreground">
                    Total errors in {timeRange}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No error stats available</p>
          )}
        </CardContent>
      </Card>

      {/* Errors Table */}
      <Card>
        <CardHeader>
          <CardTitle>Grouped Errors</CardTitle>
        </CardHeader>
        <CardContent>
          {errorsLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : errors && errors.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Error Message</TableHead>
                  <TableHead className="w-30">Count</TableHead>
                  <TableHead className="w-45">Last Seen</TableHead>
                  <TableHead className="w-45">First Seen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {errors.map((error: GroupedError) => (
                  <TableRow
                    key={error.fingerprint}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleRowClick(error.fingerprint)}
                  >
                    <TableCell>
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium truncate">
                            {truncateMessage(error.message)}
                          </p>
                          {error.last_url && (
                            <p className="text-xs text-muted-foreground truncate">
                              {error.last_url}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {error.count}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatTimeAgo(error.last_seen)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatTimeAgo(error.first_seen)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bug className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No errors found</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Great news! No errors have been captured in the selected time
                range.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
