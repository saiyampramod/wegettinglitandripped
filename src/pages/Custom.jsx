import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTrackerCtx } from "../context/TrackerContext";
import { addDays, fromIso, iso } from "../data/constants";

const ICONS = ["🎯", "📚", "🧘", "🥗", "☀️", "🚭", "💊", "🧠", "🪥", "📵"];

function daysUntil(dateStr, today) {
  const diff = Math.round((fromIso(dateStr) - fromIso(today)) / 86400000);
  if (diff === 0) return "today";
  if (diff < 0) return `${Math.abs(diff)}d overdue`;
  return `in ${diff}d`;
}

function TrackerCard({ tracker, value, onAdd, onRemove }) {
  const target = tracker.dailyTarget || 1;
  const pct = Math.min(100, Math.round((value / target) * 100));
  const done = value >= target;
  return (
    <div className="card">
      <div className="card-head card-head-top">
        <span className="card-title" style={{ fontSize: 15 }}>
          <span>{tracker.icon}</span> {tracker.name}
        </span>
        <button className="water-log-remove" onClick={onRemove}>
          remove
        </button>
      </div>
      <div className="card-body">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span className="disp meter-value" style={{ color: done ? "var(--gold)" : "var(--text)" }}>
            {value}
            {tracker.unit ? ` ${tracker.unit}` : ""}
          </span>
          <span className="meter-goal">
            target {target}
            {tracker.unit ? ` ${tracker.unit}` : ""}
          </span>
        </div>
        <div className="meter-track" style={{ marginTop: 10 }}>
          <div className="meter-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="chip-row" style={{ marginTop: 12 }}>
          <button className="btn" onClick={() => onAdd(tracker.step || 1)}>
            + {tracker.step || 1}
            {tracker.unit ? ` ${tracker.unit}` : ""}
          </button>
          {value > 0 && (
            <button className="btn ghost" onClick={() => onAdd(-(tracker.step || 1))}>
              − {tracker.step || 1}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function AddTrackerForm({ onAdd, onClose }) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState(ICONS[0]);
  const [unit, setUnit] = useState("");
  const [target, setTarget] = useState("1");
  const [step, setStep] = useState("1");

  const submit = () => {
    if (!name.trim()) return;
    onAdd({
      id: `ct-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: name.trim(),
      icon,
      unit: unit.trim(),
      dailyTarget: parseFloat(target) || 1,
      step: parseFloat(step) || 1,
    });
    onClose();
  };

  return (
    <div className="card">
      <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <span className="field-label">Icon</span>
          <div className="chip-row">
            {ICONS.map((i) => (
              <button key={i} className={"chip" + (icon === i ? " active" : "")} onClick={() => setIcon(i)}>
                {i}
              </button>
            ))}
          </div>
        </div>
        <div>
          <span className="field-label">Name</span>
          <input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Read pages" />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <span className="field-label">Daily target</span>
            <input className="field" type="number" value={target} onChange={(e) => setTarget(e.target.value)} />
          </div>
          <div style={{ flex: 1 }}>
            <span className="field-label">Step size</span>
            <input className="field" type="number" value={step} onChange={(e) => setStep(e.target.value)} />
          </div>
        </div>
        <div>
          <span className="field-label">Unit (optional)</span>
          <input className="field" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="pages, min, cups…" />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn solid block" onClick={submit}>
            Add tracker
          </button>
          <button className="btn ghost" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function AddMilestoneForm({ onAdd, onClose, today }) {
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [targetDate, setTargetDate] = useState(iso(addDays(fromIso(today), 30)));

  const submit = () => {
    if (!name.trim()) return;
    onAdd({
      id: `ms-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: name.trim(),
      note: note.trim(),
      targetDate,
      done: false,
      createdAt: today,
    });
    onClose();
  };

  return (
    <div className="card">
      <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <span className="field-label">Milestone</span>
          <input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Bench bodyweight" />
        </div>
        <div>
          <span className="field-label">Note (optional)</span>
          <input className="field" value={note} onChange={(e) => setNote(e.target.value)} placeholder="details…" />
        </div>
        <div>
          <span className="field-label">Target date</span>
          <input className="field" type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn solid block" onClick={submit}>
            Add milestone
          </button>
          <button className="btn ghost" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Custom() {
  const {
    selected,
    today,
    recordFor,
    updateRecord,
    customTrackers,
    addCustomTracker,
    removeCustomTracker,
    milestones,
    addMilestone,
    updateMilestone,
    removeMilestone,
  } = useTrackerCtx();
  const rec = recordFor(selected);
  const [addingTracker, setAddingTracker] = useState(false);
  const [addingMilestone, setAddingMilestone] = useState(false);

  const adjustTracker = (id, delta) => {
    const cur = (rec.custom && rec.custom[id]) || { value: 0, log: [] };
    const value = Math.max(0, cur.value + delta);
    updateRecord(selected, { custom: { ...rec.custom, [id]: { ...cur, value } } });
  };

  const sortedMilestones = [...milestones].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    return a.targetDate.localeCompare(b.targetDate);
  });

  return (
    <>
      <Link to="/" className="back-link">
        ← Today
      </Link>
      <div className="page-title-row">
        <h2 className="disp page-title">Custom</h2>
      </div>
      {selected !== today && (
        <div className="card-sub" style={{ marginBottom: 12 }}>
          Editing {selected} — not today
        </div>
      )}

      <div className="page-title-row" style={{ marginBottom: 8 }}>
        <span className="disp" style={{ fontSize: 13, letterSpacing: "0.08em", color: "var(--text-dim)" }}>
          Your trackers
        </span>
        <button className="btn" style={{ padding: "6px 12px" }} onClick={() => setAddingTracker((v) => !v)}>
          {addingTracker ? "Close" : "+ Add"}
        </button>
      </div>
      {addingTracker && <AddTrackerForm onAdd={addCustomTracker} onClose={() => setAddingTracker(false)} />}
      {customTrackers.length === 0 && !addingTracker && (
        <div className="card">
          <div className="empty-note">
            No custom trackers yet. Add anything you want to hold yourself to daily — reading, screen time, meds,
            steps — whatever isn't covered above.
          </div>
        </div>
      )}
      {customTrackers.map((t) => (
        <TrackerCard
          key={t.id}
          tracker={t}
          value={(rec.custom && rec.custom[t.id] && rec.custom[t.id].value) || 0}
          onAdd={(delta) => adjustTracker(t.id, delta)}
          onRemove={() => removeCustomTracker(t.id)}
        />
      ))}

      <div className="page-title-row" style={{ marginTop: 26, marginBottom: 8 }}>
        <span className="disp" style={{ fontSize: 13, letterSpacing: "0.08em", color: "var(--text-dim)" }}>
          Milestones
        </span>
        <button className="btn" style={{ padding: "6px 12px" }} onClick={() => setAddingMilestone((v) => !v)}>
          {addingMilestone ? "Close" : "+ Add"}
        </button>
      </div>
      {addingMilestone && (
        <AddMilestoneForm onAdd={addMilestone} onClose={() => setAddingMilestone(false)} today={today} />
      )}
      {milestones.length === 0 && !addingMilestone && (
        <div className="card">
          <div className="empty-note">No milestones yet. Set a one-off goal with a target date — a lift PR, a race, a body-weight target.</div>
        </div>
      )}
      {sortedMilestones.map((m) => (
        <div key={m.id} className="card">
          <div style={{ display: "flex", alignItems: "center" }}>
            <button
              onClick={() => updateMilestone(m.id, { done: !m.done })}
              className={"task-row" + (m.done ? " done" : "")}
              style={{ borderBottom: "none", flex: 1 }}
              aria-pressed={m.done}
            >
              <span style={{ flex: 1 }}>
                <span className="item-name" style={{ fontSize: 15, fontWeight: 600 }}>
                  {m.name}
                </span>
                {m.note && <span className="item-detail">{m.note}</span>}
                <span className="item-detail" style={{ color: "var(--gold)" }}>
                  {m.done ? `hit it · ${m.targetDate}` : `${daysUntil(m.targetDate, today)} · ${m.targetDate}`}
                </span>
              </span>
              {m.done ? <span className="done-chip">Hit</span> : <span className="todo-dot" />}
            </button>
            <button className="water-log-remove" style={{ padding: "0 14px" }} onClick={() => removeMilestone(m.id)}>
              remove
            </button>
          </div>
        </div>
      ))}
    </>
  );
}
