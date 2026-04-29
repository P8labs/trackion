import { Code, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import CodeBox from "../core/code-box";

interface ProjectIntegrationGuideProps {
  project: {
    api_key: string;
    name: string;
  };
  serverUrl: string;
}

export function ProjectIntegrationGuide({
  project,
  serverUrl,
}: ProjectIntegrationGuideProps) {
  const basicScript = `<!-- Trackion Analytics -->
<script 
  src="${serverUrl}/t.js" 
  data-api-key="${project.api_key}"
></script>`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          Getting Started
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-medium mb-3">Quick Setup</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Add this script tag to your website's HTML head section to start
            tracking:
          </p>
          <div className="relative">
            <CodeBox code={basicScript} language="html" />
          </div>
        </div>

        <div className="bg-theme/5 border rounded-lg p-4">
          <h4 className="font-medium text-theme mb-2">Custom Events</h4>
          <p className="text-sm text-theme mb-3">
            Track custom events programmatically:
          </p>
          <CodeBox
            code="trackion.track('button-page.click', { page: 'homepage', element: 'signup-btn' })"
            language="javascript"
          />
        </div>

        <div className="flex items-center text-sm space-x-1 text-muted-foreground">
          <ExternalLink className="h-4 w-4 mr-1" />
          <span>View full documentation and examples at</span>{" "}
          <a
            href="https://github.com/P8labs/trackion/wiki/JavaScript-API"
            className="text-primary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Github
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
