# Trackion Type-Safe Client SDK

Official client-side SDK for Trackion with first-class TypeScript support for:

- Vanilla JavaScript / TypeScript
- React
- Vue 3

## Install

```bash
npm install @trackion/web
```

## Package Entrypoints

- Core (vanilla): `@trackion/web`
- React helpers: `@trackion/web/react`
- Vue helpers: `@trackion/web/vue`
- Node helpers: `@trackion/web/node`

## Examples

Practical integration examples are available in:

- `examples/web/index.ts`
- `examples/react/App.tsx`
- `examples/vue/main.ts`
- `examples/node/index.ts`
- `examples/script/index.html`

## Vanilla Usage

```ts
import { createTrackionClient } from "@trackion/web";

const trackion = createTrackionClient({
  serverUrl: "https://api.trackion.tech",
  apiKey: "YOUR_API_KEY",
  projectId: "PROJECT_UUID",
  userId: "user-123",
  autoPageview: true,
});

trackion.track("signup.started", { source: "landing" });

await trackion.refreshRuntime();

if (trackion.isEnabled("checkout_v2")) {
  // render new checkout flow
}

const paywall = trackion.getConfig<{ title: string; cta: string }>(
  "paywall.copy",
  { title: "Upgrade", cta: "Start trial" },
);
```

## React Usage

```tsx
import {
  TrackionProvider,
  useTrackion,
  useFeatureFlag,
  useRemoteConfig,
} from "@trackion/web/react";

function UpgradeButton() {
  const trackion = useTrackion();
  const checkoutV2 = useFeatureFlag("checkout_v2");
  const copy = useRemoteConfig<{ cta: string }>("paywall.copy", {
    cta: "Upgrade",
  });

  return (
    <button
      onClick={() =>
        trackion.track("paywall.click", { variant: checkoutV2 ? "v2" : "v1" })
      }
    >
      {copy?.cta ?? "Upgrade"}
    </button>
  );
}

export function App() {
  return (
    <TrackionProvider
      options={{
        serverUrl: "https://api.trackion.tech",
        apiKey: "YOUR_API_KEY",
        projectId: "PROJECT_UUID",
        userId: "user-123",
      }}
    >
      <UpgradeButton />
    </TrackionProvider>
  );
}
```

## Vue 3 Usage

```ts
// main.ts
import { createApp } from "vue";
import App from "./App.vue";
import { createVueTrackion, provideTrackion } from "@trackion/web/vue";

const app = createApp({
  setup() {
    const client = createVueTrackion({
      serverUrl: "https://api.trackion.tech",
      apiKey: "YOUR_API_KEY",
      projectId: "PROJECT_UUID",
      userId: "user-123",
    });

    provideTrackion(client);
  },
  render: () => h(App),
});

app.mount("#app");
```

```ts
// Any component setup()
import {
  useTrackion,
  useFeatureFlag,
  useRemoteConfig,
} from "@trackion/web/vue";

const trackion = useTrackion();
const checkoutV2 = useFeatureFlag("checkout_v2");
const paywallCopy = useRemoteConfig<{ cta: string }>("paywall.copy", {
  cta: "Upgrade",
});

function onClick() {
  trackion.track("paywall.click", { variant: checkoutV2.value ? "v2" : "v1" });
}
```

## Node Usage

```ts
import { createTrackionNodeClient, trackServerEvent } from "@trackion/web/node";

const trackion = createTrackionNodeClient({
  serverUrl: "https://api.trackion.tech",
  apiKey: "YOUR_API_KEY",
  projectId: "PROJECT_UUID",
  userId: "server-user-123",
});

trackServerEvent(trackion, "job.processed", {
  queue: "billing",
  ok: true,
});

await trackion.flush();
```

## API Reference

### createTrackionClient(options)

Creates and starts a client.

`TrackionClientOptions`

- `serverUrl` (required): API base URL.
- `apiKey` (required): Authentication API key.
- `projectId` (optional): UUID used for runtime fetch (`/v1/runtime`).
- `autoPageview` (optional, default `true`).
- `batchSize` (optional, default `20`).
- `flushIntervalMs` (optional, default `5000`).
- `sessionId` (optional): custom session id.
- `userId` (optional): used for percentage rollout evaluation.
- `runtimeTTLms` (optional, default `60000`).

### TrackionClient methods

- `start()` / `shutdown()`
- `track(eventName, properties?, context?)`
- `page(options?)`
- `identify(userId, traits?)`
- `flush()`
- `setSessionId(sessionId)`
- `setUserId(userId)`
- `getSessionId()`
- `refreshRuntime(options?)`
- `isEnabled(flagKey)`
- `getConfig(configKey, fallback?)`
- `getRuntimeSnapshot()`
- `subscribeRuntime(listener)`
- `captureError(error, context?)`

## Device Information

Trackion automatically captures device and browser information with every event:

```typescript
// Automatically included in all events:
{
  user_agent: "Mozilla/5.0...",
  browser: "Chrome",
  browser_version: "91.0",
  os: "macOS",
  os_version: "10.15",
  device: "Desktop",
  device_type: "desktop", // "desktop" | "mobile" | "tablet"
  screen_resolution: "1920x1080",
  viewport: "1366x768",
  language: "en-US",
  timezone: "America/New_York",
  platform: "MacIntel"
}

// Access device info directly:
import { getDeviceInfo } from "@trackion/web";
const deviceInfo = getDeviceInfo();
```

This information is automatically merged with your custom event properties, with your properties taking precedence if there are any naming conflicts.

## Error Tracking

Trackion SDK automatically captures JavaScript errors and unhandled promise rejections:

### Automatic Error Capture

```ts
const trackion = createTrackionClient({
  serverUrl: "https://api.trackion.tech",
  projectKey: "PROJECT_API_KEY",
  // Error capture is enabled by default
});

// These are automatically captured:
throw new Error("Uncaught error");
Promise.reject(new Error("Unhandled promise rejection"));
```

### Manual Error Capture

```ts
// Capture any error manually
trackion.captureError(new Error("Something went wrong"));

// With additional context
trackion.captureError(error, {
  userId: "user123",
  feature: "checkout", 
  step: "payment"
});

// Capture string errors
trackion.captureError("Failed to load resource");
```

### React Error Boundaries

```tsx
import { TrackionErrorBoundary, useCaptureError } from "@trackion/web/react";

function MyComponent() {
  const captureError = useCaptureError();
  
  const handleSubmit = async () => {
    try {
      await submitForm();
    } catch (error) {
      captureError(error, { form: "checkout" });
      throw error; // Re-throw to handle in UI
    }
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}

// Wrap your app to catch React component errors
function App() {
  return (
    <TrackionErrorBoundary fallback={<ErrorFallback />}>
      <TrackionProvider options={{...}}>
        <MyComponent />
      </TrackionProvider>
    </TrackionErrorBoundary>
  );
}
```

### Error Filtering

The SDK automatically filters out noise:

```ts
// These errors are ignored by default:
// - Browser extension errors (chrome-extension://, moz-extension://)
// - ResizeObserver loop errors
// - Cross-origin script errors
// - Errors with empty messages

// Custom filtering can be added via context:
trackion.captureError(error, {
  skipCapture: shouldIgnoreError(error)
});
```

### Error Deduplication

Identical errors are automatically deduplicated within a 5-second window to prevent spam:

```ts
// Only the first occurrence is sent:
trackion.captureError(new Error("Same error"));
trackion.captureError(new Error("Same error")); // Deduplicated
```

### Error Grouping

Errors are grouped by fingerprint in the dashboard:
- Fingerprint = SHA256(error message + first line of stack trace)
- Same errors across different users/sessions are grouped together
- View error counts, first/last occurrence, and individual stack traces

## Runtime Behavior

- Runtime data is cached in memory.
- If `projectId` is provided, runtime cache is also persisted in `localStorage`.
- Runtime updates notify subscribers (`subscribeRuntime`) so React/Vue hooks stay in sync.

## Publishing

Publishing is automated via GitHub Actions workflow:

- `.github/workflows/publish-sdk.yml`

Required GitHub repository settings:

1. Add repository secret `NPM_TOKEN`.
2. Grant workflow permission for `id-token: write` and `contents: read`.
3. Push a tag in format `sdk-v*` (example `sdk-v0.2.0`) or trigger manually.

Release helper script:

```bash
./scripts/release-sdk.sh patch
```

This updates `sdk/web/package.json`, creates a release commit, and creates the matching `sdk-v*` tag used by the publish workflow.
