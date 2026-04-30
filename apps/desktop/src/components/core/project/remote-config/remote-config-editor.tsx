import { Textarea } from "@trackion/ui/textarea";
import { projectHooks } from "@/hooks/queries/use-project";
import type { RuntimeConfig } from "@trackion/lib/types";
import { Button } from "@trackion/ui/button";
import { Input } from "@trackion/ui/input";
import { Separator } from "@trackion/ui/separator";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { projectQueryKeys } from "@trackion/lib/queries";

interface Props {
  projectId: string;
  configs: RuntimeConfig[];
}

export default function RemoteConfigEditor({ configs, projectId }: Props) {
  const upsertConfigMutation = projectHooks.useUpsertRuntimeConfig(projectId);
  const deleteConfigMutation = projectHooks.useDeleteRuntimeConfig(projectId);
  const qc = useQueryClient();

  const [configKey, setConfigKey] = useState("");
  const [configValue, setConfigValue] = useState("{}");
  const [configError, setConfigError] = useState("");
  const isConfigJsonValid = (() => {
    try {
      JSON.parse(configValue);
      return true;
    } catch {
      return false;
    }
  })();

  const onDelete = async (key: string) => {
    await deleteConfigMutation.mutateAsync(key);

    await qc.invalidateQueries({
      queryKey: projectQueryKeys.projectRuntime(projectId),
    });
  };

  const onSave = async () => {
    if (!configKey.trim() || !isConfigJsonValid) {
      return;
    }

    await upsertConfigMutation.mutateAsync({
      configKey,
      value: JSON.parse(configValue),
    });

    await qc.invalidateQueries({
      queryKey: projectQueryKeys.projectRuntime(projectId),
    });

    setConfigKey("");
    setConfigValue("{}");
    setConfigError("");
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(configValue);
      setConfigValue(JSON.stringify(parsed, null, 2));
      setConfigError("");
    } catch {
      setConfigError("Invalid JSON format");
    }
  };

  const handleMinify = () => {
    try {
      const parsed = JSON.parse(configValue);
      setConfigValue(JSON.stringify(parsed));
      setConfigError("");
    } catch {
      setConfigError("Invalid JSON format");
    }
  };

  const handleInsertSnippet = (value: string) => {
    if (!value) {
      return;
    }

    setConfigValue(value);
    setConfigError("");
  };

  const handleTextareaKeyDown = async (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      if (
        configKey.trim() &&
        isConfigJsonValid &&
        !upsertConfigMutation.isPending
      ) {
        await onSave();
      }
      return;
    }

    if (e.key === "Tab") {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const nextValue =
        configValue.slice(0, start) + "  " + configValue.slice(end);
      setConfigValue(nextValue);
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="px-4 md:px-6 py-3 border-b border-border/60">
        <p className="text-sm font-medium">Remote Config</p>
        <p className="text-xs text-muted-foreground">Runtime JSON values</p>
      </div>
      <div className="px-4 md:px-6 py-3 border-b border-border/60 space-y-2">
        <div className="border border-border/60 bg-background">
          <div className="flex items-center h-9 focus-within:border-primary/60 transition">
            <Input
              value={configKey}
              onChange={(e) => setConfigKey(e.target.value)}
              placeholder="config.key"
              className="h-full border-0 rounded-none text-xs font-mono focus-visible:ring-0 bg-background!"
            />

            <Separator orientation="vertical" />
            <Button
              onClick={onSave}
              disabled={
                !configKey.trim() ||
                !isConfigJsonValid ||
                upsertConfigMutation.isPending
              }
              className="h-full rounded-none px-3 text-xs"
            >
              {upsertConfigMutation.isPending ? "Saving…" : "Save"}
            </Button>
          </div>

          <Separator orientation="horizontal" />

          <Textarea
            value={configValue}
            onChange={(e) => {
              setConfigValue(e.target.value);
              if (configError) {
                setConfigError("");
              }
            }}
            onKeyDown={handleTextareaKeyDown}
            rows={6}
            className="font-mono text-xs leading-5 border-0 rounded-none resize-y min-h-30 focus-visible:ring-0"
          />

          <Separator orientation="horizontal" />

          <div className="flex flex-wrap items-center gap-2 px-2 py-1.5 text-xs">
            <button
              type="button"
              onClick={handleFormat}
              className="text-muted-foreground hover:text-foreground transition"
            >
              format
            </button>
            <span className="text-border">/</span>
            <button
              type="button"
              onClick={handleMinify}
              className="text-muted-foreground hover:text-foreground transition"
            >
              minify
            </button>
            <span className="text-border">/</span>
            <select
              defaultValue=""
              onChange={(e) => {
                handleInsertSnippet(e.target.value);
                e.currentTarget.value = "";
              }}
              className="h-6 bg-transparent text-muted-foreground outline-none"
            >
              <option value="">insert snippet</option>
              <option value={"{}"}>empty object</option>
              <option value={"[]"}>empty array</option>
              <option value={'{"enabled": true}'}>boolean flag</option>
              <option value={'{"title": "", "description": ""}'}>
                content block
              </option>
            </select>
            <div className="ml-auto text-muted-foreground">
              {configValue.length} chars
            </div>
          </div>
        </div>

        {configError ? (
          <p className="text-xs text-destructive">{configError}</p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Tip: use Tab for indent and Ctrl/Cmd + Enter to save.
          </p>
        )}
      </div>

      <div className="divide-y divide-border/40">
        {configs.map((item) => (
          <div
            key={item.key}
            className="px-4 md:px-6 py-3 hover:bg-muted/20 transition"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-xs truncate">{item.key}</span>

              <div className="flex gap-2 text-xs">
                <button
                  onClick={() => {
                    setConfigKey(item.key);
                    setConfigValue(JSON.stringify(item.value, null, 2));
                    setConfigError("");
                  }}
                  className="text-muted-foreground hover:text-foreground transition"
                >
                  edit
                </button>
                <button
                  onClick={() => onDelete(item.key)}
                  disabled={deleteConfigMutation.isPending}
                  className="text-destructive hover:text-destructive/80 transition disabled:opacity-50"
                >
                  {deleteConfigMutation.isPending ? "deleting…" : "delete"}
                </button>
              </div>
            </div>

            <pre className="mt-2 text-[11px] text-muted-foreground overflow-x-auto border border-border/60 bg-muted/10 p-2 rounded">
              {JSON.stringify(item.value, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
