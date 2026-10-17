"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Button, Card, AppIcon, Field, IconButton, Input } from "@/components";

const INTEREST_AREAS = [
  { id: "music", label: "Music & Audio", desc: "Guitar, Piano, Beatbox" },
  { id: "languages", label: "Languages & Scripts", desc: "Cyrillic, Italian, Hangul" },
  { id: "crafts", label: "Tactile Crafts", desc: "Knife sharpening, Espresso" },
  { id: "tech", label: "Digital & Tech", desc: "Touch typing, Git, Terminal" },
];

export default function SignUpPage() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
        setSuccessMsg("Account created! Taking you to your Studio…");
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 700);
      } else if (data.user && !data.session) {
        setSuccessMsg(
          "Confirmation link sent! Please check your email inbox to verify your account and begin."
        );
        setLoading(false);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create account.";
      setErrorMsg(message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-canvas text-ink selection:bg-brand-500 selection:text-white">
      <header className="p-6 max-w-7xl w-full mx-auto flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-white border border-surface-border flex items-center justify-center group-hover:border-ink/30 transition">
            <Image
              src="/logo.svg"
              alt="Skillora Owl"
              width={22}
              height={22}
              className="w-5 h-5 object-contain"
            />
          </div>
          <span className="font-display font-bold text-lg text-ink">Skillora</span>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted hover:text-ink transition"
        >
          <AppIcon name="arrow-left-linear" className="w-3.5 h-3.5" />
          <span>Back to overview</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-4">
        <div className="w-full max-w-lg">
          <Card className="p-8 sm:p-10">
            <div className="text-center mb-8">
              <h1 className="font-serif italic font-normal text-3xl sm:text-4xl text-ink tracking-tight">
                Create your learning account.
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-ink-muted">
                Pick your primary interest and track progress through modular steps.
              </p>
            </div>

            {errorMsg && (
              <div className="mb-6 p-3 rounded-xl bg-danger-light border border-danger-border text-danger text-xs font-medium text-center">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="mb-6 p-3.5 rounded-xl bg-success-light border border-success-border text-accent-emerald text-xs font-medium text-center leading-relaxed">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <div id="signup-interest-label" className="block text-xs font-semibold text-ink mb-2">
                  What do you want to learn first?
                </div>
                <div role="group" aria-labelledby="signup-interest-label" className="grid grid-cols-2 gap-2.5">
                  {INTEREST_AREAS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedInterest(item.id)}
                      aria-pressed={selectedInterest === item.id}
                      className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                        selectedInterest === item.id
                          ? "border-ink bg-white text-ink ring-1 ring-ink"
                          : "border-surface-border bg-canvas hover:bg-white text-ink"
                      }`}
                    >
                      <div className="text-xs font-semibold">{item.label}</div>
                      <div className="text-xs text-ink-muted mt-0.5 truncate">
                        {item.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

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

              <Field label="Email address" htmlFor="signup-email">
                <Input
                  id="signup-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  leadingIcon="letter-linear"
                />
              </Field>

              <Field label="Password" htmlFor="signup-password">
                <Input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  leadingIcon="lock-keyhole-linear"
                  trailing={
                    <IconButton
                      icon={showPassword ? "eye-closed-linear" : "eye-linear"}
                      label={showPassword ? "Hide password" : "Show password"}
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                    />
                  }
                />
              </Field>

              <div className="text-xs text-ink-muted leading-relaxed">
                By creating an account, you agree to Skillora&apos;s Terms of Service and Privacy Policy.
              </div>

              <Button type="submit" size="lg" disabled={loading} className="w-full">
                <span>{loading ? "Creating your account..." : "Create account"}</span>
                <AppIcon name="arrow-right-linear" className="w-4 h-4" />
              </Button>
            </form>

            <div className="mt-8 text-center text-xs text-ink-muted">
              Already have an account?{" "}
              <Link href="/signin" className="font-semibold text-brand-600 hover:underline">
                Sign in
              </Link>
            </div>
          </Card>
        </div>
      </main>

      <footer className="p-6 text-center text-xs text-ink-subtle">
        <span>&copy; {new Date().getFullYear()} Skillora • Secured by Supabase Row Level Security</span>
      </footer>
    </div>
  );
}
