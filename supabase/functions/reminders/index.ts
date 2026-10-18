// Sends opt-in practice reminders and the Sunday weekly recap.
// Called every 15 minutes by pg_cron (see supabase/schedule_reminders.sql).
//
// Secrets: RESEND_API_KEY, EMAIL_FROM, SITE_URL, CRON_SECRET.
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided by the runtime.

import { createClient, SupabaseClient } from "npm:@supabase/supabase-js@^2.45.6";

const RECAP_WEEKDAY = 7; // Sunday (ISO)
const RECAP_MINUTES = 18 * 60; // 18:00 local
// Cron runs every 15 minutes; a 30-minute window tolerates a late run, and
// last_*_on stops a second send on the same local day.
const SEND_WINDOW_MINUTES = 30;

interface Prefs {
  user_id: string;
  reminders_enabled: boolean;
  remind_at: string;
  remind_days: number[];
  weekly_recap_enabled: boolean;
  timezone: string;
  unsubscribe_token: string;
  last_reminder_on: string | null;
  last_recap_on: string | null;
}

interface Step {
  id: string;
  step_number: number;
  title: string;
  estimated_minutes: number;
}

interface SkillWithSteps {
  id: string;
  title: string;
  skill_steps: Step[];
}

interface LocalNow {
  date: string; // YYYY-MM-DD
  isoWeekday: number; // 1 = Monday
  minutes: number; // minutes since local midnight
}

function localNow(timeZone: string, at = new Date()): LocalNow {
  let parts: Intl.DateTimeFormatPart[];
  try {
    parts = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      weekday: "short",
      hourCycle: "h23",
    }).formatToParts(at);
  } catch {
    return localNow("UTC", at);
  }
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    isoWeekday: weekdays.indexOf(get("weekday")) + 1,
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
  };
}

function minutesOf(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + (m || 0);
}

function inWindow(nowMinutes: number, targetMinutes: number): boolean {
  return nowMinutes >= targetMinutes && nowMinutes < targetMinutes + SEND_WINDOW_MINUTES;
}

/** Monday of the local week containing `date` (YYYY-MM-DD). */
function weekStart(date: string, isoWeekday: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - (isoWeekday - 1));
  return d.toISOString().slice(0, 10);
}

/** Same rule as the Studio's Continue card: first skill in progress, else first unfinished. */
function pickNextStep(skills: SkillWithSteps[], done: Set<string>) {
  const withProgress = skills.map((skill) => {
    const steps = [...(skill.skill_steps || [])].sort((a, b) => a.step_number - b.step_number);
    const doneCount = steps.filter((s) => done.has(s.id)).length;
    return { skill, steps, doneCount, complete: steps.length > 0 && doneCount === steps.length };
  });
  const focus =
    withProgress.find((p) => p.doneCount > 0 && !p.complete) ?? withProgress.find((p) => !p.complete && p.steps.length > 0);
  if (!focus) return null;
  const step = focus.steps.find((s) => !done.has(s.id));
  return step ? { skill: focus.skill, step, total: focus.steps.length } : null;
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function emailShell(title: string, bodyHtml: string, siteUrl: string, unsubscribeUrl: string): string {
  return `<!doctype html><html><body style="margin:0;background:#F7F5F0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1A1917">
<div style="max-width:520px;margin:0 auto;padding:32px 24px">
<p style="margin:0 0 24px;font-weight:700;font-size:16px">Skillora</p>
<div style="background:#FFFFFF;border:1px solid #E2DDD4;border-radius:16px;padding:28px">
<h1 style="margin:0 0 12px;font-family:Georgia,serif;font-style:italic;font-weight:400;font-size:26px;line-height:1.25">${escapeHtml(title)}</h1>
${bodyHtml}
<p style="margin:24px 0 0"><a href="${siteUrl}/dashboard" style="display:inline-block;background:#1A1917;color:#FFFFFF;text-decoration:none;font-weight:600;font-size:14px;padding:12px 22px;border-radius:999px">Open your Studio</a></p>
</div>
<p style="margin:20px 4px 0;font-size:12px;color:#625D55">You're getting this because you turned it on in Skillora settings. <a href="${unsubscribeUrl}" style="color:#625D55">Unsubscribe</a> · <a href="${siteUrl}/settings" style="color:#625D55">Change settings</a></p>
</div></body></html>`;
}

async function sendEmail(to: string, subject: string, html: string, text: string, unsubscribeUrl: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: Deno.env.get("EMAIL_FROM"),
      to: [to],
      subject,
      html,
      text,
      headers: {
        "List-Unsubscribe": `<${unsubscribeUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

async function loadLearner(db: SupabaseClient, userId: string) {
  const [profile, enrollments, completions, stats] = await Promise.all([
    db.from("profiles").select("email, full_name").eq("id", userId).maybeSingle(),
    db.from("user_enrollments").select("skill_id").eq("user_id", userId).order("started_at"),
    db.from("user_step_completions").select("step_id, completed_at").eq("user_id", userId),
    db.from("user_practice_stats").select("practice_dates").eq("user_id", userId).maybeSingle(),
  ]);

  const skillIds = (enrollments.data ?? []).map((e: { skill_id: string }) => e.skill_id);
  const skills = skillIds.length
    ? ((
        await db
          .from("skills")
          .select("id, title, skill_steps(id, step_number, title, estimated_minutes)")
          .in("id", skillIds)
      ).data ?? []) as SkillWithSteps[]
    : [];
  // Keep enrollment order.
  skills.sort((a, b) => skillIds.indexOf(a.id) - skillIds.indexOf(b.id));

  return {
    email: profile.data?.email as string | undefined,
    firstName: String(profile.data?.full_name || "").split(" ")[0],
    skills,
    completions: (completions.data ?? []) as { step_id: string; completed_at: string }[],
    practiceDates: (stats.data?.practice_dates ?? []) as string[],
  };
}

async function handleUser(db: SupabaseClient, prefs: Prefs, siteUrl: string): Promise<string[]> {
  const now = localNow(prefs.timezone || "UTC");
  const reminderDue =
    prefs.reminders_enabled &&
    prefs.remind_days.includes(now.isoWeekday) &&
    inWindow(now.minutes, minutesOf(prefs.remind_at)) &&
    prefs.last_reminder_on !== now.date;
  const recapDue =
    prefs.weekly_recap_enabled &&
    now.isoWeekday === RECAP_WEEKDAY &&
    inWindow(now.minutes, RECAP_MINUTES) &&
    prefs.last_recap_on !== now.date;
  if (!reminderDue && !recapDue) return [];

  const learner = await loadLearner(db, prefs.user_id);
  if (!learner.email) return [];
  const done = new Set(learner.completions.map((c) => c.step_id));
  const next = pickNextStep(learner.skills, done);
  const unsubscribeUrl = `${siteUrl}/unsubscribe?token=${prefs.unsubscribe_token}`;
  const hello = learner.firstName ? `Hi ${escapeHtml(learner.firstName)},` : "Hi,";
  const sent: string[] = [];

  if (reminderDue) {
    // Quiet by design: no email if they already practised today or have nothing left to do.
    if (!learner.practiceDates.includes(now.date) && next) {
      const minutes = next.step.estimated_minutes;
      const title = `${next.step.title}`;
      const body = `<p style="margin:0 0 8px;font-size:15px;line-height:1.6">${hello} your next step is ready${
        minutes ? ` and takes about ${minutes} minutes` : ""
      }.</p>
<p style="margin:0;font-size:14px;color:#625D55">${escapeHtml(next.skill.title)} · Step ${next.step.step_number} of ${next.total}</p>`;
      const text = `${learner.firstName ? `Hi ${learner.firstName},` : "Hi,"} your next step is ready${
        minutes ? ` (about ${minutes} min)` : ""
      }: ${next.step.title} — ${next.skill.title}, step ${next.step.step_number} of ${next.total}.\n\n${siteUrl}/dashboard\n\nUnsubscribe: ${unsubscribeUrl}`;
      await sendEmail(learner.email, `Your next step: ${next.step.title}`, emailShell(title, body, siteUrl, unsubscribeUrl), text, unsubscribeUrl);
      sent.push("reminder");
    }
    await db.from("reminder_preferences").update({ last_reminder_on: now.date }).eq("user_id", prefs.user_id);
  }

  if (recapDue) {
    const monday = weekStart(now.date, now.isoWeekday);
    const daysPractised = learner.practiceDates.filter((d) => d >= monday && d <= now.date).length;
    const stepsThisWeek = learner.completions.filter(
      (c) => localNow(prefs.timezone || "UTC", new Date(c.completed_at)).date >= monday
    ).length;
    const nextLine = next
      ? `<p style="margin:16px 0 0;font-size:15px;line-height:1.6">Next up: <strong>${escapeHtml(next.step.title)}</strong> <span style="color:#625D55">(${escapeHtml(next.skill.title)})</span></p>`
      : "";
    const body = `<p style="margin:0 0 16px;font-size:15px;line-height:1.6">${hello} here's your week.</p>
<table role="presentation" style="width:100%;border-collapse:collapse"><tr>
<td style="padding:12px;border:1px solid #E2DDD4;border-radius:12px;width:50%"><div style="font-size:12px;color:#625D55">Practice days</div><div style="font-size:24px;font-weight:700">${daysPractised}<span style="font-size:14px;color:#625D55">/7</span></div></td>
<td style="width:8px"></td>
<td style="padding:12px;border:1px solid #E2DDD4;border-radius:12px;width:50%"><div style="font-size:12px;color:#625D55">Steps done</div><div style="font-size:24px;font-weight:700">${stepsThisWeek}</div></td>
</tr></table>${nextLine}`;
    const text = `Your week on Skillora: ${daysPractised}/7 practice days, ${stepsThisWeek} steps done.${
      next ? ` Next up: ${next.step.title} (${next.skill.title}).` : ""
    }\n\n${siteUrl}/dashboard\n\nUnsubscribe: ${unsubscribeUrl}`;
    await sendEmail(learner.email, "Your week on Skillora", emailShell("Your week", body, siteUrl, unsubscribeUrl), text, unsubscribeUrl);
    await db.from("reminder_preferences").update({ last_recap_on: now.date }).eq("user_id", prefs.user_id);
    sent.push("recap");
  }

  return sent;
}

Deno.serve(async (req: Request) => {
  const secret = Deno.env.get("CRON_SECRET");
  if (!secret || req.headers.get("x-cron-secret") !== secret) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  const siteUrl = (Deno.env.get("SITE_URL") || "").replace(/\/$/, "");
  if (!Deno.env.get("RESEND_API_KEY") || !Deno.env.get("EMAIL_FROM") || !siteUrl) {
    return new Response(JSON.stringify({ error: "RESEND_API_KEY, EMAIL_FROM and SITE_URL must be set" }), { status: 500 });
  }

  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false },
  });

  const { data, error } = await db
    .from("reminder_preferences")
    .select("*")
    .or("reminders_enabled.eq.true,weekly_recap_enabled.eq.true");
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  let reminders = 0;
  let recaps = 0;
  let failures = 0;
  for (const prefs of (data ?? []) as Prefs[]) {
    try {
      const sent = await handleUser(db, prefs, siteUrl);
      reminders += sent.filter((s) => s === "reminder").length;
      recaps += sent.filter((s) => s === "recap").length;
    } catch (err) {
      failures += 1;
      console.error(`reminders: user ${prefs.user_id} failed`, err);
    }
  }

  return new Response(JSON.stringify({ checked: data?.length ?? 0, reminders, recaps, failures }), {
    headers: { "Content-Type": "application/json" },
  });
});
