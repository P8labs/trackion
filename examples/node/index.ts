// @ts-nocheck
import {
  createTrackionNodeClient,
  refreshNodeRuntime,
  trackServerEvent,
} from "@trackion/web/node";

async function main() {
  const trackion = createTrackionNodeClient({
    serverUrl: "https://your-trackion-server.com",
    projectKey: "PROJECT_API_KEY",
    projectId: "PROJECT_UUID",
    userId: "service-billing-worker",
  });

  trackServerEvent(trackion, "job.processed", {
    queue: "billing",
    status: "ok",
  });

  const runtime = await refreshNodeRuntime(trackion, { force: true });
  if (runtime.flags.checkout_v2) {
    trackServerEvent(trackion, "feature.checkout_v2.active");
  }

  await trackion.flush();
  trackion.shutdown();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
