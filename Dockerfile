FROM node:22-alpine AS build
WORKDIR /app

ENV NODE_ENV=development
RUN npm i -g npm@11.11.0
RUN npm config set registry https://registry.npmjs.org/

COPY package.json package-lock.json ./
RUN npm ci --include=dev --no-audit --no-fund

COPY . .

# если без этого падает tsc/vite - оставляем
RUN npx svelte-kit sync

# vite build -> dist/
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# SPA fallback (важно!)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]