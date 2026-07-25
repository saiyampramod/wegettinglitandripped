import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTrackerCtx } from "../context/TrackerContext";
import { useLeaderboard } from "../hooks/useLeaderboard";

function fmtTime(ts) {
  const ms = ts?.toMillis?.();
  if (!ms) return "";
  const d = new Date(ms);
  const sameDay = d.toDateString() === new Date().toDateString();
  return sameDay
    ? d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    : d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function Inbox() {
  const location = useLocation();
  const preset = location.state || {};
  const { uid, playerName, received, sent, sendItem, markRead, markDone, remove } = useTrackerCtx();
  const { players } = useLeaderboard();
  const rivals = players.filter((p) => p.id !== uid);

  const [activeUid, setActiveUid] = useState(preset.toUid || null);
  const [text, setText] = useState(preset.text || "");
  const [asTask, setAsTask] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef(null);

  const threadWith = (otherUid) =>
    [...received.filter((m) => m.fromUid === otherUid), ...sent.filter((m) => m.toUid === otherUid)].sort(
      (a, b) => (a.createdAt?.toMillis?.() || 0) - (b.createdAt?.toMillis?.() || 0)
    );

  const conversations = rivals
    .map((r) => {
      const msgs = threadWith(r.id);
      const last = msgs[msgs.length - 1];
      const unread = received.filter((m) => m.fromUid === r.id && !m.read).length;
      return { rival: r, msgs, last, unread };
    })
    .sort((a, b) => (b.last?.createdAt?.toMillis?.() || 0) - (a.last?.createdAt?.toMillis?.() || 0));

  const activeRival = rivals.find((r) => r.id === activeUid);
  const activeMsgs = activeUid ? threadWith(activeUid) : [];

  // Opening a thread marks whatever's unread in it as read.
  useEffect(() => {
    if (!activeUid) return;
    received.filter((m) => m.fromUid === activeUid && !m.read).forEach((m) => markRead(m.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeUid, received]);

  // Always show the latest message, like a real texting app.
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [activeMsgs.length, activeUid]);

  const send = async () => {
    if (!text.trim()) return;
    if (!activeUid || !activeRival) {
      setError("Pick someone to message first.");
      return;
    }
    if (!uid) {
      setError("Not signed in — if you're on the Home Screen icon, open it and sign in there directly first.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      await sendItem({
        fromUid: uid,
        fromName: playerName,
        toUid: activeUid,
        toName: activeRival.name,
        type: asTask ? "task" : "message",
        text,
      });
      setText("");
    } catch (err) {
      setError(`Couldn't send (${err.code || err.message || "unknown error"}).`);
    } finally {
      setBusy(false);
    }
  };

  if (!activeUid) {
    return (
      <>
        <Link to="/" className="back-link">
          ← Today
        </Link>
        <div className="page-title-row">
          <h2 className="disp page-title">Inbox</h2>
        </div>
        {rivals.length === 0 ? (
          <div className="card">
            <div className="empty-note">
              Nobody else has joined yet. Once a training partner creates an account, they'll show up here to message.
            </div>
          </div>
        ) : (
          <div className="card">
            {conversations.map(({ rival, last, unread }) => (
              <button key={rival.id} className="convo-row" onClick={() => setActiveUid(rival.id)}>
                <span className="convo-avatar">{(rival.name || "?")[0]?.toUpperCase()}</span>
                <span className="convo-body">
                  <span className="convo-top">
                    <span className="convo-name">{rival.name}</span>
                    {last && <span className="convo-time">{fmtTime(last.createdAt)}</span>}
                  </span>
                  <span className="convo-preview">
                    {last ? `${last.fromUid === uid ? "You: " : ""}${last.text}` : "No messages yet — say hi"}
                  </span>
                </span>
                {unread > 0 && <span className="tab-badge">{unread}</span>}
              </button>
            ))}
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <button onClick={() => setActiveUid(null)} className="back-link" style={{ background: "none", border: "none" }}>
        ← Inbox
      </button>
      <div className="page-title-row">
        <h2 className="disp page-title">{activeRival ? activeRival.name : "…"}</h2>
      </div>

      <div className="chat-thread" ref={scrollRef}>
        {activeMsgs.length === 0 && <div className="empty-note">No messages yet — say hi 👋</div>}
        {activeMsgs.map((m) => {
          const mine = m.fromUid === uid;
          return (
            <div key={m.id} className={"bubble-row" + (mine ? " mine" : "")}>
              <div className={"bubble" + (mine ? " mine" : " theirs") + (m.type === "task" ? " task" : "")}>
                <button className="bubble-remove" onClick={() => remove(m.id)} aria-label="Remove">
                  ✕
                </button>
                {m.type === "task" && <span className="bubble-task-label">✅ Task</span>}
                <span className="bubble-text">{m.text}</span>
                {m.type === "task" && !mine && (
                  <button className={"chip" + (m.done ? " active" : "")} onClick={() => markDone(m.id, !m.done)}>
                    {m.done ? "✓ Done" : "Mark done"}
                  </button>
                )}
                <span className="bubble-meta">
                  {fmtTime(m.createdAt)}
                  {m.type === "task" && mine ? (m.done ? " · done" : m.read ? " · seen" : "") : ""}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="auth-error" style={{ margin: "8px 0" }}>
          {error}
        </div>
      )}
      <div className="chat-compose">
        <button
          className={"chip" + (asTask ? " active" : "")}
          onClick={() => setAsTask((v) => !v)}
          title="Send as a task instead of a message"
        >
          ✅
        </button>
        <input
          className="field"
          placeholder={asTask ? "Task for them…" : "Message…"}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button className="btn solid" onClick={send} disabled={busy || !text.trim()}>
          {busy ? "…" : "Send"}
        </button>
      </div>
    </>
  );
}
