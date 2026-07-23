import { useCallback, useEffect, useState } from "react";
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
