# Auto-Updater Setup Guide

This guide explains how to set up the Tauri auto-updater for the desktop client.

## Quick Start

### 1. Generate Signing Keys (One-time)

```bash
cd desktop/src-tauri
tauri signer generate --password "your-secure-password"
```

Output:

```
Generated keys to /home/user/.tauri/signer/
Private key: /home/user/.tauri/signer/
Public key: dW1Y44yPVRf2UrFf...
```

### 2. Add Public Key to Config

Update `desktop/src-tauri/tauri.conf.json`:

```json
{
  "plugins": {
    "updater": {
      "active": true,
      "dialog": true,
      "pubkey": "dW1Y44yPVRf2UrFf..."
    }
  }
}
```

### 3. Set GitHub Secrets

In GitHub repository settings (`Settings > Secrets and variables > Actions`):

**`TAURI_SIGNING_PRIVATE_KEY`**:

```
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA...
... (full private key)
-----END RSA PRIVATE KEY-----
```

**`TAURI_SIGNING_PRIVATE_KEY_PASSWORD`**:

```
your-secure-password
```

### 4. Build and Release

When you push a version tag, the workflow will:

1. Build signed installers
2. Generate update manifest
3. Create GitHub Release

## Hosting Updates

### Option A: GitHub Releases (Easiest)

The auto-updater can fetch from GitHub releases directly:

```typescript
import { check } from "@tauri-apps/plugin-updater";

const update = await check();
if (update?.available) {
  await update.downloadAndInstall();
}
```

**Configure in `tauri.conf.json`**:

```json
{
  "plugins": {
    "updater": {
      "active": true,
      "dialog": true,
      "pubkey": "YOUR_PUBLIC_KEY",
      "endpoints": [
        "https://releases.example.com/updates/${{ target }}/{{ current_version }}"
      ]
    }
  }
}
```

### Option B: Self-Hosted Updates

Create a `latest.json` file on your server:

```json
{
  "version": "0.2.0",
  "notes": "Bug fixes and performance improvements",
  "pub_date": "2024-04-28T12:00:00Z",
  "platforms": {
    "windows-x86_64": {
      "signature": "base64_encoded_signature_here",
      "url": "https://your-domain.com/releases/trackion_0.2.0_x64.msi"
    }
  }
}
```

To generate the signature:

```bash
tauri signer sign --private-key-path ~/.tauri/signer/private.key --password "your-password" /path/to/installer.msi
```

Then in `tauri.conf.json`:

```json
{
  "plugins": {
    "updater": {
      "active": true,
      "dialog": true,
      "pubkey": "YOUR_PUBLIC_KEY",
      "endpoints": ["https://your-domain.com/updates/latest.json"]
    }
  }
}
```

## App-Side Implementation

### Check for Updates on Startup

In `desktop/src/App.tsx`:

```typescript
import { useEffect } from 'react';
import { check, installUpdate, relaunch } from '@tauri-apps/plugin-updater';

export function App() {
  useEffect(() => {
    checkForUpdates();
  }, []);

  async function checkForUpdates() {
    try {
      const update = await check();
      if (update?.available) {
        console.log('Update available:', update.version);
        // User will see dialog automatically due to "dialog": true
      }
    } catch (error) {
      console.error('Failed to check for updates:', error);
    }
  }

  return (
    // ... your app
  );
}
```

### Manual Check Button

```typescript
async function handleUpdateCheck() {
  const update = await check();
  if (update?.available) {
    const confirmed = window.confirm(
      `Update available: v${update.version}\n\n${update.body}\n\nDownload and install?`,
    );
    if (confirmed) {
      await update.downloadAndInstall();
      await relaunch();
    }
  } else {
    alert("You are already on the latest version");
  }
}
```

## Troubleshooting

### Updates Not Working

1. **Check network connectivity**:
   - Ensure update endpoint is accessible
   - Check CORS headers if self-hosted

2. **Verify signature**:

   ```bash
   # Re-generate signature
   tauri signer sign --private-key-path ~/.tauri/signer/private.key \
     --password "your-password" path/to/installer.msi
   ```

3. **Check logs**:
   - On Windows: Check `%APPDATA%/trackion/logs/` for updater logs
   - In dev: Check browser console and Tauri logs

### Signature Mismatch

If you get signature mismatch errors:

1. Verify the public key in `tauri.conf.json` matches the signing key
2. Re-sign the installer with the correct key
3. Ensure the installer file hasn't been modified after signing

## Version Numbering

Update versions must follow semantic versioning:

- Valid: `0.1.0`, `1.0.0`, `2.1.3`
- Invalid: `0.1`, `1.0.0.0`, `latest`

The updater compares versions to determine if update is available:

- Current: `0.1.0`
- Available: `0.1.1` → Update available ✓
- Available: `0.1.0` → No update
- Available: `0.0.9` → No update (downgrade)

## Security Considerations

1. **Private Key**: Never commit to git, only store in GitHub Secrets
2. **Password**: Use a strong password, rotate periodically
3. **Endpoint**: Use HTTPS for update checks
4. **Signature Verification**: Always enabled for auto-update
5. **Update Frequency**: Check on app start, not on every action

## References

- [Tauri Updater Plugin Docs](https://v2.tauri.app/plugin/updater/)
- [Code Signing Guide](https://v2.tauri.app/distribute/sign/windows/)
- [Semantic Versioning](https://semver.org/)
