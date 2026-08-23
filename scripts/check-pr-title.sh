#!/usr/bin/env bash
# Asserts that a pull request title is a Conventional Commits subject line.
#
# Merges here are squashes, so the PR title *is* the commit subject that lands on main — and
# release-please reads those subjects to decide the next version. A title it cannot parse is not a
# cosmetic problem: the change silently lands in the "other" bucket and never bumps anything.
#
# Runnable locally: ./scripts/check-pr-title.sh "feat(cli): add a thing"
set -euo pipefail

# The type set from commitlint's config-conventional, which is what release-please's `node` release
# type expects. feat and fix drive minor and patch bumps; a trailing `!` drives a major.
types='build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test'

# Zero arguments is a caller bug (a workflow that lost its `env:` wiring), not an untitled PR, and
# it must not read as an empty title that happens to fail — exit 2 to say so distinctly.
if [ "$#" -eq 0 ]; then
  echo "usage: $(basename "${BASH_SOURCE[0]}") <pull-request-title>" >&2
  exit 2
fi

title="$1"

# Surrounding whitespace is invisible in the GitHub UI, so a title failing only because of a stray
# leading space would be rejected with a cause the author cannot see. Trim instead of rejecting.
# This also collapses a whitespace-only subject ("feat:   ") to "feat:", which the pattern rejects.
shopt -s extglob
title="${title##+([[:space:]])}"
title="${title%%+([[:space:]])}"

# Scopes are lowercase and free-form rather than an allowlist: Dependabot already uses deps and
# deps-dev alongside hand-written scopes, and an allowlist would be one more file to maintain.
#
# Deliberately not enforced: subject capitalisation, trailing periods, and subject length. Those
# are style, and this gate exists for release-please, not for taste.
if [[ $title =~ ^($types)(\([a-z0-9-]+\))?!?:\ .+$ ]]; then
  echo "ok: $title"
  exit 0
fi

echo "::error::pull request title is not a conventional commit: '${title}'"
cat >&2 <<USAGE

Expected:  type(optional-scope): subject
           type(optional-scope)!: subject   # ! marks a breaking change

Allowed types: ${types//|/, }

Examples:  feat(cli): add a --watch flag
           fix: escape interpolated values before they reach a RegExp
           chore(deps): bump puppeteer from 24.5.0 to 24.6.0

The scope is lowercase letters, digits and hyphens. The subject must be non-empty and
separated from the colon by a single space.
USAGE
exit 1
