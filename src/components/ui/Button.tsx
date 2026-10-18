// No "use client": buttonClasses is also used by server-rendered pages (e.g. /c/[token]).
import React from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "accent" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonStyleOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  className?: string;
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-ink text-white hover:bg-brand-600 shadow-xs",
  accent: "bg-accent-vermilion text-white hover:bg-accent-vermilion-hover shadow-xs",
  secondary:
    "bg-surface text-ink border border-surface-border hover:border-brand-300 hover:bg-surface-subtle shadow-2xs",
  ghost: "text-ink-secondary hover:text-ink hover:bg-surface-subtle",
  danger: "bg-danger text-white hover:bg-danger-hover shadow-xs",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-8 px-3.5 text-xs gap-1.5",
  md: "h-10 px-5 text-sm gap-2",
  lg: "h-12 px-7 text-sm gap-2",
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  block = false,
  className,
}: ButtonStyleOptions = {}): string {
  return cn(
    "inline-flex items-center justify-center font-semibold whitespace-nowrap transition-colors cursor-pointer",
    "disabled:opacity-40 disabled:pointer-events-none",
    block ? "w-full rounded-xl" : "rounded-full",
    VARIANTS[variant],
    SIZES[size],
    className
  );
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    Omit<ButtonStyleOptions, "className"> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant, size, block, className, type = "button", ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={buttonClasses({ variant, size, block, className })}
      {...rest}
    />
  );
});
