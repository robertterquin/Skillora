"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SolarIcon } from "@/components/SolarIcon";

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
    <div className="min-h-screen flex flex-col justify-between bg-[#FAFAFA] text-ink selection:bg-brand-500 selection:text-white">
      {/* Top minimal header */}
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

      {/* Main Sign In Form */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          {/* Floating Learner Tag */}
          <div className="flex justify-center mb-4">
            <div className="relative inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-semibold shadow-xs">
              <span>@learner</span>
              <span className="text-white/80 font-normal">• Resume your streak</span>
              <div className="absolute -bottom-1 left-6 w-2 h-2 bg-blue-600 rotate-45" />
            </div>
          </div>

          <div className="p-8 sm:p-10 bg-white rounded-3xl border border-surface-border shadow-sm">
            <div className="text-center mb-8">
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-ink tracking-tight">
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

            {/* Email / Password Form with Show Password Eye Toggle */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <SolarIcon name="letter-linear" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-subtle" />
                  <input
                    type="email"
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
                  <label className="block text-xs font-semibold text-ink">
                    Password
                  </label>
                  <a
                    href="#"
                    onClick={async (e) => {
                      e.preventDefault();
                      if (!email) {
                        setErrorMsg("Please enter your email above to receive a password reset link.");
                        return;
                      }
                      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
                      if (error) setErrorMsg(error.message);
                      else setSuccessMsg("Password reset email sent! Check your inbox.");
                    }}
                    className="text-[11px] font-medium text-brand-600 hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <SolarIcon name="lock-keyhole-linear" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-subtle" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-surface-border bg-canvas text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 focus:bg-white transition"
                  />
                  {/* See Password Button */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink transition"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    <SolarIcon
                      name={showPassword ? "eye-closed-linear" : "eye-linear"}
                      className="w-4 h-4"
                    />
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-full bg-ink text-white text-sm font-semibold hover:bg-neutral-800 transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
              >
                <span>{loading ? "Signing in..." : "Sign in to Skillora"}</span>
                <SolarIcon name="arrow-right-linear" className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-8 text-center text-xs text-ink-muted">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="font-semibold text-brand-600 hover:underline">
                Create one now
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-xs text-ink-subtle">
        <span>&copy; {new Date().getFullYear()} Skillora • Secured by Supabase</span>
      </footer>
    </div>
  );
}
