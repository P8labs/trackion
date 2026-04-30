# Auto-Updater Setup

Trackion desktop uses Tauri updater with signature verification and a release-hosted `latest.json` manifest.

## Current Updater Configuration

In `desktop/src-tauri/tauri.conf.json`, updater is configured with:

- `active: true`
- `dialog: true`
- `pubkey: <minisign public key>`
- endpoint: `https://github.com/P8labs/trackion/releases/latest/download/latest.json`

This means production desktop clients check GitHub Releases directly.

## One-Time Key Setup

Generate signing keys:

```bash
cd desktop/src-tauri
tauri signer generate --password "your-strong-password"
```

Then:

1. keep private key secure (never commit)
2. set public key in updater `pubkey`
3. add secrets to repo:
   - `TAURI_SIGNING_PRIVATE_KEY`
   - `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`

## Release-Time Manifest Generation

During `release.yml`, desktop build step:

1. builds installers
2. reads generated `.sig` files
3. creates updater `latest.json`
4. publishes `latest.json` and signatures as release assets

The app then fetches this manifest at runtime via configured endpoint.

## Expected `latest.json` Shape

Typical structure:

```json
{
  "version": "2.3.0",
  "notes": "...",
  "pub_date": "2026-04-29T00:00:00Z",
  "platforms": {
    "windows-x86_64": {
      "url": "https://github.com/P8labs/trackion/releases/download/v2.3.0/trackion_2.3.0_x64-setup.exe",
      "signature": "..."
    }
  }
}
```

## App-Side Update Check

Example manual check in frontend:

```ts
import { check } from "@tauri-apps/plugin-updater";

export async function checkForDesktopUpdate() {
  const update = await check();
  if (update?.available) {
    await update.downloadAndInstall();
    // optionally relaunch afterwards
  }
}
```

With `dialog: true`, built-in updater dialogs can be shown depending on plugin behavior.

## Local Testing Strategy

For local verification without full release pipeline:

1. create a signed installer artifact
2. generate local `latest.json` pointing to reachable URL
3. temporarily override updater endpoint for test build
4. verify check/download/install flow

## Troubleshooting

### Update check fails

- verify endpoint URL resolves
- verify app has network access
- verify manifest JSON is valid

### Signature mismatch

- confirm `pubkey` matches private key used in CI signing
- confirm `.sig` belongs to exact installer file
- regenerate signatures if artifact changed

### No update detected

- confirm version in `latest.json` is newer than installed app
- confirm semver format is valid

## Security Guidelines

1. never commit private signing keys
2. rotate signing credentials on schedule
3. serve updater endpoints over HTTPS
4. review release asset integrity before publishing

## Related Pages

- release pipeline and artifacts: [Desktop Distribution](/desktop-distribution)
- local desktop workflows: [Desktop Development](/desktop-development)
