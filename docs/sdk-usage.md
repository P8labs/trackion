# SDK Usage

Trackion supports two client integration styles:

1. NPM SDK package family (`@trackion/web`)
2. Hosted browser script (`/t.js`)

## Install (NPM)

```bash
npm install @trackion/web
```

Entrypoints:

- `@trackion/web` (vanilla web)
- `@trackion/web/react`
- `@trackion/web/vue`
- `@trackion/web/node`

## Vanilla Web (NPM)

```ts
import { createTrackionClient } from "@trackion/web";

const trackion = createTrackionClient({
  serverUrl: "https://your-trackion-server.com",
  projectKey: "PROJECT_API_KEY",
  projectId: "PROJECT_UUID",
  userId: "user-123",
});

trackion.track("signup.started", { source: "landing" });
await trackion.refreshRuntime({ force: true });

if (trackion.isEnabled("checkout_v2")) {
  // gate feature UI
}
```

## React

```tsx
import { TrackionProvider, useTrackion } from "@trackion/web/react";

function SaveButton() {
  const trackion = useTrackion();
  return <button onClick={() => trackion.track("settings.save")}>Save</button>;
}

export function App() {
  return (
    <TrackionProvider
      options={{
        serverUrl: "https://your-trackion-server.com",
        projectKey: "PROJECT_API_KEY",
        projectId: "PROJECT_UUID",
      }}
    >
      <SaveButton />
    </TrackionProvider>
  );
}
```

## Vue 3

```ts
import { createApp, h } from "vue";
import { createVueTrackion, provideTrackion } from "@trackion/web/vue";

createApp({
  setup() {
    const client = createVueTrackion({
      serverUrl: "https://your-trackion-server.com",
      projectKey: "PROJECT_API_KEY",
      projectId: "PROJECT_UUID",
    });
    provideTrackion(client);
    return () => h("div", "Trackion enabled");
  },
}).mount("#app");
```

## Node

```ts
import { createTrackionNodeClient, trackServerEvent } from "@trackion/web/node";

const client = createTrackionNodeClient({
  serverUrl: "https://your-trackion-server.com",
  projectKey: "PROJECT_API_KEY",
  projectId: "PROJECT_UUID",
  userId: "worker-1",
});

trackServerEvent(client, "job.processed", { ok: true });
await client.flush();
```

## Script Tag

```html
<script
  src="https://your-trackion-server.com/t.js"
  data-api-key="PROJECT_API_KEY"
></script>
```

Then use global `trackion`:

```js
trackion.track("signup.click", { source: "hero" });
```

## Request Format Notes

- Event ingestion payloads use `session_id`.
- Runtime fetch endpoint: `GET /v1/runtime?project_id=<uuid>&user_id=<optional>`.
- Dashboard runtime management endpoints are under `/api/runtime/projects/{id}/runtime`.

## Repository Examples

- `examples/web/index.ts`
- `examples/react/App.tsx`
- `examples/vue/main.ts`
- `examples/node/index.ts`
- `examples/script/index.html`
