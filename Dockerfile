# syntax=docker/dockerfile:1
# Multiarch official Node 24.18.1: one immutable image for staging and production.
FROM --platform=$BUILDPLATFORM node:24.18.1-alpine@sha256:f70403e87646dc51b45295f4b8b70cdad0b63d2297c4c9899119b03f7af7a6b3 AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json vite.config.ts ./
COPY src ./src
COPY docs/design/tokens.css ./docs/design/tokens.css
RUN npm run build

# Current runtime dependencies are pure JS: install on the builder, avoiding ARM64 emulation for cross builds.
FROM --platform=$BUILDPLATFORM node:24.18.1-alpine@sha256:f70403e87646dc51b45295f4b8b70cdad0b63d2297c4c9899119b03f7af7a6b3 AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts \
    && test -z "$(find node_modules -name '*.node' -print -quit)" \
    && mkdir -p /data && chown node:node /data && chmod 700 /data

FROM node:24.18.1-alpine@sha256:f70403e87646dc51b45295f4b8b70cdad0b63d2297c4c9899119b03f7af7a6b3 AS runtime
ENV NODE_ENV=production \
    PORT=8888 \
    WEB_DIR=/app/dist/web \
    MIGRATIONS_DIR=/app/migrations \
    SQLITE_PATH=/data/scores.sqlite
WORKDIR /app
# Patch the pinned base's OpenSSL packages and remove unused package managers from runtime (SEG-19).
RUN apk add --no-cache --upgrade libssl3=3.5.9-r0 libcrypto3=3.5.9-r0 \
    && rm -rf /usr/local/lib/node_modules /opt/yarn-* /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/yarn /usr/local/bin/yarnpkg
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies --chown=node:node --chmod=0700 /data /data
COPY --from=build /app/dist ./dist
COPY package.json ./
COPY migrations ./migrations
USER node
VOLUME ["/data"]
EXPOSE 8888
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 CMD node --input-type=module -e "const base=(process.env.BASE_PATH||'').replace(/\/+$/,''); const response=await fetch('http://127.0.0.1:'+process.env.PORT+base+'/api/ready',{signal:AbortSignal.timeout(4000)}); if(response.status!==200) process.exit(1);"
CMD ["node", "dist/server/interface/main.js"]
