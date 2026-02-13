# Historique du Projet 7-moments

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
