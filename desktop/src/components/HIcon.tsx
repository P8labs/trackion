import { HugeiconsIcon } from "@hugeicons/react";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

type HIconProps = {
  icon: ComponentProps<typeof HugeiconsIcon>["icon"];
  className?: string;
  size?: number;
  strokeWidth?: number;
};

export function HIcon({
  icon,
  className,
  size = 18,
  strokeWidth = 1.8,
}: HIconProps) {
  return (
    <HugeiconsIcon
      icon={icon}
      size={size}
      strokeWidth={strokeWidth}
      className={cn("shrink-0", className)}
    />
  );
}
