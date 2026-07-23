import React, { createContext, useContext, useMemo, useState } from "react";
import { useTracker } from "../hooks/useTracker";
import { useInbox } from "../hooks/useInbox";
import { useAuth } from "./AuthContext";
import { iso } from "../data/constants";

const Ctx = createContext(null);

export function TrackerProvider({ children }) {
  const { user, signOutUser } = useAuth();
  const tracker = useTracker(user);
  const inbox = useInbox(tracker.uid);
  const [selected, setSelected] = useState(tracker.today);

  const value = useMemo(
    () => ({ ...tracker, ...inbox, selected, setSelected, email: user?.email || null, signOutUser }),
    [tracker, inbox, selected, user, signOutUser]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTrackerCtx() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTrackerCtx must be used within TrackerProvider");
  return ctx;
}

export const todayIso = () => iso(new Date());
