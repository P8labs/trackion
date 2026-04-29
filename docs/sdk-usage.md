# SDK Usage

Trackion supports two integration styles:

1. npm SDK (`@trackion/js` family)
2. Browser script (`/t.js` or `/t.min.js`)

Official package: [@trackion/js on npm](https://www.npmjs.com/package/@trackion/js)

## Package Variants

- `@trackion/js`: vanilla web client
- `@trackion/js/react`: React provider/hooks
- `@trackion/js/vue`: Vue integration helpers
- `@trackion/js/node`: Node/server event client

## Core Configuration

Most SDK variants require:

- `serverUrl`: Trackion API base URL
- `apiKey`: project API key
- optional `userId`: stable identifier for runtime rollout evaluation

## Vanilla Web (npm)

```ts
import { createTrackionClient } from "@trackion/js";

const trackion = createTrackionClient({
  serverUrl: "https://api.example.com",
  apiKey: "PROJECT_API_KEY",
  userId: "user-123",
});

trackion.track("signup.started", { source: "landing" });

await trackion.refreshRuntime({ force: true });

if (trackion.isEnabled("checkout_v2")) {
  // render new checkout flow
}
```

## React Integration

```tsx
import { TrackionProvider, useTrackion } from "@trackion/js/react";

function SaveButton() {
  const trackion = useTrackion();

  return (
    <button
      onClick={() => trackion.track("settings.save", { source: "profile" })}
    >
      Save
    </button>
  );
}

export function App() {
  return (
    <TrackionProvider
      options={{
        serverUrl: "https://api.example.com",
        apiKey: "PROJECT_API_KEY",
      }}
    >
      <SaveButton />
    </TrackionProvider>
  );
}
```

## Vue 3 Integration

```ts
import { createApp, h } from "vue";
import { createVueTrackion, provideTrackion } from "@trackion/js/vue";

createApp({
  setup() {
    const client = createVueTrackion({
      serverUrl: "https://api.example.com",
      apiKey: "PROJECT_API_KEY",
      userId: "user-123",
    });

    provideTrackion(client);

    return () => h("div", "Trackion enabled");
  },
}).mount("#app");
```

## Node Integration

```ts
import { createTrackionNodeClient, trackServerEvent } from "@trackion/js/node";

const client = createTrackionNodeClient({
  serverUrl: "https://api.example.com",
  apiKey: "PROJECT_API_KEY",
  userId: "worker-1",
});

trackServerEvent(client, "job.processed", {
  ok: true,
  duration_ms: 182,
});

await client.flush();
```

## Script Tag Integration

```html
<script
  src="https://api.example.com/t.js"
  data-api-key="PROJECT_API_KEY"
></script>
```

Global API:

```js
trackion.track("signup.click", { source: "hero" });
```

## Runtime Controls from SDK

Typical flow:

1. Fetch runtime (`refreshRuntime`)
2. Check flags (`isEnabled`)
3. Read config values
4. Re-fetch on user identity change

`userId` is important for partial rollout consistency.

## Event Design Recommendations

1. Use stable event naming: `domain.action` (example: `checkout.submit`)
2. Keep property keys consistent across platforms
3. Include business context (`plan`, `region`, `experiment`) in `properties`
4. Avoid high-cardinality values in top-level event names

## Validation Checklist

1. Browser/Node requests include project key
2. `POST /events/batch` or `POST /events/collect` returns `200`
3. Dashboard receives new events
4. Runtime endpoint (`/v1/runtime`) responds correctly

## Related Pages

- Script/runtime behavior details: [JavaScript API](/javascript-api)
- HTTP contracts: [API Reference](/api-reference)
