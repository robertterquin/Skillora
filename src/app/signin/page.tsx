"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Button, AppIcon, Field, Input } from "@/components";
import { AuthMessage, AuthShell, PasswordInput } from "@/components/auth";

export default function SignInPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      if (data.session) {
        setSuccessMsg("Signed in. Taking you to your Studio…");
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 600);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setErrorMsg(message);
      setLoading(false);
    }
  };

  const sendReset = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    if (!email.trim()) {
      setErrorMsg("Enter your email above and we'll send you a reset link.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) setErrorMsg(error.message);
    else setSuccessMsg("Reset link sent. Check your inbox.");
  };

  return (
    <AuthShell
      title="Welcome back."
      subtitle="Sign in to pick up where you left off."
      footer={
        <div className="space-y-2">
          <p>
            New to Skillora?{" "}
            <Link href="/signup" className="font-semibold text-ink underline underline-offset-2 hover:text-accent-vermilion">
              Create an account
            </Link>
          </p>
          <p>
            Or{" "}
            <Link href="/library" className="font-semibold text-ink underline underline-offset-2 hover:text-accent-vermilion">
              continue as a guest
            </Link>
            . Progress stays in this browser.
          </p>
        </div>
      }
    >
      {errorMsg && <AuthMessage tone="error">{errorMsg}</AuthMessage>}
      {successMsg && <AuthMessage tone="success">{successMsg}</AuthMessage>}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate={false}>
        <Field label="Email" htmlFor="signin-email">
          <Input
            id="signin-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            leadingIcon="letter-linear"
          />
        </Field>

        <Field
          label="Password"
          htmlFor="signin-password"
          action={
            <button
              type="button"
              onClick={sendReset}
              className="text-xs font-medium text-ink-secondary hover:text-ink underline-offset-2 hover:underline cursor-pointer"
            >
              Forgot password?
            </button>
          }
        >
          <PasswordInput
            id="signin-password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
          />
        </Field>

        <Button type="submit" size="lg" block disabled={loading}>
          <span>{loading ? "Signing in…" : "Sign in"}</span>
          {!loading && <AppIcon name="arrow-right-linear" className="w-4 h-4" />}
        </Button>
      </form>
    </AuthShell>
  );
}
