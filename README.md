# 7 RDV/jour avec Dieu

Application de prière quotidienne avec 7 moments de recueillement par jour.

## 🌐 Environnements

### Production (VPS)
- **URL** : https://7moments.woutils.com
- **Sécurité** : HTTPS avec certificat SSL Let's Encrypt
- **Infrastructure** : VPS Hostinger avec Nginx reverse proxy

### Développement Local
- **URL** : http://localhost:3000
- **Usage** : Tests et développement uniquement
- **Sécurité** : HTTP uniquement (pas de HTTPS en local)

## 🚀 Démarrage Rapide

### Développement Local
```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

### Déploiement VPS
```bash
# Se connecter au VPS
ssh utilisateur@168.231.84.168

# Aller dans le répertoire du projet
cd /opt/apps/7-moments

# Mettre à jour le code
git pull origin main

# Redémarrer l'application
docker compose down
docker compose up -d --build
```

## 🏗️ Architecture

- **Framework** : Next.js 15.5.5 avec React 19.1.0
- **Styling** : Tailwind CSS v4
- **TypeScript** : Activé
- **Docker** : Containerisé pour le déploiement
- **Reverse Proxy** : Nginx pour la gestion des domaines
- **SSL** : Let's Encrypt avec renouvellement automatique

## 📱 Fonctionnalités

- **7 moments de prière** par jour avec timer intégré
- **Calendrier visuel** pour le suivi mensuel
- **Stockage local** des données (localStorage + cookies)
- **Détection de plateforme** (iOS, Android, Telegram, Web)
- **Versets bibliques** aléatoires avec animations
- **Interface responsive** et moderne

## 🔧 Configuration

### Variables d'environnement
Aucune variable d'environnement requise pour le fonctionnement de base.

### Docker
```bash
# Build et démarrage
docker compose up -d --build

# Arrêt
docker compose down

# Logs
docker compose logs -f
```

## 📝 Notes Importantes

- **Tests** : Toujours effectuer les tests en local sur http://localhost:3000
- **Production** : Déployer uniquement sur https://7moments.woutils.com
- **Sécurité** : HTTPS obligatoire en production, HTTP uniquement en local
- **Architecture** : Prête pour ajouter d'autres applications sur d'autres sous-domaines
