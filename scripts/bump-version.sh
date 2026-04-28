#!/usr/bin/env bash

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

VERSION_FILE="VERSION"
WEB_PACKAGE_FILE="web/package.json"
DESKTOP_PACKAGE_FILE="desktop/package.json"
DESKTOP_CARGO_FILE="desktop/src-tauri/Cargo.toml"
DOCS_PACKAGE_FILE="docs/package.json"

usage() {
  echo -e "${RED}Usage: $0 <major|minor|patch> [--update-packages|-p] [--sync-packages|-s]${NC}"
  echo -e "Example: $0 patch --sync-packages"
  exit 1
}

update_web_version() {
  local new_version=$1

  if [[ ! -f "$WEB_PACKAGE_FILE" ]]; then
    echo -e "${RED}Missing $WEB_PACKAGE_FILE${NC}"
    exit 1
  fi

  sed -i -E "s/(\"version\"[[:space:]]*:[[:space:]]*\")([0-9]+\.[0-9]+\.[0-9]+)(\")/\1$new_version\3/" "$WEB_PACKAGE_FILE"

  echo -e "${GREEN}Updated $WEB_PACKAGE_FILE version to $new_version${NC}"
}

update_desktop_version() {
  local new_version=$1

  if [[ ! -f "$DESKTOP_PACKAGE_FILE" ]]; then
    echo -e "${RED}Missing $DESKTOP_PACKAGE_FILE${NC}"
    exit 1
  fi

  sed -i -E "s/(\"version\"[[:space:]]*:[[:space:]]*\")([0-9]+\.[0-9]+\.[0-9]+)(\")/\1$new_version\3/" "$DESKTOP_PACKAGE_FILE"

  echo -e "${GREEN}Updated $DESKTOP_PACKAGE_FILE version to $new_version${NC}"
}

update_desktop_cargo_version() {
  local new_version=$1

  if [[ ! -f "$DESKTOP_CARGO_FILE" ]]; then
    echo -e "${RED}Missing $DESKTOP_CARGO_FILE${NC}"
    exit 1
  fi

  sed -i -E "s/(^version = \")([0-9]+\.[0-9]+\.[0-9]+)(\")/\1$new_version\3/" "$DESKTOP_CARGO_FILE"

  echo -e "${GREEN}Updated $DESKTOP_CARGO_FILE version to $new_version${NC}"
}

update_docs_version() {
  local new_version=$1

  if [[ ! -f "$DOCS_PACKAGE_FILE" ]]; then
    echo -e "${RED}Missing $DOCS_PACKAGE_FILE${NC}"
    exit 1
  fi

  sed -i -E "s/(\"version\"[[:space:]]*:[[:space:]]*\")([0-9]+\.[0-9]+\.[0-9]+)(\")/\1$new_version\3/" "$DOCS_PACKAGE_FILE"

  echo -e "${GREEN}Updated $DOCS_PACKAGE_FILE version to $new_version${NC}"
}

get_version() {
  if [[ ! -f "$VERSION_FILE" ]]; then
    echo -e "${RED}Missing VERSION file at repository root${NC}"
    exit 1
  fi

  local v
  v=$(tr -d '[:space:]' < "$VERSION_FILE")

  if [[ ! "$v" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo -e "${RED}VERSION file is not valid semver (x.y.z): $v${NC}"
    exit 1
  fi

  echo "$v"
}

parse_version() {
  local version=$1
  MAJOR=$(echo "$version" | cut -d. -f1)
  MINOR=$(echo "$version" | cut -d. -f2)
  PATCH=$(echo "$version" | cut -d. -f3)
}

bump_version() {
  local bump_type=$1
  parse_version "$CURRENT_VERSION"

  case $bump_type in
    major)
      MAJOR=$((MAJOR + 1))
      MINOR=0
      PATCH=0
      ;;
    minor)
      MINOR=$((MINOR + 1))
      PATCH=0
      ;;
    patch)
      PATCH=$((PATCH + 1))
      ;;
    *)
      echo -e "${RED}Invalid bump type. Use: major, minor, or patch${NC}"
      exit 1
      ;;
  esac

  echo "$MAJOR.$MINOR.$PATCH"
}

update_version_file() {
  local new_version=$1
  printf '%s\n' "$new_version" > "$VERSION_FILE"
}

create_tag() {
  local version=$1
  local tag="v$version"

  echo -e "${YELLOW}Creating commit and git tag: $tag${NC}"

  git add .
  git commit -m "chore: bump version to $version"
  git tag -a "$tag" -m "Release $version"

  echo -e "${GREEN}Tag created: $tag${NC}\n"
  echo -e "${BLUE}To push and trigger release workflow:${NC}"
  echo -e "${YELLOW}  git push origin master && git push origin $tag${NC}\n"
}

show_info() {
  local version=$1

  echo -e "\n${BLUE}==============================================${NC}"
  echo -e "${GREEN}Trackion Release Info${NC}"
  echo -e "${BLUE}==============================================${NC}"
  echo -e "${YELLOW}Version:${NC}             $version"
  echo -e "${YELLOW}Server Binary:${NC}       trackion-server"
  echo -e "${YELLOW}Desktop Installer:${NC}   Tauri MSI/NSIS"
  echo -e "${YELLOW}Tag:${NC}                 v$version"
  echo -e "${BLUE}==============================================${NC}\n"
}

main() {
  if [[ $# -lt 1 || $# -gt 2 ]]; then
    usage
  fi

  local bump_type=$1
  local update_packages=true
  local sync_packages=true

  if [[ $# -eq 2 ]]; then
    case "$2" in
      --update-packages|-p)
        update_packages=true
        ;;
      --sync-packages|-s)
        update_packages=true
        sync_packages=true
        ;;
      *)
        usage
        ;;
    esac
  fi

  CURRENT_VERSION=$(get_version)

  echo -e "${BLUE}Current version:${NC} $CURRENT_VERSION"

  NEW_VERSION=$(bump_version "$bump_type")
  echo -e "${GREEN}New version:${NC}     $NEW_VERSION"

  read -r -p "Continue with version bump? (y/N) " REPLY
  if [[ ! "$REPLY" =~ ^[Yy]$ ]]; then
    echo -e "${RED}Aborted.${NC}"
    exit 1
  fi

  update_version_file "$NEW_VERSION"
  echo -e "${GREEN}Updated $VERSION_FILE${NC}"

  if [[ "$update_packages" == true ]]; then
    update_web_version "$NEW_VERSION"
    update_desktop_version "$NEW_VERSION"
    update_desktop_cargo_version "$NEW_VERSION"

    if [[ "$sync_packages" == true ]]; then
      update_docs_version "$NEW_VERSION"
    fi
  fi

  show_info "$NEW_VERSION"

  read -r -p "Create git commit and tag now? (y/N) " REPLY
  if [[ "$REPLY" =~ ^[Yy]$ ]]; then
    create_tag "$NEW_VERSION"
  else
    echo -e "${YELLOW}Version bumped without commit/tag.${NC}"
    echo -e "${BLUE}Run when ready:${NC}"
    echo -e "${YELLOW}  git add .${NC}"
    echo -e "${YELLOW}  git commit -m 'chore: bump version to $NEW_VERSION'${NC}"
    echo -e "${YELLOW}  git tag -a v$NEW_VERSION -m 'Release $NEW_VERSION'${NC}"
    echo -e "${YELLOW}  git push origin <branch> && git push origin v$NEW_VERSION${NC}"
  fi
}

main "$@"
