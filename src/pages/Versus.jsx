import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTrackerCtx } from "../context/TrackerContext";
import { useLeaderboard } from "../hooks/useLeaderboard";
import { addDays, fromIso, iso, mondayOf, pointsFor, statusFor, streakFor, WATER_GOAL_ML_DEFAULT } from "../data/constants";

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
  const livedDates = wkDates.filter((ds) => ds <= today);

  // Every player is scored against their OWN customized habits/split/goal.
  const profileOf = (p) => ({
    waterGoalMl: p.waterGoalMl || WATER_GOAL_ML_DEFAULT,
    habitsList: p.habitsList || undefined,
    splitOverrides: p.splitOverrides || undefined,
    morningList: p.morningList || undefined,
  });

  const statusOf = (p, ds) => statusFor(p.records && p.records[ds], profileOf(p));

  // Every individual task carries its own point — a morning stretch, one
  // exercise, one habit, a quarter of the water goal — instead of only
  // paying out once a whole category is fully cleared.
  const pointsOf = (p, ds) => pointsFor(p.records && p.records[ds], profileOf(p));

  const totalsOf = (p) =>
    livedDates.reduce(
      (sum, ds) => {
        const pts = pointsOf(p, ds);
        sum.total += pts.total;
        sum.max += pts.max;
        CATS.forEach((c) => (sum[c.key] += pts[c.key]));
        return sum;
      },
      { total: 0, max: 0, morning: 0, gym: 0, water: 0, habits: 0 }
    );

  const streakOf = (p) => streakFor(p.records || {}, profileOf(p), today);

  // How many of the past days (up to and including today) each category was missed.
  const missesOf = (p) => {
    const counts = { morning: 0, gym: 0, water: 0, habits: 0 };
    livedDates.forEach((ds) => {
      const st = statusOf(p, ds);
      CATS.forEach((c) => {
        if (!st[c.key]) counts[c.key]++;
      });
    });
    return counts;
  };

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
        Weekly score · every task pays out its own point — routine items, exercises, habits, water quarters, all of it
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
        (() => {
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
          const others = players.filter((p) => p.id !== uid);
          const board = [me, ...others]
            .map((p) => ({ ...p, totals: totalsOf(p), streak: streakOf(p) }))
            .sort((a, b) => b.totals.total - a.totals.total);
          const myTotals = board.find((p) => p.isMe).totals;
          const squadTotal = board.reduce((s, p) => s + p.totals.total, 0);

          // Who's leading each category across the whole board, for the crown strip.
          const catLeaders = CATS.map((c) => {
            const top = Math.max(...board.map((p) => p.totals[c.key]));
            const leaders = top > 0 ? board.filter((p) => p.totals[c.key] === top) : [];
            return { ...c, top, tied: leaders.length > 1, name: leaders.length === 1 ? leaders[0].name : null };
          });

          if (state === "loading") return <div className="card empty-note">Loading rivals…</div>;

          return (
            <>
              {board.length > 1 && (
                <div className="card" style={{ marginBottom: 12, padding: "12px 16px" }}>
                  <div className="card-sub" style={{ marginBottom: 8 }}>
                    This week, the crew put up <strong style={{ color: "var(--gold)" }}>{squadTotal}</strong> points
                    total
                  </div>
                  <div className="lb-miss-summary">
                    {catLeaders.map((c) => (
                      <span key={c.key} className="chip">
                        {c.icon} {c.label}: {c.top === 0 ? "no one yet" : c.tied ? "tied" : `👑 ${c.name}`}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="card">
                {board.map((p, i) => {
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
                          {p.streak > 0 && <span title={`${p.streak} day streak`}> 🔥{p.streak}</span>}
                        </span>
                        <span className="lb-dots">
                          {wkDates.map((ds) => {
                            const pts = pointsOf(p, ds);
                            return (
                              <span
                                key={ds}
                                className={
                                  "lb-dot" + (pts.max > 0 && pts.total >= pts.max ? " full" : pts.total > 0 ? " partial" : "")
                                }
                                title={`${ds}: ${pts.total}/${pts.max}`}
                              />
                            );
                          })}
                        </span>
                        <span className={"lb-score" + (i === 0 ? " first" : "")}>
                          {p.totals.total}
                          <span className="lb-score-max">/{p.totals.max}</span>
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
                            <span className="vs-val">{myTotals.total}</span>
                            <span className="vs-label">Points this week</span>
                            <span className="vs-val">{p.totals.total}</span>
                          </div>
                          {CATS.map((c) => (
                            <div className="vs-row" key={c.key}>
                              <span className="vs-val">{myTotals[c.key]}</span>
                              <span className="vs-label">
                                {c.icon} {c.label}
                              </span>
                              <span className="vs-val">{p.totals[c.key]}</span>
                            </div>
                          ))}
                          <div className="vs-row">
                            <span className="vs-val">🔥{streakOf(me)}</span>
                            <span className="vs-label">Streak</span>
                            <span className="vs-val">🔥{p.streak}</span>
                          </div>
                          <div className="vs-verdict">
                            {myTotals.total > p.totals.total
                              ? `You're ahead by ${myTotals.total - p.totals.total}`
                              : myTotals.total < p.totals.total
                              ? `${p.name} is ahead by ${p.totals.total - myTotals.total}`
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
                            const pts = pointsOf(p, ds);
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
                                        className={
                                          "lb-detail-icon" +
                                          (st[c.key] ? " hit" : pts[c.key] > 0 ? " partial" : " miss")
                                        }
                                        title={`${c.label}: ${pts[c.key]}/${pts[c.key + "Max"]}`}
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
                })}
                <div style={{ padding: "10px 16px", fontSize: 11, color: "var(--text-faint)", lineHeight: 1.5 }}>
                  Send your training partner the app link — once they create an account, they show up here
                  automatically, live. Tap anyone's row to see exactly what they've missed this week.
                </div>
              </div>
            </>
          );
        })()
      )}
    </>
  );
}
