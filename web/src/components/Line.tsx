import { cn } from "@/lib/utils";

export function FullLine({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative left-1/2 right-1/2 -mx-[50vw] w-screen border-b translate-y-1/2 dark:border-card",
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
