import { Code } from "@mantine/core";

export function ErrorBanner({
  error,
  label,
}: {
  error?: Error | null;
  label?: string;
}) {
  return (
    <div className="p-4 text-sm">
      {label ||
        "Something went wrong while fetching data. Please try again later."}
      {error && (
        <p>
          Error details:{" "}
          <Code className="px-1 py-0.5 rounded text-sm">
            {error?.message || "Unknown error"}
          </Code>
        </p>
      )}
    </div>
  );
}
