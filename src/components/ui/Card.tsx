import React from "react";
import { cn } from "@/lib/cn";

interface CardProps extends React.HTMLAttributes<HTMLElement> {
  as?: "div" | "section" | "article";
}

/** White surface with the standard border, radius, and elevation. Padding is set by the caller. */
export function Card({ as: Tag = "div", className, ...rest }: CardProps) {
  return (
    <Tag
      className={cn("bg-white rounded-3xl border border-surface-border shadow-xs", className)}
      {...rest}
    />
  );
}
