import { ExternalLink, Github, Construction } from "lucide-react";
import { useEffect } from "react";
import { PublicPageLayout } from "../components/PublicPageLayout";

export function DocsPage() {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href =
        "https://github.com/P8labs/trackion/wiki/Introduction";
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <PublicPageLayout>
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
              <Construction className="h-12 w-12 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>

          <h1 className="text-4xl font-bold mb-4">
            Documentation Under Construction
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            We're working on comprehensive documentation for Trackion. In the
            meantime, please check out our GitHub repository for installation
            guides and examples.
          </p>

          <div className="bg-card border rounded-lg p-8 mb-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <Github className="h-6 w-6 mr-2" />
              <h2 className="text-lg font-semibold">
                View Documentation on GitHub
              </h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Our README contains quick start guides, API documentation, and
              self-hosting instructions.
            </p>
            <div className="space-y-3">
              <a
                href="https://github.com/P8labs/trackion/wiki/Introduction"
                className="w-full inline-flex items-center justify-center px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                View on GitHub
                <ExternalLink className="h-4 w-4 ml-2" />
              </a>
              <p className="text-sm text-muted-foreground">
                You'll be redirected automatically in 5 seconds...
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="bg-card border rounded-lg p-6">
              <h3 className="font-semibold mb-2">Quick Start</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get up and running with Docker in under 2 minutes
              </p>
              <a
                href="https://github.com/p8labs/trackion#quick-start"
                className="text-sm text-primary hover:underline inline-flex items-center"
              >
                View Quick Start
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </div>
            <div className="bg-card border rounded-lg p-6">
              <h3 className="font-semibold mb-2">API Reference</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Complete API documentation with examples
              </p>
              <a
                href="https://github.com/p8labs/trackion#api-reference"
                className="text-sm text-primary hover:underline inline-flex items-center"
              >
                View API Docs
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </PublicPageLayout>
  );
}
