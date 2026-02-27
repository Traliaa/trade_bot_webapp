# --- build stage ---
FROM node:22-alpine AS build
WORKDIR /app

RUN npm i -g npm@11.11.0

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npm run build

# --- run stage ---
FROM node:22-alpine AS run
WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

RUN npm i -g npm@11.11.0

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund

# SvelteKit adapter-node output:
COPY --from=build /app/build ./build

EXPOSE 3000
CMD ["node", "build"]