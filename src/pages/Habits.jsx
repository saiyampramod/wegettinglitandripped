import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTrackerCtx } from "../context/TrackerContext";
import { HABITS } from "../data/constants";

const newId = () => `h-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

export default function Habits() {
  const { selected, recordFor, updateRecord, today, habitsList, setHabitsList } = useTrackerCtx();
  const rec = recordFor(selected);
  const habits = rec.habits || {};
  const list = habitsList || HABITS;
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDetail, setNewDetail] = useState("");

  const count = list.filter((h) => habits[h.id]).length;
  const pct = list.length ? Math.round((count / list.length) * 100) : 0;

  const toggle = (id) => updateRecord(selected, { habits: { ...habits, [id]: !habits[id] } });

  const mutate = (nextList) => setHabitsList(nextList);
  const editHabit = (id, patch) => mutate(list.map((h) => (h.id === id ? { ...h, ...patch } : h)));
  const removeHabit = (id) => mutate(list.filter((h) => h.id !== id));
  const addHabit = () => {
    if (!newName.trim()) return;
    mutate([...list, { id: newId(), name: newName.trim(), detail: newDetail.trim() }]);
    setNewName("");
    setNewDetail("");
  };

  return (
    <>
      <Link to="/" className="back-link">
        ← Today
      </Link>
      <div className="page-title-row">
        <h2 className="disp page-title">Performance Habits</h2>
        <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: pct === 100 ? "var(--gold)" : "var(--text-dim)", fontWeight: 600 }}>
            {pct === 100 ? "COMPLETE" : `${count}/${list.length}`}
          </span>
          <button className="chip" onClick={() => setEditing((v) => !v)}>
            {editing ? "Done editing" : "✎ Edit"}
          </button>
        </span>
      </div>
      {selected !== today && (
        <div className="card-sub" style={{ marginBottom: 12 }}>
          Editing {selected} — not today
        </div>
      )}

      <div className="card">
        <div className="card-head">
          <div className="card-sub">These are your own — edit, add, or remove them to match your goals.</div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {!editing &&
          list.map((h) => {
            const checked = !!habits[h.id];
            return (
              <button
                key={h.id}
                onClick={() => toggle(h.id)}
                className={"task-row" + (checked ? " done" : "")}
                aria-pressed={checked}
              >
                <span style={{ flex: 1 }}>
                  <span className="item-name">{h.name}</span>
                  {h.detail && <span className="item-detail">{h.detail}</span>}
                </span>
                {checked ? <span className="done-chip">Done</span> : <span className="todo-dot" />}
              </button>
            );
          })}

        {editing && (
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {list.map((h) => (
              <div key={h.id} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                  <input
                    className="field"
                    value={h.name}
                    onChange={(e) => editHabit(h.id, { name: e.target.value })}
                    placeholder="Habit"
                  />
                  <input
                    className="field"
                    style={{ fontSize: 12 }}
                    value={h.detail || ""}
                    onChange={(e) => editHabit(h.id, { detail: e.target.value })}
                    placeholder="Detail (optional)"
                  />
                </div>
                <button className="btn danger" style={{ padding: "8px 10px" }} onClick={() => removeHabit(h.id)}>
                  ✕
                </button>
              </div>
            ))}

            <div style={{ borderTop: "1px solid var(--border-soft)", paddingTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              <span className="field-label">Add a habit</span>
              <input className="field" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Read 20 min" />
              <input className="field" value={newDetail} onChange={(e) => setNewDetail(e.target.value)} placeholder="Detail (optional)" />
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn solid" onClick={addHabit} disabled={!newName.trim()}>
                  + Add
                </button>
                {habitsList && (
                  <button className="btn ghost" onClick={() => setHabitsList(null)}>
                    Reset to defaults
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
