"use client";

import React from "react";
import { cn } from "@/lib/cn";
import { AppIcon } from "./AppIcon";

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  leadingIcon?: string;
  trailing?: React.ReactNode;
  size?: "sm" | "md";
  invalid?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { leadingIcon, trailing, size = "md", invalid, className, ...rest },
  ref
) {
  return (
    <div className="relative">
      {leadingIcon && (
        <AppIcon
          name={leadingIcon}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-subtle pointer-events-none"
        />
      )}
      <input
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          "w-full rounded-xl border bg-white text-sm text-ink placeholder:text-ink-subtle shadow-2xs transition",
          "focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/10",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          invalid ? "border-danger" : "border-surface-border",
          size === "sm" ? "h-9" : "h-11",
          leadingIcon ? "pl-10" : "pl-3.5",
          trailing ? "pr-10" : "pr-3.5",
          className
        )}
        {...rest}
      />
      {trailing && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">{trailing}</div>
      )}
    </div>
  );
});

interface FieldProps {
  label: string;
  htmlFor: string;
  action?: React.ReactNode;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

export function Field({ label, htmlFor, action, hint, children, className }: FieldProps) {
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-1.5">
        <label htmlFor={htmlFor} className="block text-xs font-semibold text-ink">
          {label}
        </label>
        {action}
      </div>
      {children}
      {hint && <p id={`${htmlFor}-hint`} className="mt-1.5 text-xs text-ink-muted">{hint}</p>}
    </div>
  );
}
