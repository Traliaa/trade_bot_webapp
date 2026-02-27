# --- build stage ---
FROM node:22-alpine AS build
WORKDIR /app

RUN npm i -g npm@11.11.0
RUN npm config set registry https://registry.npmjs.org/

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .

# build через npx (гарантирует правильный бинарь)
RUN npx svelte-kit build

# --- run stage ---
FROM node:22-alpine AS run
WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

RUN npm i -g npm@11.11.0
RUN npm config set registry https://registry.npmjs.org/

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund

COPY --from=build /app/build ./build

EXPOSE 3000
CMD ["node", "build"]