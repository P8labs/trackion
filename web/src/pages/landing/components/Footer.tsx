import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-chart-1/20 py-12 px-4 bg-background rounded-t-4xl">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-5 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <img
                src="/trackion_t.png"
                alt="Trackion"
                className="w-8 h-8 -ml-2"
              />
              <span className="font-bold">Trackion</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Lightweight telemetry infrastructure for developers.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Product</h4>
            <div className="space-y-2 text-sm">
              <a
                href="/docs/"
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-foreground block"
              >
                Documentation
              </a>
              <a
                href="https://github.com/P8labs/trackion"
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
              <a
                href="/docs/quick-start/"
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-foreground block"
              >
                Quick Start
              </a>
              <a
                href="/docs/api-reference/"
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-foreground block"
              >
                API Reference
              </a>
              <a
                href="/docs/self-hosting/"
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-foreground block"
              >
                Self-hosting
              </a>
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
                href="https://P8labs.tech"
                className="text-muted-foreground hover:text-foreground block"
              >
                P8labs
              </a>
              <a
                href="mailto:hello@P8labs.tech"
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
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>
            Copyright © 2026 Trackion. Built at{" "}
            <a className="underline" href="https://P8labs.tech">
              P8labs
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
