import { Link } from "react-router-dom";
import {
  ArrowRightIcon,
  BarChart3,
  Code,
  Radar,
  Rocket,
  Shield,
  Zap,
} from "lucide-react";
import { Button } from "@trackion/ui/button";
import { FullLine, PLine, Strip, PlusDecor } from "@trackion/ui/decoration";

import { CodeBox } from "@trackion/ui/code-box";
import { SCRIPT_TAG_CODE } from "@/lib/constants";
import { Icons } from "@/lib/icons";

import { Header } from "./components/Header";
import DemoSection from "./components/DemoSection";
import { Footer } from "./components/Footer";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <BackgroundEffects />
      <div className="mx-auto relative md:max-w-5xl *:[[id]]:scroll-mt-22">
        <Header />
        <FullLine />
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center justify-between gap-4 bg-muted/30 px-4 py-3">
            <div className="flex items-center gap-3 text-sm">
              <span className="inline-flex h-2 w-2 rounded-full bg-(--color-chart-2)" />
              <p className="text-muted-foreground">
                Desktop client is now available for Trackion.
              </p>
            </div>

            <a href="/downloads">
              <button className="text-sm font-medium hover:underline">
                Download →
              </button>
            </a>
          </div>
        </div>
        <section className="relative px-4 pb-20 pt-14 md:pt-20">
          <PLine />
          <div className="text-center mb-10">
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
          <PlusDecor />
        </section>
        <FullLine />

        <DemoSection />

        <FullLine />
        <Strip />
        <FullLine />

        <section className="relative">
          <PlusDecor position="top" />
          <PLine />
          <div className="relative px-4">
            <div className="py-10 flex flex-wrap items-end justify-between gap-4">
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
            <FullLine />
            <PlusDecor position="bottom" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-12">
            <div
              className="
                group lg:col-span-7 px-6 py-10
                border-r border-border/60 border-b lg:border-b-0 
                relative overflow-hidden transition
                hover:bg-muted/20
              "
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle at 20% 0%, var(--accent-soft), transparent 60%)",
                }}
              />

              <div
                className="absolute top-0 left-0 h-px w-0 transition-all duration-500 group-hover:w-full"
                style={{ backgroundColor: "var(--accent-medium)" }}
              />

              <div
                className="
                  mb-6 inline-flex p-2 rounded-md 
                  bg-muted/40 border border-border/50
                  text-muted-foreground
                  transition group-hover:bg-muted/60 group-hover:text-foreground
                "
              >
                <Radar className="h-5 w-5" />
              </div>

              <h3 className="text-lg font-medium tracking-tight transition group-hover:text-foreground">
                Realtime event intelligence
              </h3>

              <p className="mt-3 text-muted-foreground max-w-xl leading-relaxed">
                Trace page journeys, key conversion actions, and custom events
                in one timeline made for engineering and product teams.
              </p>

              <div className="mt-8 grid grid-cols-2 border border-border/60">
                {[
                  "Multi-project isolation",
                  "Session-level analytics",
                  "Streaming ingestion",
                  "Language-agnostic APIs",
                ].map((item, i) => (
                  <div
                    key={i}
                    className="
                      relative px-4 py-3 text-sm
                      border-b border-border/60 last:border-b-0 even:border-l
                      transition group/item hover:bg-muted/30
                    "
                  >
                    <div
                      className="absolute left-0 top-0 h-full w-0.5 transition"
                      style={{
                        backgroundColor: "var(--accent-medium)",
                        opacity: 0,
                      }}
                    />

                    <div className="group-hover/item:[&>div]:opacity-100">
                      {item}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="
              group lg:col-span-5 px-6 py-10
              relative overflow-hidden
              border-border/60
              transition hover:bg-muted/20
            "
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle at 80% 0%, var(--accent-soft), transparent 60%)",
                }}
              />

              <div
                className="absolute top-0 right-0 w-px h-0 transition-all duration-500 group-hover:h-full"
                style={{ backgroundColor: "var(--accent-medium)" }}
              />

              <div
                className="
                mb-6 inline-flex p-2 rounded-md 
                bg-muted/40 border border-border/50
                text-muted-foreground
                transition group-hover:bg-muted/60 group-hover:text-foreground
              "
              >
                <Rocket className="h-5 w-5" />
              </div>

              <h3 className="text-lg font-medium tracking-tight transition group-hover:text-foreground">
                Production-ready rollout
              </h3>

              <p className="mt-3 text-muted-foreground leading-relaxed">
                Start with cloud beta and switch to self-hosting for full data
                ownership, predictable costs, and deployment flexibility.
              </p>

              <div className="mt-8 border border-border/60">
                {[
                  "Cloud beta tier up to 10K events",
                  "Docker-first self-hosting workflow",
                  "Fully open source and auditable",
                ].map((item, i) => (
                  <div
                    key={i}
                    className="
                      relative px-5 py-4 text-sm
                      border-b border-border/60 last:border-b-0
                      transition group/item hover:bg-muted/30
                    "
                  >
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {featureCards.map((feature) => (
              <div
                key={feature.title}
                className="
                  lg:col-span-3 px-6 py-7
                  border-border/60 border-r last:border-r-0
                  group relative overflow-hidden transition
                  hover:bg-muted/20 border-t
                  "
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(circle at 50% 0%, var(--accent-soft), transparent 70%)",
                  }}
                />

                <div
                  className="absolute top-0 left-0 h-px w-0 transition-all duration-500 group-hover:w-full"
                  style={{ backgroundColor: "var(--accent-medium)" }}
                />

                <div
                  className="
                  mb-4 inline-flex p-2 rounded-md 
                  bg-muted/40 border border-border/50 
                  text-muted-foreground
                  transition group-hover:bg-muted/60 group-hover:text-foreground
                  "
                >
                  {feature.icon}
                </div>

                <h3 className="text-sm font-medium tracking-tight transition group-hover:text-foreground">
                  {feature.title}
                </h3>

                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>

                <div
                  className="absolute bottom-0 left-0 h-px w-0 transition-all duration-500 group-hover:w-full"
                  style={{ backgroundColor: "var(--accent-soft)" }}
                />
              </div>
            ))}
          </div>
          <PlusDecor position="bottom" />
        </section>
        <FullLine />
        <Strip />
        <FullLine />
        <section className="relative">
          <PLine />
          <PlusDecor position="top" />
          <div className="relative px-4">
            <div className="py-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-chart-3">
                  Build Quickly
                </p>
                <h2 className="text-3xl font-bold md:text-4xl">
                  Instrument in minutes, not days
                </h2>
              </div>
            </div>
            <FullLine />
            <PlusDecor position="bottom" />
          </div>
          <div className="grid lg:grid-cols-2 border border-border/60">
            <div className="group relative px-8 py-10 border-r border-border/60">
              <p className="text-muted-foreground max-w-lg leading-relaxed">
                Create a project, copy your key, and drop in the snippet. You
                can start with page analytics, then add custom events as your
                product grows.
              </p>

              <div className="mt-8 border border-border/60">
                {[
                  "Create your first project in the dashboard",
                  "Add script tag to your frontend",
                  "Send custom events from client or server",
                ].map((step, i) => (
                  <div
                    key={i}
                    className="
                        relative px-5 py-4 text-sm
                        border-b border-border/60 last:border-b-0
                        transition group/item hover:bg-muted/30
                        "
                  >
                    <div
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: "var(--accent-medium)" }}
                    />

                    <span className="ml-5">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="group relative px-6 py-6">
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle at 80% 0%, var(--accent-soft), transparent 60%)",
                }}
              />

              <div
                className="absolute top-0 left-0 h-px w-0 transition-all duration-500 group-hover:w-full"
                style={{ backgroundColor: "var(--accent-medium)" }}
              />

              <div className="rounded-xl border border-border/60 overflow-hidden bg-background">
                <div className="flex items-center gap-2 px-3 py-2 border-b border-border/60 bg-muted/40">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
                  <span className="ml-3 text-xs text-muted-foreground">
                    snippet.html
                  </span>
                </div>

                <div className="p-4">
                  <CodeBox code={SCRIPT_TAG_CODE} language="html" />
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <Link to="/auth">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full px-10 py-6 text-base cursor-pointer sm:w-auto"
                  >
                    Get Started <ArrowRightIcon />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <FullLine />
        <Strip />
        <FullLine />

        <section className="relative">
          <PLine />
          <PlusDecor position="top" />
          <div className="relative px-4">
            <div className="py-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-chart-3">
                  Simple, predictable pricing
                </p>
                <h2 className="text-3xl font-bold md:text-4xl">
                  Start free, scale when you need more.
                </h2>
              </div>
            </div>
            <FullLine />
            <PlusDecor position="bottom" />
          </div>
          <div className="grid md:grid-cols-2 border border-border/60">
            <div className="group relative px-8 py-10 border-r border-border/60">
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle at 20% 0%, var(--accent-soft), transparent 60%)",
                }}
              />

              <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground">
                Free
              </p>

              <h3 className="mt-2 text-2xl font-medium tracking-tight">
                $0
                <span className="text-sm text-muted-foreground">/month</span>
              </h3>

              <p className="mt-3 text-muted-foreground">
                Perfect for getting started and small projects.
              </p>

              <div className="mt-6 border border-border/60">
                {[
                  "10,000 events / month",
                  "3 projects",
                  "10 config keys",
                  "Error retention: 3 days",
                  "Event retention: 30 days",
                ].map((item, i) => (
                  <div
                    key={i}
                    className="px-5 py-3 text-sm border-b border-border/60 last:border-b-0"
                  >
                    {item}
                  </div>
                ))}
              </div>

              <Link to="/auth" className="mt-6 inline-block">
                <Button
                  size="lg"
                  className="w-full px-10 py-6 text-base cursor-pointer sm:w-auto"
                >
                  Get Started
                </Button>
              </Link>
            </div>

            <div className="group relative px-8 py-10">
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle at 80% 0%, var(--accent-soft), transparent 60%)",
                }}
              />

              <div className="absolute top-4 right-4 text-xs px-2 py-1 rounded-md border border-border/60 text-muted-foreground">
                Coming Soon
              </div>

              <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground">
                Pro
              </p>

              <h3 className="mt-2 text-2xl font-medium tracking-tight">
                $9 <span className="text-sm text-muted-foreground">/month</span>
              </h3>

              <p className="mt-3 text-muted-foreground">
                For growing products and production workloads.
              </p>

              <div className="mt-6 border border-border/60">
                {[
                  "200,000 events / month",
                  "5 projects",
                  "Unlimited config keys",
                  "Error retention: 14 days",
                  "Event retention: 90 days",
                ].map((item, i) => (
                  <div
                    key={i}
                    className="px-5 py-3 text-sm border-b border-border/60 last:border-b-0"
                  >
                    {item}
                  </div>
                ))}
              </div>

              <Link to="#" className="mt-6 inline-block">
                <Button
                  variant="outline"
                  disabled
                  className="w-full px-10 py-6 text-base cursor-pointer sm:w-auto"
                >
                  Coming Soon
                </Button>
              </Link>
            </div>
          </div>

          <div className="border-border/60 px-6 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Self-hosted</p>
              <p className="text-sm text-muted-foreground mt-1">
                Full control over your data with Docker-first deployment.
              </p>
            </div>

            <a href="/docs/self-hosting/" target="_blank" rel="noreferrer">
              <Button
                variant="outline"
                className="w-full px-10 py-6 text-base cursor-pointer sm:w-auto"
              >
                View Setup Guide
              </Button>
            </a>
          </div>
          <PlusDecor />
        </section>

        <FullLine />
        <Strip />
        <FullLine />

        <section className="relative">
          <FullLine />
          <PlusDecor position="top" />
          <PLine />

          <div className="group relative overflow-hidden px-10 py-16 text-center flex items-center flex-col justify-center">
            <div
              className="absolute inset-0 opacity-60 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at 50% 0%, var(--accent-soft), transparent 70%)",
              }}
            />

            <div
              className="absolute inset-0 opacity-40 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at 50% 100%, var(--accent-soft), transparent 80%)",
              }}
            />

            <div
              className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[linear-gradient(to_right,black_1px,transparent_1px),linear-gradient(to_bottom,black_1px,transparent_1px)]
                dark:bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)]
                bg-size-[36px_36px]"
            />

            <div
              className="absolute top-0 left-0 h-px w-full opacity-60"
              style={{ backgroundColor: "var(--accent-medium)" }}
            />

            <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground">
              Ready To Ship
            </p>

            <h2 className="mt-5 text-3xl md:text-5xl font-medium tracking-tight max-w-3xl mx-auto">
              Build telemetry your team will actually use
            </h2>

            <p className="mt-5 text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Trackion keeps the setup simple, the data useful, and the
              deployment path flexible from day one.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/auth">
                <Button
                  size="lg"
                  className="w-full px-10 py-6 text-base cursor-pointer sm:w-auto"
                >
                  Create Free Project <ArrowRightIcon />
                </Button>
              </Link>

              <a href="/docs/quick-start/" target="_blank">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full px-10 py-6 text-base cursor-pointer sm:w-auto"
                >
                  Quick Start Guide
                </Button>
              </a>
            </div>

            <div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px w-1/2 opacity-40"
              style={{ backgroundColor: "var(--accent-medium)" }}
            />
          </div>
          <PlusDecor position="bottom" />
        </section>

        <FullLine />
        <Strip />
        <FullLine />

        <Footer />
      </div>
    </div>
  );
}

export function BackgroundEffects() {
  return (
    <div className="pointer-events-none absolute inset-0 - overflow-hidden">
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

const featureCards = [
  {
    icon: <Zap className="h-5 w-5" />,
    title: "2-Minute Setup",
    description:
      "Drop a single script tag and start collecting product signals immediately.",
  },
  {
    icon: <BarChart3 className="h-5 w-5" />,
    title: "Live Dashboards",
    description:
      "Watch sessions, funnels, and page behavior update in real time.",
  },
  {
    icon: <Code className="h-5 w-5" />,
    title: "Custom Events API",
    description:
      "Instrument any backend or frontend action with language-agnostic calls.",
  },
  {
    icon: <Shield className="h-5 w-5" />,
    title: "Privacy by Design",
    description:
      "Self-hosted mode gives full data ownership with no third-party dependency.",
  },
];
