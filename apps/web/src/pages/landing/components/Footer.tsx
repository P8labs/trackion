import { FullLine, PLine } from "@/components/Line";
import PlusDecor from "@/components/PlusDecor";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer>
      <div
        className="absolute z-10 inset-0 opacity-[0.03] pointer-events-none
        bg-[linear-gradient(to_right,black_1px,transparent_1px),
        linear-gradient(to_bottom,black_1px,transparent_1px)]
        dark:bg-[linear-gradient(to_right,white_1px,transparent_1px),
        linear-gradient(to_bottom,white_1px,transparent_1px)]
        bg-size-[40px_40px]"
      />

      <div className="relative mx-auto py-16 px-4">
        <PLine />

        <PlusDecor position="top" />
        <div className="grid md:grid-cols-5 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/trackion_t.png" className="w-7 h-7" />
              <span className="font-medium tracking-tight">Trackion</span>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Lightweight telemetry infrastructure built for developers who care
              about speed and clarity.
            </p>
          </div>

          {[
            {
              title: "Product",
              links: [
                { label: "Documentation", href: "/docs/" },
                { label: "Downloads", href: "/downloads", internal: true },
                {
                  label: "GitHub",
                  href: "https://github.com/P8labs/trackion",
                },
                { label: "Dashboard", href: "/auth", internal: true },
              ],
            },
            {
              title: "Resources",
              links: [
                { label: "Quick Start", href: "/docs/quick-start/" },
                { label: "API Reference", href: "/docs/api-reference/" },
                { label: "Self-hosting", href: "/docs/self-hosting/" },
              ],
            },
            {
              title: "Company",
              links: [
                { label: "About", href: "/about", internal: true },
                { label: "P8labs", href: "https://P8labs.in" },
                { label: "Contact", href: "mailto:hello@P8labs.in" },
              ],
            },
            {
              title: "Legal",
              links: [
                { label: "Terms", href: "/terms", internal: true },
                { label: "Privacy", href: "/privacy", internal: true },
              ],
            },
          ].map((col, i) => (
            <div key={i}>
              <h4 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
                {col.title}
              </h4>

              <div className="space-y-2 text-sm">
                {col.links.map((link, j) =>
                  link.internal ? (
                    <Link
                      key={j}
                      to={link.href}
                      className="block text-muted-foreground hover:text-foreground transition"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      key={j}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-muted-foreground hover:text-foreground transition"
                    >
                      {link.label}
                    </a>
                  ),
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative">
        <PLine />
        <FullLine />
        <PlusDecor position="top" />

        <div className="py-6 px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Trackion. Built at{" "}
            <a
              href="https://P8labs.in"
              className="underline hover:text-foreground transition"
            >
              P8labs
            </a>
          </p>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-muted-foreground/70">Open Source</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
