import { ExternalLink, Clock, Users, Eye } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useTopPages } from "../../hooks/useApi";

interface TopPagesProps {
  projectId: string;
}

export function TopPages({ projectId }: TopPagesProps) {
  const { data, isLoading, error } = useTopPages(projectId);

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return remainingSeconds > 0
      ? `${minutes}m ${remainingSeconds}s`
      : `${minutes}m`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ExternalLink className="h-4 w-4" />
          Top Pages
        </CardTitle>
        <CardDescription>Most popular pages on your site</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-2">
                <div className="h-4 w-48 bg-muted rounded animate-pulse"></div>
                <div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8 text-muted-foreground">
            Failed to load top pages data
          </div>
        ) : !data || data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No page data available
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Page</TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Eye className="h-3 w-3" />
                    Views
                  </div>
                </TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Users className="h-3 w-3" />
                    Unique
                  </div>
                </TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Clock className="h-3 w-3" />
                    Avg. Time
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((page, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    <div className="max-w-50 truncate" title={page.path}>
                      {page.path || "/"}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {page.total_views.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center">
                    {page.unique_visitors.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center">
                    {formatTime(page.avg_time_seconds)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
