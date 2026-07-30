/* ─────────────────────────  PPL SPLIT  ───────────────────────── */

export const SPLIT = {
  1: {
    label: "PUSH",
    focus: "Chest · Shoulders · Triceps",
    tip: "Focus on the mind-muscle connection — feel the stretch and contraction on every rep.",
    exercises: [
      { id: "d1e1", name: "Incline Dumbbell Press", sets: "3–4", reps: "8–12" },
      { id: "d1e2", name: "Chest Press Machine", sets: "3–4", reps: "10–12" },
      { id: "d1e3", name: "Dumbbell Shoulder Press", sets: "3", reps: "8–12" },
      { id: "d1e4", name: "Lateral Raises", sets: "3", reps: "12–15" },
      { id: "d1e5", name: "Tricep Pushdowns", sets: "3", reps: "10–15" },
      { id: "d1e6", name: "Overhead Tricep Extensions", sets: "3", reps: "10–15" },
    ],
  },
  2: {
    label: "PULL",
    focus: "Back · Rear Delts · Biceps",
    tip: "Drive your elbows back — don't just pull with your hands. Let the back do the work.",
    exercises: [
      { id: "d2e1", name: "Lat Pulldown", sets: "3–4", reps: "8–12" },
      { id: "d2e2", name: "Seated Row", sets: "3–4", reps: "10–12" },
      { id: "d2e3", name: "Single Arm Dumbbell Row", sets: "3", reps: "10–12" },
      { id: "d2e4", name: "Rear Delt Fly", sets: "3", reps: "12–15" },
      { id: "d2e5", name: "Barbell or EZ Bar Curl", sets: "3", reps: "8–12" },
      { id: "d2e6", name: "Hammer Curl", sets: "3", reps: "10–12" },
    ],
  },
  3: {
    label: "LEGS",
    focus: "Quads · Hamstrings · Calves",
    tip: "Prioritise depth and control on squats. A slow eccentric builds more muscle than rushing the rep.",
    exercises: [
      { id: "d3e1", name: "Squats", sets: "3–4", reps: "6–10" },
      { id: "d3e2", name: "Leg Press", sets: "3–4", reps: "10–12" },
      { id: "d3e3", name: "Romanian Deadlift", sets: "3", reps: "8–12" },
      { id: "d3e4", name: "Leg Extensions", sets: "3", reps: "12–15" },
      { id: "d3e5", name: "Hamstring Curls", sets: "3", reps: "12–15" },
      { id: "d3e6", name: "Calf Raises", sets: "4", reps: "12–15" },
    ],
  },
  4: {
    label: "REST",
    focus: "Full rest · Light steps / optional cardio",
    tip: "Recovery is where the growth happens. Walk, hydrate, sleep well.",
    exercises: [],
  },
  5: {
    label: "UPPER",
    focus: "Chest · Back · Arms",
    tip: "Second exposure of the week — chase quality reps, not new maxes.",
    exercises: [
      { id: "d5e1", name: "Incline Dumbbell Press", sets: "3", reps: "8–12" },
      { id: "d5e2", name: "Chest Fly (Machine or Cable)", sets: "3", reps: "12–15" },
      { id: "d5e3", name: "Lat Pulldown", sets: "3", reps: "8–12" },
      { id: "d5e4", name: "Seated Row", sets: "3", reps: "10–12" },
      { id: "d5e5", name: "Bicep Curls (any variation)", sets: "3", reps: "10–12" },
      { id: "d5e6", name: "Tricep Pushdowns", sets: "3", reps: "10–15" },
    ],
  },
  6: {
    label: "SHOULDERS + LEGS",
    focus: "Delts · Quads · Hamstrings",
    tip: "Control the lateral raises — no swinging. Delts respond to strict tension.",
    exercises: [
      { id: "d6e1", name: "Dumbbell Shoulder Press", sets: "3", reps: "8–12" },
      { id: "d6e2", name: "Lateral Raises", sets: "3", reps: "12–15" },
      { id: "d6e3", name: "Leg Press or Hack Squat", sets: "3–4", reps: "10–12" },
      { id: "d6e4", name: "Leg Extensions", sets: "3", reps: "12–15" },
      { id: "d6e5", name: "Hamstring Curls", sets: "3", reps: "12–15" },
    ],
  },
  7: {
    label: "REST (OPTIONAL)",
    focus: "Deload · Mobility work · Light cardio",
    tip: "Optional movement only. Mobility or an easy walk keeps you fresh for Day 1.",
    exercises: [],
  },
};

/* ─────────────────────────  MORNING ROUTINE  ───────────────────────── */

export const MORNING = [
  {
    id: "warmup",
    phase: "Warm-up",
    minutes: 2,
    items: [
      { id: "m1", name: "Neck Circles", detail: "×10 each direction" },
      { id: "m2", name: "Shoulder Circles", detail: "×20" },
      { id: "m3", name: "Hip Circles", detail: "×15" },
      { id: "m4", name: "Arm Swings", detail: "×20" },
    ],
  },
  {
    id: "mobility",
    phase: "Mobility",
    minutes: 8,
    items: [
      { id: "m5", name: "Chin Tucks", detail: "2 × 15" },
      { id: "m6", name: "Cat-Cow", detail: "2 × 10" },
      { id: "m7", name: "Thoracic Extensions", detail: "2 × 10" },
      { id: "m8", name: "World's Greatest Stretch", detail: "1 × 5 each side" },
      { id: "m9", name: "Hip Flexor Stretch", detail: "2 × 45 sec each side" },
      { id: "m10", name: "Deep Squat Hold", detail: "2 × 30 sec" },
    ],
  },
  {
    id: "posture",
    phase: "Posture & Core",
    minutes: 7,
    items: [
      { id: "m11", name: "Wall Angels", detail: "2 × 12" },
      { id: "m12", name: "Band Pull Aparts", detail: "2 × 20" },
      { id: "m13", name: "Dead Bugs", detail: "2 × 10" },
      { id: "m14", name: "Bird Dogs", detail: "2 × 10" },
      { id: "m15", name: "Side Plank", detail: "2 × 30–45 sec each side" },
    ],
  },
  {
    id: "pelvic",
    phase: "Recovery",
    minutes: 3,
    items: [
      { id: "m16", name: "Quick Kegels", detail: "2 × 10 · contract 1s, relax 1s · rest 30s" },
      { id: "m17", name: "Slow Kegels", detail: "2 × 8 · hold 5s, relax 5s · rest 45s" },
      { id: "m18", name: "Reverse Kegels", detail: "2 × 10 · inhale deep, relax + lengthen — don't strain or push" },
    ],
  },
  {
    id: "finish",
    phase: "Finish",
    minutes: 1,
    items: [
      { id: "m19", name: "Box Breathing", detail: "In 4s · hold 4s · out 4s · hold 4s — 1 min" },
    ],
  },
];

export const ALL_MORNING_IDS = MORNING.flatMap((p) => p.items.map((i) => i.id));

/* a player's morning routine — a fully custom list once they've touched it
   at all (add/remove/rename any phase, same freedom Habits already has),
   or the default MORNING template until then */
export const morningFor = (morningList) => morningList || MORNING;

/* ─────────────────────────  PERFORMANCE HABITS  ───────────────────────── */

export const HABITS = [
  { id: "h1", name: "Sleep 7.5–9 hours", detail: "Last night" },
  { id: "h2", name: "Lift heavy", detail: "5×/week target" },
  { id: "h3", name: "Cardio 20–30 min", detail: "3–5×/week target" },
  { id: "h4", name: "Protein 120–140 g", detail: "Hit daily total" },
  { id: "h5", name: "Healthy fats 50–70 g", detail: "Hit daily total" },
  { id: "h6", name: "No alcohol / nicotine", detail: "Kept it clean today" },
];

/* ─────────────────────────  WATER  ───────────────────────── */

export const WATER_GOAL_ML_DEFAULT = 3200; // 3.2 L
export const WATER_QUICK_ADDS = [250, 500, 750];

/* ─────────────────────────  REMINDERS  ───────────────────────── */

export const REMINDER_DEFAULTS = {
  water: { enabled: false, intervalMin: 60 },
  morning: { enabled: false, time: "09:00" },
  gym: { enabled: false, time: "18:00" },
  custom: { enabled: false, time: "20:00" },
  messages: { enabled: true },
};

/* ─────────────────────────  DATE HELPERS  ───────────────────────── */

export const iso = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
};
export const fromIso = (s) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};
export const addDays = (d, n) => {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
};
export const mondayOf = (d) => {
  const c = new Date(d);
  const wd = (c.getDay() + 6) % 7; // Mon = 0
  return addDays(c, -wd);
};
export const isoDow = (d) => ((d.getDay() + 6) % 7) + 1; // Mon=1 … Sun=7

export const emptyRecord = (dateStr) => ({
  morning: {},
  gym: {},
  habits: {},
  water: { ml: 0, log: [] },
  custom: {},
  splitDay: isoDow(fromIso(dateStr)),
  gymManualDone: false,
});

export const slug = (s) =>
  s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 30);

/* a split day with any per-player overrides applied — exercises, and now
   also the day's own label/focus/tip, same rename freedom Morning has */
export const splitFor = (n, splitOverrides) => {
  const base = SPLIT[n];
  const override = splitOverrides && splitOverrides[n];
  if (!override) return base;
  return {
    ...base,
    ...(override.label !== undefined ? { label: override.label } : {}),
    ...(override.focus !== undefined ? { focus: override.focus } : {}),
    ...(override.tip !== undefined ? { tip: override.tip } : {}),
    ...(Array.isArray(override.exercises) ? { exercises: override.exercises } : {}),
  };
};

/* status of a single day's record against that player's own definitions —
   each player is judged against their customized habits/split, not the defaults */
export const statusFor = (r, profile = {}) => {
  if (!r) return { morning: false, gym: false, habits: false, water: false };
  const habitsList = profile.habitsList || HABITS;
  const morningIds = morningFor(profile.morningList).flatMap((p) => p.items.map((i) => i.id));
  const morningDone = morningIds.length > 0 && morningIds.every((id) => r.morning && r.morning[id]);
  const day = splitFor(r.splitDay || 4, profile.splitOverrides);
  const isRest = day.exercises.length === 0;
  const gymDone = isRest
    ? !!r.gymManualDone
    : day.exercises.length > 0 && day.exercises.every((e) => r.gym && r.gym[e.id]);
  const habitsDone = habitsList.length > 0 && habitsList.every((h) => r.habits && r.habits[h.id]);
  const waterMl = (r.water && r.water.ml) || 0;
  const waterDone = waterMl >= (profile.waterGoalMl || WATER_GOAL_ML_DEFAULT);
  return { morning: morningDone, gym: gymDone, habits: habitsDone, water: waterDone, isRest };
};

/* Points for a single day, counted per individual task instead of only
   paying out once a whole category is fully cleared — every morning item,
   every exercise, every habit is worth 1pt on its own, and water pays out
   in quarters of the daily goal so it stays on the same scale as the rest. */
export const WATER_POINT_STEPS = 4;
export const pointsFor = (r, profile = {}) => {
  const habitsList = profile.habitsList || HABITS;
  const morningItems = morningFor(profile.morningList).flatMap((p) => p.items);
  const day = splitFor((r && r.splitDay) || 4, profile.splitOverrides);
  const isRest = day.exercises.length === 0;
  const gymMax = isRest ? 1 : day.exercises.length;
  const habitsMax = habitsList.length;
  const morningMax = morningItems.length;
  if (!r) {
    return {
      morning: 0, gym: 0, habits: 0, water: 0, total: 0,
      morningMax, gymMax, habitsMax, waterMax: WATER_POINT_STEPS,
      max: morningMax + gymMax + habitsMax + WATER_POINT_STEPS, isRest,
    };
  }
  const morning = morningItems.filter((i) => r.morning && r.morning[i.id]).length;
  const gym = isRest ? (r.gymManualDone ? 1 : 0) : day.exercises.filter((e) => r.gym && r.gym[e.id]).length;
  const habits = habitsList.filter((h) => r.habits && r.habits[h.id]).length;
  const waterMl = (r.water && r.water.ml) || 0;
  const goal = profile.waterGoalMl || WATER_GOAL_ML_DEFAULT;
  const water = Math.min(WATER_POINT_STEPS, Math.floor((waterMl / goal) * WATER_POINT_STEPS));
  const total = morning + gym + habits + water;
  const max = morningMax + gymMax + habitsMax + WATER_POINT_STEPS;
  return { morning, gym, habits, water, total, morningMax, gymMax, habitsMax, waterMax: WATER_POINT_STEPS, max, isRest };
};

/* current streak (consecutive days with both morning + gym fully cleared) —
   shared by the dashboard header and the Versus leaderboard so "your streak"
   means the same thing everywhere it's shown */
export const streakFor = (records, profile, today) => {
  let s = 0;
  let cursor = fromIso(today);
  const t = statusFor(records && records[today], profile);
  if (!(t.morning && t.gym)) cursor = addDays(cursor, -1);
  for (let i = 0; i < 365; i++) {
    const st = statusFor(records && records[iso(cursor)], profile);
    if (st.morning && st.gym) {
      s++;
      cursor = addDays(cursor, -1);
    } else break;
  }
  return s;
};
