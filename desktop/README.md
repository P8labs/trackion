# Trackion Desktop Client

A cross-platform desktop client for Trackion built with Tauri, React, and TypeScript.

## Quick Start

### Local Development

1. **Prerequisites**: Install [Rust](https://rustup.rs/) and [Node.js 22+](https://nodejs.org/)

2. **Setup**:

   ```bash
   pnpm install
   ```

3. **Run Dev**:

   ```bash
   pnpm dev
   ```

   The app will open with hot-reload enabled.

4. **Build**:

   ```bash
   npm run tauri build
   ```

   Output in: `src-tauri/target/release/bundle/`

## Documentation

- **[Local Development Setup](../docs/desktop-development.md)** - Complete guide for setting up the development environment
- **[Windows Installer & Distribution](../docs/desktop-distribution.md)** - Production build, code signing, and release process
- **[Auto-Updater Setup](../docs/updater-setup.md)** - Configure automatic app updates

## Project Structure

```
├── src/                    # Frontend (React + TypeScript)
│   ├── components/        # Reusable React components
│   ├── pages/            # Page-level components
│   ├── hooks/            # Custom React hooks
│   ├── store/            # State management (Zustand)
│   └── lib/              # Utilities and helpers
├── src-tauri/            # Backend (Rust/Tauri)
│   └── src/
│       ├── main.rs       # Entry point
│       └── lib.rs        # App initialization
├── public/               # Static assets
└── tauri.conf.json       # App configuration
```

## Available Scripts

```bash
# Development
pnpm dev                    # Run dev server with Tauri
pnpm build                  # Build frontend only
npm run tauri dev          # Run Tauri in dev mode

# Production
npm run tauri build        # Build production bundle (MSI + NSIS)

# Utilities
pnpm exec tsc --noEmit    # Type-check
```

## Key Features

- **Windows Installer**: NSIS and MSI installers
- **Auto-Updates**: Built-in update checker with cryptographic verification
- **Deep Linking**: Custom `trackion://` protocol support
- **Native Integrations**: File operations, system shell integration
- **Modern Stack**: React 19, TypeScript, Tailwind CSS

## Release Process

1. **Bump Version**:

   ```bash
   ./scripts/bump-version.sh patch --sync-packages
   ```

2. **Push Tag**:

   ```bash
   git push origin master && git push origin v$(cat VERSION)
   ```

3. **GitHub Actions**:
   - Builds MSI and NSIS installers
   - Creates GitHub Release with installers
   - Generates update manifests (if configured)

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/)
- [Tauri Extension](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode)
- [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## Environment Variables

Create `.env` in the `desktop/` directory:

```
VITE_API_URL=http://localhost:3000
VITE_ENV=development
```

## Troubleshooting

See [Local Development Setup](../docs/desktop-development.md#troubleshooting) for common issues.

## Resources

- [Tauri Documentation](https://v2.tauri.app/)
- [Tauri API](https://v2.tauri.app/api/)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)

## GitHub Workflows

- **desktop-ci.yml** - Runs on pull requests (type-check, build)
- **release-desktop.yml** - Runs on version tags (build and release)

For setup instructions, see [Windows Installer & Distribution](../docs/desktop-distribution.md).
