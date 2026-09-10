# Historique du Projet 7-moments

## 2026-09-10 (soir) - Synchronisation instantanée

Demande : que les appareils reliés se mettent à jour tout de suite, « style websocket ».

- **Server-Sent Events plutôt que WebSocket** : il suffit que le serveur pousse un signal « le carnet a changé ». SSE tient dans une route Next.js (`GET /api/sync/events?code=…`), sans serveur Node sur mesure, sans dépendance, sans changement nginx (`X-Accel-Buffering: no`), avec reconnexion automatique dans les navigateurs.
- `POST /api/sync` publie un signal seulement si la fusion a ajouté des moments (sinon les appareils se renverraient le signal sans fin). Le signal porte l'identifiant de l'onglet d'origine, qui l'ignore.
- Relais en mémoire `lib/syncHub.ts` (sur `globalThis`, partagé par les deux routes). Battement de cœur toutes les 25 s. Limites : 10 connexions par carnet, 200 au total, 60 ouvertures par 10 min et par IP.
- Navigateur (`lib/liveSync.ts`) : connexion ouverte seulement quand l'app est affichée et l'appareil relié, fermée en arrière-plan ; à chaque (re)connexion, une synchro rattrape ce qui a été manqué. Indicateur dans Réglages > Mes appareils.
- Tests : 39 (hub, format SSE, identifiant d'onglet, comptage).

## 2026-09-10 - Carnet partagé entre appareils, hors connexion, bougie réglable

### Contexte (retour de l'utilisateur principal, Samsung + iPad)
- L'historique montre presque chaque semaine des journées non terminées, alors qu'il fait ses 7 rendez-vous tous les jours depuis environ 9 mois (un seul jour manqué, pour maladie).
- Le compteur « se remet à zéro » après 3 à 5 rendez-vous.
- L'app est parfois « hors connexion ».
- La minute de bougie est trop longue : ses rendez-vous sont à heures fixes, 15 ou 30 s suffisent.

### Causes
- **Un carnet par navigateur et par appareil.** Tout vivait dans le localStorage, sans aucune synchronisation. Les moments faits sur le Samsung n'existent pas sur l'iPad et inversement ; chaque calendrier ne voit qu'une partie des journées. Sur iPad, un raccourci d'écran d'accueil a même un stockage séparé de Safari, et Safari efface les données d'un site non ouvert pendant 7 jours.
- **Aucun fonctionnement hors ligne.** Sans service worker, l'app ne s'ouvre pas quand le serveur est injoignable. Le serveur est une VM sur le PC de la maison, qui a redémarré plusieurs fois début septembre.
- **Compteur figé.** Il n'était relu qu'une fois par heure : une app restée ouverte affichait encore la veille.
- **Calendrier décalé en octobre.** La grille avançait de 24 h en millisecondes : au passage à l'heure d'hiver, une date apparaissait en double (le « double 26 » d'octobre 2025) et la suite du mois tombait sous le mauvais jour.

### Correctifs
- **Mes appareils** (Réglages) : le premier appareil demande un code de 8 caractères, tiré par le serveur ; les autres le saisissent. `POST /api/sync` fait l'union des moments par horodatage (jamais de suppression), stockée dans `./data/carnets/<CODE>.json` (volume, uid 1001). Écriture atomique avec fsync, verrou par carnet, fichier illisible mis de côté. Limites par IP : 120 requêtes par 10 min, 10 codes inconnus par heure, 5 créations par jour ; carnet plafonné à 3000 jours ou 2 Mo. Sans code, rien ne quitte l'appareil.
- Synchro à l'ouverture, au retour sur l'app, au retour du réseau et après chaque moment ; hors connexion, les moments attendent sur l'appareil.
- `public/sw.js` : pages en réseau d'abord puis copie en cache (panne, 5xx ou plus de 4 s) ; `/_next/static` en cache d'abord ; `/api` jamais en cache.
- Compteur relu au premier plan et chaque minute ; calendrier relu après chaque synchro.
- Bougie : 15 s, 30 s (défaut) ou 1 min. Le moment reste compté dès l'appui.
- Grille du calendrier calculée en jours du calendrier (`lib/calendarDates.ts`).

### Tests
`TZ=Europe/Paris node --experimental-strip-types --test __tests__/*.test.ts` : 33 tests sans dépendance (fusion, code, stockage, débit, grille).

### Limites connues
- Les jours déjà effacés d'un appareil ne peuvent pas être retrouvés. La fusion réunit ce qui existe encore sur chaque appareil.
- Un jour où des moments ont été refaits après une « remise à zéro » peut compter plus de 7 moments : le compteur est plafonné à 7.

## 2026-02-13 - Redesign "Chapelle Doree" complet

### Contexte
Redesign complet de l'UI avec un style "chaleureux spirituel" - tons ambres/dores, 7 bougies animees, typographie serif elegante. Mobile-first.

### Securite (pre-redesign)
- **Malware detecte et elimine** : botnet x86_64.kok dans le container prayer-app
- **Vecteur** : CVE RCE Next.js (GHSA-9qr9-h5gf-34mp) dans v15.5.5
- **Correction** : Next.js 15.5.5 -> 15.5.12
- **Hardening Docker** : read_only, tmpfs noexec, cap_drop ALL, no-new-privileges, init: true
- **IP C2 bloquee** : 91.92.243.113 via UFW
- **Branche backup** : `backup-before-redesign`

### Task 1 : Palette & Typographie
- **globals.css** : Palette amber/or (9 couleurs), 3 nouvelles animations (candle-flicker, glow-pulse, warm-fade-in)
- **layout.tsx** : Playfair Display (titres) + Inter (corps), themeColor amber

### Task 2 : Composants Bougie SVG
- **Candle.tsx** : Bougie SVG animee avec etats allume/eteint, flamme avec gradient, effet de lueur
- **CandleRow.tsx** : Rangee de 7 bougies pour les heures canoniques

### Task 3 : Page d'accueil
- **page.tsx** : Fond creme, gradient amber, CandleRow, overlay sombre pour timer
- **PrayerButton.tsx** : Metaphores bougies, gradient amber, barre de progression doree

### Task 4 : Timer
- **Timer.tsx** : Theme chapelle sombre, cercle SVG dore, Playfair Display, icones bougies

### Task 5 : Calendrier ameliore
- **SimpleCalendar.tsx** : Navigation mensuelle, grille amber, detail jour
- **calendar/page.tsx** : 4 cartes stats, graphique 7 derniers jours
- **storage.ts** : getCurrentStreak(), getBestStreak(), getWeekSummary()

### Task 6 : Rappels notifications
- **notifications.ts** : API Notification, 7 heures canoniques, scheduling setTimeout
- **ReminderSettings.tsx** : Modal avec 7 toggles, gestion permissions
- **page.tsx** : Bouton gear, integration rappels au mount

### Task 7 : Composants restants
- **VerseDisplay.tsx** : Overlay ambre, carte creme, barre de progression doree
- **PlatformDetector.tsx** : Badge amber au lieu de bleu/vert/gris

### Task 8 : Build Docker & Verification
- Build reussi, container sain (2 processus, /tmp vide)
- Pages / et /calendar OK (HTTP 200)

### Fichiers crees
| Fichier | Description |
|---------|-------------|
| components/Candle.tsx | Bougie SVG animee |
| components/CandleRow.tsx | Rangee de 7 bougies |
| components/ReminderSettings.tsx | Modal rappels |
| lib/notifications.ts | API Notification |

### Fichiers modifies
| Fichier | Description |
|---------|-------------|
| app/globals.css | Palette Chapelle Doree |
| app/layout.tsx | Polices Playfair + Inter |
| app/page.tsx | Accueil redesignee + rappels |
| app/calendar/page.tsx | Calendrier ameliore |
| components/PrayerButton.tsx | Theme bougie amber |
| components/Timer.tsx | Theme chapelle sombre |
| components/SimpleCalendar.tsx | Navigation mois + streaks |
| components/VerseDisplay.tsx | Theme amber |
| components/PlatformDetector.tsx | Badge amber |
| lib/storage.ts | Fonctions streak |

### Commits
1. `00c8ee0` - feat: add Chapelle Doree palette, typography, and candle SVG components
2. `dafe9d5` - feat: redesign home page, prayer button, and timer with Chapelle Doree theme
3. `999a491` - feat: improve calendar with streaks, add notification reminders, restyle remaining components
