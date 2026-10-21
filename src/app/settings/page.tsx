"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppIcon, Button, buttonClasses, Input, useToast } from "@/components";
import { Switch } from "@/components/ui/Switch";
import { useAuth } from "@/hooks/useAuth";
import { getSupabase } from "@/lib/supabase";
import { authedFetch } from "@/lib/authed-fetch";
import { cn } from "@/lib/cn";

const EMAIL_REMINDERS_ON = process.env.NEXT_PUBLIC_EMAIL_REMINDERS === "on";

const DAYS = [
  { iso: 1, short: "M", name: "Monday" },
  { iso: 2, short: "T", name: "Tuesday" },
  { iso: 3, short: "W", name: "Wednesday" },
  { iso: 4, short: "T", name: "Thursday" },
  { iso: 5, short: "F", name: "Friday" },
  { iso: 6, short: "S", name: "Saturday" },
  { iso: 7, short: "S", name: "Sunday" },
];

interface ReminderPrefs {
  reminders_enabled: boolean;
  remind_at: string;
  remind_days: number[];
  weekly_recap_enabled: boolean;
}

const DEFAULTS: ReminderPrefs = {
  reminders_enabled: false,
  remind_at: "19:00",
  remind_days: [1, 2, 3, 4, 5, 6, 7],
  weekly_recap_enabled: false,
};

function browserTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

function Row({
  id,
  title,
  description,
  control,
  children,
}: {
  id: string;
  title: string;
  description: string;
  control: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="py-5 first:pt-0 last:pb-0">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h3 id={`${id}-label`} className="text-base font-semibold text-ink">
            {title}
          </h3>
          <p id={`${id}-desc`} className="mt-0.5 text-sm text-ink-muted max-w-md">
            {description}
          </p>
        </div>
        {control}
      </div>
      {children}
    </div>
  );
}

function DeleteAccount({ email }: { email: string }) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);

  const remove = async () => {
    setBusy(true);
    const res = await authedFetch("/api/account/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirm: typed }),
    }).catch(() => null);
    if (!res?.ok) {
      const err = res ? await res.json().catch(() => ({})) : {};
      toast({ message: err.error || "Couldn't delete your account. Please try again.", tone: "danger" });
      setBusy(false);
      return;
    }
    await getSupabase().auth.signOut().catch(() => undefined);
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith("skillora"))
        .forEach((k) => localStorage.removeItem(k));
    } catch {
    }
    toast({ message: "Your account and its data were deleted.", tone: "info" });
    router.push("/");
    router.refresh();
  };

  return (
    <section aria-labelledby="delete-heading" className="mt-6 p-6 sm:p-7 rounded-2xl bg-white border border-danger-border">
      <h2 id="delete-heading" className="text-base font-semibold text-ink flex items-center gap-2">
        <AppIcon name="trash-bin-trash-linear" className="w-4 h-4 text-danger" />
        Delete account
      </h2>
      <p className="mt-1 text-sm text-ink-muted max-w-md">
        Permanently removes {email || "your account"} and everything in it: skills, progress, notes, chats,
        certificates and photos. Shared certificate links stop working. This can&rsquo;t be undone.
      </p>
      {!open ? (
        <Button variant="secondary" className="mt-5 text-danger" onClick={() => setOpen(true)}>
          Delete my account
        </Button>
      ) : (
        <div className="mt-5 space-y-3">
          <label htmlFor="delete-confirm" className="block text-sm font-medium text-ink">
            Type <span className="font-mono font-semibold">DELETE</span> to confirm
          </label>
          <Input
            id="delete-confirm"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            autoComplete="off"
            placeholder="DELETE"
          />
          <div className="flex flex-wrap gap-2">
            <Button variant="danger" onClick={remove} disabled={typed !== "DELETE" || busy}>
              {busy ? "Deleting…" : "Delete permanently"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setOpen(false);
                setTyped("");
              }}
              disabled={busy}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}

export default function SettingsPage() {
  const { user, isLoading } = useAuth();
  const toast = useToast();
  const [prefs, setPrefs] = useState<ReminderPrefs>(DEFAULTS);
  const [loaded, setLoaded] = useState(false);
  const [hasSavedPrefs, setHasSavedPrefs] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const timeZone = browserTimeZone();

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    Promise.resolve(
      getSupabase()
        .from("reminder_preferences")
        .select("reminders_enabled, remind_at, remind_days, weekly_recap_enabled")
        .eq("user_id", user.id)
        .maybeSingle()
    ).then(({ data, error }) => {
      if (cancelled) return;
      if (error) console.warn("Could not load reminder settings", error.message);
      if (data) {
        setHasSavedPrefs(true);
        setPrefs({
          reminders_enabled: data.reminders_enabled,
          remind_at: String(data.remind_at).slice(0, 5),
          remind_days: data.remind_days ?? DEFAULTS.remind_days,
          weekly_recap_enabled: data.weekly_recap_enabled,
        });
      }
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const showEmail = EMAIL_REMINDERS_ON || hasSavedPrefs;

  const update = (patch: Partial<ReminderPrefs>) => {
    setPrefs((p) => ({ ...p, ...patch }));
    setDirty(true);
  };

  const toggleDay = (iso: number) => {
    const has = prefs.remind_days.includes(iso);
    const next = has ? prefs.remind_days.filter((d) => d !== iso) : [...prefs.remind_days, iso].sort();
    if (next.length > 0) update({ remind_days: next });
  };

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await getSupabase()
      .from("reminder_preferences")
      .upsert(
        { user_id: user.id, ...prefs, timezone: timeZone, updated_at: new Date().toISOString() },
        { onConflict: "user_id" }
      );
    setSaving(false);
    if (error) {
      toast({ message: "Couldn't save your settings. Please try again.", tone: "danger" });
      return;
    }
    setDirty(false);
    toast({ message: "Settings saved" });
  };

  return (
    <div className="flex-1 bg-canvas text-ink">
      <main id="main" className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <h1 className="font-display font-bold text-3xl sm:text-4xl tracking-tight">Settings</h1>

        {isLoading ? (
          <div className="mt-8 h-48 rounded-2xl bg-surface-muted animate-pulse" aria-hidden="true" />
        ) : !user ? (
          <section className="mt-8 p-6 rounded-2xl bg-white border border-surface-border">
            <h2 className="text-lg font-semibold">Settings need an account</h2>
            <p className="mt-1 text-[15px] text-ink-muted">
              {EMAIL_REMINDERS_ON
                ? "Sign up and Skillora can email you a gentle nudge with your next step, and a short recap each week."
                : "Sign up to keep your progress on every device and manage your account here."}
            </p>
            <Link href="/signup" className={buttonClasses({ className: "mt-5" })}>
              Create an account
            </Link>
          </section>
        ) : (
          <>
            {showEmail && (
              <section aria-labelledby="email-heading" className="mt-8 p-6 sm:p-7 rounded-2xl bg-white border border-surface-border">
                <h2 id="email-heading" className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-5">
                  Email · {user.email}
                </h2>

                <div className={cn("divide-y divide-surface-border", !loaded && "opacity-50 pointer-events-none")}>
                  <Row
                    id="reminder"
                    title="Practice reminder"
                    description="A short email with your next step. Skipped on days you've already practised."
                    control={
                      <Switch
                        checked={prefs.reminders_enabled}
                        onChange={(v) => update({ reminders_enabled: v })}
                        labelledBy="reminder-label"
                        describedBy="reminder-desc"
                      />
                    }
                  >
                    {prefs.reminders_enabled && (
                      <div className="mt-5 space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <label htmlFor="remind-at" className="text-sm font-medium text-ink">
                            Time
                          </label>
                          <input
                            id="remind-at"
                            type="time"
                            step={900}
                            value={prefs.remind_at}
                            onChange={(e) => update({ remind_at: e.target.value })}
                            className="h-10 px-3 rounded-xl bg-canvas border border-surface-border text-base text-ink focus:outline-none focus:border-ink"
                          />
                          <span className="text-xs text-ink-muted">{timeZone}</span>
                        </div>
                        <fieldset>
                          <legend className="text-sm font-medium text-ink mb-2">Days</legend>
                          <div className="flex flex-wrap gap-1.5">
                            {DAYS.map((d) => {
                              const on = prefs.remind_days.includes(d.iso);
                              return (
                                <button
                                  key={d.iso}
                                  type="button"
                                  aria-pressed={on}
                                  aria-label={d.name}
                                  onClick={() => toggleDay(d.iso)}
                                  className={cn(
                                    "w-10 h-10 rounded-full text-sm font-semibold transition cursor-pointer",
                                    on
                                      ? "bg-ink text-white"
                                      : "bg-canvas border border-surface-border text-ink-muted hover:text-ink"
                                  )}
                                >
                                  {d.short}
                                </button>
                              );
                            })}
                          </div>
                        </fieldset>
                      </div>
                    )}
                  </Row>

                  <Row
                    id="recap"
                    title="Weekly recap"
                    description="Sundays at 6 pm: days practised, steps done and what's next."
                    control={
                      <Switch
                        checked={prefs.weekly_recap_enabled}
                        onChange={(v) => update({ weekly_recap_enabled: v })}
                        labelledBy="recap-label"
                        describedBy="recap-desc"
                      />
                    }
                  />
                </div>

                <div className="mt-6 pt-5 border-t border-surface-border flex items-center justify-between gap-3">
                  <p className="text-xs text-ink-muted">Every email has a one-click unsubscribe link.</p>
                  <Button onClick={save} disabled={!dirty || saving || !loaded}>
                    {saving ? "Saving…" : "Save"}
                  </Button>
                </div>
              </section>
            )}

            <section
              aria-labelledby="install-heading"
              className={cn("p-6 sm:p-7 rounded-2xl bg-white border border-surface-border", showEmail ? "mt-6" : "mt-8")}
            >
              <h2 id="install-heading" className="text-base font-semibold text-ink flex items-center gap-2">
                <AppIcon name="layout-grid-linear" className="w-4 h-4 text-ink-muted" />
                Put Skillora on your phone
              </h2>
              <p className="mt-1 text-sm text-ink-muted max-w-md">
                Practise at the counter or with the guitar in hand. On iPhone, tap Share then &ldquo;Add to Home
                Screen&rdquo;. On Android, open the browser menu and choose &ldquo;Install app&rdquo;. Steps you&rsquo;ve
                opened stay readable offline.
              </p>
            </section>

            <DeleteAccount email={user.email ?? ""} />
          </>
        )}
      </main>
    </div>
  );
}
