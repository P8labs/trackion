import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Heart, Code, Github } from "lucide-react";
import { PublicPageLayout } from "../components/PublicPageLayout";

export function AboutPage() {
  return (
    <PublicPageLayout>
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">About Trackion</h1>
          <p className="text-xl text-muted-foreground">
            A lightweight telemetry infrastructure built for developers who
            value simplicity and control.
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Heart className="h-6 w-6 text-[#ff6b35] mr-3" />
              Why Trackion Exists
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              In the world of analytics and telemetry, most solutions are either
              too complex, too expensive, or require you to give up control of
              your data. We built Trackion because we believe developers should
              have access to simple, powerful tools that respect their autonomy.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Trackion focuses on the essentials: tracking events, understanding
              user behavior, and providing the insights you need to make
              informed decisions. No bloat, no vendor lock-in, no surprises.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Code className="h-6 w-6 text-[#ff6b35] mr-3" />
              Built by Developers, for Developers
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Trackion is crafted by <strong>Priyanshu</strong> under{" "}
              <strong>P8Labs</strong>, with a focus on developer experience and
              practical utility. Every feature is designed with the
              understanding that your time is valuable and your data is yours.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              The project emphasizes:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
              <li>
                <strong>Simplicity:</strong> Get started in 2 minutes, not 2
                hours
              </li>
              <li>
                <strong>Transparency:</strong> Open source, auditable, and
                honest
              </li>
              <li>
                <strong>Control:</strong> Self-host anywhere, own your data
                completely
              </li>
              <li>
                <strong>Performance:</strong> Lightweight and efficient by
                design
              </li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Philosophy</h2>
            <div className="bg-card border rounded-lg p-6">
              <blockquote className="text-lg italic text-muted-foreground border-l-4 border-[#ff6b35] pl-6">
                "The best tools are the ones that get out of your way and let
                you focus on what matters: building great software."
              </blockquote>
            </div>
            <p className="text-muted-foreground leading-relaxed mt-6">
              This philosophy drives every decision in Trackion's development.
              We optimize for clarity over complexity, usefulness over features,
              and reliability over flashiness.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Open Source Commitment</h2>
            <p className="text-muted-foreground leading-relaxed">
              Trackion is released under the MIT License, ensuring it remains
              free and open forever. We believe in transparency and community
              collaboration. Whether you want to audit the code, contribute
              features, or fork the project for your own needs, you're welcome
              to do so.
            </p>
            <div className="mt-6">
              <a
                href="https://github.com/p8labs/trackion"
                className="inline-flex items-center"
              >
                <Button className="bg-[#24292e] hover:bg-[#1c2128] text-white">
                  <Github className="mr-2 h-4 w-4" />
                  View on GitHub
                </Button>
              </a>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">What's Next</h2>
            <p className="text-muted-foreground leading-relaxed">
              While Trackion already provides essential analytics and event
              tracking capabilities, we're continuously working on improvements
              based on community feedback. The roadmap includes enhanced
              visualizations, more deployment options, and additional
              integrations.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Features currently in development or planned:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
              <li>Advanced workflow and pipeline tracking</li>
              <li>Enhanced dashboard customization</li>
              <li>More authentication options</li>
              <li>Extended API capabilities</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Get Involved</h2>
            <p className="text-muted-foreground leading-relaxed">
              Trackion is a community project, and we welcome contributions of
              all kinds. Whether you're reporting bugs, suggesting features,
              writing documentation, or contributing code, your input helps make
              Trackion better.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mt-6">
              <div className="bg-card border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Contribute Code</h4>
                <p className="text-sm text-muted-foreground">
                  Check out our GitHub repository and submit pull requests for
                  bug fixes or new features.
                </p>
              </div>
              <div className="bg-card border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Report Issues</h4>
                <p className="text-sm text-muted-foreground">
                  Found a bug or have a feature request? Open an issue on GitHub
                  to help us improve.
                </p>
              </div>
              <div className="bg-card border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Share Feedback</h4>
                <p className="text-sm text-muted-foreground">
                  Tell us how you're using Trackion and what could be better.
                  Your feedback shapes our roadmap.
                </p>
              </div>
              <div className="bg-card border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Spread the Word</h4>
                <p className="text-sm text-muted-foreground">
                  If you find Trackion useful, consider starring the repo or
                  sharing it with fellow developers.
                </p>
              </div>
            </div>
          </section>

          <section className="text-center">
            <div className="bg-linear-to-r from-[#ff6b35] to-[#d73502] text-white rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
              <p className="mb-6 opacity-90">
                Join developers who trust Trackion for their analytics and
                telemetry needs.
              </p>
              <div className="space-x-4">
                <Link to="/docs">
                  <Button variant="secondary">Read Documentation</Button>
                </Link>
                <Link to="/auth">
                  <Button
                    variant="outline"
                    className="text-white border-white hover:bg-white hover:text-[#ff6b35]"
                  >
                    Try Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </PublicPageLayout>
  );
}
