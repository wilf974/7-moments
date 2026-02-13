# Redesign "Chapelle Doree" - 7 Rendez-vous de Priere

**Date** : 2026-02-13
**Status** : Approuve
**Branche backup** : `backup-before-redesign`

## Objectif

Redesign complet de l'UI avec un style "chaleureux spirituel" - tons ambres/dores, 7 bougies animees, typographie serif elegante. Mobile-first.

## Stack inchange

- Next.js 15.5.12 + React 19 + TypeScript
- Tailwind CSS v4
- Stockage local (localStorage + IndexedDB)
- PWA

## Palette

| Usage | Couleur | Hex |
|-------|---------|-----|
| Fond principal | Creme parchemin | #FFFBEB |
| Fond sombre (timer) | Brun profond | #1C1208 |
| Accent primaire | Ambre | #D97706 |
| Accent dore | Or | #F59E0B |
| Texte principal | Brun chaud | #78350F |
| Texte secondaire | Brun moyen | #92400E |
| Succes (complete) | Or lumineux | #FBBF24 |
| Bordures/deco | Or pale | #FDE68A |
| Accent rouge | Bordeaux | #7F1D1D |

## Typographie

- **Titres** : Playfair Display (Google Fonts, serif)
- **Corps** : Inter ou Geist (sans-serif)
- **Citations** : Playfair Display italic

## Pages

### 1. Accueil (/)

1. **Header** : Gradient ambre sombre -> creme. "7 Rendez-vous" en Playfair Display. Psaume 119:164 en italique.
2. **7 Bougies** : SVG alignees horizontalement. Flamme animee CSS quand moment complete. Heures canoniques sous chaque bougie.
3. **Bouton** : Grand bouton ambre arrondi, ombre doree, pulse glow. "Allumer une bougie".
4. **Stats** : 3 cartes fond creme, bordure doree - Moments, Statut, Serie.
5. **Lien calendrier** : Bouton secondaire.
6. **Footer** : Citation biblique.

### 2. Timer (overlay)

- Fond brun sombre
- Bougie animee au centre (flamme CSS keyframes)
- Cercle dore countdown autour de la flamme
- Message encourageant

### 3. Calendrier (/calendar)

- Navigation mois (fleches + nom en or)
- Grille tons ambres (or=complete, ambre=en cours, parchemin=vide)
- Stats enrichies : streak, meilleure serie, mini-barres 7 derniers jours
- Details jour au tap

### 4. Rappels (nouveau)

- Notification API navigateur
- Toggle par heure canonique
- 7 heures : Vigiles 3h, Laudes 6h, Tierce 9h, Sexte 12h, None 15h, Vepres 18h, Complies 21h

## Fonctionnalites

### Conservees
- 7 moments de priere quotidiens
- Timer 60 secondes
- Calendrier visuel
- Versets bibliques (easter egg)
- Detection plateforme
- Stockage local + IndexedDB
- PWA support

### Ajoutees
- Rappels aux heures canoniques (Notification API)
- Calendrier ameliore (navigation mois, streaks, graphique)
- 7 bougies animees comme indicateur de progression

### Modifiees
- Palette complete (purple/blue -> ambre/or)
- Typographie (Geist -> Playfair Display + Inter)
- Animations (generiques -> flammes, lueur doree)
- Bouton principal (texte + style)

## Contraintes Docker

- Container read_only + tmpfs noexec + cap_drop ALL
- Image Alpine build + slim runtime
- Memoire max 256M
