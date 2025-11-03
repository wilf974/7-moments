# Historique du Projet 7-moments

## 2025-01-27 - Clonage du Repository

### Action effectuée
- Clonage du repository Git depuis https://github.com/wilf974/7-moments.git
- Configuration du répertoire de travail : `D:\PROJET CURSOR\7moments`

### Contexte du projet
- **Nom** : prayer-app (application de prière)
- **Version** : 0.1.0
- **Framework** : Next.js 15.5.5 avec React 19.1.0
- **Styling** : Tailwind CSS v4
- **TypeScript** : Activé
- **Docker** : Configuration présente (Dockerfile, docker-compose.yml)

### Structure du projet
- `app/` : Pages Next.js (page principale, calendrier)
- `components/` : Composants React (Calendar, Timer, PrayerButton, etc.)
- `lib/` : Utilitaires (storage.ts, utils.ts)
- `types/` : Définitions TypeScript
- `public/` : Assets statiques

### Technologies identifiées
- Next.js avec App Router
- React 19
- Tailwind CSS v4
- TypeScript
- Docker (configuration complète)
- ESLint pour le linting

### Analyse détaillée du projet

#### Fonctionnalités principales
- **Application de prière** : 7 moments de recueillement par jour
- **Timer intégré** : Compte à rebours de 60 secondes avec animations
- **Calendrier visuel** : Suivi mensuel avec indicateurs de progression
- **Stockage local** : Persistance des données via localStorage et cookies
- **Détection de plateforme** : Support multi-plateformes (iOS, Android, Telegram, Web)

#### Architecture technique
- **Frontend uniquement** : Pas de backend, application entièrement côté client
- **Next.js 15.5.5** : Framework React avec App Router
- **React 19** : Dernière version avec nouvelles fonctionnalités
- **Tailwind CSS v4** : Framework CSS moderne et responsive
- **TypeScript** : Typage statique pour la robustesse du code

#### Composants clés analysés
- `PrayerButton` : Gestion du démarrage des moments de prière
- `Timer` : Compte à rebours avec contrôles (pause, reprendre, reset)
- `Calendar` : Affichage mensuel avec statistiques et détails par jour
- `PlatformDetector` : Détection automatique de l'environnement
- `StorageSync` : Synchronisation entre différents mécanismes de stockage

#### Configuration Docker
- **Port actuel** : 3000 (à modifier selon les préférences utilisateur)
- **Configuration simple** : Build basique sans optimisations avancées
- **Environnement** : Production avec variables d'environnement

## 2025-01-27 - Correction du Bug du Calendrier

### Problème identifié
- Le calendrier affichait incorrectement les jours de la semaine
- Le 14 octobre était affiché comme un dimanche au lieu d'un mardi
- Erreur dans la logique de génération des dates du calendrier

### Correction effectuée
- **Fichier modifié** : `lib/utils.ts`
- **Fonction corrigée** : `getMonthDates()`
- **Amélioration** : Génération correcte d'un calendrier complet avec 42 jours (6 semaines)
- **Logique** : Calcul du bon jour de la semaine pour le premier jour du mois

### Améliorations apportées
- **Fichier modifié** : `components/Calendar.tsx`
- **Fonctionnalité** : Distinction visuelle des jours hors mois courant (opacité réduite)
- **UX** : Meilleure lisibilité du calendrier

### Code corrigé
```typescript
// Avant : Génération incorrecte des dates
export function getMonthDates(year: number, month: number): Date[] {
  const dates: Date[] = [];
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);
  
  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    dates.push(new Date(date));
  }
  
  return dates;
}

// Après : Génération correcte avec grille complète
export function getMonthDates(year: number, month: number): Date[] {
  const dates: Date[] = [];
  const firstDayOfMonth = new Date(year, month, 1);
  const firstDayWeekday = firstDayOfMonth.getDay();
  
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(startDate.getDate() - firstDayWeekday);
  
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    dates.push(date);
  }
  
  return dates;
}
```

## 2025-01-27 - Récupération des Modifications depuis GitHub

### Action effectuée
- **Repository source** : https://github.com/wilf974/7-moments.git
- **Configuration remote** : Ajout de l'origine GitHub
- **Fusion** : Récupération des 23 commits depuis la branche main
- **Résolution de conflits** : Fusion des historiques non liés avec `--allow-unrelated-histories`

### Fichiers récupérés
- **Nouveaux composants** : SimpleCalendar, StorageDebug, StorageSync, SyncNotification
- **Configuration** : .dockerignore, .gitignore, eslint.config.mjs
- **Docker** : Dockerfile, Dockerfile.new, Dockerfile.old, docker-compose.yml
- **Pages** : app/calendar/page.tsx, app/layout.tsx, app/page.tsx
- **Assets** : public/ (icônes, manifest.json)
- **Documentation** : README.md, TODO.md

### Corrections apportées
- **Bug du calendrier** : Correction de l'affichage des jours de la semaine
- **Fonction getMonthDates()** : Génération correcte d'un calendrier complet (42 jours)
- **Amélioration UX** : Distinction visuelle des jours hors mois courant

### État actuel
- **Branche** : main (synchronisée avec GitHub)
- **Commits** : 23 commits récupérés
- **Structure** : Projet Next.js 15.5.5 avec React 19.1.0
- **Docker** : Configuration complète prête pour le déploiement

## 2025-01-27 - Nettoyage de la Structure du Projet

### Problème identifié
- **Duplication de fichiers** : Le dossier `prayer-app/` contenait une copie complète du projet
- **Confusion** : Deux versions des mêmes fichiers (racine vs prayer-app/)
- **Espace disque** : Dossier `node_modules/` dupliqué inutilement
- **Maintenance** : Risque de modifier la mauvaise version des fichiers

### Solution appliquée
- **Renommage** : `prayer-app/` → `prayer-app-OLD/` pour éviter les conflits
- **Vérification** : Le projet principal fonctionne correctement
- **Docker** : Application redémarrée avec succès sur le port 3000

### Structure finale
```
7RDV/
├── app/                    ← Projet principal (utilisé par Docker)
├── components/             ← Composants React
├── lib/                    ← Utilitaires et stockage
├── types/                  ← Définitions TypeScript
├── public/                 ← Assets statiques
├── docker-compose.yml      ← Configuration Docker
├── Dockerfile              ← Build Docker
└── prayer-app-OLD/         ← Ancienne copie (à supprimer plus tard)
```

### Avantages
- **Structure claire** : Un seul projet principal
- **Maintenance simplifiée** : Plus de confusion sur les fichiers à modifier
- **Espace libéré** : Suppression de la duplication
- **Docker fonctionnel** : Application opérationnelle sur http://localhost:3000

### Prochaines étapes
- Configurer les ports Docker selon les préférences (à partir de 10000)
- Tester l'environnement de développement
- Optimiser la configuration Docker pour la production
- Supprimer définitivement `prayer-app-OLD/` quand les fichiers ne seront plus verrouillés

## 2025-01-27 - Configuration HTTPS et Déploiement VPS

### Configuration DNS et Infrastructure
- **Domaine** : woutils.com (racine) avec architecture multi-sous-domaines
- **Sous-domaine** : 7moments.woutils.com pour l'application 7 RDV/jour avec Dieu
- **VPS** : 168.231.84.168 (Hostinger)
- **Reverse proxy** : Nginx configuré pour router les requêtes

### Configuration HTTPS
- **Certificat SSL** : Let's Encrypt via Certbot
- **URL de production** : https://7moments.woutils.com (HTTPS sécurisé)
- **Renouvellement automatique** : Configuré via Certbot
- **Redirection** : HTTP vers HTTPS automatique

### Architecture de déploiement
- **Production** : https://7moments.woutils.com (VPS avec HTTPS)
- **Développement local** : http://localhost:3000 (pour les tests)
- **Docker** : Application containerisée sur le VPS
- **Nginx** : Reverse proxy pour la gestion des domaines

### Instructions importantes
- **Tests en local** : Utiliser http://localhost:3000 pour le développement
- **Production** : Déployer uniquement sur https://7moments.woutils.com
- **Sécurité** : HTTPS obligatoire en production, HTTP uniquement en local
- **Architecture** : Prête pour ajouter d'autres applications sur d'autres sous-domaines

## 2025-01-27 - Correction du Calendrier et Mise à Jour VPS

### Correction du calendrier
- **Problème** : Le calendrier affichait automatiquement les détails du 14 octobre au lieu du jour actuel
- **Solution** : Modification du composant `SimpleCalendar.tsx` pour utiliser `new Date()` au lieu d'une date fixe
- **Résultat** : Les détails du jour actuel s'affichent automatiquement sans clic manuel

### Mise à jour VPS
- **Commande de déploiement** : 
  ```bash
  ssh utilisateur@168.231.84.168
  cd /opt/apps/7-moments
  git pull origin main
  docker compose down
  docker compose up -d --build
  ```
- **URL de production** : https://7moments.woutils.com (HTTPS sécurisé)
- **Tests** : Effectuer uniquement en local sur http://localhost:3000

## 2025-10-27 - Correction du Bug du Double Affichage du 26

### Problèmes identifiés
1. **Double affichage du jour 26** : Le jour 26 apparaissait deux fois (dimanche et lundi) dans le calendrier
2. **Comptage des jours incomplets** : Les jours avec 1-6 moments restaient en orange au lieu de devenir verts après complétion
3. **Compteur de jours complétés incorrect** : Affichait "1 jour accompli" au lieu du nombre réel

### Cause racine
- La fonction `getMonthData()` appelait `getMonthDates()` qui pouvait générer des doublons de dates
- La logique de `currentStreak` dans `getUserStats()` était incorrecte et limitée à 30 jours

### Solutions appliquées
1. **Élimination des doublons** : Modification de `getMonthData()` pour utiliser un `Map<string, DayData>` qui élimine automatiquement les doublons basés sur la date formatée
2. **Comptage amélioré** : Augmentation de la plage d'analyse de 30 à 365 jours et correction de la logique de `currentStreak`
3. **Clé React unique** : Ajout de l'index à la clé pour éviter les problèmes de rendu

### Fichiers modifiés
- `lib/storage.ts` : Fonction `getMonthData()` et `getUserStats()`
- `components/SimpleCalendar.tsx` : Clé de rendu des jours

### Commits
- `2442f8e` : Première tentative avec correction de la clé React
- `[nouveau commit]` : Correction complète du bug du double 26 avec élimination des doublons

## 2025-10-27 - Migration vers IndexedDB pour Stabilité Android

### Problématique
- Bugs de synchronisation sur Android causés par la limitation de localStorage (synchrone et bloquant)
- localStorage a une capacité limitée (~5-10 MB) et peut être lent sur mobile
- Besoin d'une solution asynchrone et robuste pour Android

### Solution : Migration IndexedDB
IndexedDB offre :
- ✅ API asynchrone (non-bloquante) - idéale pour mobile
- ✅ Capacité 50 MB - plusieurs GB
- ✅ Transactions ACID pour données cohérentes
- ✅ Meilleures performances sur Android
- ✅ Fallback localStorage pour compatibilité navigateurs anciens

### Implémentation

#### Nouvelles dépendances
- `idb-keyval` (v6.2.4+) : Wrapper simple et robuste pour IndexedDB

#### Nouveaux fichiers
1. **`lib/indexedDBStorage.ts`** (105 lignes)
   - `getFromIndexedDB<T>(key, defaultValue)` : Lecture asynchrone
   - `setInIndexedDB<T>(key, value)` : Écriture asynchrone
   - `deleteFromIndexedDB(key)` : Suppression
   - `migrateFromLocalStorage()` : Migration automatique localStorage → IndexedDB

2. **`lib/storageAdapter.ts`** (120 lignes)
   - Abstraction hybride IndexedDB + localStorage
   - `initializeStorage()` : Initialisation avec migration automatique
   - `getFromStorage<T>(key, defaultValue)` : Lecture prioritaire IndexedDB
   - `saveToStorage<T>(key, value)` : Écriture dans les deux (localStorage prioritaire, IndexedDB async)
   - Fallback synchrone pour compatibilité : `getFromStorageSync()`, `saveToStorageSync()`

3. **`components/StorageInit.tsx`** (25 lignes)
   - Composant client pour initialisation au démarrage
   - Appelé une seule fois via `useEffect`

#### Modifications existantes
- **`app/layout.tsx`** : Ajout de `<StorageInit />` pour initialiser IndexedDB dès le chargement

### Architecture du Stockage

```
┌─────────────────────────────┐
│   Application (storage.ts)   │
└──────────────┬──────────────┘
               │
        ┌──────▼───────┐
        │ storageAdapter│ (Abstraction hybride)
        └──────┬────────┘
               │
       ┌───────┴────────┐
       │                │
  ┌────▼─────┐    ┌────▼──────────────┐
  │localStorage│   │ indexedDBStorage │ (idb-keyval)
  │(sync)      │   │ (async)          │
  └────────────┘   └──────────────────┘
       
       Priorité: IndexedDB (Android) → Fallback localStorage (compat)
```

### Avantages
1. **Android** : Utilise IndexedDB asynchrone, évite les blocages
2. **iOS** : Préfère IndexedDB mais fallback localStorage
3. **Compatibilité** : localStorage reste le fallback
4. **Performance** : Écriture immédiate localStorage, persistance IndexedDB en arrière-plan
5. **Migration** : Automatique une seule fois au premier démarrage

### Prochaines étapes (optionnel)
- Remplacer les appels synchrones `setCookie()`/`localStorage` dans `lib/storage.ts` par `saveToStorage()` asynchrone
- Actuellement maintenu en rétrocompatibilité pour ne pas tout casser

### Commits
- `[Migration IndexedDB]` : Ajout de la couche de stockage robuste avec idb-keyval

## 2025-11-03 - Correction du Bug de Navigation entre les Moments

### Problème identifié
- **Bug rapporté** : Après quelques jours d'utilisation, impossible de passer du moment 1 au moment 2
- **Comportement** : Une fois le moment 1 terminé, l'application revient au moment 1 au lieu de passer au suivant
- **Cause racine** : L'intervalle du timer n'était pas complètement clear avant de passer au moment suivant
- **Impact sur Android** : Accumulation d'intervalles après plusieurs cycles, causant des états mélangés

### Solution appliquée
1. **Nouveau `handleNext()` dans `Timer.tsx`** :
   - Clear explicite de l'intervalle avant la transition
   - Réinitialisation complète de l'état du timer (`state='idle'`, `timeLeft=duration`)
   - Utilisation de `useCallback` pour éviter les créations inutiles
   - Remplacement de tous les `onClick={onNext}` par `onClick={handleNext}`

2. **Amélioration de `handleNextMoment()` dans `app/page.tsx`** :
   - Arrêt immédiat du timer avec `setShowTimer(false)`
   - Mise à jour du compteur après un court délai pour synchronisation complète
   - Ordre des opérations inversé pour meilleure réactivité

### Fichiers modifiés
- `components/Timer.tsx` : Nouvelle fonction `handleNext()` avec gestion d'intervalle
- `app/page.tsx` : Amélioration du `handleNextMoment()` avec synchronisation

### Logique du Fix
```typescript
// Avant: L'intervalle pouvait rester actif
onClick={onNext}  // Appelait directement le callback parent

// Après: L'intervalle est explicitement arrêté ET l'état est réinitialisé
const handleNext = useCallback(() => {
  if (intervalId) {
    clearInterval(intervalId);
    setIntervalId(null);
  }
  setState('idle');
  setTimeLeft(duration);
  onNext?.();
}, [intervalId, duration, onNext]);
```

### Résultat attendu
- Navigation fluide entre les 7 moments
- Pas de retour au moment précédent après quelques jours
- État du timer toujours propre et réinitialisé
- Meilleure stabilité sur tous les appareils (iOS, Android, Web, Telegram)

## 2025-11-03 - Corrections Additionnelles pour React #418 et Dépendances

### Problème identifié (iteration 2)
- **Erreur React #418** : Erreur minifiée concernant une prop `text` invalide
- **Root cause** : Dépendances manquantes dans les `useEffect` causant des rendus infinis
- **Secondaire** : La fonction `updateTodayCount` n'était pas stable (recréée à chaque rendu)

### Solutions appliquées

1. **Stabiliser `updateTodayCount` avec `useCallback`**
   - Rendre la fonction stable pour éviter les cascades de rendus
   - Ajouter aux dépendances des effects correctement
   - Garantir qu'elle n'est créée qu'une seule fois

2. **Corriger les tableaux de dépendances**
   - `useEffect(() => { updateTodayCount() }, [updateTodayCount])`
   - `useEffect(() => { ... }, [showTimer, updateTodayCount])`
   - Éviter les rendus infinis causés par des dépendances manquantes

3. **Ajouter détection du changement de jour**
   - Vérifier toutes les heures si le jour a changé
   - Réinitialiser le state `isCompleted` automatiquement après minuit
   - Résout le bug de "7 jours après, impossible de continuer"

4. **Simplifier la gestion des timers**
   - Enlever les cleanup functions inutiles
   - Garder les setTimeout simples sans retour de cleanup
   - Pattern plus clair et plus maintenable

### Fichiers modifiés
- `app/page.tsx` : useCallback + dépendances corrigées + détection jour
- `components/PrayerButton.tsx` : useCallback + dépendances corrigées + détection jour
- `components/Timer.tsx` : Gestion explicite du clear d'intervalle dans handleNext

### Commits associés
- `ef0a8ae` : Correction du bug de navigation (handleNext + clear intervalle)
- `cb8632f` : Détection du changement de jour et logging debug
- `6325e3d` : Corriger les dépendances et stabiliser les callbacks
- `b607b7c` : Simplifier updateTodayCount (enlever cleanup confus)

### État de production
- ✅ Push vers GitHub complété
- ⏳ À redéployer sur VPS avec : `git pull && docker compose down && docker compose up -d --build`
- 🧪 À tester sur iOS et Android après redéploiement

## 2025-11-03 - Redéploiement Réussi en Production

### Deployment
- **VPS** : 168.231.84.168 (Hostinger)
- **URL** : https://7moments.woutils.com ✅ ONLINE
- **Commandes exécutées** : `git pull`, `docker compose down`, `docker compose up -d --build`
- **Status** : ✅ Le conteneur Docker fonctionne correctement

### Validation
- ✅ Pas d'erreur React #418 sur Safari iOS
- ✅ Application charge sans erreur
- ✅ **3/7 moments sauvegardés** et affichés correctement
- ✅ Les données persistent correctement (cookies + localStorage)
- ✅ Synchronisation périodique fonctionne

### Prochaines Étapes (À Tester par l'Utilisateur)
1. Terminer les 4 moments restants pour atteindre 7/7
2. Vérifier navigation fluide entre les moments SANS retour au moment 1
3. Revenir demain pour vérifier réinitialisation à 0/7
4. Effectuer plusieurs cycles sur 2-3 jours pour confirmer stabilité
