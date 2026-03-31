import { cn } from "@/lib/utils";

export default function PlusDecor({
  position = "bottom",
}: {
  position?: "top" | "bottom";
}) {
  return (
    <>
      <div
        className={cn(
          "absolute left-0 -translate-x-1/2 translate-y-1/2 md:block hidden z-50",
          position === "bottom" && "bottom-0",
          position === "top" && "top-0 -translate-y-1/2",
        )}
      >
        <div className="relative w-3.5 h-3.5">
          <div className="absolute left-1/2 top-1/2 w-3.5 h-px -translate-x-1/2 -translate-y-1/2 bg-zinc-400 dark:bg-zinc-500" />
          <div className="absolute left-1/2 top-1/2 h-3.5 w-px -translate-x-1/2 -translate-y-1/2 bg-zinc-400 dark:bg-zinc-500" />
        </div>
      </div>
      <div
        className={cn(
          "absolute right-0 translate-x-1/2 translate-y-1/2 md:block hidden z-50",
          position === "bottom" && "bottom-0",
          position === "top" && "top-0 -translate-y-1/2",
        )}
      >
        <div className="relative w-3.5 h-3.5  flex items-center justify-center">
          <div className="absolute left-1/2 top-1/2 w-3.5 h-px -translate-x-1/2 -translate-y-1/2 bg-zinc-400/80" />
          <div className="absolute left-1/2 top-1/2 h-3.5 w-px -translate-x-1/2 -translate-y-1/2 bg-zinc-400/80" />
        </div>
      </div>
    </>
  );
}
