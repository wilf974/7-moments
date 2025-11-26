#!/bin/bash

# Script d'installation automatique pour 7moments.woutils.com
# À exécuter sur le VPS avec les droits root ou sudo

set -e  # Arrêter en cas d'erreur

echo "🚀 Installation de 7moments.woutils.com sur le VPS"
echo "=================================================="

# 1. Installation des dépendances
echo ""
echo "📦 Étape 1/6 : Installation des dépendances..."
sudo apt update && sudo apt upgrade -y

# Docker
if ! command -v docker &> /dev/null; then
    echo "  → Installation de Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
else
    echo "  ✓ Docker déjà installé"
fi

# Docker Compose
if ! command -v docker compose &> /dev/null; then
    echo "  → Installation de Docker Compose..."
    sudo apt install docker-compose-plugin -y
else
    echo "  ✓ Docker Compose déjà installé"
fi

# Nginx
if ! command -v nginx &> /dev/null; then
    echo "  → Installation de Nginx..."
    sudo apt install nginx -y
else
    echo "  ✓ Nginx déjà installé"
fi

# Certbot
if ! command -v certbot &> /dev/null; then
    echo "  → Installation de Certbot..."
    sudo apt install certbot python3-certbot-nginx -y
else
    echo "  ✓ Certbot déjà installé"
fi

# 2. Création du répertoire
echo ""
echo "📁 Étape 2/6 : Création du répertoire..."
sudo mkdir -p /opt/apps/7-moments
sudo chown $USER:$USER /opt/apps/7-moments

# 3. Clonage du projet
echo ""
echo "📥 Étape 3/6 : Clonage du projet depuis GitHub..."
cd /opt/apps/7-moments

if [ -d ".git" ]; then
    echo "  → Mise à jour du repository existant..."
    git pull origin main
else
    echo "  → Clonage du repository..."
    git clone https://github.com/wilf974/7-moments.git .
fi

# 4. Configuration Nginx (HTTP)
echo ""
echo "⚙️  Étape 4/6 : Configuration Nginx..."
sudo tee /etc/nginx/sites-available/7moments.woutils.com > /dev/null <<EOF
server {
    listen 80;
    server_name 7moments.woutils.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Activer le site
sudo ln -sf /etc/nginx/sites-available/7moments.woutils.com /etc/nginx/sites-enabled/

# Tester et redémarrer Nginx
sudo nginx -t
sudo systemctl restart nginx

# 5. Configuration HTTPS
echo ""
echo "🔒 Étape 5/6 : Configuration HTTPS avec Let's Encrypt..."
echo "  ⚠️  Vous devrez répondre aux questions de Certbot :"
echo "     - Email : votre email"
echo "     - Accepter les conditions : A"
echo "     - Redirection HTTP → HTTPS : 2 (Oui)"
echo ""
read -p "Appuyez sur Entrée pour continuer..."

sudo certbot --nginx -d 7moments.woutils.com --non-interactive --agree-tos --email admin@woutils.com --redirect

# 6. Build et démarrage Docker
echo ""
echo "🐳 Étape 6/6 : Build et démarrage de l'application..."
cd /opt/apps/7-moments
docker compose down 2>/dev/null || true
docker compose up -d --build

# Attendre que le conteneur démarre
echo "  → Attente du démarrage du conteneur..."
sleep 10

# Vérification
echo ""
echo "✅ Installation terminée !"
echo ""
echo "📊 Vérification :"
docker ps | grep prayer-app && echo "  ✓ Conteneur Docker actif" || echo "  ✗ Conteneur Docker non actif"
curl -s -o /dev/null -w "%{http_code}" https://7moments.woutils.com | grep -q "200\|301\|302" && echo "  ✓ HTTPS fonctionne" || echo "  ✗ HTTPS ne répond pas"

echo ""
echo "🌐 Votre application est disponible sur : https://7moments.woutils.com"
echo ""
echo "📝 Commandes utiles :"
echo "  - Voir les logs : cd /opt/apps/7-moments && docker compose logs -f"
echo "  - Redémarrer : cd /opt/apps/7-moments && docker compose restart"
echo "  - Mettre à jour : cd /opt/apps/7-moments && git pull && docker compose up -d --build"

