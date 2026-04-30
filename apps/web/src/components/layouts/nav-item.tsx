import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link, useLocation } from "react-router-dom";

export function NavItem({
  name,
  path,
  icon: Icon,
}: {
  name: string;
  path: string;
  icon: any;
}) {
  const location = useLocation();
  const isActive = location.pathname === path;

  return (
    <Link
      to={path}
      className={cn(
        "flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
      )}
    >
      <HugeiconsIcon icon={Icon} />
      <span>{name}</span>
    </Link>
  );
}
