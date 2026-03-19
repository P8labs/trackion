import { Code, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import CodeBox from "../CodeBox";

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
  const trackingScript = `<script>
(function() {
  var script = document.createElement('script');
  script.src = '${serverUrl}/js/trackion.js';
  script.async = true;
  script.setAttribute('data-api-key', '${project.api_key}');
  script.setAttribute('data-server-url', '${serverUrl}');
  document.head.appendChild(script);
})();
</script>`;

  const basicScript = `<!-- Trackion Analytics -->
<script src="${serverUrl}/js/trackion.js" 
        async 
        data-api-key="${project.api_key}"
        data-server-url="${serverUrl}">
</script>`;

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

        <div>
          <h4 className="font-medium mb-3">Advanced Setup</h4>
          <p className="text-sm text-muted-foreground mb-4">
            For dynamic loading or more control, use this JavaScript snippet:
          </p>
          <div className="relative">
            <CodeBox code={trackingScript} language="html" />
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
            Custom Events
          </h4>
          <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
            Track custom events programmatically:
          </p>
          <CodeBox
            code="trackion.track('button-click', { page: 'homepage', element: 'signup-btn' })"
            language="javascript"
          />
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ExternalLink className="h-4 w-4" />
          <span>View full documentation and examples at</span>
          <a
            href="https://github.com/P8labs/trackion/wiki/JavaScript-API"
            className="text-primary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Wiki
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
