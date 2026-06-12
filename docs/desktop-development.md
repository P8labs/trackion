# Desktop Development

This guide covers local development for the Trackion desktop client (`desktop/`) built with Tauri + React.

## Prerequisites

### Required

- Rust toolchain (`rustup`, `cargo`)
- Node.js `22+`
- pnpm `10+`
- platform build prerequisites for Tauri

### Windows Notes

For Windows builds (recommended for this project’s distribution path), install Visual Studio Build Tools with C++ workload.

## Project Layout

`desktop/` contains:

- `src/`: React UI
- `src-tauri/`: Rust/Tauri host
- `vite.config.ts`: Vite dev/build config (port `1420`)
- `src-tauri/tauri.conf.json`: app, bundling, updater, deep-link config

## Install Dependencies

```bash
cd desktop
pnpm install --frozen-lockfile
```

## Development Modes

### Frontend-Only Development

```bash
cd desktop
pnpm dev
```

Starts Vite server at `http://localhost:1420`.

### Full Tauri App Development

```bash
cd desktop
pnpm tauri dev
```

This launches the desktop window and wires Rust + frontend together.

## Build Commands

### Frontend Build Only

```bash
cd desktop
pnpm build
```

### Production Tauri Bundle

```bash
cd desktop
pnpm tauri build
```

Artifacts are generated in:

`desktop/src-tauri/target/release/bundle/`

## Useful Checks

Type-check:

```bash
cd desktop
pnpm exec tsc --noEmit
```

Rust format/lint/test:

```bash
cd desktop/src-tauri
cargo fmt
cargo clippy -- -D warnings
cargo test
```

## Environment Variables

Use a local `.env` in `desktop/` for frontend configuration:

```env
VITE_SERVER_URL=http://localhost:8000
VITE_TRACKION_MODE=selfhost
```

Common mode values:

- `VITE_TRACKION_MODE=selfhost` for token-based local API login
- `VITE_TRACKION_MODE=saas` for OAuth flow against hosted API

## Key Tauri Features in This App

- deep link scheme: `trackion://`
- updater plugin enabled
- single-instance handling with deep-link registration
- custom window actions via Rust invoke command

## Troubleshooting

### Port `1420` already in use

- Stop conflicting process or change Vite/Tauri dev configuration together
- `tauri dev` expects this port to be available (`strictPort=true`)

### Build fails on Rust step

```bash
cd desktop/src-tauri
cargo clean
cd ..
pnpm tauri build
```

### App launches but API requests fail

- Check `VITE_SERVER_URL`
- Check API health (`/health`)
- Check auth mode alignment (`selfhost` vs `saas`)

### Updater errors in dev

Updater endpoints are production-oriented. Expect updater checks to fail in local dev unless endpoint + signatures are available.

## CI Behavior

Desktop CI workflow validates:

1. dependency installation
2. TypeScript type-check
3. frontend build
4. `tauri build --no-sign`

## Next

- release process and installers: [Desktop Distribution](/desktop-distribution)
- updater lifecycle and `latest.json`: [Auto-Updater Setup](/updater-setup)
