// @ts-nocheck
import { createApp, defineComponent, h } from "vue";
import {
  createVueTrackion,
  provideTrackion,
  useFeatureFlag,
  useRemoteConfig,
  useTrackion,
} from "@trackion/web/vue";

const App = defineComponent({
  setup() {
    const trackion = useTrackion();
    const checkoutV2 = useFeatureFlag("checkout_v2");
    const copy = useRemoteConfig<{ cta: string }>("paywall.copy", {
      cta: "Upgrade",
    });

    const onClick = () => {
      trackion.track("paywall.click", {
        variant: checkoutV2.value ? "v2" : "v1",
      });
    };

    return () => h("button", { onClick }, copy.value?.cta ?? "Upgrade");
  },
});

createApp({
  setup() {
    const client = createVueTrackion({
      serverUrl: "https://your-trackion-server.com",
      projectKey: "PROJECT_API_KEY",
      projectId: "PROJECT_UUID",
      userId: "user-42",
    });

    provideTrackion(client);
    return () => h(App);
  },
}).mount("#app");
