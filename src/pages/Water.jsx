import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTrackerCtx } from "../context/TrackerContext";
import { WATER_GOAL_ML_DEFAULT, WATER_QUICK_ADDS } from "../data/constants";

const fmtTime = (ts) => new Date(ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

export default function Water() {
  const { selected, recordFor, updateRecord, today, waterGoalMl, setWaterGoalMl } = useTrackerCtx();
  const rec = recordFor(selected);
  const water = rec.water || { ml: 0, log: [] };
  const goal = waterGoalMl || WATER_GOAL_ML_DEFAULT;
  const pct = Math.min(100, Math.round((water.ml / goal) * 100));
  const [customAmount, setCustomAmount] = useState("");
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(String(goal));

  const addWater = (amount) => {
    if (!amount || amount <= 0) return;
    const entry = { amount, ts: new Date().toISOString() };
    updateRecord(selected, { water: { ml: water.ml + amount, log: [...water.log, entry] } });
  };

  const removeEntry = (idx) => {
    const entry = water.log[idx];
    const log = water.log.filter((_, i) => i !== idx);
    updateRecord(selected, { water: { ml: Math.max(0, water.ml - entry.amount), log } });
  };

  const saveGoal = () => {
    const n = parseInt(goalInput, 10);
    if (n > 0) setWaterGoalMl(n);
    setEditingGoal(false);
  };

  return (
    <>
      <Link to="/" className="back-link">
        ← Today
      </Link>
      <div className="page-title-row">
        <h2 className="disp page-title">Water</h2>
        <span style={{ fontSize: 12, color: pct >= 100 ? "var(--gold)" : "var(--text-dim)", fontWeight: 600 }}>
          {pct >= 100 ? "GOAL MET" : `${pct}%`}
        </span>
      </div>
      {selected !== today && (
        <div className="card-sub" style={{ marginBottom: 12 }}>
          Editing {selected} — not today
        </div>
      )}

      <div className="card">
        <div className="card-body">
          <div className="bottle-wrap">
            <div className="bottle">
              <span className="bottle-cap" />
              <div className="bottle-fill" style={{ height: `${pct}%` }} />
            </div>
            <div className="bottle-stats">
              <div className="disp bottle-ml">{(water.ml / 1000).toFixed(2)}L</div>
              {editingGoal ? (
                <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                  <input
                    className="field"
                    style={{ width: 90, padding: "6px 8px" }}
                    type="number"
                    value={goalInput}
                    onChange={(e) => setGoalInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveGoal()}
                  />
                  <button className="btn" style={{ padding: "6px 10px" }} onClick={saveGoal}>
                    Save
                  </button>
                </div>
              ) : (
                <button
                  className="bottle-goal"
                  style={{ background: "none", border: "none", padding: 0, textDecoration: "underline" }}
                  onClick={() => {
                    setGoalInput(String(goal));
                    setEditingGoal(true);
                  }}
                >
                  goal {(goal / 1000).toFixed(1)}L — edit
                </button>
              )}
            </div>
          </div>

          <div className="meter-track" style={{ marginTop: 16 }}>
            <div className="meter-fill" style={{ width: `${pct}%` }} />
          </div>

          <div className="chip-row" style={{ marginTop: 16 }}>
            {WATER_QUICK_ADDS.map((ml) => (
              <button key={ml} className="btn" onClick={() => addWater(ml)}>
                + {ml}ml
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <input
              className="field"
              type="number"
              placeholder="custom ml"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  addWater(parseInt(customAmount, 10));
                  setCustomAmount("");
                }
              }}
            />
            <button
              className="btn"
              onClick={() => {
                addWater(parseInt(customAmount, 10));
                setCustomAmount("");
              }}
            >
              Add
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head card-head-top">
          <span className="card-title" style={{ fontSize: 14 }}>
            Today's log
          </span>
          <span className="card-sub" style={{ marginTop: 0 }}>
            {water.log.length} entr{water.log.length === 1 ? "y" : "ies"}
          </span>
        </div>
        {water.log.length === 0 ? (
          <div className="empty-note">Nothing logged yet — tap a quick-add above whenever you drink.</div>
        ) : (
          [...water.log]
            .map((e, i) => ({ ...e, i }))
            .reverse()
            .map((e) => (
              <div key={e.i} className="water-log-row">
                <span className="water-log-time">{fmtTime(e.ts)}</span>
                <span>+{e.amount}ml</span>
                <button className="water-log-remove" onClick={() => removeEntry(e.i)}>
                  remove
                </button>
              </div>
            ))
        )}
      </div>
    </>
  );
}
