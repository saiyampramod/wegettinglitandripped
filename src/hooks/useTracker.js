import { useCallback, useEffect, useRef, useState } from "react";
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { db, firebaseReady } from "../firebase";
import { emptyRecord, iso, REMINDER_DEFAULTS, WATER_GOAL_ML_DEFAULT } from "../data/constants";

const LOCAL_CACHE_KEY = "mm-local-cache";
const cacheKeyFor = (uid) => (uid ? `mm-cache-${uid}` : LOCAL_CACHE_KEY);

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
 * Owns one player's tracker doc: daily records, custom trackers, milestones,
 * reminders. Lives in Firestore at trackers/{uid} once signed in (uid comes
 * from Firebase Auth — see AuthContext); AuthGate keeps this hook from ever
 * mounting with firebaseReady=true and no user. When Firebase isn't
 * configured at all, it runs against a single localStorage doc on this
 * device instead, so local dev works without any setup.
 */
export function useTracker(user) {
  const uid = user?.uid || null;
  const displayName = user?.displayName || user?.email || "You";

  const [data, setData] = useState(() => readCache(cacheKeyFor(uid)) || emptyDoc());
  const [loaded, setLoaded] = useState(!firebaseReady || !uid);
  const [saveState, setSaveState] = useState("idle");
  const saveTimer = useRef(null);
  const skipNextWrite = useRef(false);

  const docRef = uid && firebaseReady ? doc(db, "trackers", uid) : null;

  useEffect(() => {
    if (!docRef) {
      setLoaded(true);
      return;
    }
    setLoaded(false);
    const unsub = onSnapshot(
      docRef,
      (snap) => {
        skipNextWrite.current = true;
        setData(snap.exists() ? { ...emptyDoc(), ...snap.data() } : emptyDoc());
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
    writeCache(cacheKeyFor(uid), data);
    if (skipNextWrite.current) {
      skipNextWrite.current = false;
      return;
    }
    if (!docRef) return;
    setSaveState("saving");
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await setDoc(docRef, { ...data, name: displayName, updatedAt: serverTimestamp() }, { merge: true });
        setSaveState("saved");
        setTimeout(() => setSaveState((s) => (s === "saved" ? "idle" : s)), 1500);
      } catch {
        setSaveState("error");
      }
    }, 500);
    return () => clearTimeout(saveTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, loaded, docRef?.path, displayName]);

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
    uid,
    playerName: firebaseReady ? displayName : null,
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
