import { Link } from "react-router-dom";
import {
  BarChart3,
  Code,
  Globe,
  Radar,
  Rocket,
  Server,
  Shield,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import CodeBox from "@/components/CodeBox";
import { SCRIPT_TAG_CODE } from "@/lib/constants";
import { PublicPageLayout } from "./components/PublicPageLayout";
import { Icons } from "@/lib/icons";

export function LandingPage() {
  const featureCards = [
    {
      icon: <Zap className="h-5 w-5 text-theme" />,
      title: "2-Minute Setup",
      description:
        "Drop a single script tag and start collecting product signals immediately.",
    },
    {
      icon: <BarChart3 className="h-5 w-5 text-theme" />,
      title: "Live Dashboards",
      description:
        "Watch sessions, funnels, and page behavior update in real time.",
    },
    {
      icon: <Code className="h-5 w-5 text-theme" />,
      title: "Custom Events API",
      description:
        "Instrument any backend or frontend action with language-agnostic calls.",
    },
    {
      icon: <Shield className="h-5 w-5 text-theme" />,
      title: "Privacy by Design",
      description:
        "Self-hosted mode gives full data ownership with no third-party dependency.",
    },
  ];

  return (
    <PublicPageLayout>
      <BackgroundEffects />

      <section className="relative px-4 pb-20 pt-14 md:pt-20">
        <div className="container mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-balance text-5xl font-extrabold leading-tight tracking-tight md:text-7xl">
              Love your product telemetry again
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
              Trackion delivers session insights, custom events, and reliable
              observability in one clean workflow. Start in cloud beta, then
              move to self-hosting when you are ready to scale with full
              control.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to="/auth">
                <Button
                  size="lg"
                  className="w-full px-10 py-6 text-base cursor-pointer sm:w-auto"
                >
                  Start Free
                </Button>
              </Link>
              <a href="/docs/" target="_blank" rel="noreferrer">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full px-10 py-6 text-base cursor-pointer sm:w-auto"
                >
                  Read Docs
                </Button>
              </a>
            </div>
          </div>

          <div className="relative mx-auto mt-14 max-w-5xl">
            <div className="absolute -inset-10 -z-10 bg-[radial-gradient(circle_at_top,var(--color-chart-2)_0%,transparent_55%)] opacity-25 blur-2xl" />
            <div className="overflow-hidden rounded-3xl border border-chart-2/30 bg-card/85 p-2 shadow-2xl backdrop-blur-sm">
              <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-muted/30">
                <video
                  src="https://res.cloudinary.com/p8labs/video/upload/v1774267109/trackion-product-demo_b2fvuu.mp4"
                  className="aspect-video w-full"
                  preload="metadata"
                  poster="/hero_dark.png"
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls
                />
              </div>
            </div>
          </div>

          {/* <div className="mx-auto mt-12 grid max-w-5xl grid-cols-2 gap-4 rounded-2xl border border-border/50 bg-card/65 p-5 text-sm text-muted-foreground backdrop-blur md:grid-cols-4">
            <div>
              <p className="text-2xl font-bold text-foreground">7,475</p>
              <p>Projects Tracked</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">77M+</p>
              <p>Events Processed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">453</p>
              <p>Contributors</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">99.9%</p>
              <p>API Uptime</p>
            </div>
          </div> */}
        </div>
      </section>

      <section className="px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-chart-3">
                Features
              </p>
              <h2 className="text-3xl font-bold md:text-4xl">
                Built to track fast-moving products
              </h2>
            </div>
            <a
              href="https://github.com/P8labs/trackion"
              target="_blank"
              rel="noreferrer"
            >
              <Button
                variant="secondary"
                className="gap-2 px-6 py-5 text-sm cursor-pointer"
              >
                <Icons.github className="h-4 w-4" />
                Star on GitHub
              </Button>
            </a>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-12">
            <div className="rounded-3xl border border-border/70 bg-card/80 p-7 lg:col-span-7">
              <div className="mb-5 inline-flex rounded-xl border border-chart-2/30 bg-chart-1/20 p-2 text-chart-3">
                <Radar className="h-5 w-5" />
              </div>
              <h3 className="text-2xl font-bold">
                Realtime event intelligence
              </h3>
              <p className="mt-3 max-w-xl text-muted-foreground">
                Trace page journeys, key conversion actions, and custom events
                in one timeline made for engineering and product teams.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border border-border/70 bg-background/60 p-4">
                  Multi-project isolation
                </div>
                <div className="rounded-xl border border-border/70 bg-background/60 p-4">
                  Session-level analytics
                </div>
                <div className="rounded-xl border border-border/70 bg-background/60 p-4">
                  Streaming ingestion
                </div>
                <div className="rounded-xl border border-border/70 bg-background/60 p-4">
                  Language-agnostic APIs
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-border/70 bg-card/80 p-7 lg:col-span-5">
              <div className="mb-5 inline-flex rounded-xl border border-chart-3/30 bg-chart-3/10 p-2 text-chart-3">
                <Rocket className="h-5 w-5" />
              </div>
              <h3 className="text-2xl font-bold">Production-ready rollout</h3>
              <p className="mt-3 text-muted-foreground">
                Start with cloud beta and switch to self-hosting for full data
                ownership, predictable costs, and deployment flexibility.
              </p>
              <div className="mt-6 space-y-3 text-sm text-muted-foreground">
                <div className="rounded-xl border border-border/70 bg-background/60 px-4 py-3">
                  Cloud beta tier up to 10K events
                </div>
                <div className="rounded-xl border border-border/70 bg-background/60 px-4 py-3">
                  Docker-first self-hosting workflow
                </div>
                <div className="rounded-xl border border-border/70 bg-background/60 px-4 py-3">
                  Fully open source and auditable
                </div>
              </div>
            </div>

            {featureCards.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-border/70 bg-card/70 p-6 lg:col-span-3"
              >
                <div className="mb-4 inline-flex rounded-lg border border-theme/25 bg-theme/10 p-2">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid items-start gap-10 lg:grid-cols-2">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-chart-3">
                Build Quickly
              </p>
              <h2 className="text-3xl font-bold md:text-4xl">
                Instrument in minutes, not days
              </h2>
              <p className="mt-4 max-w-xl text-muted-foreground">
                Create a project, copy your key, and drop in the snippet. You
                can start with page analytics, then add custom events as your
                product grows.
              </p>

              <div className="mt-6 space-y-4 text-sm text-muted-foreground">
                <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-card/80 p-4">
                  <span className="mt-0.5 h-2 w-2 rounded-full bg-chart-2" />
                  Create your first project in the dashboard
                </div>
                <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-card/80 p-4">
                  <span className="mt-0.5 h-2 w-2 rounded-full bg-chart-3" />
                  Add script tag to your frontend
                </div>
                <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-card/80 p-4">
                  <span className="mt-0.5 h-2 w-2 rounded-full bg-theme" />
                  Send custom events from client or server
                </div>
              </div>

              <div className="mt-7">
                <Link to="/auth">
                  <Button className="px-7 py-5 text-sm cursor-pointer">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/85 p-1">
              <CodeBox code={SCRIPT_TAG_CODE} language="html" />
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold md:text-4xl">
            Choose your deployment path
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
            Start where it is easiest, move where it is safest for your stack.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="relative overflow-hidden rounded-3xl border border-chart-2/30 bg-card/85 p-7">
              <div className="pointer-events-none absolute -right-14 -top-10 h-40 w-40 rounded-full bg-chart-2/20 blur-3xl" />
              <div className="relative">
                <div className="mb-4 inline-flex rounded-xl border border-chart-2/30 bg-chart-1/20 p-2 text-chart-3">
                  <Globe className="h-5 w-5" />
                </div>
                <h3 className="text-2xl font-semibold">Cloud Beta</h3>
                <p className="mt-3 text-muted-foreground">
                  Hosted beta for demos and quick evaluation with no setup
                  overhead.
                </p>
                <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
                  <li>Free tier up to 10,000 events</li>
                  <li>Managed infrastructure</li>
                  <li>Great for trial workloads</li>
                </ul>
                <Link to="/auth" className="mt-6 inline-block">
                  <Button className="px-7 py-5 text-sm cursor-pointer">
                    Try Beta Free
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-chart-3/30 bg-card/85 p-7">
              <div className="pointer-events-none absolute -bottom-14 -left-10 h-40 w-40 rounded-full bg-chart-3/20 blur-3xl" />
              <div className="relative">
                <div className="mb-4 inline-flex rounded-xl border border-chart-3/30 bg-chart-3/10 p-2 text-chart-3">
                  <Server className="h-5 w-5" />
                </div>
                <h3 className="text-2xl font-semibold">Self-Hosted</h3>
                <p className="mt-3 text-muted-foreground">
                  Run Trackion on your own infrastructure with complete control
                  over your telemetry data.
                </p>
                <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
                  <li>Full data ownership</li>
                  <li>Docker-ready deployment</li>
                  <li>Recommended for production</li>
                </ul>
                <a
                  href="/docs/self-hosting/"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-block"
                >
                  <Button
                    variant="outline"
                    className="px-7 py-5 text-sm cursor-pointer"
                  >
                    View Setup Guide
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-20 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <div className="rounded-3xl border border-border/70 bg-card/80 p-8 text-center md:p-12">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-chart-3">
              Ready To Ship
            </p>
            <h2 className="mx-auto mt-3 max-w-3xl text-3xl font-bold md:text-5xl">
              Build telemetry your team will actually use
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Trackion keeps the setup simple, the data useful, and the
              deployment path flexible from day one.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to="/auth">
                <Button
                  size="lg"
                  className="w-full px-10 py-6 text-base cursor-pointer sm:w-auto"
                >
                  Create Free Project
                </Button>
              </Link>
              <a href="/docs/quick-start/" target="_blank" rel="noreferrer">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full px-10 py-6 text-base cursor-pointer sm:w-auto"
                >
                  Quick Start Guide
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </PublicPageLayout>
  );
}

export function BackgroundEffects() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-40 left-1/2 h-144 w-xl -translate-x-1/2 rounded-full border border-chart-2/20 opacity-30 animate-spin-slow" />
      <div className="absolute -top-28 left-1/2 h-112 w-md -translate-x-1/2 rounded-full border border-chart-3/20 opacity-30 animate-spin-reverse" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,var(--color-chart-2)_0%,transparent_40%),radial-gradient(circle_at_bottom,var(--color-chart-3)_0%,transparent_35%)] opacity-20" />

      <div className="absolute inset-0">
        <div className="signal-dot left-[9%] top-[18%]" />
        <div className="signal-dot left-[81%] top-[35%]" />
        <div className="signal-dot left-[23%] top-[70%]" />
      </div>
    </div>
  );
}
