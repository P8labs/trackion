# Desktop Distribution

This guide describes how Trackion desktop releases are built and published.

## Distribution Targets

Current release workflow builds Windows desktop artifacts and Android APKs:

- NSIS installer (`*.exe`)
- MSI installer (`*.msi`)
- portable ZIP package
- updater metadata (`latest.json` + signatures)
- ABI-specific Android APKs (`arm64-v8a`, `armeabi-v7a`, `x86`, `x86_64`)

## Release Workflow Overview

Desktop and Android build are part of the repository-wide `release.yml` workflow, triggered by semver tags:

- trigger pattern: `v*.*.*`

High-level pipeline:

1. build server binaries (multi-platform)
2. build desktop client on Windows runner
3. build Android APKs for all supported ABIs
4. generate updater metadata
5. package release assets
6. publish GitHub Release
7. build/push Docker image for server

## Required GitHub Secrets

For signed updater artifacts in desktop build job:

- `TAURI_SIGNING_PRIVATE_KEY`
- `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`

For signed Android release APKs:

- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`
- `ANDROID_KEY_BASE64`

Generate keys:

```bash
cd desktop/src-tauri
tauri signer generate --password "your-strong-password"
```

Put generated public key in `tauri.conf.json` updater `pubkey`, and private key/password in repository secrets.

Android signing uses a `keystore.properties` file under `desktop/src-tauri/gen/android/` during CI. The release workflow writes it from the secrets above before running `tauri android build -- --apk --split-per-abi`.

## Local Production Build

```bash
cd desktop
pnpm install --frozen-lockfile
pnpm tauri build
```

Artifacts appear under:

`desktop/src-tauri/target/release/bundle/`

### Production Android APKs

```bash
cd desktop
pnpm tauri android build -- --apk --split-per-abi
```

Android artifacts appear under:

`desktop/src-tauri/gen/android/app/build/outputs/apk/`

## Versioning and Tagging

Use the root script:

```bash
./scripts/bump-version.sh patch
```

This updates:

- root `VERSION`
- `web/package.json`
- `desktop/package.json`
- `desktop/src-tauri/Cargo.toml`
- `desktop/src-tauri/tauri.conf.json`
- `docs/package.json`

Then push code + tag:

```bash
git push origin <branch>
git push origin v$(cat VERSION)
```

## Updater Artifact Generation

Release workflow constructs `latest.json` with:

- release version
- release notes
- `windows-x86_64` URLs and signatures
- additional windows platform aliases

The GitHub release also includes ABI-specific Android APKs for direct download.

The app’s updater plugin is configured to fetch:

`https://github.com/P8labs/trackion/releases/latest/download/latest.json`

## Code Signing and SmartScreen

Trackion updater artifacts are signature-verified using Tauri signer keys.

Separate Windows Authenticode signing (commercial cert) is optional but recommended for reducing SmartScreen friction.

If you add certificate signing:

1. configure certificate parameters in `tauri.conf.json`
2. ensure cert material is securely injected in CI
3. validate installer trust chain on clean Windows machines

## Distribution Checklist

1. Confirm version bump across all packages
2. Ensure desktop CI is green
3. Ensure updater keys exist in secrets
4. Tag release with semver format
5. Validate created GitHub Release assets
6. Validate updater check from installed app

## Troubleshooting

### Missing `latest.json` in release

- Check desktop build step completed
- Check updater artifact path upload in workflow

### Installer artifacts missing

- Verify `pnpm tauri build` output in workflow logs
- Verify bundle paths in upload-artifact step

### Signature verification failures

- Confirm private key secret matches `pubkey` in config
- Ensure generated `.sig` files are uploaded with release assets

### PR desktop CI failure

CI runs `tauri build --no-sign`; resolve Rust/toolchain/frontend build errors first, then re-run.

## Related Pages

- local development: [Desktop Development](/desktop-development)
- updater details: [Auto-Updater Setup](/updater-setup)
