import React, { useMemo } from "react";
import { NavLink, Route, Routes } from "react-router-dom";
import { TrackerProvider, useTrackerCtx } from "./context/TrackerContext";
import { addDays, fromIso, iso, statusFor } from "./data/constants";
import Dashboard from "./pages/Dashboard";
import Morning from "./pages/Morning";
import Gym from "./pages/Gym";
import Water from "./pages/Water";
import Habits from "./pages/Habits";
import Custom from "./pages/Custom";
import Versus from "./pages/Versus";

const TABS = [
  { to: "/", label: "Today", end: true },
  { to: "/morning", label: "Morning" },
  { to: "/gym", label: "Gym" },
  { to: "/water", label: "Water" },
  { to: "/habits", label: "Habits" },
  { to: "/custom", label: "Custom" },
  { to: "/versus", label: "Versus" },
];

function useStreak() {
  const { records, waterGoalMl, today } = useTrackerCtx();
  return useMemo(() => {
    let s = 0;
    let cursor = fromIso(today);
    const t = statusFor(records[today], waterGoalMl);
    if (!(t.morning && t.gym)) cursor = addDays(cursor, -1);
    for (let i = 0; i < 365; i++) {
      const st = statusFor(records[iso(cursor)], waterGoalMl);
      if (st.morning && st.gym) {
        s++;
        cursor = addDays(cursor, -1);
      } else break;
    }
    return s;
  }, [records, waterGoalMl, today]);
}

function Shell() {
  const streak = useStreak();
  const { saveState, playerName, firebaseReady } = useTrackerCtx();

  return (
    <>
      <header className="app-header">
        <div className="app-header-inner">
          <div>
            <div className="brand-eyebrow">Mindful Muscle</div>
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
        </Routes>

        <div className={"footer-note" + (saveState === "error" ? " error" : "")}>
          {saveState === "saving"
            ? "saving…"
            : saveState === "saved"
            ? "saved"
            : saveState === "error"
            ? "couldn't sync — changes are kept on this device"
            : firebaseReady && playerName
            ? "synced"
            : firebaseReady
            ? "playing as guest · join in Versus to sync"
            : "local device only"}
        </div>
      </div>
    </>
  );
}

export default function App() {
  return (
    <TrackerProvider>
      <Shell />
    </TrackerProvider>
  );
}
