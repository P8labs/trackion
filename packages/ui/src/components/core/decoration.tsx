import { cn } from "@trackion/ui/lib";

export function PlusDecor({
  position = "bottom",
  v = "both",
}: {
  position?: "top" | "bottom";
  v?: "both" | "r" | "l";
}) {
  const pos =
    position === "top"
      ? "top-0 -translate-y-1/2 mt-[1.5px]"
      : "top-full -translate-y-1/2";

  if (v === "r") {
    return (
      <>
        <div
          className={cn(
            "absolute right-0 translate-x-1/2 z-50 hidden md:block",
            pos,
          )}
        >
          <div className="relative w-4 h-4 flex items-center justify-center">
            <div className="absolute left-1/2 top-1/2 w-3 h-px -translate-x-1/2 -translate-y-1/2 bg-neutral-400 dark:bg-neutral-500" />
            <div className="absolute left-1/2 top-1/2 h-3 w-px -translate-x-1/2 -translate-y-1/2 bg-neutral-400 dark:bg-neutral-500" />
          </div>
        </div>
      </>
    );
  }
  if (v === "l") {
    return (
      <>
        <div
          className={cn(
            "absolute left-0 -translate-x-1/2 z-50 hidden md:block",
            pos,
          )}
        >
          <div className="relative w-4 h-4 flex items-center justify-center">
            <div className="absolute left-1/2 top-1/2 w-3 h-px -translate-x-1/2 -translate-y-1/2 bg-neutral-400 dark:bg-neutral-500" />
            <div className="absolute left-1/2 top-1/2 h-3 w-px -translate-x-1/2 -translate-y-1/2 bg-neutral-400 dark:bg-neutral-500" />
          </div>
        </div>
      </>
    );
  }

  if (v == "both") {
    return (
      <>
        <div
          className={cn(
            "absolute left-0 -translate-x-1/2 z-50 hidden md:block",
            pos,
          )}
        >
          <div className="relative w-4 h-4 flex items-center justify-center">
            <div className="absolute left-1/2 top-1/2 w-3 h-px -translate-x-1/2 -translate-y-1/2 bg-neutral-400 dark:bg-neutral-500" />
            <div className="absolute left-1/2 top-1/2 h-3 w-px -translate-x-1/2 -translate-y-1/2 bg-neutral-400 dark:bg-neutral-500" />
          </div>
        </div>

        <div
          className={cn(
            "absolute right-0 translate-x-1/2 z-50 hidden md:block",
            pos,
          )}
        >
          <div className="relative w-4 h-4 flex items-center justify-center">
            <div className="absolute left-1/2 top-1/2 w-3 h-px -translate-x-1/2 -translate-y-1/2 bg-neutral-400 dark:bg-neutral-500" />
            <div className="absolute left-1/2 top-1/2 h-3 w-px -translate-x-1/2 -translate-y-1/2 bg-neutral-400 dark:bg-neutral-500" />
          </div>
        </div>
      </>
    );
  }
}

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
