import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTrackerCtx } from "../context/TrackerContext";
import { morningFor } from "../data/constants";

const newItemId = (phaseId) => `${phaseId}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

export default function Morning() {
  const { selected, recordFor, updateRecord, today, morningOverrides, setPhaseItems, resetMorningPhase } =
    useTrackerCtx();
  const rec = recordFor(selected);
  const [openPhases, setOpenPhases] = useState({ warmup: true });
  const [editing, setEditing] = useState(false);

  const phases = morningFor(morningOverrides);
  // An empty phase (e.g. a phase someone else's template includes but you
  // emptied out, or never added to) just clutters the checklist — hide it
  // outside edit mode, where it's still there to add to if you want it back.
  const visiblePhases = phases.filter((p) => editing || p.items.length > 0);
  const allIds = phases.flatMap((p) => p.items.map((i) => i.id));
  const count = allIds.filter((id) => rec.morning[id]).length;
  const pct = allIds.length ? Math.round((count / allIds.length) * 100) : 0;

  const toggle = (id) => updateRecord(selected, { morning: { ...rec.morning, [id]: !rec.morning[id] } });

  const editItem = (phase, itemId, patch) =>
    setPhaseItems(phase.id, phase.items.map((i) => (i.id === itemId ? { ...i, ...patch } : i)));
  const removeItem = (phase, itemId) => setPhaseItems(phase.id, phase.items.filter((i) => i.id !== itemId));
  const addItem = (phase) =>
    setPhaseItems(phase.id, [...phase.items, { id: newItemId(phase.id), name: "New item", detail: "" }]);

  return (
    <>
      <Link to="/" className="back-link">
        ← Today
      </Link>
      <div className="page-title-row">
        <h2 className="disp page-title">Morning Routine</h2>
        <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: pct === 100 ? "var(--gold)" : "var(--text-dim)", fontWeight: 600 }}>
            {pct === 100 ? "COMPLETE" : `${count}/${allIds.length}`}
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
          <div className="card-sub">Your routine — edit any phase to make it yours.</div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {visiblePhases.map((phase) => {
          const done = phase.items.filter((i) => rec.morning[i.id]).length;
          const open = editing || !!openPhases[phase.id];
          const customized = !!(morningOverrides && morningOverrides[phase.id]);
          return (
            <div key={phase.id} style={{ borderBottom: "1px solid var(--border-soft)" }}>
              <button
                onClick={() => !editing && setOpenPhases((p) => ({ ...p, [phase.id]: !p[phase.id] }))}
                className="row-btn"
                style={{ justifyContent: "space-between" }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="disp" style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.08em" }}>
                    {phase.phase}
                  </span>
                  <span className="chip">{phase.minutes} min</span>
                  {customized && <span className="chip active">custom</span>}
                </span>
                {!editing && (
                  <span style={{ fontSize: 11, color: done === phase.items.length ? "var(--gold)" : "var(--text-dim)" }}>
                    {done}/{phase.items.length} {open ? "▾" : "▸"}
                  </span>
                )}
              </button>

              {open && editing && (
                <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {phase.items.map((item) => (
                    <div key={item.id} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                        <input
                          className="field"
                          value={item.name}
                          onChange={(e) => editItem(phase, item.id, { name: e.target.value })}
                          placeholder="Item"
                        />
                        <input
                          className="field"
                          style={{ fontSize: 12 }}
                          value={item.detail || ""}
                          onChange={(e) => editItem(phase, item.id, { detail: e.target.value })}
                          placeholder="Detail (optional)"
                        />
                      </div>
                      <button className="btn danger" style={{ padding: "8px 10px" }} onClick={() => removeItem(phase, item.id)}>
                        ✕
                      </button>
                    </div>
                  ))}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button className="btn solid" onClick={() => addItem(phase)}>
                      + Add item
                    </button>
                    {customized && (
                      <button className="btn ghost" onClick={() => resetMorningPhase(phase.id)}>
                        Reset to default
                      </button>
                    )}
                  </div>
                </div>
              )}

              {open &&
                !editing &&
                phase.items.map((item) => {
                  const checked = !!rec.morning[item.id];
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggle(item.id)}
                      className={"task-row" + (checked ? " done" : "")}
                      aria-pressed={checked}
                    >
                      <span style={{ flex: 1 }}>
                        <span className="item-name">{item.name}</span>
                        {item.detail && <span className="item-detail">{item.detail}</span>}
                      </span>
                      {checked ? <span className="done-chip">Done</span> : <span className="todo-dot" />}
                    </button>
                  );
                })}
            </div>
          );
        })}
      </div>
    </>
  );
}
