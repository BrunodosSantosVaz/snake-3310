#!/usr/bin/env bash
set -euo pipefail

readonly NODE_VERSION=24.18.1

install_node() {
  local architecture checksum archive temporary destination
  [ "$(uname -s)" = Linux ] || { echo 'CI requires Linux' >&2; return 1; }
  case "$(uname -m)" in
    x86_64) architecture=x64; checksum=d6c664df3f3f61458e8c277585571328522d705166723a7c7823a9253a4d15a0 ;;
    aarch64|arm64) architecture=arm64; checksum=7201e3a09dc825bac57867c81913e2b8f0ef87d04cb9082af4cda82f6ff3d88c ;;
    *) echo 'Unsupported CI architecture' >&2; return 1 ;;
  esac
  temporary=$(mktemp -d)
  trap 'rm -rf "$temporary"' RETURN
  archive="$temporary/node.tar.xz"
  destination="${RUNNER_TEMP:?RUNNER_TEMP is required}/node-$NODE_VERSION"
  curl --fail --silent --show-error --location --proto '=https' --tlsv1.2 \
    "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-$architecture.tar.xz" --output "$archive"
  printf '%s  %s\n' "$checksum" "$archive" | sha256sum --check --strict
  mkdir -p "$destination"
  tar --extract --xz --file "$archive" --directory "$destination" --strip-components=1
  export PATH="$destination/bin:$PATH"
  if [ -n "${GITHUB_PATH:-}" ]; then printf '%s\n' "$destination/bin" >> "$GITHUB_PATH"; fi
}

if [ "${CI:-}" = true ]; then
  install_node
fi
if [ "$(node --version)" != "v$NODE_VERSION" ]; then
  echo "Use Node $NODE_VERSION before installing locally" >&2
  exit 1
fi
npm ci
