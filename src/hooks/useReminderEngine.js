import { useEffect, useRef } from "react";
import { statusFor } from "../data/constants";

export const notificationsSupported = () => typeof window !== "undefined" && "Notification" in window;
export const permissionState = () => (notificationsSupported() ? Notification.permission : "unsupported");
export const requestPermission = () => (notificationsSupported() ? Notification.requestPermission() : Promise.resolve("unsupported"));

function fire(tag, title, body) {
  if (!notificationsSupported() || Notification.permission !== "granted") return;
  try {
    new Notification(title, { body, tag });
  } catch {
    /* some browsers only allow Notification via a service worker registration — silently skip */
  }
}

export function sendTestNotification() {
  fire("mm-test", "🔔 Ripped & Lit", "This is what a reminder looks like. You're set up.");
}

const dedupeKey = (category, dateStr) => `mm-reminder-fired-${category}-${dateStr}`;
const firedToday = (category, dateStr) => localStorage.getItem(dedupeKey(category, dateStr)) === "1";
const markFired = (category, dateStr) => {
  try {
    localStorage.setItem(dedupeKey(category, dateStr), "1");
  } catch {
    /* ignore */
  }
};

/**
 * In-app reminder engine. Ticks every 30s while the app is open and fires
 * browser Notifications for water/morning/gym/custom based on the player's
 * reminder settings. Only fires while a tab is open — no service worker, no
 * push. Water is throttled by interval; the daily categories fire at most
 * once per day past their configured time (deduped via localStorage so a
 * reload the same day doesn't re-fire).
 */
export function useReminderEngine(ctx) {
  const ctxRef = useRef(ctx);
  ctxRef.current = ctx;
  const lastWaterFireRef = useRef(0);

  useEffect(() => {
    const tick = () => {
      if (!notificationsSupported() || Notification.permission !== "granted") return;
      const { reminders, today, recordFor, waterGoalMl, habitsList, splitOverrides, morningOverrides, customTrackers, milestones } =
        ctxRef.current;
      const now = new Date();
      const rec = recordFor(today);
      const st = statusFor(rec, { waterGoalMl, habitsList, splitOverrides, morningOverrides });

      if (reminders.water.enabled && !st.water) {
        const intervalMs = Math.max(5, reminders.water.intervalMin) * 60 * 1000;
        const log = (rec.water && rec.water.log) || [];
        const lastLogTs = log.length ? new Date(log[log.length - 1].ts).getTime() : 0;
        const dayStartTs = new Date(today + "T00:00:00").getTime();
        const baseline = Math.max(lastLogTs, dayStartTs, lastWaterFireRef.current);
        if (now.getTime() - baseline >= intervalMs) {
          const ml = (rec.water && rec.water.ml) || 0;
          fire(
            "water",
            "💧 Hydration check",
            `${(ml / 1000).toFixed(1)}L of ${(waterGoalMl / 1000).toFixed(1)}L so far — log a glass?`
          );
          lastWaterFireRef.current = now.getTime();
        }
      }

      const hhmm = now.toTimeString().slice(0, 5);

      if (reminders.morning.enabled && !st.morning && hhmm >= reminders.morning.time && !firedToday("morning", today)) {
        fire(`morning-${today}`, "🌅 Morning routine", "Not logged yet today — 20 minutes, worth it.");
        markFired("morning", today);
      }

      if (
        reminders.gym.enabled &&
        !st.isRest &&
        !st.gym &&
        hhmm >= reminders.gym.time &&
        !firedToday("gym", today)
      ) {
        fire(`gym-${today}`, "🏋️ Gym", "Today's session isn't logged complete yet.");
        markFired("gym", today);
      }

      if (reminders.custom.enabled && hhmm >= reminders.custom.time && !firedToday("custom", today)) {
        const incomplete = customTrackers.filter((t) => {
          const v = (rec.custom && rec.custom[t.id] && rec.custom[t.id].value) || 0;
          return t.dailyTarget ? v < t.dailyTarget : v === 0;
        });
        const soonMilestones = milestones.filter((m) => {
          if (m.done) return false;
          const days = Math.round((new Date(m.targetDate) - new Date(today)) / 86400000);
          return days >= 0 && days <= 3;
        });
        if (incomplete.length || soonMilestones.length) {
          const parts = [];
          if (incomplete.length) parts.push(`${incomplete.length} tracker${incomplete.length === 1 ? "" : "s"} short of target`);
          if (soonMilestones.length) parts.push(`${soonMilestones.length} milestone${soonMilestones.length === 1 ? "" : "s"} coming up`);
          fire(`custom-${today}`, "🎯 Evening check-in", parts.join(" · "));
        }
        markFired("custom", today);
      }
    };

    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);
}
