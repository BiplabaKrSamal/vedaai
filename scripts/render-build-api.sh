#!/bin/bash
set -e
command -v pnpm || npm install -g pnpm@9.14.2
pnpm install --frozen-lockfile
pnpm --filter @vedaai/api build
