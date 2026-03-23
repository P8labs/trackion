import { Users, Activity } from "lucide-react";
import { useOnlineUsers } from "../../hooks/useApi";
import { LoadingSpinner } from "../LoadingSpinner";

interface OnlineUsersProps {
  projectId: string;
}

export function OnlineUsers({ projectId }: OnlineUsersProps) {
  const { data, isLoading } = useOnlineUsers(projectId);

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 px-4 py-3">
        <LoadingSpinner className="h-4 w-4" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

  const onlineCount = data?.online_users || 0;

  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-emerald-200/50 bg-emerald-50/50 px-5 py-2.5 dark:border-emerald-900/30 dark:bg-emerald-950/30">
      <div className="relative flex items-center gap-2">
        <div className="absolute inset-0 flex items-center justify-center">
          <Activity className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
        </div>
        <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400 relative" />
      </div>
      <span className="text-base font-medium text-emerald-700 dark:text-emerald-300">
        {onlineCount} {onlineCount === 1 ? "user" : "users"} online
      </span>
    </div>
  );
}
