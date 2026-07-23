import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTrackerCtx } from "../context/TrackerContext";
import {
  notificationsSupported,
  permissionState,
  requestPermission,
  sendTestNotification,
} from "../hooks/useReminderEngine";

const ROWS = [
  {
    key: "water",
    icon: "💧",
    title: "Water",
    desc: "Repeats every N minutes until today's goal is hit.",
    kind: "interval",
  },
  {
    key: "morning",
    icon: "🌅",
    title: "Morning routine",
    desc: "One nudge if it's not done by this time.",
    kind: "time",
  },
  { key: "gym", icon: "🏋️", title: "Gym", desc: "One nudge if today's session isn't logged by this time.", kind: "time" },
  {
    key: "custom",
    icon: "🎯",
    title: "Custom & milestones",
    desc: "Evening summary of trackers still short of target and milestones due within 3 days.",
    kind: "time",
  },
];

export default function Reminders() {
  const { reminders, updateReminders } = useTrackerCtx();
  const [permission, setPermission] = useState(permissionState());

  const enableNotifications = async () => {
    const result = await requestPermission();
    setPermission(result);
  };

  const supported = notificationsSupported();
  const granted = permission === "granted";

  return (
    <>
      <Link to="/" className="back-link">
        ← Today
      </Link>
      <div className="page-title-row">
        <h2 className="disp page-title">Reminders</h2>
      </div>
      <div className="card-sub" style={{ marginBottom: 14 }}>
        In-app browser notifications — fire only while this tab is open, no account or server needed.
      </div>

      {!supported ? (
        <div className="card">
          <div className="empty-note">This browser doesn't support notifications.</div>
        </div>
      ) : !granted ? (
        <div className="card">
          <div className="card-body">
            <p style={{ margin: "0 0 12px", fontSize: 13, color: "#b5afa2", lineHeight: 1.5 }}>
              {permission === "denied"
                ? "Notifications are blocked for this site. Re-enable them in your browser's site settings, then reload."
                : "Turn on notifications to let any of the reminders below actually fire."}
            </p>
            {permission !== "denied" && (
              <button className="btn solid block" onClick={enableNotifications}>
                Enable notifications
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-body" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="live-badge">
              <span className="live-dot" /> notifications on
            </span>
            <button className="btn" style={{ padding: "6px 12px" }} onClick={sendTestNotification}>
              Send test
            </button>
          </div>
        </div>
      )}

      {ROWS.map((row) => {
        const cfg = reminders[row.key];
        return (
          <div className="card" key={row.key}>
            <div className="card-head card-head-top">
              <span className="card-title" style={{ fontSize: 15 }}>
                <span>{row.icon}</span> {row.title}
              </span>
              <button
                className={"chip" + (cfg.enabled ? " active" : "")}
                disabled={!granted}
                onClick={() => updateReminders(row.key, { enabled: !cfg.enabled })}
              >
                {cfg.enabled ? "ON" : "OFF"}
              </button>
            </div>
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <span className="card-sub" style={{ marginTop: 0 }}>
                {row.desc}
              </span>
              {row.kind === "interval" ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="field-label" style={{ marginBottom: 0 }}>
                    every
                  </span>
                  <input
                    className="field"
                    style={{ width: 80 }}
                    type="number"
                    min="5"
                    value={cfg.intervalMin}
                    onChange={(e) => updateReminders(row.key, { intervalMin: parseInt(e.target.value, 10) || 60 })}
                  />
                  <span className="field-label" style={{ marginBottom: 0 }}>
                    minutes
                  </span>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="field-label" style={{ marginBottom: 0 }}>
                    after
                  </span>
                  <input
                    className="field"
                    style={{ width: 120 }}
                    type="time"
                    value={cfg.time}
                    onChange={(e) => updateReminders(row.key, { time: e.target.value })}
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}
