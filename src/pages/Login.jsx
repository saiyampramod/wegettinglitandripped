import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

function friendlyError(code) {
  switch (code) {
    case "auth/email-already-in-use":
      return "That email already has an account — try signing in instead.";
    case "auth/invalid-email":
      return "That email doesn't look right.";
    case "auth/weak-password":
      return "Password needs to be at least 6 characters.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Email or password didn't match.";
    case "auth/too-many-requests":
      return "Too many attempts — wait a bit and try again.";
    case "auth/operation-not-allowed":
      return "Email/password sign-in isn't enabled on this Firebase project yet.";
    case "auth/network-request-failed":
      return "Network error reaching Firebase — check your connection and try again.";
    case "auth/configuration-not-found":
      return "Firebase Authentication isn't set up on this project yet (auth/configuration-not-found).";
    default:
      return `Something went wrong (${code || "unknown error"}). Try again.`;
  }
}

export default function Login() {
  const { signUp, signIn, resetPassword } = useAuth();
  const [mode, setMode] = useState("signin"); // signin | signup
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setResetSent(false);
    if (mode === "signup" && !displayName.trim()) {
      setError("Pick a display name — that's what training partners will see.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        await signUp(displayName, email.trim(), password);
      } else {
        await signIn(email.trim(), password);
      }
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setBusy(false);
    }
  };

  const forgotPassword = async () => {
    if (!email.trim()) {
      setError("Enter your email above first, then tap this again.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      await resetPassword(email.trim());
      setResetSent(true);
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="brand-eyebrow" style={{ textAlign: "center" }}>
          Ripped &amp; Lit
        </div>
        <h1 className="disp brand-title" style={{ textAlign: "center", marginBottom: 18 }}>
          Habit Tracker
        </h1>

        <div className="chip-row" style={{ justifyContent: "center", marginBottom: 16 }}>
          <button className={"chip" + (mode === "signin" ? " active" : "")} onClick={() => setMode("signin")}>
            Sign in
          </button>
          <button className={"chip" + (mode === "signup" ? " active" : "")} onClick={() => setMode("signup")}>
            Create account
          </button>
        </div>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {mode === "signup" && (
            <div>
              <span className="field-label">Display name</span>
              <input
                className="field"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="What your training partners see"
                autoComplete="nickname"
              />
            </div>
          )}
          <div>
            <span className="field-label">Email</span>
            <input
              className="field"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <div>
            <span className="field-label">Password</span>
            <input
              className="field"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              required
              minLength={6}
            />
          </div>

          {error && <div className="auth-error">{error}</div>}
          {resetSent && <div className="auth-note">Password reset email sent — check your inbox.</div>}

          <button className="btn solid block" type="submit" disabled={busy}>
            {busy ? "…" : mode === "signup" ? "Create account" : "Sign in"}
          </button>

          {mode === "signin" && (
            <button type="button" className="btn ghost" onClick={forgotPassword} disabled={busy}>
              Forgot password?
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
