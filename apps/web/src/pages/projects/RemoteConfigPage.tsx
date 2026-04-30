import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Skeleton } from "../../components/ui/skeleton";
import {
  useDeleteFeatureFlag,
  useDeleteRemoteConfig,
  useUpsertFeatureFlag,
  useUpsertRemoteConfig,
} from "../../hooks/useApi";
import { projectHooks } from "@/hooks/queries/use-project";
import { ErrorBanner } from "@/components/core/error-banner";
import z from "zod";
import { useForm } from "react-hook-form";

const runtimeConfigSchema = z.object({
  flags: z.array(
    z.object({
      key: z.string(),
      enabled: z.boolean(),
      rollout_percentage: z.number().min(0).max(100),
    }),
  ),
  configs: z.array(
    z.object({
      key: z.string(),
      value: z.unknown().refine((val) => {
        try {
          JSON.stringify(val);
          return true;
        } catch {
          return false;
        }
      }, "Value must be JSON serializable"),
    }),
  ),
});

type RuntimeConfigForm = z.infer<typeof runtimeConfigSchema>;

export function RemoteConfigPage() {
  const { id = "" } = useParams<{ id: string }>();

  const [flagKey, setFlagKey] = useState("");
  const [flagEnabled, setFlagEnabled] = useState(true);
  const [flagRollout, setFlagRollout] = useState(100);
  const [configKey, setConfigKey] = useState("");
  const [configValue, setConfigValue] = useState("{}");
  const [configError, setConfigError] = useState("");

  const isConfigJsonValid = useMemo(() => {
    try {
      JSON.parse(configValue);
      return true;
    } catch {
      return false;
    }
  }, [configValue]);

  const {
    data: runtimeData,
    isLoading: runtimeLoading,
    error,
  } = projectHooks.useProjectRuntime(id);

  const upsertFlagMutation = useUpsertFeatureFlag(id || "");
  const deleteFlagMutation = useDeleteFeatureFlag(id || "");
  const upsertConfigMutation = useUpsertRemoteConfig(id || "");
  const deleteConfigMutation = useDeleteRemoteConfig(id || "");

  const handleSaveFlag = async () => {
    const key = flagKey.trim();
    if (!key) {
      return;
    }

    const rollout = Number.isFinite(flagRollout)
      ? Math.max(0, Math.min(100, Math.floor(flagRollout)))
      : 0;

    await upsertFlagMutation.mutateAsync({
      key,
      enabled: flagEnabled,
      rollout_percentage: rollout,
    });

    setFlagKey("");
    setFlagEnabled(true);
    setFlagRollout(100);
  };

  const handleSaveConfig = async () => {
    const key = configKey.trim();
    if (!key) {
      setConfigError("Config key cannot be empty.");
      return;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(configValue);
    } catch {
      setConfigError("Invalid JSON format");
      return;
    }

    setConfigError("");
    await upsertConfigMutation.mutateAsync({ key, value: parsed });
    setConfigKey("");
    setConfigValue("{}");
  };

  if (runtimeLoading) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="border-b border-border/60 px-4 py-4 md:px-6">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-2 h-4 w-72" />
        </div>
        <div className="grid lg:grid-cols-2 border-b border-border/60">
          <div className="border-r border-border/60 p-4 md:p-6 space-y-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="p-4 md:p-6 space-y-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!runtimeData || error) {
    return (
      <ErrorBanner
        label="Failed to load runtime data. Please try again later."
        error={error}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <section className="border-b border-border/60 px-4 py-3 md:px-6">
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
          Remote Config
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Manage feature flags and runtime config for {runtimeData.project.name}
        </p>
      </section>
      <section className="grid lg:grid-cols-2 border-y border-border/60">
        <div className="flex flex-col border-r border-border/60">
          <div className="px-4 md:px-6 py-3 border-b border-border/60">
            <p className="text-sm font-medium">Feature Flags</p>
            <p className="text-xs text-muted-foreground">
              Boolean flags with rollout
            </p>
          </div>

          <div className="px-4 md:px-6 py-3">
            <div className=" flex items-center h-9 border border-border/60 bg-background overflow-hidden focus-within:border-primary/60 transition">
              <input
                value={flagKey}
                onChange={(e) => setFlagKey(e.target.value)}
                placeholder="flag_key"
                className="
                  flex-1 px-6 text-xs font-mono bg-transparent
                  outline-none border-0
                "
              />

              <Divider />

              <button
                type="button"
                onClick={() => setFlagEnabled((v) => !v)}
                className="
                  flex items-center gap-2 px-3 text-xs
                  text-muted-foreground
                  hover:text-foreground transition
                "
              >
                <span
                  className={`
                  relative w-7 h-4 rounded-full transition
                  ${flagEnabled ? "bg-primary" : "bg-muted"}
                `}
                >
                  <span
                    className={`
                    absolute top-0.5 left-0.5 h-3 w-3 rounded-full bg-background transition
                    ${flagEnabled ? "translate-x-3" : ""}
                  `}
                  />
                </span>
              </button>

              <Divider />

              <input
                type="text"
                inputMode="numeric"
                value={flagRollout}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  const num = Math.min(100, Number(val || 0));
                  setFlagRollout(num);
                }}
                className="
                  w-12 px-2  text-xs text-right
                  bg-transparent outline-none border-0
                "
              />

              <span className="px-2 text-xs text-muted-foreground">%</span>

              <Divider />

              <Button
                onClick={handleSaveFlag}
                disabled={!flagKey.trim() || upsertFlagMutation.isPending}
                className="
                  px-3 text-xs h-full
                  disabled:opacity-50
                  transition
                  rounded-none
                "
              >
                {upsertFlagMutation.isPending ? "Saving…" : "Save"}
              </Button>
            </div>

            <div>
              {runtimeLoading || !runtimeData ? (
                <State>Loading flags…</State>
              ) : !(runtimeData?.flags || []).length ? (
                <State>No flags yet</State>
              ) : (
                runtimeData.flags.map((item) => {
                  return (
                    <div
                      key={item.key}
                      className="group px-4 md:px-6 py-2.5 hover:bg-muted/20 transition border"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="font-mono text-xs truncate">
                            {item.key}
                          </span>

                          <span className="text-[11px] text-muted-foreground">
                            {item.rollout_percentage}%
                          </span>

                          <span
                            className={`text-[11px] ${
                              item.enabled
                                ? "text-emerald-500"
                                : "text-muted-foreground"
                            }`}
                          >
                            {item.enabled ? "on" : "off"}
                          </span>
                        </div>

                        <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition">
                          <button
                            onClick={() => {
                              setFlagKey(item.key);
                              setFlagEnabled(item.enabled);
                              setFlagRollout(item.rollout_percentage);
                            }}
                            className="text-xs text-muted-foreground hover:text-foreground"
                          >
                            edit
                          </button>

                          <button
                            onClick={() => deleteFlagMutation.mutate(item.key)}
                            disabled={deleteFlagMutation.isPending}
                            className="text-xs text-destructive"
                          >
                            delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="px-4 md:px-6 py-3 border-b border-border/60">
            <p className="text-sm font-medium">Remote Config</p>
            <p className="text-xs text-muted-foreground">Runtime JSON values</p>
          </div>
          <RemoteConfigEditor
            configKey={configKey}
            setConfigKey={setConfigKey}
            configValue={configValue}
            setConfigValue={setConfigValue}
            configError={configError}
            setConfigError={setConfigError}
            isConfigJsonValid={isConfigJsonValid}
            isSaving={upsertConfigMutation.isPending}
            onSave={handleSaveConfig}
          />

          <div className="divide-y divide-border/40">
            {runtimeLoading ? (
              <State>Loading configs…</State>
            ) : !(runtimeData?.configs || []).length ? (
              <State>No configs yet</State>
            ) : (
              runtimeData?.configs.map((item) => (
                <div
                  key={item.key}
                  className="px-4 md:px-6 py-3 hover:bg-muted/20 transition"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-xs truncate">
                      {item.key}
                    </span>

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
                        onClick={() => deleteConfigMutation.mutate(item.key)}
                        disabled={deleteConfigMutation.isPending}
                        className="text-destructive hover:text-destructive/80 transition disabled:opacity-50"
                      >
                        {deleteConfigMutation.isPending
                          ? "deleting…"
                          : "delete"}
                      </button>
                    </div>
                  </div>

                  <pre className="mt-2 text-[11px] text-muted-foreground overflow-x-auto border border-border/60 bg-muted/10 p-2 rounded">
                    {JSON.stringify(item.value, null, 2)}
                  </pre>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function State({ children }: { children: React.ReactNode }) {
  return (
    <div className="py-10 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}

function Divider() {
  return <div className="h-full w-px bg-border/60" />;
}

function DividerHorizontal() {
  return <div className="h-px w-full bg-border/60" />;
}

type RemoteConfigEditorProps = {
  configKey: string;
  setConfigKey: (value: string) => void;
  configValue: string;
  setConfigValue: (value: string) => void;
  configError: string;
  setConfigError: (value: string) => void;
  isConfigJsonValid: boolean;
  isSaving: boolean;
  onSave: () => Promise<void>;
};

function RemoteConfigEditor({
  configKey,
  setConfigKey,
  configValue,
  setConfigValue,
  configError,
  setConfigError,
  isConfigJsonValid,
  isSaving,
  onSave,
}: RemoteConfigEditorProps) {
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
      if (configKey.trim() && isConfigJsonValid && !isSaving) {
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
    <div className="px-4 md:px-6 py-3 border-b border-border/60 space-y-2">
      <div className="border border-border/60 bg-background">
        <div className="flex items-center h-9 focus-within:border-primary/60 transition">
          <Input
            value={configKey}
            onChange={(e) => setConfigKey(e.target.value)}
            placeholder="config.key"
            className="h-full border-0 rounded-none text-xs font-mono focus-visible:ring-0 bg-background!"
          />

          <Divider />

          <Button
            onClick={onSave}
            disabled={!configKey.trim() || !isConfigJsonValid || isSaving}
            className="h-full rounded-none px-3 text-xs"
          >
            {isSaving ? "Saving…" : "Save"}
          </Button>
        </div>

        <DividerHorizontal />

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

        <DividerHorizontal />

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
  );
}
