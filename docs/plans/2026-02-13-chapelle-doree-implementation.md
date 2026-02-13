# "Chapelle Doree" Redesign - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Use the frontend-design skill for all UI component work.

**Goal:** Redesign the prayer app with a warm spiritual aesthetic ("Chapelle Doree") - amber/gold palette, animated candles, serif typography, improved calendar with streaks, and notification reminders at canonical hours.

**Architecture:** Pure frontend redesign on existing Next.js 15.5.12 + React 19 + Tailwind v4 stack. No backend changes. New components: CandleRow (7 animated SVG candles), ReminderSettings (Notification API), enhanced SimpleCalendar. All data stays in localStorage/IndexedDB.

**Tech Stack:** Next.js 15.5.12, React 19.1, TypeScript 5.9, Tailwind CSS v4, Playfair Display + Inter (Google Fonts), SVG animations, Notification API

**Working directory:** `/opt/apps/7-moments/`

**Backup branch:** `backup-before-redesign` (restore with `git checkout backup-before-redesign`)

---

### Task 1: Palette & Typography Foundation

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

**Step 1: Update layout.tsx with new fonts**

Replace Geist font with Playfair Display + Inter from Google Fonts:

```tsx
import { Playfair_Display, Inter } from "next/font/google";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});
```

Update `<body>` className to use both font variables:
```tsx
<body className={`${playfair.variable} ${inter.variable} antialiased`}>
```

**Step 2: Rewrite globals.css with amber/gold palette**

Replace all purple/blue/indigo references with the Chapelle Doree palette:
- CSS custom properties for the palette colors
- Update all `@keyframes` to use amber/gold tones
- Add new animations: `candle-flicker`, `glow-pulse`, `warm-fade-in`
- Font families: `--font-heading: var(--font-playfair)`, `--font-body: var(--font-inter)`

**Step 3: Verify build compiles**

Run: `docker compose build 2>&1 | tail -5`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add app/globals.css app/layout.tsx
git commit -m "style: switch to Chapelle Doree palette and typography"
```

---

### Task 2: Candle SVG Component

**Files:**
- Create: `components/Candle.tsx`
- Create: `components/CandleRow.tsx`

**Step 1: Create Candle.tsx**

Single candle SVG component with props:
- `lit: boolean` - whether the flame is active
- `label?: string` - canonical hour name below
- `index: number` - for staggered animation delay

The candle SVG should include:
- Wax body (rounded rect, cream/ivory color)
- Wick (thin dark line)
- Flame (animated with CSS `candle-flicker` keyframes when `lit=true`)
- Glow effect (radial gradient, opacity animated)
- When `lit=false`: grey/translucent, no flame

**Step 2: Create CandleRow.tsx**

Row of 7 candles with props:
- `count: number` - how many are lit (0-7)

Maps the 7 canonical hours:
```typescript
const CANONICAL_HOURS = [
  { name: "Vigiles", hour: 3 },
  { name: "Laudes", hour: 6 },
  { name: "Tierce", hour: 9 },
  { name: "Sexte", hour: 12 },
  { name: "None", hour: 15 },
  { name: "Vepres", hour: 18 },
  { name: "Complies", hour: 21 },
];
```

Candles 0 to count-1 are `lit=true`, rest are `lit=false`.

**Step 3: Verify components render**

Build and check in browser.

**Step 4: Commit**

```bash
git add components/Candle.tsx components/CandleRow.tsx
git commit -m "feat: add animated candle SVG components"
```

---

### Task 3: Redesign Home Page

**Files:**
- Modify: `app/page.tsx`
- Modify: `components/PrayerButton.tsx`

**Step 1: Rewrite page.tsx**

New structure (top to bottom):
1. Header: gradient `from-amber-900/20 via-amber-50 to-[#FFFBEB]`, title "7 Rendez-vous" in Playfair Display, Psalm quote in italic
2. CandleRow: 7 candles showing `todayCount`
3. PrayerButton: restyled with amber theme
4. Stats cards: 3 cards with cream bg, gold border
5. Calendar link: secondary button
6. Footer: biblical citation

**Step 2: Restyle PrayerButton.tsx**

- Background: amber gradient `from-amber-600 to-amber-700`
- Hover: golden glow shadow
- Text: "Allumer une bougie" (when not all lit)
- Text: "7 bougies allumees" (when completed, disabled style)
- Icon changes: candle emoji instead of prayer emoji
- Progress bar: gold gradient instead of purple

**Step 3: Verify in browser**

Run container and check: `docker compose up -d && sleep 5 && docker logs prayer-app --tail 5`

**Step 4: Commit**

```bash
git add app/page.tsx components/PrayerButton.tsx
git commit -m "feat: redesign home page with Chapelle Doree theme"
```

---

### Task 4: Redesign Timer

**Files:**
- Modify: `components/Timer.tsx`

**Step 1: Restyle Timer.tsx**

- Background wrapper: dark brown `#1C1208` with subtle radial gradient
- Center: candle SVG (large, single candle with active flame)
- Circle countdown: gold stroke `#F59E0B` instead of purple, on dark background
- Time display: Playfair Display, gold color
- "Suivant" button: amber styled
- Status indicator: flame states (bright = running, dim = paused, gone = completed)
- Encouraging message below in cream italic

**Step 2: Verify timer flow**

Click prayer button, verify timer appears with new styling, countdown works, "Suivant" returns to home.

**Step 3: Commit**

```bash
git add components/Timer.tsx
git commit -m "style: redesign timer with dark chapel theme"
```

---

### Task 5: Improve Calendar

**Files:**
- Modify: `components/SimpleCalendar.tsx`
- Modify: `app/calendar/page.tsx`
- Modify: `lib/storage.ts` (add streak calculation)
- Modify: `lib/utils.ts` (add month navigation helpers)

**Step 1: Add streak calculation to storage.ts**

```typescript
export function getCurrentStreak(): number {
  // Count consecutive completed days going backwards from today
}

export function getBestStreak(): number {
  // Find longest consecutive completed streak ever
}

export function getWeekSummary(): number[] {
  // Return array of 7 counts for last 7 days
}
```

**Step 2: Add month navigation to SimpleCalendar.tsx**

- State: `currentMonth`, `currentYear`
- Navigation arrows: `<` previous month, `>` next month
- Month name in gold Playfair Display
- Cannot navigate past current month

**Step 3: Restyle calendar grid**

- Day cells: amber tones
  - Completed (7/7): gold background `#FBBF24`, dark text
  - Partial (1-6): amber light `#FDE68A`, amber text
  - Empty (0): cream `#FFFBEB`, grey text
  - Today: gold border `ring-2 ring-amber-500`
- Selected day detail: cream card with gold accent

**Step 4: Restyle calendar page (app/calendar/page.tsx)**

- 4 stat cards: Total moments, Streak actuel, Meilleure serie, Derniere activite
- Mini bar chart: 7 bars for last 7 days (max height = 7 moments)
- Navigation back button styled amber

**Step 5: Verify calendar**

Navigate to /calendar, check month navigation, stats, styling.

**Step 6: Commit**

```bash
git add components/SimpleCalendar.tsx app/calendar/page.tsx lib/storage.ts lib/utils.ts
git commit -m "feat: improve calendar with month nav, streaks, and amber theme"
```

---

### Task 6: Notification Reminders

**Files:**
- Create: `components/ReminderSettings.tsx`
- Create: `lib/notifications.ts`
- Modify: `app/page.tsx` (add settings gear icon)

**Step 1: Create lib/notifications.ts**

```typescript
const CANONICAL_HOURS = [
  { key: "vigiles", name: "Vigiles", hour: 3, minute: 0 },
  { key: "laudes", name: "Laudes", hour: 6, minute: 0 },
  { key: "tierce", name: "Tierce", hour: 9, minute: 0 },
  { key: "sexte", name: "Sexte", hour: 12, minute: 0 },
  { key: "none", name: "None", hour: 15, minute: 0 },
  { key: "vepres", name: "Vepres", hour: 18, minute: 0 },
  { key: "complies", name: "Complies", hour: 21, minute: 0 },
];

export async function requestNotificationPermission(): Promise<boolean>
export function getEnabledReminders(): Record<string, boolean>
export function setReminderEnabled(key: string, enabled: boolean): void
export function scheduleReminders(): void  // Uses setTimeout for next upcoming hour
export function cancelReminders(): void
```

Store settings in localStorage key `reminder_settings`.
Use `setTimeout` to schedule the next notification (recalculate on each page load).
Notification text: "C'est l'heure de {name} - votre {N}e rendez-vous avec Dieu"

**Step 2: Create ReminderSettings.tsx**

- Modal/drawer triggered by gear icon on home page
- Toggle for each of the 7 canonical hours
- Permission request button if not granted
- Status indicator (notifications enabled/disabled)
- Styled with cream background, gold toggles

**Step 3: Wire into page.tsx**

- Add gear icon (top-left or accessible area)
- Import and render ReminderSettings
- Call `scheduleReminders()` on mount if any are enabled

**Step 4: Verify notifications**

Enable a reminder, set a canonical hour to current time, verify notification fires.

**Step 5: Commit**

```bash
git add lib/notifications.ts components/ReminderSettings.tsx app/page.tsx
git commit -m "feat: add canonical hour reminders with Notification API"
```

---

### Task 7: Restyle Remaining Components

**Files:**
- Modify: `components/VerseDisplay.tsx`
- Modify: `components/PlatformDetector.tsx`
- Modify: `components/StorageSync.tsx` (no visual changes, just verify)
- Modify: `components/StorageInit.tsx` (no visual changes, just verify)

**Step 1: Restyle VerseDisplay.tsx**

- Overlay: darker, warmer tint (`bg-amber-950/70`)
- Card: cream background, gold border, Playfair Display for verse text
- Progress bar: gold gradient
- Close area: same interaction

**Step 2: Restyle PlatformDetector.tsx**

- Badge: amber/gold tones instead of grey
- Easter egg behavior unchanged

**Step 3: Commit**

```bash
git add components/VerseDisplay.tsx components/PlatformDetector.tsx
git commit -m "style: restyle verse display and platform detector"
```

---

### Task 8: Docker Build & Visual Verification

**Files:**
- Modify: `Dockerfile` (if needed for new font optimization)

**Step 1: Build Docker image**

```bash
cd /opt/apps/7-moments
docker compose build --no-cache
```

Expected: Build succeeds with Next.js 15.5.12

**Step 2: Deploy**

```bash
docker compose up -d --force-recreate
```

**Step 3: Visual verification with Playwright**

Use browser-use skill to:
- Navigate to https://7moments.woutils.com (or localhost:3000)
- Take screenshot of home page
- Click prayer button, take screenshot of timer
- Navigate to /calendar, take screenshot
- Verify all amber/gold theming is applied

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete Chapelle Doree redesign"
```

---

## Execution Order

Tasks 1-2 are foundation (palette + candles).
Tasks 3-4 are main pages (home + timer).
Task 5 is calendar improvement.
Task 6 is new feature (reminders).
Task 7 is cleanup (remaining components).
Task 8 is verification.

Tasks 1 and 2 can run in parallel.
Tasks 3 and 4 can run in parallel (after 1+2).
Tasks 5, 6, 7 can run in parallel (after 3+4).
Task 8 is final.
