"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { AppIcon } from "../ui/AppIcon";
import { IconButton } from "../ui/IconButton";
import { Input } from "../ui/Input";
import { InteractiveOwlAvatar } from "../ui/InteractiveOwlAvatar";

const SAMPLE_PATH = [
  { title: "Hold the knife at 15°", minutes: 15, done: true },
  { title: "Raise a burr along the edge", minutes: 20, done: true },
  { title: "Refine on the fine grit", minutes: 20, done: false },
  { title: "Slice paper cleanly", minutes: 15, done: false },
];

/** The quiet panel beside the form on wider screens. */
function AuthAside() {
  return (
    <aside
      aria-hidden="true"
      className="hidden lg:flex flex-col justify-center gap-10 p-12 xl:p-16 bg-paper-warm border-l border-surface-border"
    >
      <div className="flex items-center gap-4">
        <InteractiveOwlAvatar size={64} />
        <p className="font-serif italic text-2xl text-ink leading-snug max-w-xs">
          &ldquo;Small steps, most days. That&rsquo;s the whole trick.&rdquo;
        </p>
      </div>

      <div className="max-w-sm rounded-2xl bg-white border border-surface-border shadow-card p-5">
        <p className="text-xs font-semibold text-deck-life">Crafts &amp; life</p>
        <p className="mt-1 font-serif italic text-xl text-ink">Whetstone Knife Sharpening</p>
        <ol className="mt-4 space-y-3">
          {SAMPLE_PATH.map((step, i) => {
            const isCurrent = !step.done && SAMPLE_PATH.slice(0, i).every((s) => s.done);
            return (
              <li key={step.title} className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex w-6 h-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                    step.done
                      ? "bg-deck-life text-white"
                      : isCurrent
                      ? "border-2 border-deck-life text-deck-life bg-white"
                      : "border border-surface-border text-ink-muted bg-white"
                  )}
                >
                  {step.done ? <AppIcon name="check-linear" className="w-3.5 h-3.5" /> : i + 1}
                </span>
                <span className={cn("flex-1 text-sm", step.done ? "text-ink-muted" : "text-ink", isCurrent && "font-semibold")}>
                  {step.title}
                </span>
                <span className="text-xs text-ink-muted tabular-nums">{step.minutes} min</span>
              </li>
            );
          })}
        </ol>
      </div>
    </aside>
  );
}

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  /** Line under the form, e.g. "Don't have an account? Sign up". */
  footer: React.ReactNode;
}

/** Shared frame for sign in and sign up. */
export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="min-h-screen grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] bg-canvas text-ink">
      <div className="flex flex-col min-h-screen">
        <header className="px-6 sm:px-10 py-6 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2.5 rounded-lg">
            <Image src="/logo.svg" alt="" width={28} height={28} className="w-7 h-7" />
            <span className="font-display font-bold text-lg text-ink">Skillora</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink transition"
          >
            <AppIcon name="arrow-left-linear" className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
        </header>

        <main id="main" className="flex-1 flex items-center justify-center px-6 sm:px-10 py-8">
          <div className="w-full max-w-sm">
            <h1 className="font-serif italic font-normal text-4xl text-ink tracking-tight">{title}</h1>
            <p className="mt-2 text-[15px] text-ink-muted">{subtitle}</p>
            <div className="mt-8">{children}</div>
            <div className="mt-8 text-sm text-ink-muted">{footer}</div>
          </div>
        </main>

        <footer className="px-6 sm:px-10 py-6 text-xs text-ink-subtle flex flex-wrap gap-x-4 gap-y-1">
          <span>&copy; {new Date().getFullYear()} Skillora</span>
          <Link href="/privacy" className="hover:text-ink">Privacy</Link>
          <Link href="/terms" className="hover:text-ink">Terms</Link>
        </footer>
      </div>
      <AuthAside />
    </div>
  );
}

/** Password rules. Keep in step with Supabase → Authentication → Email (minimum length, "Letters and digits"). */
export const MIN_PASSWORD = 8;
export const PASSWORD_HINT = `At least ${MIN_PASSWORD} characters, with letters and numbers.`;

/** Why Supabase would reject this new password, or null if it's fine. */
export function passwordProblem(password: string): string | null {
  if (password.length < MIN_PASSWORD) return `Use at least ${MIN_PASSWORD} characters.`;
  if (!/[a-z]/i.test(password) || !/\d/.test(password)) return "Use both letters and numbers.";
  return null;
}

/** Error or success line for auth forms, announced to screen readers. */
export function AuthMessage({ tone, children }: { tone: "error" | "success"; children: React.ReactNode }) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "mb-5 flex items-start gap-2 p-3 rounded-xl border text-sm",
        tone === "error"
          ? "bg-danger-light border-danger-border text-danger"
          : "bg-success-light border-success-border text-success"
      )}
    >
      <AppIcon
        name={tone === "error" ? "danger-circle-linear" : "check-circle-linear"}
        className="w-4 h-4 mt-0.5 shrink-0"
      />
      <span>{children}</span>
    </div>
  );
}

type PasswordInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "size">;

/** Password field with a show / hide toggle. */
export function PasswordInput(props: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  return (
    <Input
      {...props}
      type={visible ? "text" : "password"}
      leadingIcon="lock-keyhole-linear"
      trailing={
        <IconButton
          icon={visible ? "eye-closed-linear" : "eye-linear"}
          label={visible ? "Hide password" : "Show password"}
          variant="ghost"
          size="sm"
          onClick={() => setVisible(!visible)}
        />
      }
    />
  );
}
