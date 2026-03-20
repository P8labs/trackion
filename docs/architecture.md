# Architecture

Technical overview of Trackion system design, components, and data flow.

## System Overview

Trackion is built as a lightweight, self-hosted telemetry infrastructure with three main components:

1. API Server (Go) - Event collection and analytics API
2. Dashboard (React) - Web interface for analytics and project management
3. Database (PostgreSQL) - Event storage and analytics data
4. Tracking Script (JavaScript) - Client-side event collection

Component relationship summary:

| Layer      | Components                                                     |
| ---------- | -------------------------------------------------------------- |
| Clients    | Website, backend APIs, mobile apps                             |
| Ingestion  | Tracking script (`t.js`), reverse proxy                        |
| API server | Chi router, auth middleware, events/analytics/projects modules |
| Frontend   | React dashboard UI                                             |
| Storage    | PostgreSQL                                                     |

Typical request flow:

1. Client app emits events via tracker or direct API calls.
2. Reverse proxy forwards requests to the Go API server.
3. API modules validate auth/project scope.
4. Events and analytics data are persisted/read from PostgreSQL.

## Core Components

### API Server (Backend)

Built with Go 1.21+ using the Chi router framework.

Key features:

- High-performance event ingestion
- RESTful API design
- Connection pooling with PostgreSQL
- GitHub OAuth authentication
- Rate limiting and CORS support
- Structured logging

### Frontend Dashboard

Modern React application with TypeScript and Tailwind CSS.

Technology stack:

- React 18 with hooks and context
- TypeScript for type safety
- Tailwind CSS for styling
- Vite for build tooling
- TanStack Query for data fetching
- Recharts for data visualization

### Tracking Script

Lightweight JavaScript SDK for client-side event collection.

Core responsibilities:

- Auto page-view instrumentation
- Session management
- Batch event sending
- UTM capture
- Config-based behavior toggles

## Data Flow

### Event Collection Flow

1. Website loads `t.js`.
2. Tracker fetches `/events/config` for project settings.
3. Tracker queues automatic and manual events.
4. Tracker flushes events to `/events/batch`.
5. API validates project key and inserts into PostgreSQL.

### Analytics Query Flow

1. Dashboard requests `/api/analytics/*`.
2. API authenticates bearer/session context.
3. API runs aggregated queries in PostgreSQL.
4. Dashboard receives formatted analytics payloads.

## Security Architecture

Trackion uses a two-tier security model:

1. Project API keys for ingestion
2. Bearer token auth for dashboard APIs

Security controls include:

- Rate limiting
- CORS policy
- Project/user validation
- Session or admin token auth depending on mode

## Scalability

- Vertical scaling via CPU/RAM and DB tuning
- Horizontal scaling via multiple API instances behind a load balancer
- Read-replicas and caching for heavy analytics workloads
