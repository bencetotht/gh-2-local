FROM node:20-bookworm-slim AS build
WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends git python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json tsconfig.test.json ./
COPY src ./src
RUN npm run build && npm prune --omit=dev

FROM node:20-bookworm-slim AS runtime
WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends git ca-certificates \
  && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV GH_2_LOCAL_ROOT=/data/repos
ENV GH_2_LOCAL_DB=/data/repos.db

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY docker/entrypoint.sh /usr/local/bin/gh-2-local-entrypoint

RUN mkdir -p /data \
  && useradd --create-home --uid 10001 appuser \
  && chown -R appuser:appuser /app /data

VOLUME ["/data"]
USER appuser
ENTRYPOINT ["/usr/local/bin/gh-2-local-entrypoint"]
CMD ["--help"]
