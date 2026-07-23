import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTrackerCtx } from "../context/TrackerContext";
import { useLeaderboard } from "../hooks/useLeaderboard";
import { addDays, fromIso, iso, mondayOf, statusFor, WATER_GOAL_ML_DEFAULT } from "../data/constants";

const CATS = [
  { key: "morning", icon: "🌅", label: "Morning" },
  { key: "gym", icon: "🏋️", label: "Gym" },
  { key: "water", icon: "💧", label: "Water" },
  { key: "habits", icon: "⚡", label: "Habits" },
];
const DOW = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export default function Versus() {
  const { playerName, uid, records, waterGoalMl, habitsList, splitOverrides, morningList, today, firebaseReady } =
    useTrackerCtx();
  const { players, state } = useLeaderboard();
  const [expanded, setExpanded] = useState(null);
  const navigate = useNavigate();

  const wkStart = mondayOf(fromIso(today));
  const wkDates = Array.from({ length: 7 }, (_, i) => iso(addDays(wkStart, i)));

  // Every player is scored against their OWN customized habits/split/goal.
  const statusOf = (p, ds) =>
    statusFor(p.records && p.records[ds], {
      waterGoalMl: p.waterGoalMl || WATER_GOAL_ML_DEFAULT,
      habitsList: p.habitsList || undefined,
      splitOverrides: p.splitOverrides || undefined,
      morningList: p.morningList || undefined,
    });

  const scoreOf = (p) =>
    wkDates.reduce((sum, ds) => {
      if (!p.records || !p.records[ds]) return sum;
      const st = statusOf(p, ds);
      return sum + (st.morning ? 1 : 0) + (st.gym ? 1 : 0) + (st.habits ? 1 : 0) + (st.water ? 1 : 0);
    }, 0);

  const pointsOf = (p, ds) => {
    if (!p.records || !p.records[ds]) return 0;
    const st = statusOf(p, ds);
    return (st.morning ? 1 : 0) + (st.gym ? 1 : 0) + (st.habits ? 1 : 0) + (st.water ? 1 : 0);
  };

  // How many of the past days (up to and including today) each category was missed.
  const missesOf = (p) => {
    const counts = { morning: 0, gym: 0, water: 0, habits: 0 };
    wkDates.filter((ds) => ds <= today).forEach((ds) => {
      const st = statusOf(p, ds);
      CATS.forEach((c) => {
        if (!st[c.key]) counts[c.key]++;
      });
    });
    return counts;
  };

  const hitCountOf = (p, key) =>
    wkDates.filter((ds) => ds <= today).filter((ds) => statusOf(p, ds)[key]).length;

  return (
    <>
      <Link to="/" className="back-link">
        ← Today
      </Link>
      <div className="page-title-row">
        <h2 className="disp page-title">Versus</h2>
        {firebaseReady && (
          <span className="live-badge">
            <span className="live-dot" /> live
          </span>
        )}
      </div>
      <div className="card-sub" style={{ marginBottom: 12 }}>
        Weekly score · morning + gym + water + habits = 4 pts/day, 28/week max
      </div>

      {!firebaseReady ? (
        <div className="card">
          <div className="empty-note">
            Live sync isn't configured yet — this build is running against local storage only. Add your Firebase
            project keys to <code>.env.local</code> (see the README) to turn this into a real shared leaderboard
            with your training partners.
          </div>
        </div>
      ) : (
        <div className="card">
          {(() => {
            const me = {
              id: uid,
              name: playerName,
              records,
              waterGoalMl,
              habitsList,
              splitOverrides,
              morningList,
              isMe: true,
            };
            const myScore = scoreOf(me);
            const others = players.filter((p) => p.id !== uid);
            const board = [me, ...others].map((p) => ({ ...p, score: scoreOf(p) })).sort((a, b) => b.score - a.score);
            if (state === "loading") return <div className="empty-note">Loading rivals…</div>;
            return board.map((p, i) => {
              const id = p.id || p.name || `player-${i}`;
              const isOpen = expanded === id;
              const misses = isOpen ? missesOf(p) : null;
              return (
                <div key={id}>
                  <button
                    className={"lb-row" + (p.isMe ? " me" : "")}
                    style={{ width: "100%", background: "none", border: "none", cursor: "pointer" }}
                    onClick={() => setExpanded(isOpen ? null : id)}
                  >
                    <span className={"lb-rank" + (i === 0 ? " first" : "")}>{i + 1}</span>
                    <span className={"lb-name" + (p.isMe ? " me" : "")}>
                      {p.name} {p.isMe ? "(you)" : ""}
                    </span>
                    <span className="lb-dots">
                      {wkDates.map((ds) => {
                        const pts = pointsOf(p, ds);
                        return (
                          <span
                            key={ds}
                            className={"lb-dot" + (pts === 4 ? " full" : pts > 0 ? " partial" : "")}
                            title={`${ds}: ${pts}/4`}
                          />
                        );
                      })}
                    </span>
                    <span className={"lb-score" + (i === 0 ? " first" : "")}>
                      {p.score}
                      <span className="lb-score-max">/28</span>
                    </span>
                    <span className="lb-caret">{isOpen ? "▾" : "▸"}</span>
                  </button>

                  {isOpen && !p.isMe && (
                    <div className="vs-card">
                      <div className="vs-card-head">
                        <span className="vs-col-name">You</span>
                        <span className="vs-vs">VS</span>
                        <span className="vs-col-name">{p.name}</span>
                      </div>
                      <div className="vs-row">
                        <span className="vs-val">{myScore}</span>
                        <span className="vs-label">Score /28</span>
                        <span className="vs-val">{p.score}</span>
                      </div>
                      {CATS.map((c) => (
                        <div className="vs-row" key={c.key}>
                          <span className="vs-val">{hitCountOf(me, c.key)}</span>
                          <span className="vs-label">
                            {c.icon} {c.label}
                          </span>
                          <span className="vs-val">{hitCountOf(p, c.key)}</span>
                        </div>
                      ))}
                      <div className="vs-verdict">
                        {myScore > p.score
                          ? `You're ahead by ${myScore - p.score}`
                          : myScore < p.score
                          ? `${p.name} is ahead by ${p.score - myScore}`
                          : "Tied up"}
                      </div>
                      <button
                        className="btn block"
                        style={{ marginTop: 10 }}
                        onClick={() => navigate("/inbox", { state: { toUid: p.id } })}
                      >
                        ✉️ Send {p.name} something
                      </button>
                    </div>
                  )}

                  {isOpen && (
                    <div className="lb-detail">
                      {wkDates.map((ds) => {
                        const st = statusOf(p, ds);
                        const hasRecord = !!(p.records && p.records[ds]);
                        const isFuture = ds > today;
                        return (
                          <div key={ds} className="lb-detail-row">
                            <span className="lb-detail-day">
                              {DOW[(fromIso(ds).getDay() + 6) % 7]} {fromIso(ds).getDate()}
                            </span>
                            <span className="lb-detail-icons">
                              {isFuture ? (
                                <span className="lb-detail-future">—</span>
                              ) : (
                                CATS.map((c) => (
                                  <span
                                    key={c.key}
                                    className={"lb-detail-icon" + (st[c.key] ? " hit" : " miss")}
                                    title={`${c.label}: ${st[c.key] ? "done" : "missed"}`}
                                  >
                                    {c.icon}
                                  </span>
                                ))
                              )}
                            </span>
                            {!isFuture && !hasRecord && <span className="lb-detail-note">no activity logged</span>}
                          </div>
                        );
                      })}
                      <div className="lb-miss-summary">
                        {CATS.map((c) =>
                          misses[c.key] > 0 ? (
                            <span key={c.key} className="chip" style={{ borderColor: "var(--danger)", color: "var(--danger)" }}>
                              {c.icon} {c.label} missed {misses[c.key]}×
                            </span>
                          ) : null
                        )}
                        {CATS.every((c) => misses[c.key] === 0) && (
                          <span className="chip active">Clean week so far</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            });
          })()}
          <div style={{ padding: "10px 16px", fontSize: 11, color: "var(--text-faint)", lineHeight: 1.5 }}>
            Send your training partner the app link — once they create an account, they show up here automatically,
            live. Tap anyone's row to see exactly what they've missed this week.
          </div>
        </div>
      )}
    </>
  );
}
