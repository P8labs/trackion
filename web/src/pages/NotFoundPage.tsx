import { useNavigate } from "react-router-dom";

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background px-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-150 h-75 bg-primary/10 blur-3xl opacity-30" />
      </div>

      <div className="relative w-full max-w-md text-center">
        <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
          Error 404
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Page not found
        </h1>

        <p className="mt-3 text-sm text-muted-foreground">
          The page you are looking for does not exist or has been moved.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="
              px-4 py-2 text-sm
              border border-border/60 rounded-md
              hover:bg-muted/30 transition
            "
          >
            Go back
          </button>

          <button
            onClick={() => navigate("/projects")}
            className="
              px-4 py-2 text-sm
              bg-primary text-primary-foreground
              rounded-md
              hover:opacity-90 transition
            "
          >
            Go to Projects
          </button>
        </div>
      </div>
    </div>
  );
}
