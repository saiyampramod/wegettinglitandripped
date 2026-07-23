import { useCallback, useEffect, useRef, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db, firebaseReady } from "../firebase";

const sortByDateDesc = (arr) =>
  [...arr].sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));

const AUTO_DELETE_MS = 48 * 60 * 60 * 1000;

/**
 * Messages & tasks sent between players. Two separate live queries (received,
 * sent) instead of one OR query — Firestore rules validate each query
 * pattern independently, and toUid==me / fromUid==me are each simple
 * single-field equality filters that need no composite index.
 */
export function useInbox(uid) {
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);

  useEffect(() => {
    if (!firebaseReady || !uid) {
      setReceived([]);
      setSent([]);
      return;
    }
    const receivedQ = query(collection(db, "messages"), where("toUid", "==", uid));
    const sentQ = query(collection(db, "messages"), where("fromUid", "==", uid));
    const unsub1 = onSnapshot(receivedQ, (snap) => setReceived(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
    const unsub2 = onSnapshot(sentQ, (snap) => setSent(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
    return () => {
      unsub1();
      unsub2();
    };
  }, [uid]);

  // Cleanup: sweep for anything past 48h old and delete it. No server/Cloud
  // Function involved — this only runs while some client has the app open,
  // so it's not a precise scheduled job, but functionally the same for a
  // small friends-tracker. Needs BOTH a snapshot-triggered check (catches
  // already-stale messages the moment they're first loaded) and a periodic
  // timer (catches messages that go stale while just sitting there with no
  // new Firestore activity to re-trigger the snapshot listener).
  const listsRef = useRef({ received, sent });
  listsRef.current = { received, sent };

  const sweepExpired = useCallback(() => {
    const now = Date.now();
    const { received: r, sent: s } = listsRef.current;
    [...r, ...s]
      .filter((m) => {
        const ms = m.createdAt?.toMillis?.();
        return ms && now - ms > AUTO_DELETE_MS;
      })
      .forEach((m) => deleteDoc(doc(db, "messages", m.id)).catch(() => {}));
  }, []);

  useEffect(() => {
    if (!firebaseReady) return;
    sweepExpired();
  }, [received, sent, sweepExpired]);

  useEffect(() => {
    if (!firebaseReady) return;
    const id = setInterval(sweepExpired, 60000);
    return () => clearInterval(id);
  }, [sweepExpired]);

  const sendItem = useCallback(async ({ fromUid, fromName, toUid, toName, type, text }) => {
    await addDoc(collection(db, "messages"), {
      fromUid,
      fromName,
      toUid,
      toName,
      type,
      text: text.trim(),
      read: false,
      done: false,
      doneAt: null,
      createdAt: serverTimestamp(),
    });
  }, []);

  const markRead = useCallback((id) => updateDoc(doc(db, "messages", id), { read: true }), []);
  const markDone = useCallback(
    (id, done) => updateDoc(doc(db, "messages", id), { done, doneAt: done ? serverTimestamp() : null }),
    []
  );
  const remove = useCallback((id) => deleteDoc(doc(db, "messages", id)), []);

  return {
    received: sortByDateDesc(received),
    sent: sortByDateDesc(sent),
    unreadCount: received.filter((m) => !m.read).length,
    sendItem,
    markRead,
    markDone,
    remove,
  };
}
