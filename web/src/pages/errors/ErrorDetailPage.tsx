import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  ArrowLeft, 
  AlertCircle, 
  Clock, 
  User, 
  Monitor, 
  Hash,
  Copy,
  Check
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { useStore } from "../../store";
import { getErrorOccurrences } from "../../lib/api";
import type { ErrorOccurrence } from "../../types";
import { formatDistanceToNow } from "date-fns";

export function ErrorDetailPage() {
  const { fingerprint } = useParams<{ fingerprint: string }>();
  const navigate = useNavigate();
  const { authToken, serverUrl, currentProject } = useStore();
  const [copiedFingerprint, setCopiedFingerprint] = useState(false);

  const { data: occurrences, isLoading } = useQuery({
    queryKey: ["error-occurrences", currentProject?.id, fingerprint],
    queryFn: () => getErrorOccurrences(currentProject!.id, fingerprint!, serverUrl, authToken!),
    enabled: !!currentProject && !!fingerprint && !!authToken,
  });

  const handleBack = () => {
    navigate(`/errors`);
  };

  const copyFingerprint = async () => {
    if (fingerprint) {
      await navigator.clipboard.writeText(fingerprint);
      setCopiedFingerprint(true);
      setTimeout(() => setCopiedFingerprint(false), 2000);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return dateString;
    }
  };

  const formatStackTrace = (stackTrace: string) => {
    if (!stackTrace) return "No stack trace available";
    
    // Split into lines and format
    const lines = stackTrace.split('\n');
    return lines.map((line, index) => (
      <div key={index} className={`text-sm font-mono ${index === 0 ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>
        {line || '\u00A0'} {/* Non-breaking space for empty lines */}
      </div>
    ));
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
              Please select a project to view error details.
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

  if (!fingerprint) {
    return <div>Error fingerprint required</div>;
  }

  const firstOccurrence = occurrences?.[0];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="outline" size="sm" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4" />
          Back to Errors
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-destructive" />
            Error Details
          </h1>
          {isLoading ? (
            <Skeleton className="h-6 w-96 mt-2" />
          ) : firstOccurrence ? (
            <p className="text-muted-foreground mt-1">
              {firstOccurrence.message}
            </p>
          ) : null}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : !occurrences || occurrences.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No occurrences found</h3>
            <p className="text-sm text-muted-foreground">
              This error fingerprint has no recorded occurrences.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Error Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Total Occurrences</span>
                </div>
                <p className="text-2xl font-bold mt-1">{occurrences.length}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Last Seen</span>
                </div>
                <p className="text-sm font-medium mt-1">
                  {formatTimeAgo(occurrences[0].timestamp)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Affected Users</span>
                </div>
                <p className="text-2xl font-bold mt-1">
                  {new Set(occurrences.filter(o => o.user_id).map(o => o.user_id)).size || "Unknown"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Browser</span>
                </div>
                <p className="text-sm font-medium mt-1 truncate">
                  {firstOccurrence?.browser || "Unknown"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Fingerprint */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Error Fingerprint</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 p-2 bg-muted rounded font-mono text-sm">
                <span className="flex-1 truncate">{fingerprint}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyFingerprint}
                  className="h-6 w-6 p-0"
                >
                  {copiedFingerprint ? (
                    <Check className="h-3 w-3 text-green-600" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stack Trace */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Stack Trace</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-md overflow-auto max-h-96">
                {formatStackTrace(firstOccurrence?.stack_trace || "")}
              </div>
            </CardContent>
          </Card>

          {/* Recent Occurrences */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Occurrences</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Browser</TableHead>
                    <TableHead>Platform</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {occurrences.slice(0, 10).map((occurrence: ErrorOccurrence) => (
                    <TableRow key={occurrence.id}>
                      <TableCell className="text-sm">
                        {formatTimeAgo(occurrence.timestamp)}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">
                          <a 
                            href={occurrence.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            {occurrence.url}
                          </a>
                        </div>
                      </TableCell>
                      <TableCell>
                        {occurrence.user_id ? (
                          <Badge variant="outline" className="text-xs">
                            {occurrence.user_id}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">Anonymous</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {occurrence.browser || "Unknown"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {occurrence.platform || "Unknown"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {occurrences.length > 10 && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Showing 10 of {occurrences.length} occurrences
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Context */}
          {firstOccurrence?.context && Object.keys(firstOccurrence.context).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Additional Context</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-md">
                  <pre className="text-sm overflow-auto">
                    {JSON.stringify(firstOccurrence.context, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}