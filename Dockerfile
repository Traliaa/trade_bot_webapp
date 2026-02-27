# --- build stage ---
FROM node:20-alpine AS build
WORKDIR /app

# install deps
COPY package.json package-lock.json ./
RUN npm ci

# copy sources and build
COPY . .
RUN npm run build

# --- run stage ---
FROM node:20-alpine AS run
WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# copy only what we need to run
COPY --from=build /app/package.json /app/package-lock.json ./
RUN npm ci --omit=dev

COPY --from=build /app/build ./build

EXPOSE 3000
CMD ["node", "build"]