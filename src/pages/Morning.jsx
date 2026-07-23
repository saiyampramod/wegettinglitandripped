import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTrackerCtx } from "../context/TrackerContext";
import { ALL_MORNING_IDS, MORNING } from "../data/constants";

export default function Morning() {
  const { selected, recordFor, updateRecord, today } = useTrackerCtx();
  const rec = recordFor(selected);
  const [openPhases, setOpenPhases] = useState({ warmup: true });

  const count = ALL_MORNING_IDS.filter((id) => rec.morning[id]).length;
  const pct = Math.round((count / ALL_MORNING_IDS.length) * 100);

  const toggle = (id) => updateRecord(selected, { morning: { ...rec.morning, [id]: !rec.morning[id] } });

  return (
    <>
      <Link to="/" className="back-link">
        ← Today
      </Link>
      <div className="page-title-row">
        <h2 className="disp page-title">Morning Routine</h2>
        <span style={{ fontSize: 12, color: pct === 100 ? "var(--gold)" : "var(--text-dim)", fontWeight: 600 }}>
          {pct === 100 ? "COMPLETE" : `${count}/${ALL_MORNING_IDS.length}`}
        </span>
      </div>
      {selected !== today && (
        <div className="card-sub" style={{ marginBottom: 12 }}>
          Editing {selected} — not today
        </div>
      )}

      <div className="card">
        <div className="card-head">
          <div className="card-sub">20 min · mobility · posture · pelvic floor</div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {MORNING.map((phase) => {
          const done = phase.items.filter((i) => rec.morning[i.id]).length;
          const open = !!openPhases[phase.id];
          return (
            <div key={phase.id} style={{ borderBottom: "1px solid var(--border-soft)" }}>
              <button
                onClick={() => setOpenPhases((p) => ({ ...p, [phase.id]: !p[phase.id] }))}
                className="row-btn"
                style={{ justifyContent: "space-between" }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="disp" style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.08em" }}>
                    {phase.phase}
                  </span>
                  <span className="chip">{phase.minutes} min</span>
                </span>
                <span style={{ fontSize: 11, color: done === phase.items.length ? "var(--gold)" : "var(--text-dim)" }}>
                  {done}/{phase.items.length} {open ? "▾" : "▸"}
                </span>
              </button>
              {open &&
                phase.items.map((item) => {
                  const checked = !!rec.morning[item.id];
                  return (
                    <button key={item.id} onClick={() => toggle(item.id)} className="row-btn">
                      <span className={"checkbox" + (checked ? " checked" : "")}>{checked ? "✓" : ""}</span>
                      <span style={{ flex: 1 }}>
                        <span className={"item-name" + (checked ? " checked" : "")}>{item.name}</span>
                        <span className="item-detail">{item.detail}</span>
                      </span>
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
