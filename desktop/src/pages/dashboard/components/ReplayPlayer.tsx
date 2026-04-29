import { Maximize, Minimize, Pause, Play, SkipForward } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import "@rrweb/replay/dist/style.css";

type Props = {
  events: any[];
};

export function ReplayPlayer({ events }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const replayerRef = useRef<any>(null);

  const startTimeRef = useRef(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!events?.length || !containerRef.current) return;

    let disposed = false;

    import("@rrweb/replay").then(({ Replayer }) => {
      if (disposed) return;

      // cleanup
      if (replayerRef.current) {
        replayerRef.current.pause();
        clearInterval(replayerRef.current.__interval);
        replayerRef.current = null;
      }

      const start = events[0]?.timestamp ?? 0;
      const end = events[events.length - 1]?.timestamp ?? 0;
      const relativeDuration = Math.max(0, end - start);

      startTimeRef.current = start;
      setDuration(relativeDuration);
      setProgress(0);
      setIsPlaying(false);
      setSpeed(1);

      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }

      const replayer = new Replayer(events, {
        root: containerRef.current!,
      });

      replayerRef.current = replayer;

      replayer.on("finish", () => setIsPlaying(false));

      const interval = setInterval(() => {
        if (!replayerRef.current) return;

        const relative = Math.max(0, replayerRef.current.getCurrentTime());

        setProgress(relative);
      }, 200);

      replayerRef.current.__interval = interval;

      // force proper layout
      setTimeout(() => window.dispatchEvent(new Event("resize")), 50);
    });

    return () => {
      disposed = true;
      if (replayerRef.current) {
        clearInterval(replayerRef.current.__interval);
        replayerRef.current.pause();
        replayerRef.current = null;
      }
    };
  }, [events]);

  useEffect(() => {
    const handler = () => {
      setIsFullscreen(!!document.fullscreenElement);

      // force reflow for rrweb
      setTimeout(() => window.dispatchEvent(new Event("resize")), 50);
    };

    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const toggleFullscreen = () => {
    if (!wrapperRef.current) return;

    if (!document.fullscreenElement) {
      wrapperRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const togglePlay = () => {
    if (!replayerRef.current) return;

    if (isPlaying) {
      replayerRef.current.pause();
    } else {
      replayerRef.current.play();
    }

    setIsPlaying((value) => !value);
  };

  const seek = (value: number) => {
    if (!replayerRef.current) return;

    replayerRef.current.pause();
    replayerRef.current.play(value);

    setProgress(value);
  };

  const changeSpeed = (value: number) => {
    if (!replayerRef.current) return;
    replayerRef.current.setConfig({ speed: value });
    setSpeed(value);
  };

  const skipToNextInteraction = () => {
    if (!replayerRef.current) return;

    const currentOffset = replayerRef.current.getCurrentTime();
    const currentAbs = startTimeRef.current + currentOffset;

    const next = events.find(
      (e) => e.timestamp > currentAbs && (e.type === 3 || e.type === 4),
    );

    if (next) {
      replayerRef.current.pause();
      const nextOffset = next.timestamp - startTimeRef.current;
      replayerRef.current.play(nextOffset);
      setProgress(nextOffset);
    }
  };

  const formatTime = (ms: number) => {
    if (!ms || ms < 0) return "0:00";

    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;

    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div
      ref={wrapperRef}
      className={`
          replay-stage
          group relative w-full overflow-hidden
          border border-border/60 bg-background
          ${isFullscreen ? "fixed inset-0 z-50" : ""}
      `}
    >
      <div className="relative aspect-video bg-black">
        <div ref={containerRef} className="absolute inset-0" />

        <div className="absolute top-0 left-0 right-0 px-4 py-2 flex justify-between text-xs text-muted-foreground bg-linear-to-b from-black/60 to-transparent">
          <span className="font-medium text-white/80">Replay</span>
          <span className="font-mono text-white/70">
            {formatTime(progress)} / {formatTime(duration)}
          </span>
        </div>

        <div
          className="
            absolute bottom-0 left-0 right-0
            px-4 pb-3 pt-6
            bg-linear-to-t from-black/70 to-transparent
            opacity-0 group-hover:opacity-100 transition
          "
        >
          <input
            type="range"
            min={0}
            max={duration}
            value={Math.min(progress, duration)}
            onChange={(e) => seek(Number(e.target.value))}
            className="w-full accent-primary"
          />

          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconButton onClick={togglePlay}>
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </IconButton>

              <IconButton onClick={skipToNextInteraction}>
                <SkipForward size={16} />
              </IconButton>

              <div className="flex items-center gap-1 ml-2">
                {[1, 1.5, 2].map((s) => (
                  <button
                    key={s}
                    onClick={() => changeSpeed(s)}
                    className={`
                  text-xs px-2 py-1
                  ${speed === s ? "text-white" : "text-white/50"}
                `}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <IconButton onClick={toggleFullscreen}>
                {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
              </IconButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="
        flex items-center justify-center
        h-8 w-8
        rounded-md
        text-white/80
        hover:text-white
        hover:bg-white/10
        transition
      "
    >
      {children}
    </button>
  );
}
