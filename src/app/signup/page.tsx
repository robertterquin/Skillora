"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { cn } from "@/lib/cn";
import { INTERESTS } from "@/lib/interests";
import { getCategoryStyleById } from "@/lib/skill-progress";
import { Button, AppIcon, Field, Input } from "@/components";
import { AuthMessage, AuthShell, PasswordInput } from "@/components/auth";


const MIN_PASSWORD = 6;

export default function SignUpPage() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedInterest, setSelectedInterest] = useState("music");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: name.trim(),
            primary_interest: selectedInterest,
          },
          emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/dashboard` : undefined,
        },
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      if (data.session) {
        setSuccessMsg("Account created. Taking you to your Studio…");
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 700);
      } else if (data.user && !data.session) {
        setSuccessMsg("Almost there. We sent a confirmation link to your email; open it to finish signing up.");
        setLoading(false);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create account.";
      setErrorMsg(message);
      setLoading(false);
    }
  };

  const passwordShort = password.length > 0 && password.length < MIN_PASSWORD;

  return (
    <AuthShell
      title="Start learning."
      subtitle="Create an account to save your progress across devices."
      footer={
        <p>
          Already have an account?{" "}
          <Link href="/signin" className="font-semibold text-ink underline underline-offset-2 hover:text-accent-vermilion">
            Sign in
          </Link>
        </p>
      }
    >
      {errorMsg && <AuthMessage tone="error">{errorMsg}</AuthMessage>}
      {successMsg && <AuthMessage tone="success">{successMsg}</AuthMessage>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <fieldset>
          <legend className="block text-xs font-semibold text-ink mb-2">What do you want to learn first?</legend>
          <div className="grid grid-cols-2 gap-2">
            {INTERESTS.map((item) => {
              const selected = selectedInterest === item.id;
              return (
                <label
                  key={item.id}
                  className={cn(
                    "relative flex flex-col p-3 rounded-xl border cursor-pointer transition",
                    "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ink",
                    selected ? "border-ink bg-white ring-1 ring-ink" : "border-surface-border bg-white/60 hover:bg-white"
                  )}
                >
                  <input
                    type="radio"
                    name="interest"
                    value={item.id}
                    checked={selected}
                    onChange={() => setSelectedInterest(item.id)}
                    className="sr-only"
                  />
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                    <span
                      className={cn("w-1.5 h-1.5 rounded-full", getCategoryStyleById(item.categoryId).fill)}
                      aria-hidden="true"
                    />
                    {item.label}
                  </span>
                  <span className="text-xs text-ink-muted mt-0.5 truncate">{item.desc}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <Field label="Your name" htmlFor="signup-name">
          <Input
            id="signup-name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Alex Rivera"
            leadingIcon="user-linear"
          />
        </Field>

        <Field label="Email" htmlFor="signup-email">
          <Input
            id="signup-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            leadingIcon="letter-linear"
          />
        </Field>

        <Field label="Password" htmlFor="signup-password" hint={`At least ${MIN_PASSWORD} characters.`}>
          <PasswordInput
            id="signup-password"
            autoComplete="new-password"
            required
            minLength={MIN_PASSWORD}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={passwordShort || undefined}
            aria-describedby="signup-password-hint"
          />
        </Field>

        <p className="text-xs text-ink-muted leading-relaxed">
          By creating an account, you agree to Skillora&apos;s Terms of Service and Privacy Policy.
        </p>

        <Button type="submit" size="lg" block disabled={loading}>
          <span>{loading ? "Creating your account…" : "Create account"}</span>
          {!loading && <AppIcon name="arrow-right-linear" className="w-4 h-4" />}
        </Button>
      </form>
    </AuthShell>
  );
}
