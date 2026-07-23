# Mindful Muscle — Habit Tracker

A daily habit + PPL workout tracker built to use with training partners. Morning
mobility routine, a 7-day push/pull/legs split, water logging, performance
habits, your own custom trackers and milestones, and a live leaderboard —
each as its own section instead of one long scrolling page.

## Sections

- **Today** — week strip, streak, and quick-glance status cards into every section.
- **Morning** — the mobility/posture/pelvic-floor routine, grouped by phase.
- **Gym** — an overview of all 7 split days; tap one to open its exercise
  checklist. Picking a day assigns it to the selected date.
- **Water** — no tick marks. Quick-add buttons (250/500/750ml or a custom
  amount) fill a bottle visual and a log shows when you drank, so you can
  top up roughly once an hour without fiddling with checkboxes.
- **Habits** — sleep, training, nutrition, discipline — daily booleans.
- **Custom** — add your own daily trackers (name, icon, unit, daily target —
  reading, screen time, meds, steps, anything) or one-off milestones with a
  target date.
- **Versus** — a live leaderboard shared with whoever else opens the app and
  joins with a name. Updates in real time via Firestore, no refresh button.
- **Reminders** — per-person, in-app browser notifications: a repeating
  hydration nudge, and once-daily nudges for morning routine, gym, and a
  custom-trackers/milestones evening check-in. These fire only while the app
  is open in a tab (no service worker or push server involved), so they're
  best paired with keeping a tab open, or as a "did I actually do this today"
  check when you open the app in the evening.

## Getting started

```bash
npm install
npm run dev
```

The app works immediately against local storage on this device — you don't
need Firebase to try it out. To get the live, cross-device, shared-with-friends
part working:

1. Create a free project at [firebase.google.com](https://firebase.google.com).
2. Enable **Firestore Database** (production mode is fine).
3. In Project settings → General → Your apps, add a Web app and copy the
   config values.
4. Copy `.env.example` to `.env.local` and fill in those values.
5. Deploy `firestore.rules` from this repo (Firestore → Rules tab, paste and
   publish — or `firebase deploy --only firestore:rules` with the Firebase
   CLI).
6. Restart `npm run dev`. Open **Versus**, pick a name, and you're synced.
   Send the same URL to a training partner — once they pick their own name,
   they show up on the leaderboard live.

## Data model

Each player is one Firestore document at `trackers/{slugified-name}`:

```
{
  name: "Alex",
  waterGoalMl: 3200,
  records: { "2026-07-23": { morning: {...}, gym: {...}, habits: {...}, water: {ml, log}, custom: {...}, splitDay, gymManualDone } },
  customTrackers: [{ id, name, icon, unit, dailyTarget, step }],
  milestones: [{ id, name, note, targetDate, done }],
}
```

Before you've picked a name, the app runs in "guest" mode against
`localStorage` only; joining migrates that local data into your named
Firestore doc so nothing you logged pre-setup is lost.

## Security note

There's no login — just a name. Anyone with the app URL can read or write
any player's doc (see the comment in `firestore.rules`). That's a deliberate
trade-off for zero-setup sharing with people you trust; it's not meant to
hold sensitive data. If you want real per-person write protection, add
Firebase Anonymous Auth and key the rules off `request.auth.uid`.

## Build

```bash
npm run build
```

Outputs a static `dist/` you can deploy anywhere (Vercel, Netlify, Firebase
Hosting, GitHub Pages). Routing uses a hash router (`/#/gym`) specifically so
no server-side rewrite rules are needed for static hosting.
