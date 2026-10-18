"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Button, AppIcon, Field } from "@/components";
import { AuthMessage, AuthShell, MIN_PASSWORD, PASSWORD_HINT, PasswordInput, passwordProblem } from "@/components/auth";

/** Where the "Forgot password?" email lands: the link signs the learner in, then they choose a new password. */
export default function ResetPasswordPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  // null while the link is being checked.
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    // The client exchanges the code in the link for a session on load.
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setHasSession(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      setHasSession((prev) => prev || !!data.session);
    });
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  const weak = password.length > 0 && passwordProblem(password) !== null;
  const mismatch = confirm.length > 0 && confirm !== password;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const problem = passwordProblem(password);
    if (problem) {
      setErrorMsg(problem);
      return;
    }
    if (password !== confirm) {
      setErrorMsg("The two passwords don't match.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }
    setSuccessMsg("Password updated. Taking you to your Studio…");
    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 800);
  };

  return (
    <AuthShell
      title="Choose a new password."
      subtitle="You'll use it the next time you sign in."
      footer={
        <p>
          Remembered it?{" "}
          <Link href="/signin" className="font-semibold text-ink underline underline-offset-2 hover:text-accent-vermilion">
            Back to sign in
          </Link>
        </p>
      }
    >
      {hasSession === false && (
        <AuthMessage tone="error">
          This reset link has expired or was opened in a different browser. Request a new one from{" "}
          <Link href="/signin" className="font-semibold underline underline-offset-2">
            sign in
          </Link>
          .
        </AuthMessage>
      )}
      {errorMsg && <AuthMessage tone="error">{errorMsg}</AuthMessage>}
      {successMsg && <AuthMessage tone="success">{successMsg}</AuthMessage>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="New password" htmlFor="reset-password" hint={PASSWORD_HINT}>
          <PasswordInput
            id="reset-password"
            autoComplete="new-password"
            required
            minLength={MIN_PASSWORD}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            aria-invalid={weak || undefined}
          />
        </Field>
        <Field label="Confirm new password" htmlFor="reset-confirm" hint={mismatch ? "The passwords don't match yet." : undefined}>
          <PasswordInput
            id="reset-confirm"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Type it again"
            aria-invalid={mismatch || undefined}
          />
        </Field>

        <Button type="submit" size="lg" block disabled={loading || !hasSession}>
          <span>{loading ? "Saving…" : "Save new password"}</span>
          {!loading && <AppIcon name="arrow-right-linear" className="w-4 h-4" />}
        </Button>
      </form>
    </AuthShell>
  );
}
