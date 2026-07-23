import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTrackerCtx } from "../context/TrackerContext";
import { SPLIT } from "../data/constants";

const DAYS = [1, 2, 3, 4, 5, 6, 7];

export default function Gym() {
  const { selected, recordFor, updateRecord, today } = useTrackerCtx();
  const rec = recordFor(selected);
  const [viewDay, setViewDay] = useState(null);

  const openDay = (n) => {
    if (n !== rec.splitDay) {
      updateRecord(selected, { splitDay: n, gym: {}, gymManualDone: false });
    }
    setViewDay(n);
  };

  if (viewDay == null) {
    return (
      <>
        <Link to="/" className="back-link">
          ← Today
        </Link>
        <div className="page-title-row">
          <h2 className="disp page-title">Gym</h2>
        </div>
        <div className="card-sub" style={{ marginBottom: 14 }}>
          {selected === today ? "Today's program" : `Program for ${selected}`} — pick a day to open its routine.
        </div>
        <div className="day-card-grid">
          {DAYS.map((n) => {
            const day = SPLIT[n];
            const isRest = day.exercises.length === 0;
            const isAssigned = rec.splitDay === n;
            const done = isRest
              ? isAssigned && rec.gymManualDone
              : isAssigned && day.exercises.length > 0 && day.exercises.every((e) => rec.gym[e.id]);
            return (
              <button key={n} onClick={() => openDay(n)} className={"day-card" + (isAssigned ? " today" : "")}>
                <span className="day-card-num">Day {n}</span>
                <span className="disp day-card-label">{day.label}</span>
                <span className="day-card-focus">{day.focus}</span>
                <span className={"day-card-status" + (done ? " done" : "")}>
                  {isAssigned ? (done ? "✓ Complete" : "Assigned today") : "View routine"}
                </span>
              </button>
            );
          })}
        </div>
      </>
    );
  }

  const day = SPLIT[viewDay];
  const isRest = day.exercises.length === 0;
  const isAssigned = rec.splitDay === viewDay;
  const gymCount = day.exercises.filter((e) => rec.gym[e.id]).length;
  const pct = isRest
    ? rec.gymManualDone
      ? 100
      : 0
    : day.exercises.length
    ? Math.round((gymCount / day.exercises.length) * 100)
    : 0;

  const toggleEx = (id) => updateRecord(selected, { gym: { ...rec.gym, [id]: !rec.gym[id] } });

  return (
    <>
      <button onClick={() => setViewDay(null)} className="back-link" style={{ background: "none", border: "none" }}>
        ← All days
      </button>
      <div className="page-title-row">
        <h2 className="disp page-title">
          Day {viewDay} · {day.label}
        </h2>
        <span style={{ fontSize: 12, color: pct === 100 ? "var(--gold)" : "var(--text-dim)", fontWeight: 600 }}>
          {pct === 100 ? "COMPLETE" : isRest ? "REST DAY" : `${gymCount}/${day.exercises.length}`}
        </span>
      </div>
      <div className="card-sub" style={{ marginBottom: 12 }}>
        {day.focus}
        {!isAssigned && ` · not assigned to ${selected === today ? "today" : selected}`}
      </div>

      <div className="card">
        <div className="card-head">
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {isRest ? (
          <div className="card-body">
            <p style={{ margin: "0 0 14px", fontSize: 13, color: "#b5afa2", lineHeight: 1.5 }}>{day.tip}</p>
            <button
              onClick={() => updateRecord(selected, { gymManualDone: !rec.gymManualDone })}
              className={"btn block" + (rec.gymManualDone ? " solid" : "")}
            >
              {rec.gymManualDone ? "✓ Rest Day Logged" : "Log Rest Day"}
            </button>
          </div>
        ) : (
          <>
            {day.exercises.map((ex) => {
              const checked = !!rec.gym[ex.id];
              return (
                <button
                  key={ex.id}
                  onClick={() => toggleEx(ex.id)}
                  className="row-btn"
                  style={{ borderBottom: "1px solid var(--border-soft)" }}
                >
                  <span className={"checkbox" + (checked ? " checked" : "")}>{checked ? "✓" : ""}</span>
                  <span className={"item-name" + (checked ? " checked" : "")} style={{ flex: 1 }}>
                    {ex.name}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--gold)", whiteSpace: "nowrap" }}>
                    {ex.sets} × {ex.reps}
                  </span>
                </button>
              );
            })}
            <div style={{ padding: "12px 16px", fontSize: 11.5, color: "var(--text-dim)", fontStyle: "italic", lineHeight: 1.5 }}>
              💡 {day.tip}
            </div>
          </>
        )}
      </div>
    </>
  );
}
