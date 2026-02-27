# --- build ---
FROM node:22-alpine AS build
WORKDIR /app

RUN npm i -g npm@11.11.0
RUN npm config set registry https://registry.npmjs.org/

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npm run build

# --- run ---
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]