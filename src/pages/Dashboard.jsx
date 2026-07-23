import React from "react";
import { Link } from "react-router-dom";
import { useTrackerCtx } from "../context/TrackerContext";
import { addDays, fromIso, iso, mondayOf, statusFor, WATER_GOAL_ML_DEFAULT } from "../data/constants";

const DOW = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];

export default function Dashboard() {
  const {
    records, recordFor, selected, setSelected, today, waterGoalMl,
    habitsList, splitOverrides, morningOverrides, customTrackers, milestones, unreadCount,
  } = useTrackerCtx();

  const profile = { waterGoalMl, habitsList, splitOverrides, morningOverrides };
  const weekStart = mondayOf(fromIso(selected));
  const week = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const rec = recordFor(selected);
  const st = statusFor(rec, profile);
  const waterMl = (rec.water && rec.water.ml) || 0;
  const goal = waterGoalMl || WATER_GOAL_ML_DEFAULT;

  const customDoneToday = customTrackers.filter((t) => {
    const v = (rec.custom && rec.custom[t.id] && rec.custom[t.id].value) || 0;
    return t.dailyTarget ? v >= t.dailyTarget : v > 0;
  }).length;

  const openMilestones = milestones.filter((m) => !m.done).length;

  return (
    <>
      <div className="week-grid">
        {week.map((d) => {
          const ds = iso(d);
          const dayStatus = statusFor(records[ds], profile);
          const isSel = ds === selected;
          const isToday = ds === today;
          const future = ds > today;
          return (
            <button
              key={ds}
              onClick={() => setSelected(ds)}
              aria-label={`Select ${ds}`}
              className={"week-cell" + (isSel ? " selected" : "") + (future ? " future" : "")}
            >
              <div className={"week-dow" + (isToday ? " today" : "")}>{DOW[(d.getDay() + 6) % 7]}</div>
              <div className="disp week-date">{d.getDate()}</div>
              <div className="week-dots">
                <span title="Morning" className={"week-dot" + (dayStatus.morning ? " done" : "")} />
                <span title="Gym" className={"week-dot" + (dayStatus.gym ? " done" : "")} />
                <span title="Water" className={"week-dot" + (dayStatus.water ? " done" : "")} />
                <span title="Habits" className={"week-dot" + (dayStatus.habits ? " done" : "")} />
              </div>
            </button>
          );
        })}
      </div>
      <div className="week-nav">
        <button onClick={() => setSelected(iso(addDays(weekStart, -7)))}>← prev week</button>
        <button
          onClick={() => setSelected(today)}
          style={{ color: "var(--gold)", letterSpacing: "0.08em" }}
        >
          TODAY
        </button>
        <button onClick={() => setSelected(iso(addDays(weekStart, 7)))}>next week →</button>
      </div>

      <div className="quick-grid">
        <Link to="/morning" className="quick-card">
          <div className="quick-card-top">
            <span className="quick-card-icon">🌅</span>
            <span style={{ color: st.morning ? "var(--gold)" : "var(--text-faint)", fontSize: 16 }}>
              {st.morning ? "✓" : ""}
            </span>
          </div>
          <span className="quick-card-label">Morning</span>
          <span className="quick-card-value">{st.morning ? "Complete" : "20 min routine"}</span>
        </Link>

        <Link to="/gym" className="quick-card">
          <div className="quick-card-top">
            <span className="quick-card-icon">🏋️</span>
            <span style={{ color: st.gym ? "var(--gold)" : "var(--text-faint)", fontSize: 16 }}>
              {st.gym ? "✓" : ""}
            </span>
          </div>
          <span className="quick-card-label">Gym</span>
          <span className="quick-card-value">{st.isRest ? "Rest day" : st.gym ? "Complete" : "Not started"}</span>
        </Link>

        <Link to="/water" className="quick-card">
          <div className="quick-card-top">
            <span className="quick-card-icon">💧</span>
            <span style={{ color: st.water ? "var(--gold)" : "var(--text-faint)", fontSize: 16 }}>
              {st.water ? "✓" : ""}
            </span>
          </div>
          <span className="quick-card-label">Water</span>
          <span className="quick-card-value">
            {(waterMl / 1000).toFixed(1)}L / {(goal / 1000).toFixed(1)}L
          </span>
        </Link>

        <Link to="/habits" className="quick-card">
          <div className="quick-card-top">
            <span className="quick-card-icon">⚡</span>
            <span style={{ color: st.habits ? "var(--gold)" : "var(--text-faint)", fontSize: 16 }}>
              {st.habits ? "✓" : ""}
            </span>
          </div>
          <span className="quick-card-label">Habits</span>
          <span className="quick-card-value">{st.habits ? "Complete" : "In progress"}</span>
        </Link>

        <Link to="/custom" className="quick-card">
          <div className="quick-card-top">
            <span className="quick-card-icon">🎯</span>
          </div>
          <span className="quick-card-label">Custom</span>
          <span className="quick-card-value">
            {customTrackers.length ? `${customDoneToday}/${customTrackers.length} done` : "Add a tracker"}
            {openMilestones ? ` · ${openMilestones} milestone${openMilestones === 1 ? "" : "s"}` : ""}
          </span>
        </Link>

        <Link to="/versus" className="quick-card">
          <div className="quick-card-top">
            <span className="quick-card-icon">⚔️</span>
          </div>
          <span className="quick-card-label">Versus</span>
          <span className="quick-card-value">See leaderboard</span>
        </Link>

        <Link to="/inbox" className="quick-card">
          <div className="quick-card-top">
            <span className="quick-card-icon">✉️</span>
            {unreadCount > 0 && <span className="tab-badge">{unreadCount}</span>}
          </div>
          <span className="quick-card-label">Inbox</span>
          <span className="quick-card-value">{unreadCount > 0 ? `${unreadCount} new` : "Messages & tasks"}</span>
        </Link>

        <Link to="/reminders" className="quick-card">
          <div className="quick-card-top">
            <span className="quick-card-icon">🔔</span>
          </div>
          <span className="quick-card-label">Reminders</span>
          <span className="quick-card-value">Set up nudges</span>
        </Link>
      </div>
    </>
  );
}
