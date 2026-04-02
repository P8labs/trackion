# SDK Usage

Trackion supports two client integration styles:

1. NPM SDK package family (`@trackion/js`)
2. Hosted browser script (`/t.js`)

Official package: [@trackion/js on npm](https://www.npmjs.com/package/@trackion/js)

## Install (NPM)

```bash
npm install @trackion/js
```

Entrypoints:

- `@trackion/js` (vanilla web)
- `@trackion/js/react`
- `@trackion/js/vue`
- `@trackion/js/node`

## Vanilla Web (NPM)

```ts
import { createTrackionClient } from "@trackion/js";

const trackion = createTrackionClient({
  serverUrl: "https://your-trackion-server.com",
  apiKey: "PROJECT_API_KEY",
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
import { TrackionProvider, useTrackion } from "@trackion/js/react";

function SaveButton() {
  const trackion = useTrackion();
  return <button onClick={() => trackion.track("settings.save")}>Save</button>;
}

export function App() {
  return (
    <TrackionProvider
      options={{
        serverUrl: "https://your-trackion-server.com",
        apiKey: "PROJECT_API_KEY",
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
import { createVueTrackion, provideTrackion } from "@trackion/js/vue";

createApp({
  setup() {
    const client = createVueTrackion({
      serverUrl: "https://your-trackion-server.com",
      apiKey: "PROJECT_API_KEY",
    });
    provideTrackion(client);
    return () => h("div", "Trackion enabled");
  },
}).mount("#app");
```

## Node

```ts
import { createTrackionNodeClient, trackServerEvent } from "@trackion/js/node";

const client = createTrackionNodeClient({
  serverUrl: "https://your-trackion-server.com",
  apiKey: "PROJECT_API_KEY",
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
- Runtime fetch endpoint: `GET /v1/runtime?user_id=<optional>`.
- Dashboard runtime management endpoints are under `/api/runtime/projects/{id}/runtime`.

## Repository Examples

- `examples/web/index.ts`
- `examples/react/App.tsx`
- `examples/vue/main.ts`
- `examples/node/index.ts`
- `examples/script/index.html`
