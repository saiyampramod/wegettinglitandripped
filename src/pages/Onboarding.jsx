import React, { useState } from "react";
import { useTrackerCtx } from "../context/TrackerContext";

export default function Onboarding() {
  const { completeOnboarding } = useTrackerCtx();
  const [busy, setBusy] = useState(null);

  const choose = (choice) => {
    setBusy(choice);
    completeOnboarding(choice);
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="brand-eyebrow" style={{ textAlign: "center" }}>
          Ripped &amp; Lit
        </div>
        <h1 className="disp brand-title" style={{ textAlign: "center", marginBottom: 6, fontSize: 22 }}>
          Set up your program
        </h1>
        <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-dim)", margin: "0 0 20px", lineHeight: 1.5 }}>
          You can change any of this later — nothing here is permanent.
        </p>

        <button
          className="btn solid block"
          style={{ marginBottom: 10, padding: "14px 16px" }}
          onClick={() => choose("template")}
          disabled={!!busy}
        >
          {busy === "template" ? "…" : "Use the built-in template"}
        </button>
        <p style={{ fontSize: 12, color: "var(--text-dim)", margin: "0 0 18px", lineHeight: 1.5 }}>
          A 7-day push/pull/legs split, a morning mobility routine, and a starter habits list — edit any of it
          whenever you want.
        </p>

        <button
          className="btn block"
          style={{ marginBottom: 10, padding: "14px 16px" }}
          onClick={() => choose("blank")}
          disabled={!!busy}
        >
          {busy === "blank" ? "…" : "Start blank, build it myself"}
        </button>
        <p style={{ fontSize: 12, color: "var(--text-dim)", margin: 0, lineHeight: 1.5 }}>
          Gym, Habits, and Morning start empty — add your own from scratch using the ✎ Edit button on each page. Or
          just tell whoever set this app up what you want and have them enter it for you.
        </p>
      </div>
    </div>
  );
}
