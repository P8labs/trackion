import { cn } from "@/lib/utils";

export default function PlusDecor({
  position = "bottom",
}: {
  position?: "top" | "bottom";
}) {
  const pos =
    position === "top"
      ? "top-0 -translate-y-1/2 mt-[1.5px]"
      : "top-full -translate-y-1/2";

  return (
    <>
      <div
        className={cn(
          "absolute left-0 -translate-x-1/2 z-50 hidden md:block",
          pos,
        )}
      >
        <Plus />
      </div>

      <div
        className={cn(
          "absolute right-0 translate-x-1/2 z-50 hidden md:block",
          pos,
        )}
      >
        <Plus />
      </div>
    </>
  );
}

function Plus() {
  return (
    <div className="relative w-4 h-4 flex items-center justify-center">
      <div className="absolute left-1/2 top-1/2 w-3 h-px -translate-x-1/2 -translate-y-1/2 bg-neutral-400 dark:bg-neutral-500" />
      <div className="absolute left-1/2 top-1/2 h-3 w-px -translate-x-1/2 -translate-y-1/2 bg-neutral-400 dark:bg-neutral-500" />
    </div>
  );
}
