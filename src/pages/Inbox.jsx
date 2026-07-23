import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTrackerCtx } from "../context/TrackerContext";
import { useLeaderboard } from "../hooks/useLeaderboard";

function fmtWhen(ts) {
  const ms = ts?.toMillis?.();
  if (!ms) return "sending…";
  const d = new Date(ms);
  const sameDay = d.toDateString() === new Date().toDateString();
  return sameDay
    ? d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    : d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function Inbox() {
  const location = useLocation();
  const preset = location.state || {};
  const { uid, playerName, received, sent, unreadCount, sendItem, markRead, markDone, remove } = useTrackerCtx();
  const { players } = useLeaderboard();

  const rivals = players.filter((p) => p.id !== uid);
  const [toUid, setToUid] = useState(preset.toUid || (rivals[0] && rivals[0].id) || "");
  const [type, setType] = useState("message");
  const [text, setText] = useState(preset.text || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const send = async () => {
    if (!text.trim() || !toUid) return;
    const rival = rivals.find((r) => r.id === toUid);
    if (!rival) return;
    if (!uid) {
      setError("Not signed in — if you're on the Home Screen icon, open it and sign in there directly first.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      await sendItem({ fromUid: uid, fromName: playerName, toUid, toName: rival.name, type, text });
      setText("");
    } catch (err) {
      setError(`Couldn't send (${err.code || err.message || "unknown error"}).`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Link to="/" className="back-link">
        ← Today
      </Link>
      <div className="page-title-row">
        <h2 className="disp page-title">Inbox</h2>
        {unreadCount > 0 && <span className="msg-badge unread">{unreadCount} new</span>}
      </div>
      <div className="card-sub" style={{ marginBottom: 14 }}>
        Send a training partner a message, or a task to hold them to.
      </div>

      {rivals.length === 0 ? (
        <div className="card">
          <div className="empty-note">
            Nobody else has joined yet. Once a training partner creates an account, they'll show up here to message.
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <span className="field-label">To</span>
              <select className="field" value={toUid} onChange={(e) => setToUid(e.target.value)}>
                {rivals.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="chip-row">
              <button className={"chip" + (type === "message" ? " active" : "")} onClick={() => setType("message")}>
                💬 Message
              </button>
              <button className={"chip" + (type === "task" ? " active" : "")} onClick={() => setType("task")}>
                ✅ Task
              </button>
            </div>
            <textarea
              className="field"
              rows={3}
              placeholder={type === "task" ? "e.g. Don't skip leg day tomorrow" : "e.g. Nice work today 💪"}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            {error && <div className="auth-error">{error}</div>}
            <button className="btn solid block" onClick={send} disabled={busy || !text.trim()}>
              {busy ? "Sending…" : `Send ${type === "task" ? "task" : "message"}`}
            </button>
          </div>
        </div>
      )}

      <div className="page-title-row" style={{ marginTop: 26, marginBottom: 8 }}>
        <span className="disp" style={{ fontSize: 13, letterSpacing: "0.08em", color: "var(--text-dim)" }}>
          Received
        </span>
      </div>
      {received.length === 0 ? (
        <div className="card">
          <div className="empty-note">Nothing yet.</div>
        </div>
      ) : (
        received.map((m) => (
          <div key={m.id} className="card">
            <div className="card-body msg-item">
              <div className="msg-meta">
                <span className={"msg-badge" + (m.type === "task" ? " task" : "")}>
                  {m.type === "task" ? "TASK" : "MSG"}
                </span>
                <span className="item-detail" style={{ margin: 0 }}>
                  from {m.fromName} · {fmtWhen(m.createdAt)}
                </span>
                {!m.read && <span className="msg-dot" />}
              </div>
              <p className={"msg-text" + (m.type === "task" && m.done ? " done" : "")}>{m.text}</p>
              <div className="chip-row">
                {m.type === "task" && (
                  <button className={"chip" + (m.done ? " active" : "")} onClick={() => markDone(m.id, !m.done)}>
                    {m.done ? "✓ Done" : "Mark done"}
                  </button>
                )}
                {!m.read && (
                  <button className="chip" onClick={() => markRead(m.id)}>
                    Mark read
                  </button>
                )}
                <button className="chip" onClick={() => remove(m.id)}>
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        ))
      )}

      <div className="page-title-row" style={{ marginTop: 26, marginBottom: 8 }}>
        <span className="disp" style={{ fontSize: 13, letterSpacing: "0.08em", color: "var(--text-dim)" }}>
          Sent
        </span>
      </div>
      {sent.length === 0 ? (
        <div className="card">
          <div className="empty-note">Nothing sent yet.</div>
        </div>
      ) : (
        sent.map((m) => (
          <div key={m.id} className="card">
            <div className="card-body msg-item">
              <div className="msg-meta">
                <span className={"msg-badge" + (m.type === "task" ? " task" : "")}>
                  {m.type === "task" ? "TASK" : "MSG"}
                </span>
                <span className="item-detail" style={{ margin: 0 }}>
                  to {m.toName} · {fmtWhen(m.createdAt)}
                </span>
              </div>
              <p className={"msg-text" + (m.type === "task" && m.done ? " done" : "")}>{m.text}</p>
              <span className="item-detail" style={{ color: m.read ? "var(--gold)" : "var(--text-faint)" }}>
                {m.type === "task" ? (m.done ? "✓ they marked it done" : m.read ? "seen" : "not seen yet") : m.read ? "read" : "unread"}
              </span>
            </div>
          </div>
        ))
      )}
    </>
  );
}
