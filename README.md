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
- **Versus** — a live leaderboard shared with whoever else signs up. Updates
  in real time via Firestore, no refresh button. Tap any row to expand a
  day-by-day, category-by-category breakdown of exactly what that person hit
  or missed this week, plus a "missed N×" summary per category.
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

The app works immediately against local storage on this device with no sign-in
at all — you don't need Firebase to try it out. To turn on real accounts and
the live, cross-device, shared-with-friends part:

1. Create a free project at [firebase.google.com](https://firebase.google.com).
2. Enable **Firestore Database** (production mode is fine).
3. Enable **Authentication → Sign-in method → Email/Password**.
4. In Project settings → General → Your apps, add a Web app and copy the
   config values.
5. Copy `.env.example` to `.env.local` and fill in those values.
6. Deploy `firestore.rules` from this repo (Firestore → Rules tab, paste and
   publish — or `firebase deploy --only firestore:rules` with the Firebase
   CLI).
7. Restart `npm run dev`. You'll now be asked to create an account or sign
   in before the app loads. Send the same URL to a training partner — once
   they create their own account, they show up on the Versus leaderboard
   live.

## Data model

Each player is one Firestore document at `trackers/{firebaseAuthUid}`:

```
{
  name: "Alex",              // the display name chosen at sign-up
  waterGoalMl: 3200,
  records: { "2026-07-23": { morning: {...}, gym: {...}, habits: {...}, water: {ml, log}, custom: {...}, splitDay, gymManualDone } },
  customTrackers: [{ id, name, icon, unit, dailyTarget, step }],
  milestones: [{ id, name, note, targetDate, done }],
  reminders: { water: {...}, morning: {...}, gym: {...}, custom: {...} },
}
```

Without Firebase configured, the app runs entirely against a single
`localStorage` doc on that device — no account, no sync, single user. There's
no migration path from local-only into a real account; local mode is meant
for trying the app out or for offline solo use, not as a staging area before
signing up.

## Security model

Real accounts via Firebase Auth (email/password) — each player's doc lives
at `trackers/{uid}`, and Firestore rules only let the signed-in owner write
their own doc (`request.auth.uid == uid`), so nobody can edit or wipe someone
else's data. Any signed-in user can *read* any player's doc — that's what
makes the Versus leaderboard and the "what did they miss" breakdown work.
See the comment in `firestore.rules` for the exact rule.

## Build

```bash
npm run build
```

Outputs a static `dist/` you can deploy anywhere (Vercel, Netlify, Firebase
Hosting, GitHub Pages). Routing uses a hash router (`/#/gym`) specifically so
no server-side rewrite rules are needed for static hosting.
