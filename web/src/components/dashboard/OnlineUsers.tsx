import { useOnlineUsers } from "../../hooks/useApi";

interface OnlineUsersProps {
  projectId: string;
}
export function OnlineUsers({ projectId }: OnlineUsersProps) {
  const { data, isLoading } = useOnlineUsers(projectId);

  const onlineCount = data?.online_users || 0;

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>

      {isLoading ? (
        <span className="text-muted-foreground">Loading</span>
      ) : (
        <span className="text-muted-foreground">
          <span className="text-foreground font-medium">{onlineCount}</span>{" "}
          online
        </span>
      )}
    </div>
  );
}
