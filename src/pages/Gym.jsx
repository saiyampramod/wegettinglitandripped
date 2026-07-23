import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTrackerCtx } from "../context/TrackerContext";
import { splitFor } from "../data/constants";

const DAYS = [1, 2, 3, 4, 5, 6, 7];
const newExId = (day) => `d${day}x-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

export default function Gym() {
  const { selected, recordFor, updateRecord, today, splitOverrides, setSplitDayExercises, resetSplitDay } =
    useTrackerCtx();
  const rec = recordFor(selected);
  const [viewDay, setViewDay] = useState(null);
  const [editing, setEditing] = useState(false);

  const openDay = (n) => {
    if (n !== rec.splitDay) {
      updateRecord(selected, { splitDay: n, gym: {}, gymManualDone: false });
    }
    setEditing(false);
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
          Every day is editable: make the program yours.
        </div>
        <div className="day-card-grid">
          {DAYS.map((n) => {
            const day = splitFor(n, splitOverrides);
            const isRest = day.exercises.length === 0;
            const isAssigned = rec.splitDay === n;
            const customized = !!(splitOverrides && splitOverrides[n]);
            const done = isRest
              ? isAssigned && rec.gymManualDone
              : isAssigned && day.exercises.length > 0 && day.exercises.every((e) => rec.gym[e.id]);
            return (
              <button key={n} onClick={() => openDay(n)} className={"day-card" + (isAssigned ? " today" : "")}>
                <span className="day-card-num">
                  Day {n}
                  {customized ? " · custom" : ""}
                </span>
                <span className="disp day-card-label">{day.label}</span>
                <span className="day-card-focus">{day.focus}</span>
                <span className={"day-card-status" + (done ? " done" : "")}>
                  {isAssigned ? (done ? "Complete" : "Assigned today") : "View routine"}
                </span>
              </button>
            );
          })}
        </div>
      </>
    );
  }

  const day = splitFor(viewDay, splitOverrides);
  const isRest = day.exercises.length === 0;
  const isAssigned = rec.splitDay === viewDay;
  const customized = !!(splitOverrides && splitOverrides[viewDay]);
  const gymCount = day.exercises.filter((e) => rec.gym[e.id]).length;
  const pct = isRest
    ? rec.gymManualDone
      ? 100
      : 0
    : day.exercises.length
    ? Math.round((gymCount / day.exercises.length) * 100)
    : 0;

  const toggleEx = (id) => updateRecord(selected, { gym: { ...rec.gym, [id]: !rec.gym[id] } });

  const editEx = (id, patch) =>
    setSplitDayExercises(viewDay, day.exercises.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  const removeEx = (id) =>
    setSplitDayExercises(viewDay, day.exercises.filter((e) => e.id !== id));
  const addEx = () =>
    setSplitDayExercises(viewDay, [
      ...day.exercises,
      { id: newExId(viewDay), name: "New exercise", sets: "3", reps: "10–12" },
    ]);

  return (
    <>
      <button onClick={() => setViewDay(null)} className="back-link" style={{ background: "none", border: "none" }}>
        ← All days
      </button>
      <div className="page-title-row">
        <h2 className="disp page-title">
          Day {viewDay} · {day.label}
        </h2>
        <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: pct === 100 ? "var(--gold)" : "var(--text-dim)", fontWeight: 600 }}>
            {pct === 100 ? "COMPLETE" : isRest ? "REST DAY" : `${gymCount}/${day.exercises.length}`}
          </span>
          <button className="chip" onClick={() => setEditing((v) => !v)}>
            {editing ? "Done editing" : "✎ Edit"}
          </button>
        </span>
      </div>
      <div className="card-sub" style={{ marginBottom: 12 }}>
        {day.focus}
        {customized && " · customized"}
        {!isAssigned && ` · not assigned to ${selected === today ? "today" : selected}`}
      </div>

      <div className="card">
        <div className="card-head">
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {editing ? (
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {day.exercises.map((ex) => (
              <div key={ex.id} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                  <input
                    className="field"
                    value={ex.name}
                    onChange={(e) => editEx(ex.id, { name: e.target.value })}
                    placeholder="Exercise"
                  />
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      className="field"
                      style={{ width: 90 }}
                      value={ex.sets}
                      onChange={(e) => editEx(ex.id, { sets: e.target.value })}
                      placeholder="Sets"
                    />
                    <input
                      className="field"
                      style={{ width: 110 }}
                      value={ex.reps}
                      onChange={(e) => editEx(ex.id, { reps: e.target.value })}
                      placeholder="Reps"
                    />
                  </div>
                </div>
                <button className="btn danger" style={{ padding: "8px 10px" }} onClick={() => removeEx(ex.id)}>
                  ✕
                </button>
              </div>
            ))}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="btn solid" onClick={addEx}>
                + Add exercise
              </button>
              {customized && (
                <button className="btn ghost" onClick={() => resetSplitDay(viewDay)}>
                  Reset to default
                </button>
              )}
            </div>
            <span className="card-sub" style={{ marginTop: 0 }}>
              Adding exercises to a rest day turns it into a training day (and vice versa if you remove them all).
            </span>
          </div>
        ) : isRest ? (
          <div className="card-body">
            <p style={{ margin: "0 0 14px", fontSize: 13, color: "#b5afa2", lineHeight: 1.5 }}>{day.tip}</p>
            <button
              onClick={() => updateRecord(selected, { gymManualDone: !rec.gymManualDone })}
              className={"btn block" + (rec.gymManualDone ? " solid" : "")}
            >
              {rec.gymManualDone ? "Rest Day Logged" : "Log Rest Day"}
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
                  className={"task-row" + (checked ? " done" : "")}
                  aria-pressed={checked}
                >
                  <span className="item-name" style={{ flex: 1 }}>
                    {ex.name}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--gold)", whiteSpace: "nowrap" }}>
                    {ex.sets} × {ex.reps}
                  </span>
                  {checked ? <span className="done-chip">Done</span> : <span className="todo-dot" />}
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
