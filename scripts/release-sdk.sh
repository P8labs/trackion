#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SDK_PACKAGE_JSON="$REPO_ROOT/sdk/web/package.json"

usage() {
  cat <<'EOF'
Usage:
  scripts/release-sdk.sh <major|minor|patch|x.y.z> [--push]

Examples:
  scripts/release-sdk.sh patch
  scripts/release-sdk.sh 0.3.0 --push

What it does:
  1) Bumps sdk/web/package.json version
  2) Creates commit: chore(sdk): release @trackion/js v<version>
  3) Creates tag: sdk-v<version>
  4) Optionally pushes branch + tag with --push
EOF
}

if [[ $# -lt 1 || $# -gt 2 ]]; then
  usage
  exit 1
fi

BUMP_INPUT="$1"
PUSH=false
if [[ $# -eq 2 ]]; then
  if [[ "$2" == "--push" ]]; then
    PUSH=true
  else
    usage
    exit 1
  fi
fi

if [[ ! -f "$SDK_PACKAGE_JSON" ]]; then
  echo "Missing $SDK_PACKAGE_JSON"
  exit 1
fi

CURRENT_VERSION="$(node -p "require('$SDK_PACKAGE_JSON').version")"

if [[ -z "$CURRENT_VERSION" ]]; then
  echo "Could not read current SDK version"
  exit 1
fi

NEW_VERSION=""
if [[ "$BUMP_INPUT" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  NEW_VERSION="$BUMP_INPUT"
elif [[ "$BUMP_INPUT" == "major" || "$BUMP_INPUT" == "minor" || "$BUMP_INPUT" == "patch" ]]; then
  NEW_VERSION="$(node -e "const v='$CURRENT_VERSION'.split('.').map(Number); if(v.length!==3||v.some(Number.isNaN)){process.exit(1)}; if('$BUMP_INPUT'==='major'){v[0]++;v[1]=0;v[2]=0}else if('$BUMP_INPUT'==='minor'){v[1]++;v[2]=0}else{v[2]++}; process.stdout.write(v.join('.'))")"
else
  echo "Invalid version bump input: $BUMP_INPUT"
  usage
  exit 1
fi

if [[ "$NEW_VERSION" == "$CURRENT_VERSION" ]]; then
  echo "Version unchanged ($CURRENT_VERSION). Nothing to do."
  exit 1
fi

TAG="sdk-v$NEW_VERSION"

if git -C "$REPO_ROOT" rev-parse "$TAG" >/dev/null 2>&1; then
  echo "Tag already exists: $TAG"
  exit 1
fi

node -e "const fs=require('fs');const p='$SDK_PACKAGE_JSON';const data=JSON.parse(fs.readFileSync(p,'utf8'));data.version='$NEW_VERSION';fs.writeFileSync(p, JSON.stringify(data,null,2)+'\n');"

echo "SDK version: $CURRENT_VERSION -> $NEW_VERSION"

git -C "$REPO_ROOT" add sdk/web/package.json

git -C "$REPO_ROOT" commit -m "chore(sdk): release @trackion/js v$NEW_VERSION"

git -C "$REPO_ROOT" tag -a "$TAG" -m "Release @trackion/js v$NEW_VERSION"

echo "Created commit and tag: $TAG"

echo "Publish workflow trigger: push the tag to origin"

if [[ "$PUSH" == true ]]; then
  CURRENT_BRANCH="$(git -C "$REPO_ROOT" rev-parse --abbrev-ref HEAD)"
  git -C "$REPO_ROOT" push origin "$CURRENT_BRANCH"
  git -C "$REPO_ROOT" push origin "$TAG"
  echo "Pushed branch and tag to origin"
else
  echo "Run: git push origin <branch> && git push origin $TAG"
fi
