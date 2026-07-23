import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db, firebaseReady } from "../firebase";

/** Live-subscribes to every player's tracker doc for the Versus leaderboard. */
export function useLeaderboard() {
  const [players, setPlayers] = useState([]);
  const [state, setState] = useState(firebaseReady ? "loading" : "unavailable");

  useEffect(() => {
    if (!firebaseReady) return;
    const unsub = onSnapshot(
      collection(db, "trackers"),
      (snap) => {
        setPlayers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setState("idle");
      },
      () => setState("error")
    );
    return unsub;
  }, []);

  return { players, state };
}
