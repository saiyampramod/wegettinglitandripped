import React from "react";
import { Link } from "react-router-dom";
import { useTrackerCtx } from "../context/TrackerContext";
import { HABITS } from "../data/constants";

export default function Habits() {
  const { selected, recordFor, updateRecord, today } = useTrackerCtx();
  const rec = recordFor(selected);
  const habits = rec.habits || {};
  const count = HABITS.filter((h) => habits[h.id]).length;
  const pct = Math.round((count / HABITS.length) * 100);

  const toggle = (id) => updateRecord(selected, { habits: { ...habits, [id]: !habits[id] } });

  return (
    <>
      <Link to="/" className="back-link">
        ← Today
      </Link>
      <div className="page-title-row">
        <h2 className="disp page-title">Performance Habits</h2>
        <span style={{ fontSize: 12, color: pct === 100 ? "var(--gold)" : "var(--text-dim)", fontWeight: 600 }}>
          {pct === 100 ? "COMPLETE" : `${count}/${HABITS.length}`}
        </span>
      </div>
      {selected !== today && (
        <div className="card-sub" style={{ marginBottom: 12 }}>
          Editing {selected} — not today
        </div>
      )}

      <div className="card">
        <div className="card-head">
          <div className="card-sub">Sleep · training · nutrition · discipline</div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
        {HABITS.map((h) => {
          const checked = !!habits[h.id];
          return (
            <button
              key={h.id}
              onClick={() => toggle(h.id)}
              className="row-btn"
              style={{ borderBottom: "1px solid var(--border-soft)" }}
            >
              <span className={"checkbox" + (checked ? " checked" : "")}>{checked ? "✓" : ""}</span>
              <span style={{ flex: 1 }}>
                <span className={"item-name" + (checked ? " checked" : "")}>{h.name}</span>
                <span className="item-detail">{h.detail}</span>
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}
