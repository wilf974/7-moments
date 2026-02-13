# Dockerfile pour l'application 7 Rendez-vous de Prière
# Multi-stage build optimisé pour la taille et les performances

# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Copier uniquement les fichiers de dépendances d'abord (meilleur cache Docker)
COPY package.json package-lock.json ./

# Installer avec npm ci (plus rapide et reproductible)
RUN npm ci --ignore-scripts

# Copier le code source
COPY . .

# Build de l'application
RUN npm run build

# Stage 2: Production (image minimale)
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Créer un utilisateur non-root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copier uniquement les fichiers nécessaires
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "--max-old-space-size=96", "--optimize-for-size", "server.js"]
