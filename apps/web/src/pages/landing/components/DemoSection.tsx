import { PlusDecor } from "@trackion/ui/decoration";
import { PauseIcon, PlayIcon } from "lucide-react";
import { useRef, useState, useEffect } from "react";

export default function DemoSection() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [inside, setInside] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!inside || playing) return;

    setLoading(true);
    setCountdown(3);

    let time = 3;

    const interval = setInterval(() => {
      time -= 1;
      setCountdown(time);
    }, 1000);

    hoverTimer.current = setTimeout(() => {
      playVideo();
    }, 3000);

    return () => {
      clearInterval(interval);

      if (hoverTimer.current) {
        clearTimeout(hoverTimer.current);
        hoverTimer.current = null;
      }

      if (!started) {
        setLoading(false);
        setCountdown(3);
      }
    };
  }, [inside]);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();

      const isInside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      setInside(isInside);
    };

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  const playVideo = () => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
      setPlaying(true);
      setStarted(true);
      setLoading(false);
    }
  };

  const pauseVideo = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setPlaying(false);
    }
  };

  return (
    <div className="relative px-4 py-10">
      <div className="absolute inset-0 border-l border-r dark:border-card pointer-events-none"></div>
      <PlusDecor />

      <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 z-20">
        <button
          onClick={playing ? pauseVideo : playVideo}
          className="flex items-center gap-2 px-3 py-1.5 text-xs 
            rounded-md border border-border bg-secondary-foreground/5 backdrop-blur-md 
            hover:bg-accent/10 transition"
        >
          {playing ? (
            <>
              <PauseIcon className="fill-accent size-3" /> Pause Demo
            </>
          ) : (
            <>
              <PlayIcon className="fill-accent size-3" />
              Watch Demo
            </>
          )}
        </button>
      </div>
      <CursorFollower
        active={inside && !playing}
        loading={loading}
        countdown={countdown}
      />
      <div
        ref={containerRef}
        className="relative rounded-2xl border border-white/10 bg-black overflow-hidden cursor-e"
      >
        <video
          ref={videoRef}
          src="https://res.cloudinary.com/p8labs/video/upload/v1774267109/trackion-product-demo_b2fvuu.mp4"
          className="w-full aspect-video"
          muted
          playsInline
          controls={false}
          poster="/hero_dark.png"
        />
      </div>
    </div>
  );
}

function CursorFollower({
  active,
  loading,
  countdown,
}: {
  active: boolean;
  loading: boolean;
  countdown: number;
}) {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  if (!active) return null;

  return (
    <div
      className="pointer-events-none fixed z-9999"
      style={{ left: pos.x, top: pos.y }}
    >
      <div
        className="translate-x-2 translate-y-2 flex items-center gap-2 px-3 py-1.5 rounded-md 
        bg-white/10 backdrop-blur-md border border-white/10 text-xs text-white shadow-lg"
      >
        {loading ? (
          <>
            <div className="relative w-4 h-4">
              <div className="absolute inset-0 border border-white/30 rounded-full" />
              <div className="absolute inset-0 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span className="absolute inset-0 flex items-center justify-center text-[10px]">
                {countdown}
              </span>
            </div>
            Activating Demo...
          </>
        ) : (
          <>Play</>
        )}
      </div>
    </div>
  );
}
