"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Button, Card, SolarIcon } from "@/components";

export default function SignInPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
        setSuccessMsg("Signed in successfully. Redirecting to your learning studio...");
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

  return (
    <div className="min-h-screen flex flex-col justify-between bg-canvas workbench-grid text-ink selection:bg-brand-500 selection:text-white">
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
          <SolarIcon name="arrow-left-linear" className="w-3.5 h-3.5" />
          <span>Back to home</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          <Card className="p-8 sm:p-10">
            <div className="text-center mb-8">
              <h1 className="font-serif italic font-normal text-3xl sm:text-4xl text-ink tracking-tight">
                Welcome back.
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-ink-muted">
                Log in to resume your active skill pathways.
              </p>
            </div>

            {errorMsg && (
              <div className="mb-6 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium text-center">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="mb-6 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-accent-emerald text-xs font-medium text-center">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="signin-email" className="block text-xs font-semibold text-ink mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <SolarIcon name="letter-linear" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-subtle" />
                  <input
                    id="signin-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-border bg-canvas text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="signin-password" className="block text-xs font-semibold text-ink">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!email) {
                        setErrorMsg("Please enter your email above to receive a password reset link.");
                        return;
                      }
                      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
                      if (error) setErrorMsg(error.message);
                      else setSuccessMsg("Password reset email sent! Check your inbox.");
                    }}
                    className="text-2xs font-medium text-brand-600 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <SolarIcon name="lock-keyhole-linear" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-subtle" />
                  <input
                    id="signin-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-surface-border bg-canvas text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 focus:bg-white transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink transition"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <SolarIcon
                      name={showPassword ? "eye-closed-linear" : "eye-linear"}
                      className="w-4 h-4"
                    />
                  </button>
                </div>
              </div>

              <Button type="submit" size="lg" disabled={loading} className="w-full mt-2">
                <span>{loading ? "Signing in..." : "Sign in"}</span>
                <SolarIcon name="arrow-right-linear" className="w-4 h-4" />
              </Button>
            </form>

            <div className="mt-8 text-center text-xs text-ink-muted">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="font-semibold text-brand-600 hover:underline">
                Create one now
              </Link>
            </div>
          </Card>
        </div>
      </main>

      <footer className="p-6 text-center text-xs text-ink-subtle">
        <span>&copy; {new Date().getFullYear()} Skillora • Secured by Supabase</span>
      </footer>
    </div>
  );
}
