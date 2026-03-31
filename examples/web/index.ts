// @ts-nocheck
import { createTrackionClient } from "@trackion/web";

const trackion = createTrackionClient({
  serverUrl: "https://your-trackion-server.com",
  projectKey: "PROJECT_API_KEY",
  projectId: "PROJECT_UUID",
  userId: "user-42",
  autoPageview: true,
});

trackion.track("signup.started", { source: "landing" });

await trackion.refreshRuntime({ force: true });

if (trackion.isEnabled("checkout_v2")) {
  trackion.track("checkout.v2.enabled");
}

const paywall = trackion.getConfig<{ title: string; cta: string }>(
  "paywall.copy",
  { title: "Upgrade", cta: "Start trial" },
);

console.log("Paywall config", paywall);
