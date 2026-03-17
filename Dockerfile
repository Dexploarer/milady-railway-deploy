# ==============================================================================
# Milady Railway Deployment
# ==============================================================================
FROM node:22-bookworm AS builder

RUN curl -fsSL https://bun.sh/install | bash -s "bun-v1.3.9"
ENV PATH="/root/.bun/bin:${PATH}"

WORKDIR /app

ARG MILADY_BRANCH=develop
ARG MILADY_REPO=https://github.com/milady-ai/milady.git
RUN git clone --depth 1 --branch ${MILADY_BRANCH} ${MILADY_REPO} .

RUN bun install --ignore-scripts
RUN node ./scripts/link-browser-server.mjs && node ./scripts/patch-deps.mjs
RUN bun run build

# Build the autonomous workspace package so dist/ exists
RUN cd packages/autonomous && bun run build || true

# Production deps (preserves workspace symlinks in node_modules)
RUN rm -rf node_modules && bun install --ignore-scripts --production --no-frozen-lockfile

# Resolve workspace symlinks into real copies so Docker COPY works correctly.
# bun install creates node_modules/@miladyai/autonomous -> ../../packages/autonomous
# Docker COPY preserves symlinks but the target paths can break across stages.
RUN find node_modules -maxdepth 3 -type l | while read link; do \
      target="$(readlink -f "$link")" && \
      rm "$link" && \
      cp -a "$target" "$link"; \
    done

# ==============================================================================
# Runtime
# ==============================================================================
FROM node:22-bookworm AS runtime

RUN curl -fsSL https://bun.sh/install | bash -s "bun-v1.3.9"
ENV PATH="/root/.bun/bin:${PATH}"

WORKDIR /app
ENV NODE_LLAMA_CPP_SKIP_DOWNLOAD="true"

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/apps/app/dist ./apps/app/dist
COPY --from=builder /app/milady.mjs ./milady.mjs
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/apps/app/public ./apps/app/public
COPY --from=builder /app/apps/app/package.json ./apps/app/package.json
COPY --from=builder /app/apps/app/node_modules ./apps/app/node_modules

ENV NODE_ENV=production
ENV MILADY_API_BIND="0.0.0.0"
ENV MILADY_STATE_DIR="/data/.milady"
ENV MILADY_CONFIG_PATH="/data/.milady/milady.json"
ENV PGLITE_DATA_DIR="/data/.milady/workspace/.eliza/.elizadb"

RUN mkdir -p /data/.milady/workspace/.eliza/.elizadb

CMD ["sh", "-lc", "mkdir -p /data/.milady && if [ ! -f /data/.milady/milady.json ] && [ -n \"${MILADY_INIT_CONFIG}\" ]; then printf '%s' \"${MILADY_INIT_CONFIG}\" > /data/.milady/milady.json; fi && MILADY_PORT=${PORT:-2138} bun milady.mjs start"]
