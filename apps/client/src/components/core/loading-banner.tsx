export function LoadingBanner({ label }: { label?: string }) {
  return (
    <div className="px-4 md:px-6 py-3">
      <div className="flex items-center gap-3">
        <div className="h-3.5 w-3.5 animate-spin rounded-full" />

        <p className="text-sm text-muted-foreground">
          {label ||
            "Loading data... Please wait while we fetch the latest information for you."}
        </p>
      </div>
    </div>
  );
}
