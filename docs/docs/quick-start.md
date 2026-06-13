---
title: "Quick Start"
---

# Quick Start

Get Trackion running in minutes and start tracking events from your applications.

## Create a Project

After signing in to [Trackion](https://trackion.tech), create your first project from the dashboard.

Each project has its own:

- API Key
- Event stream
- Analytics dashboard
- Settings and integrations

Once created, copy the generated API key. You will need it to send events to Trackion.

## Install the SDK

Install the Trackion SDK for your platform.

::: tabs
== tab "npm"

```bash
npm install @trackion/js
```

== tab "pnpm"

```bash
pnpm add @trackion/js
```

== tab "bun"

```bash
bun add @trackion/js
```

== tab "yarn"

```bash
yarn add @trackion/js
```

:::

## Initialize Trackion

Configure the SDK using your project API key.

::: tabs
== tab "React"

```ts
import { createTrackionClient } from "@trackion/js/react";

const trackion = createTrackionClient({
  serverUrl: "https://api.trackion.tech", // change of selfhosted
  apiKey: "PROJECT_API_KEY",
  userId: "user-123",
});
```

== tab "Vue 3"

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

== tab "Node"

```ts
import { createTrackionNodeClient, trackServerEvent } from "@trackion/js/node";

const client = createTrackionNodeClient({
  serverUrl: "https://api.example.com",
  apiKey: "PROJECT_API_KEY",
  userId: "worker-1",
});
```

== tab "Script"

```html
<script
  src="https://api.trackion.tech/t.js"
  data-api-key="PROJECT_API_KEY"
></script>
```

:::

## Track Your First Event

Send a custom event to Trackion.

::: tabs

== tab "React / Vue / Script"

```ts
trackion.track("signup_started", {
  source: "landing",
  plan: "pro",
});
```

== tab "Node"

```ts
trackServerEvent(client, "job.processed", {
  ok: true,
  duration_ms: 182,
});

await client.flush();
```

:::

Within a few seconds the event should appear in your project dashboard.

## Add User Context

Associate events with users to unlock user analytics and segmentation.

```ts
await trackion.identify("user_123", {
  name: "John Doe",
  email: "john@example.com",
});
```

## Error Tracking

Trackion automatically captures JavaScript errors and unhandled promise rejections:

```ts
// Automatic capture - no setup needed
window.onerror = (message, source, lineno, colno, error) => {
  // Trackion captures this automatically
};

// Manual capture
trackion.captureError(new Error("Something went wrong"), {
  userId: "user123",
  page: "checkout",
});
```
