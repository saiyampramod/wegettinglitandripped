import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTrackerCtx } from "../context/TrackerContext";
import { useLeaderboard } from "../hooks/useLeaderboard";
import { addDays, fromIso, iso, mondayOf, slug, statusFor, WATER_GOAL_ML_DEFAULT } from "../data/constants";

export default function Versus() {
  const { playerName, joinAs, records, waterGoalMl, today, firebaseReady } = useTrackerCtx();
  const { players, state } = useLeaderboard();
  const [nameInput, setNameInput] = useState("");

  const wkStart = mondayOf(fromIso(today));
  const wkDates = Array.from({ length: 7 }, (_, i) => iso(addDays(wkStart, i)));

  const scoreOf = (p) =>
    wkDates.reduce((sum, ds) => {
      const st = statusFor(p.records && p.records[ds], p.waterGoalMl || WATER_GOAL_ML_DEFAULT);
      if (!p.records || !p.records[ds]) return sum;
      return sum + (st.morning ? 1 : 0) + (st.gym ? 1 : 0) + (st.habits ? 1 : 0) + (st.water ? 1 : 0);
    }, 0);

  const pointsOf = (p, ds) => {
    if (!p.records || !p.records[ds]) return 0;
    const st = statusFor(p.records[ds], p.waterGoalMl || WATER_GOAL_ML_DEFAULT);
    return (st.morning ? 1 : 0) + (st.gym ? 1 : 0) + (st.habits ? 1 : 0) + (st.water ? 1 : 0);
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
      ) : !playerName ? (
        <div className="card">
          <div className="card-body">
            <p style={{ margin: "0 0 12px", fontSize: 13, color: "#b5afa2", lineHeight: 1.5 }}>
              Pick a name to join the scoreboard. Your name and daily progress become visible to everyone using this
              tracker, and your data syncs live across any device you sign into with this name.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                className="field"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && joinAs(nameInput)}
                placeholder="Your name"
              />
              <button className="btn solid" onClick={() => joinAs(nameInput)}>
                Join
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          {(() => {
            const me = { name: playerName, records, waterGoalMl, isMe: true };
            const others = players.filter((p) => slug(p.name || "") !== slug(playerName));
            const board = [me, ...others].map((p) => ({ ...p, score: scoreOf(p) })).sort((a, b) => b.score - a.score);
            if (state === "loading") return <div className="empty-note">Loading rivals…</div>;
            return board.map((p, i) => (
              <div key={(p.name || "player") + i} className={"lb-row" + (p.isMe ? " me" : "")}>
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
              </div>
            ));
          })()}
          <div style={{ padding: "10px 16px", fontSize: 11, color: "var(--text-faint)", lineHeight: 1.5 }}>
            Send your training partner the app link — once they join with their name, they show up here
            automatically, live.
          </div>
        </div>
      )}
    </>
  );
}
