import { queryClient } from "@/lib/queryClient";
import {
  CodeHighlightAdapterProvider,
  createHighlightJsAdapter,
} from "@mantine/code-highlight";
import { ModalsProvider } from "@mantine/modals";
import { QueryClientProvider } from "@tanstack/react-query";

import hljs from "highlight.js/lib/core";
import tsLang from "highlight.js/lib/languages/typescript";
import json from "highlight.js/lib/languages/json";
import xml from "highlight.js/lib/languages/xml";
import { Notifications } from "@mantine/notifications";

import "highlight.js/styles/dark.min.css";

hljs.registerLanguage("typescript", tsLang);
hljs.registerLanguage("json", json);
hljs.registerLanguage("html", xml);
hljs.registerLanguage("plaintext", xml);
const highlightJsAdapter = createHighlightJsAdapter(hljs);

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <CodeHighlightAdapterProvider adapter={highlightJsAdapter}>
          <ModalsProvider>
            <Notifications position="top-left" />

            {children}
          </ModalsProvider>
        </CodeHighlightAdapterProvider>
      </QueryClientProvider>
    </>
  );
}
