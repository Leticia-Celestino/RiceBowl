FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY 15-dns-resolver.envsh /docker-entrypoint.d/15-dns-resolver.envsh
RUN chmod 755 /docker-entrypoint.d/15-dns-resolver.envsh
COPY --from=build /app/dist /usr/share/nginx/html
ENV PORT=80
EXPOSE 80
