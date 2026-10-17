"use client";

import React from "react";
import { cn } from "@/lib/cn";
import { AppIcon } from "./AppIcon";

export type IconButtonVariant = "secondary" | "ghost" | "primary" | "accent";
export type IconButtonSize = "sm" | "md" | "lg";

const VARIANTS: Record<IconButtonVariant, string> = {
  secondary:
    "bg-surface border border-surface-border text-ink-secondary hover:text-ink hover:border-brand-300 hover:bg-surface-subtle shadow-2xs",
  ghost: "text-ink-muted hover:text-ink hover:bg-surface-subtle",
  primary: "bg-ink text-white hover:bg-brand-600 shadow-2xs",
  accent: "bg-accent-vermilion text-white hover:bg-accent-vermilion-hover shadow-2xs",
};

const SIZES: Record<IconButtonSize, { box: string; icon: string }> = {
  sm: { box: "w-8 h-8 rounded-lg", icon: "w-4 h-4" },
  md: { box: "w-9 h-9 rounded-xl", icon: "w-4 h-4" },
  lg: { box: "w-10 h-10 rounded-xl", icon: "w-[18px] h-[18px]" },
};

export interface IconButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** AppIcon name, e.g. "volume-loud-linear". */
  icon: string;
  /** Accessible name; also used as the tooltip unless `title` is given. */
  label: string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  /** Toggle state; sets aria-pressed and the "on" styling. */
  pressed?: boolean;
  iconClassName?: string;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  {
    icon,
    label,
    variant = "secondary",
    size = "md",
    pressed,
    iconClassName,
    className,
    title,
    type = "button",
    ...rest
  },
  ref
) {
  const s = SIZES[size];
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      aria-pressed={pressed}
      title={title ?? label}
      className={cn(
        "inline-flex items-center justify-center shrink-0 transition-colors cursor-pointer",
        "disabled:opacity-40 disabled:pointer-events-none",
        s.box,
        VARIANTS[variant],
        pressed === false && variant === "secondary" && "bg-surface-muted border-transparent text-ink-subtle shadow-none",
        className
      )}
      {...rest}
    >
      <AppIcon name={icon} className={cn(s.icon, iconClassName)} />
    </button>
  );
});
