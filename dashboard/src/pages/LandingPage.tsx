import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { ThemeToggle } from "../components/ui/theme-toggle";
import {
  BarChart3,
  Zap,
  Shield,
  Github,
  Code,
  Globe,
  Server,
} from "lucide-react";

export function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img src="/trackion_t.png" alt="Trackion" className="w-8 h-8" />
            <span className="font-bold text-xl">Trackion</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <a
              href="#features"
              className="text-muted-foreground hover:text-foreground"
            >
              Features
            </a>
            <a
              href="https://github.com/P8labs/trackion/wiki/Introduction"
              target="_blank"
              className="text-muted-foreground hover:text-foreground"
            >
              Docs
            </a>
            <a
              href="https://github.com/p8labs/trackion"
              className="text-muted-foreground hover:text-foreground"
            >
              GitHub
            </a>
            <ThemeToggle />
            <Link to="/auth">
              <Button variant="outline">Sign In</Button>
            </Link>
          </nav>
        </div>
      </header>

      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-linear-to-r from-[#ff6b35] to-[#d73502] bg-clip-text text-transparent">
            Lightweight Telemetry Infrastructure
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Track, analyze, and understand your application with real-time
            analytics and custom events. Self-hosted or SaaS - your choice, your
            data.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/auth">
              <Button size="lg" variant="outline">
                Get Started Free
              </Button>
            </Link>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-card rounded-lg border shadow-xl p-1">
              <div className="bg-[#1d1816] rounded-md aspect-video flex items-center justify-center">
                <img
                  src="/hero.png"
                  alt="Dashboard Image"
                  className="rounded aspect-video"
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
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-card rounded-lg p-6 border">
              <div className="flex items-center mb-4">
                <Globe className="h-8 w-8 text-[#ff6b35] mr-3" />
                <h3 className="text-xl font-semibold">SaaS (Coming Soon)</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Hosted solution for quick setup. Start tracking immediately
                without any infrastructure setup.
              </p>
              <ul className="text-sm text-muted-foreground space-y-2 mb-6">
                <li>• No setup required</li>
                <li>• Managed infrastructure</li>
                <li>• Automatic updates</li>
                <li>• Support included</li>
              </ul>
              <Button className="w-full" disabled>
                Coming Soon
              </Button>
            </div>

            <div className="bg-card rounded-lg p-6 border">
              <div className="flex items-center mb-4">
                <Server className="h-8 w-8 text-[#ff6b35] mr-3" />
                <h3 className="text-xl font-semibold">Self-Hosted</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Deploy on your infrastructure. Complete control over your data
                and privacy.
              </p>
              <ul className="text-sm text-muted-foreground space-y-2 mb-6">
                <li>• Complete data ownership</li>
                <li>• Deploy anywhere</li>
                <li>• Open source</li>
                <li>• No vendor lock-in</li>
              </ul>
              <Link to="/docs" className="block">
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
            <div className="text-center">
              <div className="w-12 h-12 bg-[#ff6b35]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-[#ff6b35]" />
              </div>
              <h3 className="text-lg font-semibold mb-2">2-Minute Setup</h3>
              <p className="text-muted-foreground">
                Add a single script tag and start tracking immediately. No
                complex configuration.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-[#ff6b35]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-6 w-6 text-[#ff6b35]" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Real-time Analytics
              </h3>
              <p className="text-muted-foreground">
                Monitor page views, sessions, and user engagement with live
                dashboard updates.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-[#ff6b35]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Code className="h-6 w-6 text-[#ff6b35]" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Custom Events</h3>
              <p className="text-muted-foreground">
                Track any action with our simple REST API. Works with any
                programming language.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-[#ff6b35]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-[#ff6b35]" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Privacy First</h3>
              <p className="text-muted-foreground">
                Self-hosted means complete data ownership. No third-party
                tracking or data sharing.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-[#ff6b35]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Globe className="h-6 w-6 text-[#ff6b35]" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Multi-Project</h3>
              <p className="text-muted-foreground">
                Organize tracking across multiple applications and environments
                with project isolation.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-[#ff6b35]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Github className="h-6 w-6 text-[#ff6b35]" />
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
                <div className="bg-muted rounded p-4 font-mono text-sm overflow-x-auto">
                  <pre className="text-left whitespace-pre-wrap">
                    {`<script 
  src="https://your-server.com/t.js"
  data-project="your-project-key">
</script>`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-5 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <img src="/trackion_t.png" alt="Trackion" className="w-8 h-8" />
                <span className="font-bold">Trackion</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Lightweight telemetry infrastructure for developers.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Product</h4>
              <div className="space-y-2 text-sm">
                <Link
                  to="/docs"
                  className="text-muted-foreground hover:text-foreground block"
                >
                  Documentation
                </Link>
                <a
                  href="https://github.com/p8labs/trackion"
                  className="text-muted-foreground hover:text-foreground block"
                >
                  GitHub
                </a>
                <Link
                  to="/auth"
                  className="text-muted-foreground hover:text-foreground block"
                >
                  Dashboard
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Resources</h4>
              <div className="space-y-2 text-sm">
                <Link
                  to="/docs/quick-start"
                  className="text-muted-foreground hover:text-foreground block"
                >
                  Quick Start
                </Link>
                <Link
                  to="/docs/api"
                  className="text-muted-foreground hover:text-foreground block"
                >
                  API Reference
                </Link>
                <Link
                  to="/docs/self-hosting"
                  className="text-muted-foreground hover:text-foreground block"
                >
                  Self-hosting
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <div className="space-y-2 text-sm">
                <Link
                  to="/about"
                  className="text-muted-foreground hover:text-foreground block"
                >
                  About
                </Link>
                <a
                  href="https://p8labs.tech"
                  className="text-muted-foreground hover:text-foreground block"
                >
                  P8Labs
                </a>
                <a
                  href="mailto:hello@p8labs.tech"
                  className="text-muted-foreground hover:text-foreground block"
                >
                  Contact
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <div className="space-y-2 text-sm">
                <Link
                  to="/terms"
                  className="text-muted-foreground hover:text-foreground block"
                >
                  Terms of Service
                </Link>
                <Link
                  to="/privacy"
                  className="text-muted-foreground hover:text-foreground block"
                >
                  Privacy Policy
                </Link>
                <a
                  href="https://github.com/p8labs/trackion/blob/main/LICENSE"
                  className="text-muted-foreground hover:text-foreground block"
                >
                  MIT License
                </a>
              </div>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2026 P8Labs. Released under the MIT License.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
