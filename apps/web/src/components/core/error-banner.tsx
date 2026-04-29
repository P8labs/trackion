export function ErrorBanner({
  error,
  label,
}: {
  error: Error;
  label?: string;
}) {
  return (
    <div className="bg-destructive/10 p-4 text-sm text-destructive">
      {label ||
        "Something went wrong while fetching data. Please try again later."}
      <p>
        Error details:{" "}
        <code className="bg-destructive/20 px-1 py-0.5 rounded text-destructive text-sm">
          {error?.message || "Unknown error"}
        </code>
      </p>
    </div>
  );
}
