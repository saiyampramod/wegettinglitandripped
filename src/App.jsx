import React, { useMemo } from "react";
import { NavLink, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { TrackerProvider, useTrackerCtx } from "./context/TrackerContext";
import { addDays, fromIso, iso, statusFor } from "./data/constants";
import { useInboxNotifications, useReminderEngine } from "./hooks/useReminderEngine";
import Dashboard from "./pages/Dashboard";
import Morning from "./pages/Morning";
import Gym from "./pages/Gym";
import Water from "./pages/Water";
import Habits from "./pages/Habits";
import Custom from "./pages/Custom";
import Versus from "./pages/Versus";
import Reminders from "./pages/Reminders";
import Inbox from "./pages/Inbox";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";

const TABS = [
  { to: "/", label: "Today", end: true },
  { to: "/morning", label: "Morning" },
  { to: "/gym", label: "Gym" },
  { to: "/water", label: "Water" },
  { to: "/habits", label: "Habits" },
  { to: "/custom", label: "Custom" },
  { to: "/versus", label: "Versus" },
  { to: "/inbox", label: "Inbox" },
  { to: "/reminders", label: "Reminders" },
];

function useStreak() {
  const { records, waterGoalMl, habitsList, splitOverrides, morningList, today } = useTrackerCtx();
  return useMemo(() => {
    const profile = { waterGoalMl, habitsList, splitOverrides, morningList };
    let s = 0;
    let cursor = fromIso(today);
    const t = statusFor(records[today], profile);
    if (!(t.morning && t.gym)) cursor = addDays(cursor, -1);
    for (let i = 0; i < 365; i++) {
      const st = statusFor(records[iso(cursor)], profile);
      if (st.morning && st.gym) {
        s++;
        cursor = addDays(cursor, -1);
      } else break;
    }
    return s;
  }, [records, waterGoalMl, habitsList, splitOverrides, morningList, today]);
}

function Shell() {
  const streak = useStreak();
  const {
    saveState, firebaseReady, reminders, today, recordFor, waterGoalMl,
    habitsList, splitOverrides, morningList, customTrackers, milestones, unreadCount, received,
  } = useTrackerCtx();

  useReminderEngine({
    reminders, today, recordFor, waterGoalMl, habitsList, splitOverrides, morningList, customTrackers, milestones,
  });
  useInboxNotifications(received, reminders);

  return (
    <>
      <header className="app-header">
        <div className="app-header-inner">
          <div>
            <div className="brand-eyebrow">Ripped &amp; Lit</div>
            <h1 className="disp brand-title">Habit Tracker</h1>
          </div>
          <div>
            <div className="disp streak-number">{streak}</div>
            <div className="streak-label">day streak</div>
          </div>
        </div>
        <nav className="tab-nav" aria-label="Sections">
          {TABS.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.end}
              className={({ isActive }) => "tab-pill" + (isActive ? " active" : "")}
            >
              {t.label}
              {t.to === "/inbox" && unreadCount > 0 && <span className="tab-badge">{unreadCount}</span>}
            </NavLink>
          ))}
        </nav>
      </header>

      <div className="shell">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/morning" element={<Morning />} />
          <Route path="/gym" element={<Gym />} />
          <Route path="/water" element={<Water />} />
          <Route path="/habits" element={<Habits />} />
          <Route path="/custom" element={<Custom />} />
          <Route path="/versus" element={<Versus />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/reminders" element={<Reminders />} />
        </Routes>

        <div className={"footer-note" + (saveState === "error" ? " error" : "")}>
          {saveState === "saving"
            ? "saving…"
            : saveState === "saved"
            ? "saved"
            : saveState === "error"
            ? "couldn't sync — changes are kept on this device"
            : firebaseReady
            ? "synced"
            : "local device only"}
        </div>
      </div>
    </>
  );
}

function AuthGate({ children }) {
  const { user, authLoading, firebaseReady } = useAuth();
  if (!firebaseReady) return children;
  if (authLoading) {
    return (
      <div className="auth-screen">
        <div className="brand-eyebrow">Ripped &amp; Lit</div>
      </div>
    );
  }
  if (!user) return <Login />;
  return children;
}

function OnboardingGate({ children }) {
  const { loaded, needsOnboarding } = useTrackerCtx();
  if (loaded && needsOnboarding) return <Onboarding />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <AuthGate>
        <TrackerProvider>
          <OnboardingGate>
            <Shell />
          </OnboardingGate>
        </TrackerProvider>
      </AuthGate>
    </AuthProvider>
  );
}
