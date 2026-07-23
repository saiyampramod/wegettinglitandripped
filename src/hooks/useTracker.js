import { useCallback, useEffect, useRef, useState } from "react";
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { db, firebaseReady } from "../firebase";
import { emptyRecord, iso, REMINDER_DEFAULTS, slug, WATER_GOAL_ML_DEFAULT } from "../data/constants";

const NAME_KEY = "mm-profile-name";
const GUEST_CACHE_KEY = "mm-guest-cache";
const cacheKeyFor = (name) => (name ? `mm-cache-${slug(name)}` : GUEST_CACHE_KEY);

const emptyDoc = () => ({
  records: {},
  customTrackers: [],
  milestones: [],
  waterGoalMl: WATER_GOAL_ML_DEFAULT,
  reminders: REMINDER_DEFAULTS,
});

function readCache(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function writeCache(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or unavailable — the live doc is still the source of truth */
  }
}

/**
 * Owns one player's tracker doc: daily records, custom trackers, milestones.
 * Lives in Firestore at trackers/{slug(name)} when Firebase is configured and
 * a name has been chosen; otherwise (or before joining) it falls back to a
 * localStorage-only "guest" doc on this device so the app is fully usable
 * pre-setup. Joining migrates whatever guest data exists into the named doc.
 */
export function useTracker() {
  const [playerName, setPlayerNameState] = useState(() => localStorage.getItem(NAME_KEY) || "");
  const [data, setData] = useState(() => readCache(cacheKeyFor(localStorage.getItem(NAME_KEY))) || emptyDoc());
  const [loaded, setLoaded] = useState(!firebaseReady || !localStorage.getItem(NAME_KEY));
  const [saveState, setSaveState] = useState("idle");
  const saveTimer = useRef(null);
  const skipNextWrite = useRef(false);

  const docRef = playerName && firebaseReady ? doc(db, "trackers", slug(playerName)) : null;

  useEffect(() => {
    if (!docRef) {
      setLoaded(true);
      return;
    }
    setLoaded(false);
    const unsub = onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          skipNextWrite.current = true;
          setData({ ...emptyDoc(), ...snap.data() });
        }
        setLoaded(true);
      },
      () => setLoaded(true)
    );
    return unsub;
  }, [docRef?.path]);

  // Debounced write-through: local state is the optimistic source of truth,
  // Firestore (or localStorage, offline) catches up shortly after.
  useEffect(() => {
    if (!loaded) return;
    writeCache(cacheKeyFor(playerName), data);
    if (skipNextWrite.current) {
      skipNextWrite.current = false;
      return;
    }
    if (!docRef) return;
    setSaveState("saving");
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await setDoc(docRef, { ...data, name: playerName, updatedAt: serverTimestamp() }, { merge: true });
        setSaveState("saved");
        setTimeout(() => setSaveState((s) => (s === "saved" ? "idle" : s)), 1500);
      } catch {
        setSaveState("error");
      }
    }, 500);
    return () => clearTimeout(saveTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, loaded, docRef?.path]);

  const joinAs = useCallback(
    async (name) => {
      const clean = name.trim();
      if (!clean) return;
      const guest = readCache(GUEST_CACHE_KEY);
      localStorage.setItem(NAME_KEY, clean);
      setPlayerNameState(clean);
      if (firebaseReady) {
        const ref = doc(db, "trackers", slug(clean));
        const base = guest ? { ...emptyDoc(), ...guest } : emptyDoc();
        await setDoc(ref, { ...base, name: clean, updatedAt: serverTimestamp() }, { merge: true });
      } else if (guest) {
        writeCache(cacheKeyFor(clean), guest);
        setData(guest);
      }
    },
    []
  );

  const updateRecord = useCallback((date, patch) => {
    setData((prev) => {
      const cur = prev.records[date] || emptyRecord(date);
      return { ...prev, records: { ...prev.records, [date]: { ...cur, ...patch } } };
    });
  }, []);

  const recordFor = useCallback((date) => data.records[date] || emptyRecord(date), [data.records]);

  const setWaterGoalMl = useCallback((ml) => {
    setData((prev) => ({ ...prev, waterGoalMl: ml }));
  }, []);

  const addCustomTracker = useCallback((tracker) => {
    setData((prev) => ({ ...prev, customTrackers: [...prev.customTrackers, tracker] }));
  }, []);
  const updateCustomTracker = useCallback((id, patch) => {
    setData((prev) => ({
      ...prev,
      customTrackers: prev.customTrackers.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    }));
  }, []);
  const removeCustomTracker = useCallback((id) => {
    setData((prev) => ({ ...prev, customTrackers: prev.customTrackers.filter((t) => t.id !== id) }));
  }, []);

  const addMilestone = useCallback((milestone) => {
    setData((prev) => ({ ...prev, milestones: [...prev.milestones, milestone] }));
  }, []);
  const updateMilestone = useCallback((id, patch) => {
    setData((prev) => ({
      ...prev,
      milestones: prev.milestones.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    }));
  }, []);
  const removeMilestone = useCallback((id) => {
    setData((prev) => ({ ...prev, milestones: prev.milestones.filter((m) => m.id !== id) }));
  }, []);

  const updateReminders = useCallback((category, patch) => {
    setData((prev) => ({
      ...prev,
      reminders: {
        ...REMINDER_DEFAULTS,
        ...prev.reminders,
        [category]: { ...REMINDER_DEFAULTS[category], ...prev.reminders?.[category], ...patch },
      },
    }));
  }, []);

  return {
    loaded,
    saveState,
    firebaseReady,
    playerName,
    joinAs,
    records: data.records,
    recordFor,
    updateRecord,
    waterGoalMl: data.waterGoalMl || WATER_GOAL_ML_DEFAULT,
    setWaterGoalMl,
    customTrackers: data.customTrackers || [],
    addCustomTracker,
    updateCustomTracker,
    removeCustomTracker,
    milestones: data.milestones || [],
    addMilestone,
    updateMilestone,
    removeMilestone,
    reminders: { ...REMINDER_DEFAULTS, ...data.reminders },
    updateReminders,
    today: iso(new Date()),
  };
}
