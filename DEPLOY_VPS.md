# Guide de Déploiement VPS - 7moments.woutils.com

## Prérequis
- VPS Debian/Ubuntu avec accès root
- Domaine `7moments.woutils.com` pointant vers l'IP du VPS

## 1. Installation des dépendances

```bash
# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Installer Docker Compose
sudo apt install docker-compose-plugin -y

# Installer Nginx
sudo apt install nginx -y

# Installer Certbot pour HTTPS
sudo apt install certbot python3-certbot-nginx -y
```

## 2. Création du répertoire et clonage du projet

```bash
# Créer le répertoire
sudo mkdir -p /opt/apps/7-moments
sudo chown $USER:$USER /opt/apps/7-moments

# Aller dans le répertoire
cd /opt/apps/7-moments

# Cloner le repository
git clone https://github.com/wilf974/7-moments.git .

# Vérifier que les fichiers sont bien là
ls -la
```

## 3. Configuration Nginx (avant HTTPS)

```bash
# Créer la configuration Nginx
sudo nano /etc/nginx/sites-available/7moments.woutils.com
```

**Contenu du fichier :**
```nginx
server {
    listen 80;
    server_name 7moments.woutils.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Activer le site
sudo ln -s /etc/nginx/sites-available/7moments.woutils.com /etc/nginx/sites-enabled/

# Tester la configuration
sudo nginx -t

# Redémarrer Nginx
sudo systemctl restart nginx
```

## 4. Configuration HTTPS avec Let's Encrypt

```bash
# Obtenir le certificat SSL
sudo certbot --nginx -d 7moments.woutils.com

# Suivre les instructions :
# - Email : votre email
# - Accepter les conditions
# - Redirection HTTP → HTTPS : Oui (2)
```

Certbot va automatiquement :
- Obtenir le certificat SSL
- Modifier la config Nginx pour HTTPS
- Configurer le renouvellement automatique

## 5. Build et démarrage de l'application Docker

```bash
# Aller dans le répertoire du projet
cd /opt/apps/7-moments

# Build et démarrer le conteneur
docker compose up -d --build

# Vérifier que le conteneur tourne
docker ps

# Voir les logs
docker compose logs -f
```

## 6. Vérification

```bash
# Vérifier que le conteneur est actif
docker ps | grep prayer-app

# Vérifier que Nginx fonctionne
sudo systemctl status nginx

# Vérifier que HTTPS fonctionne
curl -I https://7moments.woutils.com
```

## 7. Commandes utiles pour la maintenance

```bash
# Voir les logs de l'application
cd /opt/apps/7-moments
docker compose logs -f prayer-app

# Redémarrer l'application après un git pull
cd /opt/apps/7-moments
git pull origin main
docker compose down
docker compose up -d --build

# Vérifier le renouvellement automatique du certificat SSL
sudo certbot renew --dry-run

# Redémarrer Nginx
sudo systemctl restart nginx
```

## 8. Configuration du renouvellement automatique du certificat SSL

Le renouvellement est déjà configuré automatiquement par Certbot via un cron job.

Pour vérifier :
```bash
sudo systemctl status certbot.timer
```

## Notes importantes

- **Port Docker** : L'application tourne sur le port 3000 en interne
- **HTTPS** : Nginx fait le reverse proxy et gère HTTPS
- **Renouvellement SSL** : Automatique via Certbot (gratuit)
- **Backup** : Les données sont dans localStorage côté client (pas de backup serveur nécessaire)

## En cas de problème

```bash
# Vérifier les logs Docker
docker compose logs prayer-app

# Vérifier les logs Nginx
sudo tail -f /var/log/nginx/error.log

# Vérifier le statut des services
sudo systemctl status nginx
docker ps -a
```

