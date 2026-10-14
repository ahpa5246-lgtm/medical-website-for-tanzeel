FROM node:22-bookworm-slim AS frontend
WORKDIR /build
RUN corepack enable
COPY ["Build Medical Consultation Platform/package.json", "Build Medical Consultation Platform/pnpm-lock.yaml", "./"]
RUN pnpm install --frozen-lockfile
COPY ["Build Medical Consultation Platform/", "./"]
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY VITE_ENABLE_PROTOTYPE=false
RUN pnpm build
FROM php:8.3-apache
RUN a2enmod rewrite headers
COPY --from=frontend /build/dist/ /var/www/html/
COPY server/src/ /var/www/src/
COPY server/public/ /var/www/html/
ENV APP_PUBLIC_DIR=/var/www/html
EXPOSE 80
