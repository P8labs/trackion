import { Link } from "react-router-dom";
import { BarChart3, Zap, Shield, Code, Globe, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import CodeBox from "@/components/CodeBox";
import { SCRIPT_TAG_CODE } from "@/lib/constants";
import { PublicPageLayout } from "./components/PublicPageLayout";
import { Icons } from "@/lib/icons";

export function LandingPage() {
  return (
    <PublicPageLayout>
      <BackgroundEffects />

      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-linear-to-r from-chart-1 to-chart-3 bg-clip-text text-transparent">
            Lightweight Telemetry Infrastructure
          </h1>
          <div className="inline-flex items-center gap-2 rounded-full border border-chart-2/30 bg-chart-1/10 px-4 py-1.5 text-sm font-semibold text-chart-3 mb-6">
            <span className="h-2 w-2 rounded-full bg-chart-3" />
            Open analytics stack for modern teams
          </div>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Track, analyze, and understand your application with real-time
            analytics and custom events. Try the beta cloud tier for demos, then
            move to self-hosting for full ownership and production control.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/auth">
              <Button size="lg" className="p-4 py-5" variant="default">
                Get Started Free
              </Button>
            </Link>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-card rounded-lg border shadow-xl p-1">
              <div className="bg-[#1d1816] rounded-md aspect-video flex items-center justify-center">
                <img
                  src="/hero_light.png"
                  alt="Dashboard Image"
                  className="dark:hidden block rounded aspect-video"
                />
                <img
                  src="/hero_dark.png"
                  alt="Dashboard Image"
                  className="dark:block hidden rounded aspect-video"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Choose Your Deployment
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
            <div className="relative overflow-hidden rounded-2xl border border-chart-2/25 bg-card/90 p-6 shadow-lg h-full flex flex-col">
              <div className="pointer-events-none absolute -top-20 -right-12 h-44 w-44 rounded-full bg-chart-2/25 blur-2xl" />
              <div className="relative flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Globe className="h-8 w-8 text-theme mr-3" />
                  <h3 className="text-xl font-semibold">Cloud Beta</h3>
                </div>
                <span className="rounded-full border border-chart-2/40 bg-chart-1/20 px-2.5 py-1 text-xs font-semibold text-chart-3">
                  Free 100K events
                </span>
              </div>
              <p className="text-muted-foreground mb-5">
                Hosted beta for quick testing. Great for demos and evaluation
                before moving to self-hosted production.
              </p>
              <ul className="text-sm text-muted-foreground space-y-2 mb-6 flex-1">
                <li>• No setup required</li>
                <li>• Managed infrastructure</li>
                <li>• Free tier: up to 100,000 events</li>
                <li>• Best for demo and trial workloads</li>
              </ul>
              <Link to="/auth" className="block">
                <Button className="w-full">Try Beta Free</Button>
              </Link>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-chart-3/25 bg-card/90 p-6 shadow-lg h-full flex flex-col">
              <div className="pointer-events-none absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-chart-3/20 blur-2xl" />
              <div className="relative flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Server className="h-8 w-8 text-theme mr-3" />
                  <h3 className="text-xl font-semibold">Self-Hosted</h3>
                </div>
                <span className="rounded-full border border-chart-3/30 bg-chart-3/10 px-2.5 py-1 text-xs font-semibold text-chart-3">
                  Recommended
                </span>
              </div>
              <p className="text-muted-foreground mb-5">
                Deploy on your infrastructure. Complete control over your data
                and privacy. Recommended for long-term and production use.
              </p>
              <ul className="text-sm text-muted-foreground space-y-2 mb-6 flex-1">
                <li>• Complete data ownership</li>
                <li>• Deploy anywhere</li>
                <li>• Open source</li>
                <li>• Recommended for production</li>
              </ul>
              <Link
                to="https://github.com/P8labs/trackion/wiki"
                target="_blank"
                rel="noreferrer"
                className="block"
              >
                <Button className="w-full" variant="outline">
                  View Setup Guide
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything You Need
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center rounded-2xl border border-border/60 bg-card/70 p-6 h-full">
              <div className="w-12 h-12 bg-theme/10 rounded-lg flex items-center justify-center mx-auto mb-4 ring-1 ring-theme/20">
                <Zap className="h-6 w-6 text-theme" />
              </div>
              <h3 className="text-lg font-semibold mb-2">2-Minute Setup</h3>
              <p className="text-muted-foreground">
                Add a single script tag and start tracking immediately. No
                complex configuration.
              </p>
            </div>

            <div className="text-center rounded-2xl border border-border/60 bg-card/70 p-6 h-full">
              <div className="w-12 h-12 bg-theme/10 rounded-lg flex items-center justify-center mx-auto mb-4 ring-1 ring-theme/20">
                <BarChart3 className="h-6 w-6 text-theme" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Real-time Analytics
              </h3>
              <p className="text-muted-foreground">
                Monitor page views, sessions, and user engagement with live
                dashboard updates.
              </p>
            </div>

            <div className="text-center rounded-2xl border border-border/60 bg-card/70 p-6 h-full">
              <div className="w-12 h-12 bg-theme/10 rounded-lg flex items-center justify-center mx-auto mb-4 ring-1 ring-theme/20">
                <Code className="h-6 w-6 text-theme" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Custom Events</h3>
              <p className="text-muted-foreground">
                Track any action with our simple REST API. Works with any
                programming language.
              </p>
            </div>

            <div className="text-center rounded-2xl border border-border/60 bg-card/70 p-6 h-full">
              <div className="w-12 h-12 bg-theme/10 rounded-lg flex items-center justify-center mx-auto mb-4 ring-1 ring-theme/20">
                <Shield className="h-6 w-6 text-theme" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Privacy First</h3>
              <p className="text-muted-foreground">
                Self-hosted means complete data ownership. No third-party
                tracking or data sharing.
              </p>
            </div>

            <div className="text-center rounded-2xl border border-border/60 bg-card/70 p-6 h-full">
              <div className="w-12 h-12 bg-theme/10 rounded-lg flex items-center justify-center mx-auto mb-4 ring-1 ring-theme/20">
                <Globe className="h-6 w-6 text-theme" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Multi-Project</h3>
              <p className="text-muted-foreground">
                Organize tracking across multiple applications and environments
                with project isolation.
              </p>
            </div>

            <div className="text-center rounded-2xl border border-border/60 bg-card/70 p-6 h-full">
              <div className="w-12 h-12 bg-theme/10 rounded-lg flex items-center justify-center mx-auto mb-4 ring-1 ring-theme/20">
                <Icons.github className="h-6 w-6 text-theme" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Open Source</h3>
              <p className="text-muted-foreground">
                MIT licensed, completely transparent. Audit the code, contribute
                features, or fork it.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-8">
            Get Started in 2 Minutes
          </h2>
          <div className="bg-card rounded-lg p-6 border">
            <div className="grid gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">
                  1. Create a Project
                </h3>
                <p className="text-muted-foreground mb-4">
                  Sign in to your dashboard and create a new project. Each
                  project gets a unique tracking key.
                </p>
                <Link to="/auth">
                  <Button variant="outline">Get Started</Button>
                </Link>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4">
                  2. Add Script Tag
                </h3>
                <div className="rounded overflow-x-auto">
                  <CodeBox code={SCRIPT_TAG_CODE} language="html" />
                </div>
              </div>
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
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-150 w-150 rounded-full border border-border opacity-20 animate-spin-slow" />
        <div className="absolute h-100 w-100 rounded-full border border-border opacity-10 animate-spin-reverse" />
      </div>

      <div className="absolute inset-0">
        <div className="signal-dot top-[20%] left-[10%]" />
        <div className="signal-dot top-[70%] left-[80%]" />
        <div className="signal-dot top-[50%] left-[40%]" />
      </div>

      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `
            linear-gradient(
              120deg,
              transparent 40%,
              var(--color-primary) 50%,
              transparent 60%
            )
          `,
          backgroundSize: "200% 200%",
          animation: "beam 6s linear infinite",
        }}
      />
    </div>
  );
}
