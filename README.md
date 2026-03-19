# Trackion

This is a lightweight telementry infrastructure tool.

## Build Server Locally

```bash
go test ./...
go build -o builds/trackion-server ./cmd
```

## Self-Hosting with Docker Compose

1. Create a self-hosting env file:

```bash
cp .env.selfhost.example .env.selfhost
```

2. Update at least `TRACKION_ADMIN_TOKEN` and `AUTH_SECRET` in `.env.selfhost`.

3. Start the stack:

```bash
docker compose up -d --build
```

The server will be available on `http://localhost:8000` by default.

## Docker Image

Build the server image locally:

```bash
docker build --build-arg VERSION=dev -t trackion/server:dev .
```

## Version Bumping

Server version is tracked in the `VERSION` file.

Use the helper script:

```bash
./scripts/bump-version.sh patch
```

Supported bump types: `major`, `minor`, `patch`.

The script can optionally create:

- a commit with the bumped version
- an annotated git tag (`vX.Y.Z`)

## GitHub Actions

- `.github/workflows/build-go-server.yml`:
  - runs on push and pull requests
  - runs `go test ./...`
  - builds the Go server binary
  - validates Docker image build

- `.github/workflows/release-go-server.yml`:
  - runs when a tag like `v1.2.3` is pushed
  - creates multi-platform server binaries and uploads them to GitHub Releases
  - builds and publishes Docker image to GHCR (`ghcr.io/<owner>/trackion`)
