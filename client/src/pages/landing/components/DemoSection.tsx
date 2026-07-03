import { ActionIcon, Group, Loader, Paper, Text } from "@mantine/core";
import { PauseIcon, PlayIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function DemoSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hoverTimer = useRef<any | null>(null);

  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [inside, setInside] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!inside || playing) return;

    setLoading(true);
    setCountdown(3);

    let remaining = 3;

    const interval = setInterval(() => {
      remaining--;
      setCountdown(remaining);
    }, 1000);

    hoverTimer.current = setTimeout(() => {
      playVideo();
    }, 3000);

    return () => {
      clearInterval(interval);

      if (hoverTimer.current) {
        clearTimeout(hoverTimer.current);
      }

      if (!started) {
        setLoading(false);
        setCountdown(3);
      }
    };
  }, [inside, playing]);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();

      setInside(
        e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom,
      );
    };

    window.addEventListener("mousemove", handleMove);

    return () => {
      window.removeEventListener("mousemove", handleMove);
    };
  }, []);

  const playVideo = async () => {
    try {
      await videoRef.current?.play();
      setPlaying(true);
      setStarted(true);
      setLoading(false);
    } catch {}
  };

  const pauseVideo = () => {
    videoRef.current?.pause();
    setPlaying(false);
  };

  return (
    <>
      <CursorFollower
        active={inside && !playing}
        loading={loading}
        countdown={countdown}
      />

      <Paper pos="relative" py="xl">
        <Group justify="center" mb="md">
          <ActionIcon
            variant="light"
            radius="xl"
            size="lg"
            onClick={playing ? pauseVideo : playVideo}
          >
            {playing ? <PauseIcon size={16} /> : <PlayIcon size={16} />}
          </ActionIcon>

          <Text size="sm" fw={500}>
            {playing ? "Pause Demo" : "Watch Demo"}
          </Text>
        </Group>

        <Paper ref={containerRef} radius="xl" withBorder>
          <video
            ref={videoRef}
            src="https://res.cloudinary.com/pz-public-assets/video/upload/v1783053168/trackion_al7kti.mp4"
            poster="/hero.png"
            muted
            playsInline
            controls={false}
            style={{
              width: "100%",
              aspectRatio: "16 / 9",
              display: "block",
            }}
            className="rounded-xl object-cover"
          />
        </Paper>
      </Paper>
    </>
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
  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const move = (e: MouseEvent) => {
      setPosition({
        x: e.clientX,
        y: e.clientY,
      });
    };

    window.addEventListener("mousemove", move);

    return () => {
      window.removeEventListener("mousemove", move);
    };
  }, []);

  if (!active) return null;

  return (
    <Paper
      shadow="md"
      radius="md"
      p="xs"
      withBorder
      pos="fixed"
      style={{
        left: position.x + 12,
        top: position.y + 12,
        zIndex: 9999,
        pointerEvents: "none",
        backdropFilter: "blur(10px)",
      }}
    >
      <Group gap="xs">
        {loading ? (
          <>
            <Loader size="xs" />
            <Text size="xs">Activating Demo ({countdown})</Text>
          </>
        ) : (
          <Text size="xs">Play Demo</Text>
        )}
      </Group>
    </Paper>
  );
}
