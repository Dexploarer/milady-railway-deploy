#!/bin/bash
set -ex
bunx tsdown
echo '{"type":"module"}' > dist/package.json
bun scripts/write-build-info.ts
cd apps/app
bun run build
