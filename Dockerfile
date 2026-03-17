# ==============================================================================
# Milady Railway Deployment
# Wraps the upstream milady build with workspace package fix
# ==============================================================================
FROM node:22-bookworm AS builder

RUN curl -fsSL https://bun.sh/install | bash -s "bun-v1.3.9"
ENV PATH="/root/.bun/bin:${PATH}"

WORKDIR /app

# Clone the milady repo
ARG MILADY_BRANCH=develop
ARG MILADY_REPO=https://github.com/milady-ai/milady.git
RUN git clone --depth 1 --branch ${MILADY_BRANCH} ${MILADY_REPO} .

# Install and build
RUN bun install --ignore-scripts
RUN node ./scripts/link-browser-server.mjs && node ./scripts/patch-deps.mjs
RUN bun run build

# Production deps
RUN rm -rf node_modules && bun install --ignore-scripts --production

# ==============================================================================
# Runtime
# ==============================================================================
FROM node:22-bookworm AS runtime

RUN curl -fsSL https://bun.sh/install | bash -s "bun-v1.3.9"
ENV PATH="/root/.bun/bin:${PATH}"

WORKDIR /app
ENV NODE_LLAMA_CPP_SKIP_DOWNLOAD="true"

# Copy production node_modules
COPY --from=builder /app/node_modules ./node_modules

# Copy workspace packages (symlink targets for @miladyai/autonomous etc.)
COPY --from=builder /app/packages ./packages

# Copy build outputs
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/apps/app/dist ./apps/app/dist

# Copy entrypoint and runtime scripts
COPY --from=builder /app/milady.mjs ./milady.mjs
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/scripts ./scripts

# Copy VRM/animation assets
COPY --from=builder /app/apps/app/public ./apps/app/public

# Copy workspace package.json for module resolution
COPY --from=builder /app/apps/app/package.json ./apps/app/package.json
COPY --from=builder /app/apps/app/node_modules ./apps/app/node_modules

ENV NODE_ENV=production
ENV MILADY_API_BIND="0.0.0.0"
ENV MILADY_STATE_DIR="/data/.milady"
ENV MILADY_CONFIG_PATH="/data/.milady/milady.json"

RUN mkdir -p /data/.milady/workspace/.eliza/.elizadb

CMD ["sh", "-lc", "mkdir -p /data/.milady && if [ ! -f /data/.milady/milady.json ] && [ -n \"$MILADY_INIT_CONFIG\" ]; then printf '%s' \"$MILADY_INIT_CONFIG\" > /data/.milady/milady.json; fi && MILADY_PORT=${PORT:-2138} node milady.mjs start"]
