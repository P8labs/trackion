import { Link } from "react-router-dom";
import { Code, Zap, Database } from "lucide-react";
import { Button } from "@trackion/ui/button";
import { PublicPageLayout } from "./components/PublicPageLayout";
import { Icons } from "@/lib/icons";
import { FullLine, PLine } from "@trackion/ui/decoration";

export function AboutPage() {
  return (
    <PublicPageLayout>
      <PLine />
      <div className="text-center mb-20 p-6">
        <h1 className="text-5xl font-bold mb-6 tracking-tight">Trackion</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Telemetry infrastructure that doesn't fight you. No bloat. No lock-in.{" "}
          <br /> Just events, data, and control.
        </p>
      </div>

      <section className="mb-20 p-6">
        <h2 className="text-2xl font-semibold mb-6">Why this exists</h2>

        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            Most analytics tools are either too heavy, too expensive, or too
            opaque. You ship a simple product and suddenly you're dealing with
            dashboards you don't trust and data you don't control.
          </p>

          <p>
            Trackion was built to fix that. It gives you the core primitives:
            events, sessions, and insights — without forcing a platform on you.
          </p>

          <p className="text-foreground font-medium">
            If you can send an event, you can understand your system.
          </p>
        </div>
      </section>

      <section className="mb-20 grid md:grid-cols-3 gap-6 p-6">
        <div className="border rounded-xl p-6">
          <Zap className="h-5 w-5 mb-4 text-theme" />
          <h3 className="font-semibold mb-2">Fast to adopt</h3>
          <p className="text-sm text-muted-foreground">
            Minimal setup. No long onboarding. You should be tracking data in
            minutes.
          </p>
        </div>

        <div className="border rounded-xl p-6">
          <Database className="h-5 w-5 mb-4 text-theme" />
          <h3 className="font-semibold mb-2">You own your data</h3>
          <p className="text-sm text-muted-foreground">
            Self-host if you want. No forced pipelines. No hidden processing.
          </p>
        </div>

        <div className="border rounded-xl p-6">
          <Code className="h-5 w-5 mb-4 text-theme" />
          <h3 className="font-semibold mb-2">Built for developers</h3>
          <p className="text-sm text-muted-foreground">
            Clean APIs, predictable behavior, no unnecessary abstractions.
          </p>
        </div>
      </section>

      <section className="mb-20 p-6">
        <h2 className="text-2xl font-semibold mb-6">Built by P8labs</h2>

        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            Trackion is built by{" "}
            <span className="text-foreground font-medium">P8labs Team</span>.
          </p>

          <p>
            P8labs focuses on building small, sharp developer tools — things
            that solve real problems without turning into platforms.
          </p>

          <p>
            This project started from a simple frustration:
            <span className="text-foreground">
              {" "}
              tracking events shouldn't require a full ecosystem.
            </span>
          </p>
        </div>
      </section>

      <section className="mb-20 p-6">
        <h2 className="text-2xl font-semibold mb-6">Open source first</h2>

        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            Trackion is MIT licensed. You can read the code, modify it, fork it,
            or run it however you want.
          </p>

          <p>No hidden logic. No black boxes.</p>
        </div>

        <div className="mt-6">
          <a href="https://github.com/P8labs/trackion">
            <Button variant="outline">
              <Icons.github className="h-4 w-4 mr-2" />
              View on GitHub
            </Button>
          </a>
        </div>
      </section>

      <section className="mb-20 p-6">
        <h2 className="text-2xl font-semibold mb-6">What's next</h2>

        <ul className="space-y-3 text-muted-foreground">
          <li>• Better dashboards (less noise, more signal)</li>
          <li>• Workflow / pipeline tracking</li>
          <li>• More flexible auth models</li>
          <li>• Stronger API surface</li>
        </ul>
      </section>

      <section className="text-center p-6">
        <div className="border rounded-2xl p-10 bg-muted/40">
          <h2 className="text-2xl font-semibold mb-4">Try it yourself</h2>

          <p className="text-muted-foreground mb-6">
            Run it locally, or use the cloud version (currently in beta).
          </p>

          <div className="flex justify-center gap-4">
            <a href="/docs/" target="_blank" rel="noreferrer">
              <Button variant="secondary">Read Docs</Button>
            </a>
            <Link to="/auth">
              <Button>Open Dashboard</Button>
            </Link>
          </div>
        </div>
      </section>
      <FullLine />
    </PublicPageLayout>
  );
}
