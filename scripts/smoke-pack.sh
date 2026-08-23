#!/usr/bin/env bash
# Packs the tarball, installs it into a throwaway directory, and runs the CLI out of it.
#
# `files` is ["bin","dist"] and bin/resumefy.js imports ../dist/index.js, so a wrong files list or a
# skipped build produces a tarball that installs cleanly and then fails on first use. npm versions
# are immutable, so that must be caught here rather than by the first person to npx it.
#
# Deliberate limit: PUPPETEER_SKIP_DOWNLOAD keeps this from fetching ~150 MB of Chromium on every
# run, so this proves the tarball installs and the CLI's module graph loads — not that
# Chrome-dependent rendering works. The unit tests cover that layer.
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

# Read before the cd below, so the comparison is against the version being packed.
expected_version="$(node -p 'require("./package.json").version')"

work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT

echo "packing (prepack runs the build)…"
# A literal path rather than yarn's %s-%v placeholders: the exact filename is needed twice below.
yarn pack --out "$work/resumefy.tgz"

echo "installing the tarball into $work…"
cd "$work"
npm init -y >/dev/null 2>&1
# Both variable names: PUPPETEER_SKIP_DOWNLOAD is current, the CHROMIUM one is the older spelling
# still honoured by some versions. Setting both costs nothing and avoids a 150 MB surprise.
PUPPETEER_SKIP_DOWNLOAD=1 PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1 \
  npm install --no-audit --no-fund "$work/resumefy.tgz"

cli='./node_modules/.bin/resumefy'
if [ ! -x "$cli" ]; then
  echo "::error::the installed package has no executable at $cli — check the bin field"
  exit 1
fi

echo "running the installed CLI…"
# This is the step that would fail on a missing dist/: bin/resumefy.js imports ../dist/index.js at
# load time, so --help cannot print without the built output being present in the tarball.
help_output="$("$cli" --help)"
echo "$help_output"

for command in render init validate; do
  if ! grep -q "$command" <<<"$help_output"; then
    echo "::error::'resumefy --help' does not mention the '$command' command — the tarball may be built from stale output"
    exit 1
  fi
done

reported_version="$("$cli" --version)"
echo "reported version: $reported_version (expected $expected_version)"
if [ "$reported_version" != "$expected_version" ]; then
  echo "::error::the installed CLI reports $reported_version but the package is $expected_version"
  echo "  the built dist/ is stale, or release-please's fan-out to src/cli/index.ts did not land" >&2
  exit 1
fi

echo "smoke test passed"
