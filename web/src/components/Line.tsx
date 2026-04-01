import { cn } from "@/lib/utils";

export function FullLine({
  className,
  direction = "horizontal",
}: {
  className?: string;
  direction?: "vertical" | "horizontal";
}) {
  if (direction === "vertical") {
    return (
      <div
        className={cn(
          "relative bottom-1/2 top-1/2 -my-[50vh] h-screen border translate-y-1/2 border-border/60 -z-10",
          className,
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "relative left-1/2 right-1/2 -mx-[50vw] max-w-screen border translate-y-1/2 border-border/60",
        className,
      )}
    />
  );
}

export function PLine({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "absolute inset-0 border-l border-r dark:border-card pointer-events-none",
        className,
      )}
    />
  );
}

export function Strip({ className }: { className?: string }) {
  return (
    <div className="relative">
      <div
        className={cn("h-20 opacity-60", className)}
        style={{
          background:
            "repeating-linear-gradient(45deg, var(--muted) 0px, var(--muted) 6px, transparent 6px, transparent 12px)",
        }}
      />
    </div>
  );
}
