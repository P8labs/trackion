# Desktop Client - Local Development Setup

This guide helps you set up the development environment for building and testing the Tauri desktop client locally on Windows.

## Prerequisites

### 1. Rust

Install from https://rustup.rs/

```powershell
# Run the installer and follow prompts
# Verify installation
rustc --version
cargo --version
```

### 2. Node.js & pnpm

```powershell
# Install Node.js v22+ from https://nodejs.org/
node --version

# Install pnpm
npm install -g pnpm
pnpm --version
```

### 3. Windows Build Tools

Choose one:

**Option A: Visual Studio Community (Recommended)**

- Download from https://visualstudio.microsoft.com/downloads/
- Install with "Desktop development with C++" workload

**Option B: Build Tools Standalone**

- Download Visual Studio Build Tools
- Select C++ development tools during installation

**Option C: MinGW** (if you prefer)

- Install via `choco install mingw`

## Setup Steps

### 1. Clone Repository

```bash
git clone <repo-url>
cd trackion/desktop
```

### 2. Install Dependencies

```bash
# Install Node dependencies
pnpm install --frozen-lockfile

# Rust dependencies are handled automatically by Tauri
```

### 3. Setup Tauri CLI

```bash
# Ensure Tauri CLI is installed (should be in node_modules)
npx tauri --version

# Or install globally
pnpm add -g @tauri-apps/cli
```

## Development

### Run Dev Server

```bash
cd desktop
pnpm dev
```

This will:

1. Start the Vite dev server (http://localhost:1420)
2. Build and run the Tauri app
3. Enable hot-reload for frontend changes

### Hot Reload Features

- **Frontend**: Changes to React/TypeScript files reload instantly
- **Rust Backend**: You need to rebuild the app (restart `pnpm dev`)

### Build Frontend Only

```bash
pnpm build
```

Output: `desktop/dist/`

## Building for Production

### Build Tauri App (Dev Artifacts)

```bash
npm run tauri build
```

Output: `desktop/src-tauri/target/release/bundle/`

This includes:

- MSI installer
- NSIS installer
- EXE installer

### Production Build Checklist

- [ ] Frontend builds without errors: `pnpm build`
- [ ] No TypeScript errors: `pnpm exec tsc --noEmit`
- [ ] Tauri builds: `npm run tauri build`
- [ ] Installers are signed (if configured)

## Project Structure

```
desktop/
├── src/                          # Frontend source
│   ├── App.tsx                   # Main app component
│   ├── components/               # React components
│   ├── hooks/                    # Custom React hooks
│   ├── lib/                      # Utilities and helpers
│   ├── pages/                    # Page components
│   └── store/                    # State management
├── src-tauri/                    # Rust backend
│   ├── src/
│   │   ├── main.rs              # Entry point
│   │   └── lib.rs               # App initialization
│   ├── Cargo.toml               # Rust dependencies
│   └── tauri.conf.json          # App config
├── package.json                  # Node dependencies
└── vite.config.ts               # Vite config
```

## Common Tasks

### Update Dependencies

```bash
# Update Node dependencies
pnpm update

# Update Rust dependencies
cd src-tauri
cargo update
cd ..
```

### Add New npm Package

```bash
pnpm add package-name
```

### Add Tauri Plugin

```bash
cd src-tauri
cargo add tauri-plugin-name
cd ..

# Then update src-tauri/src/lib.rs to initialize the plugin
```

### Run Tests

```bash
# Rust tests
cd src-tauri
cargo test
cd ..

# Frontend tests (if configured)
pnpm test
```

## Debugging

### Browser DevTools

When running `pnpm dev`, you can access DevTools:

```typescript
// In any component
import { open } from "@tauri-apps/api/shell";

useEffect(() => {
  // Press Ctrl+Shift+I or add a button to open DevTools
  const handleDevTools = async (e: KeyboardEvent) => {
    if (e.ctrlKey && e.shiftKey && e.code === "KeyI") {
      // DevTools opens automatically
    }
  };
  window.addEventListener("keydown", handleDevTools);
  return () => window.removeEventListener("keydown", handleDevTools);
}, []);
```

### Rust Debugging

```bash
# Run with backtrace
RUST_BACKTRACE=1 npm run tauri dev

# Or full backtrace
RUST_BACKTRACE=full npm run tauri dev
```

### Tauri Logs

Check logs in:

- **Windows**: `%APPDATA%/trackion/logs/`
- **Dev Console**: Check browser console (F12)

## Troubleshooting

### Port Already in Use

```bash
# Default dev port is 1420. Change in vite.config.ts
# Or kill the process:
netstat -ano | findstr :1420
taskkill /PID <PID> /F
```

### Build Fails on Windows

```bash
# Clear Rust cache
cargo clean

# Update Rust
rustup update

# Rebuild
npm run tauri build
```

### Dependencies Not Installing

```bash
# Clear pnpm store
pnpm store prune

# Reinstall
pnpm install --frozen-lockfile
```

### Tauri App Won't Start

1. Check browser console (F12) for errors
2. Check Rust compilation errors in terminal
3. Try running without dev server: `npm run tauri build && npm run tauri`

## Environment Variables

Create `desktop/.env` for development:

```
VITE_API_URL=http://localhost:3000
VITE_ENV=development
```

Access in frontend:

```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes
# ...

# Commit
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/my-feature
```

The CI will automatically:

1. Type-check frontend
2. Build frontend
3. Attempt Tauri build
4. Run desktop CI checks

## Next Steps

1. Read [Desktop Distribution Guide](./desktop-distribution.md) for production setup
2. Check [Updater Setup Guide](./updater-setup.md) for auto-update configuration
3. Review Tauri docs: https://v2.tauri.app/

## Getting Help

- **Tauri Docs**: https://v2.tauri.app/
- **Tauri Discord**: https://discord.gg/tauri
- **GitHub Issues**: Check existing issues or create new one
