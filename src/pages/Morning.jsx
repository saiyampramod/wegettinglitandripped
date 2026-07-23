import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTrackerCtx } from "../context/TrackerContext";
import { morningFor } from "../data/constants";

const newItemId = (phaseId) => `${phaseId}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
const newPhaseId = () => `phase-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

export default function Morning() {
  const { selected, recordFor, updateRecord, today, morningList, setMorningList } = useTrackerCtx();
  const rec = recordFor(selected);
  const [openPhases, setOpenPhases] = useState({ warmup: true });
  const [editing, setEditing] = useState(false);

  const list = morningFor(morningList);
  const isCustom = morningList !== null;
  // An empty phase just clutters the checklist outside edit mode — still
  // there to add to via Edit, just not shown as a dead section.
  const visiblePhases = list.filter((p) => editing || p.items.length > 0);
  const allIds = list.flatMap((p) => p.items.map((i) => i.id));
  const count = allIds.filter((id) => rec.morning[id]).length;
  const pct = allIds.length ? Math.round((count / allIds.length) * 100) : 0;

  const toggle = (id) => updateRecord(selected, { morning: { ...rec.morning, [id]: !rec.morning[id] } });
  const mutate = (nextList) => setMorningList(nextList);

  const editPhaseMeta = (phaseId, patch) => mutate(list.map((p) => (p.id === phaseId ? { ...p, ...patch } : p)));
  const removePhase = (phaseId) => mutate(list.filter((p) => p.id !== phaseId));
  const addPhase = () =>
    mutate([...list, { id: newPhaseId(), phase: "New phase", minutes: 1, items: [] }]);

  const editItem = (phase, itemId, patch) =>
    mutate(
      list.map((p) => (p.id !== phase.id ? p : { ...p, items: p.items.map((i) => (i.id === itemId ? { ...i, ...patch } : i)) }))
    );
  const removeItem = (phase, itemId) =>
    mutate(list.map((p) => (p.id !== phase.id ? p : { ...p, items: p.items.filter((i) => i.id !== itemId) })));
  const addItem = (phase) =>
    mutate(
      list.map((p) =>
        p.id !== phase.id ? p : { ...p, items: [...p.items, { id: newItemId(phase.id), name: "New item", detail: "" }] }
      )
    );

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
          <div className="card-sub">
            Fully yours — add a phase, remove one, rename anything.
            {isCustom && " (customized)"}
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {visiblePhases.map((phase) => {
          const done = phase.items.filter((i) => rec.morning[i.id]).length;
          const open = editing || !!openPhases[phase.id];
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
                </span>
                {!editing && (
                  <span style={{ fontSize: 11, color: done === phase.items.length ? "var(--gold)" : "var(--text-dim)" }}>
                    {done}/{phase.items.length} {open ? "▾" : "▸"}
                  </span>
                )}
              </button>

              {open && editing && (
                <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <span className="field-label">Phase name</span>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        className="field"
                        value={phase.phase}
                        onChange={(e) => editPhaseMeta(phase.id, { phase: e.target.value })}
                      />
                      <input
                        className="field"
                        type="number"
                        style={{ width: 70 }}
                        value={phase.minutes}
                        onChange={(e) => editPhaseMeta(phase.id, { minutes: parseInt(e.target.value, 10) || 0 })}
                      />
                    </div>
                  </div>
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
                    <button className="btn danger" onClick={() => removePhase(phase.id)}>
                      Remove this phase
                    </button>
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

        {editing && (
          <div className="card-body" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="btn solid" onClick={addPhase}>
              + Add phase
            </button>
            {isCustom && (
              <button className="btn ghost" onClick={() => setMorningList(null)}>
                Reset everything to default
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
