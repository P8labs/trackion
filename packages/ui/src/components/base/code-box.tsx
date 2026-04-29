import { useState, useMemo } from "react";
import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import xml from "highlight.js/lib/languages/xml";
import { Check, Copy } from "lucide-react";
import { Button } from "@trackion/ui/button";

hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("html", xml);

type CodeBoxProps = {
  code: string;
  language?: "javascript" | "html";
  showbtn?: boolean;
};

export function CodeBox({
  code,
  language = "javascript",
  showbtn = true,
}: CodeBoxProps) {
  const [copied, setCopied] = useState(false);

  const highlighted = useMemo(() => {
    try {
      return hljs.highlight(code, { language }).value;
    } catch {
      return code;
    }
  }, [code, language]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <pre className="p-4 rounded-lg text-sm overflow-x-auto bg-[#1c1b1b] text-primary-foreground">
        <code dangerouslySetInnerHTML={{ __html: highlighted }} />
      </pre>

      {showbtn && (
        <Button
          size="sm"
          variant="outline"
          className="absolute top-2 right-2"
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-1" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </>
          )}
        </Button>
      )}
    </div>
  );
}
