// @ts-nocheck
import {
  TrackionProvider,
  useFeatureFlag,
  useRemoteConfig,
  useTrackion,
} from "@trackion/web/react";

function UpgradeCTA() {
  const trackion = useTrackion();
  const checkoutV2 = useFeatureFlag("checkout_v2");
  const copy = useRemoteConfig<{ cta: string }>("paywall.copy", {
    cta: "Upgrade",
  });

  return (
    <button
      onClick={() =>
        trackion.track("paywall.click", {
          variant: checkoutV2 ? "v2" : "v1",
        })
      }
    >
      {copy?.cta ?? "Upgrade"}
    </button>
  );
}

export default function App() {
  return (
    <TrackionProvider
      options={{
        serverUrl: "https://your-trackion-server.com",
        projectKey: "PROJECT_API_KEY",
        projectId: "PROJECT_UUID",
        userId: "user-42",
      }}
    >
      <UpgradeCTA />
    </TrackionProvider>
  );
}
