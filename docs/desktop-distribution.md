# Desktop Client - Windows Installer & Distribution Setup

This guide covers the setup of the Tauri desktop client for production Windows distribution with automatic updates.

## Overview

The desktop client is built using Tauri with the following features:

- **Windows Installer**: NSIS and MSI installers for easy installation
- **Code Signing**: Sign installers for authenticity and Windows SmartScreen bypass
- **Auto-Updates**: Built-in updater plugin for automatic app updates
- **CI/CD**: GitHub Actions workflows for automated builds and releases

## Prerequisites

### Local Development

1. **Rust**: Install from https://rustup.rs/
2. **Node.js**: v22+ (used in GH Actions)
3. **pnpm**: Install via `npm install -g pnpm`
4. **Windows Development Tools**:
   - Visual Studio Build Tools (for Windows builds)
   - Or Visual Studio Community Edition

### GitHub Secrets (Required for Production)

For the GitHub Actions workflows to build and sign the desktop app, set these secrets:

1. **`TAURI_SIGNING_PRIVATE_KEY`**: Your private key for signing updates
2. **`TAURI_SIGNING_PRIVATE_KEY_PASSWORD`**: Password for the private key

To generate signing keys:

```bash
cd desktop/src-tauri
tauri signer generate --password "your-password"
```

This will output:

- Public key: Add to `tauri.conf.json` as `plugins.updater.pubkey`
- Private key: Add to GitHub Secrets as `TAURI_SIGNING_PRIVATE_KEY`

## Configuration

### tauri.conf.json

The configuration includes:

- **Bundle targets**: `msi`, `nsis`, `exe`
- **Updater plugin**: Enabled with public key for signature verification
- **Windows-specific settings**: Code signing placeholders for production

```json
{
  "plugins": {
    "updater": {
      "active": true,
      "dialog": true,
      "pubkey": "{{ TAURI_UPDATER_PUBLIC_KEY }}"
    }
  },
  "bundle": {
    "windows": [
      {
        "certificateThumbprint": null,
        "digestAlgorithm": "sha256",
        "timestampUrl": ""
      }
    ],
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true
    },
    "msi": {
      "certificateThumbprint": null,
      "digestAlgorithm": "sha256",
      "timestampUrl": ""
    }
  }
}
```

## Building Locally

### Development Build

```bash
cd desktop
pnpm install
pnpm dev
```

### Production Build

```bash
cd desktop
pnpm install
npm run tauri build
```

Built files will be in: `desktop/src-tauri/target/release/bundle/`

## Release Process

### 1. Bump Version

```bash
./scripts/bump-version.sh patch --sync-packages
```

This will:

- Update `VERSION` file
- Update `web/package.json`
- Update `desktop/package.json`
- Update `desktop/src-tauri/Cargo.toml`
- Update `docs/package.json`

### 2. Create Release

Push the version tag to trigger both:

- **Desktop Release Workflow**: Builds Windows MSI/NSIS installers
- **Go Server Release Workflow**: Builds server binaries

```bash
git push origin master && git push origin v$(cat VERSION)
```

### 3. GitHub Release

Both workflows will:

1. Build artifacts
2. Create a GitHub Release with installers
3. Generate release notes

## Code Signing (Optional but Recommended)

For production builds, you should code sign the installers to:

- Bypass Windows SmartScreen warnings
- Improve user trust
- Meet Windows quality standards

### Prerequisites for Code Signing

1. **Code Signing Certificate**:
   - Obtain from a CA (e.g., DigiCert, GlobalSign)
   - Or use a self-signed certificate for testing

2. **Certificate Setup**:
   - Export certificate as `.pfx` file
   - Add to GitHub Secrets as `WINDOWS_CERTIFICATE`
   - Add password as `WINDOWS_CERTIFICATE_PASSWORD`

### Update Configuration

Edit `desktop/src-tauri/tauri.conf.json`:

```json
{
  "bundle": {
    "windows": [
      {
        "certificateThumbprint": "YOUR_CERT_THUMBPRINT",
        "digestAlgorithm": "sha256",
        "timestampUrl": "http://timestamp.digicert.com"
      }
    ],
    "msi": {
      "certificateThumbprint": "YOUR_CERT_THUMBPRINT",
      "digestAlgorithm": "sha256",
      "timestampUrl": "http://timestamp.digicert.com"
    }
  }
}
```

### Update GitHub Actions

In `.github/workflows/release-desktop.yml`, add certificate handling:

```yaml
- name: Sign Installer
  env:
    WINDOWS_CERTIFICATE: ${{ secrets.WINDOWS_CERTIFICATE }}
    WINDOWS_CERTIFICATE_PASSWORD: ${{ secrets.WINDOWS_CERTIFICATE_PASSWORD }}
  run: |
    # Set up certificate for signing
    [IO.File]::WriteAllBytes('cert.pfx', [Convert]::FromBase64String($env:WINDOWS_CERTIFICATE))
    # Build will automatically sign with the certificate
```

## Auto-Update Configuration

### Updater Endpoint

The auto-updater needs a static file endpoint. Configure your server to serve:

```
https://your-domain.com/updates/latest.json
```

Example `latest.json`:

```json
{
  "version": "0.1.0",
  "notes": "New version with bug fixes",
  "pub_date": "2024-04-28T00:00:00Z",
  "platforms": {
    "windows-x86_64": {
      "signature": "BASE64_ENCODED_SIGNATURE",
      "url": "https://your-domain.com/downloads/trackion_0.1.0_x64.msi"
    }
  }
}
```

### In the App

To check for updates programmatically in your React app:

```typescript
import { check, installUpdate } from "@tauri-apps/plugin-updater";

async function checkForUpdates() {
  const update = await check();
  if (update?.available) {
    console.log("Update available:", update.version);
    await update.downloadAndInstall();
    // Optionally restart the app
    relaunch();
  }
}
```

## GitHub Actions Workflows

### Desktop CI (`desktop-ci.yml`)

Runs on every pull request:

- Type-checks TypeScript
- Builds frontend
- Attempts full Tauri build

### Release Desktop (`release-desktop.yml`)

Runs on version tags (e.g., `v0.1.0`):

1. Builds Windows MSI and NSIS installers
2. Uploads artifacts
3. Creates GitHub Release with installers
4. Generates release notes linking to server release

## Troubleshooting

### Build Failures

1. **Rust Cache Issues**:

   ```bash
   cargo clean
   cargo build
   ```

2. **Node Dependencies**:

   ```bash
   cd desktop
   pnpm install --frozen-lockfile
   ```

3. **Tauri Cache**:
   ```bash
   rm -rf desktop/src-tauri/target
   npm run tauri build
   ```

### Update Signature Issues

If updates fail verification:

1. Ensure public key in `tauri.conf.json` matches the one used to sign
2. Check that the signature in `latest.json` is correct
3. Regenerate keys if needed

### GitHub Actions Failures

1. Check secrets are set: `Settings > Secrets and variables > Actions`
2. Verify Rust toolchain compatibility
3. Check pnpm-lock.yaml is committed
4. Review workflow logs in Actions tab

## References

- [Tauri Windows Installer Docs](https://v2.tauri.app/distribute/windows-installer/)
- [Tauri Code Signing](https://v2.tauri.app/distribute/sign/windows/)
- [Tauri Updater Plugin](https://v2.tauri.app/plugin/updater/)
- [Tauri CLI Documentation](https://v2.tauri.app/reference/cli/)
