export default function Loader() {
  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-background">
      <div
        className="absolute w-75 h-75 rounded-full blur-3xl opacity-60"
        style={{
          background:
            "radial-gradient(circle, var(--primary), transparent 70%)",
        }}
      />

      <div className="relative flex flex-col items-center gap-5">
        <div className="relative">
          <img src="/trackion_t.png" className="w-12 h-12 opacity-90" />

          <div
            className="absolute inset-0 rounded-full animate-ping opacity-20"
            style={{ backgroundColor: "var(--primary)" }}
          />
        </div>

        <p className="text-xs text-muted-foreground tracking-wide">
          Loading Trackion…
        </p>
      </div>
    </div>
  );
}
