#!/bin/bash
set -euo pipefail

usage() {
  printf '%s\n' \
    'Usage: ./scripts/verify.sh --profile <content|product|integrated> --stage <quick|final>' \
    '' \
    'Profiles:' \
    '  content     Validate MDX, translations, frontmatter, and content assets.' \
    '  product     Validate application code and product behavior.' \
    '  integrated  Run both content and product validation.' \
    '' \
    'Stages:' \
    '  quick       Run the fast feedback loop.' \
    '  final       Run the quick loop, build, and profile-required E2E.'
}

profile=''
stage=''

while [[ $# -gt 0 ]]; do
  case "$1" in
    --profile)
      [[ $# -ge 2 ]] || { usage >&2; exit 2; }
      profile="$2"
      shift 2
      ;;
    --stage)
      [[ $# -ge 2 ]] || { usage >&2; exit 2; }
      stage="$2"
      shift 2
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      printf 'Unknown argument: %s\n' "$1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

case "$profile" in
  content|product|integrated) ;;
  *)
    printf 'Invalid profile: %s\n' "${profile:-<missing>}" >&2
    usage >&2
    exit 2
    ;;
esac

case "$stage" in
  quick|final) ;;
  *)
    printf 'Invalid stage: %s\n' "${stage:-<missing>}" >&2
    usage >&2
    exit 2
    ;;
esac

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$repo_root"

pnpm_bin="$(command -v pnpm || true)"
if [[ -z "$pnpm_bin" ]]; then
  printf 'pnpm was not found on PATH.\n' >&2
  exit 1
fi

initial_status="$(git status --porcelain=v1 --untracked-files=all)"

check_worktree() {
  local result=$?
  local final_status
  final_status="$(git status --porcelain=v1 --untracked-files=all)"
  if [[ "$final_status" != "$initial_status" ]]; then
    printf 'Verification changed Git-visible worktree files.\n' >&2
    diff -u <(printf '%s\n' "$initial_status") <(printf '%s\n' "$final_status") >&2 || true
    result=1
  fi
  exit "$result"
}

trap check_worktree EXIT

run_content() {
  "$pnpm_bin" --filter @joseph0926/blog validate:content
  "$pnpm_bin" --filter @joseph0926/blog test:content-validator
}

run_product() {
  "$pnpm_bin" --filter @joseph0926/blog lint
  "$pnpm_bin" --filter @joseph0926/blog format:check
  "$pnpm_bin" type-check
  "$pnpm_bin" --filter @joseph0926/blog test:ci
}

printf 'Verification profile=%s stage=%s\n' "$profile" "$stage"

case "$profile" in
  content)
    run_content
    ;;
  product)
    run_product
    ;;
  integrated)
    run_content
    run_product
    ;;
esac

if [[ "$stage" == 'final' ]]; then
  "$pnpm_bin" build
  if [[ "$profile" != 'content' ]]; then
    "$pnpm_bin" exec playwright test --config=e2e/playwright.config.ts
  fi
fi

printf 'Verification passed without Git-visible worktree changes.\n'
