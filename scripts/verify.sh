#!/bin/bash
set -euo pipefail

echo "=== lint ==="
pnpm lint

echo "=== format ==="
pnpm --filter @joseph0926/blog format:check

echo "=== typecheck ==="
pnpm type-check

echo "=== test ==="
pnpm --filter @joseph0926/blog test:ci

echo "=== build ==="
pnpm build

echo "=== All checks passed ==="
