FROM node:20-alpine AS builder

WORKDIR /app

COPY client/package.json client/package-lock.json ./

RUN npm ci

COPY client ./

RUN npx vite build

FROM openintegrationengine/engine:latest-alpine

COPY --from=builder /app/dist /opt/engine/public_html/adminweb
USER root
RUN chown -R engine:engine /opt/engine/public_html/adminweb
USER engine
