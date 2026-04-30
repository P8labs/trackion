import { projectHooks } from "@/hooks/queries/use-project";
import { useQueryClient } from "@tanstack/react-query";
import { projectQueryKeys } from "@trackion/lib/queries";
import type { RuntimeFlag } from "@trackion/lib/types";
import { Button } from "@trackion/ui/button";
import { Separator } from "@trackion/ui/separator";
import { useState } from "react";

interface Props {
  projectId: string;
  flags: RuntimeFlag[];
}

export default function RemoteConfigFlagsEditor({ flags, projectId }: Props) {
  const deleteFlagMutation = projectHooks.useDeleteRuntimeFlag(projectId);
  const upsertFlagMutation = projectHooks.useUpsertRuntimeFlag(projectId);
  const qc = useQueryClient();

  const [flagKey, setFlagKey] = useState("");
  const [flagEnabled, setFlagEnabled] = useState(true);
  const [flagRollout, setFlagRollout] = useState(100);

  async function handleDeleteFlag(flagKey: string) {
    await deleteFlagMutation.mutateAsync(flagKey);

    await qc.invalidateQueries({
      queryKey: projectQueryKeys.projectRuntime(projectId),
    });
  }

  async function handleSaveFlag() {
    await upsertFlagMutation.mutateAsync({
      flagKey,
      enabled: flagEnabled,
      rollout_percentage: flagRollout,
    });

    await qc.invalidateQueries({
      queryKey: projectQueryKeys.projectRuntime(projectId),
    });
  }

  return (
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
            className="flex-1 px-6 text-xs font-mono bg-transparent outline-none border-0"
          />
          <Separator orientation="vertical" />

          <button
            type="button"
            onClick={() => setFlagEnabled((v) => !v)}
            className="flex items-center gap-2 px-3 text-xs text-muted-foreground hover:text-foreground transition"
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

          <Separator orientation="vertical" />

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

          <Separator orientation="vertical" />

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
          {flags.map((item) => {
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
                      onClick={() => handleDeleteFlag(item.key)}
                      disabled={deleteFlagMutation.isPending}
                      className="text-xs text-destructive"
                    >
                      delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
