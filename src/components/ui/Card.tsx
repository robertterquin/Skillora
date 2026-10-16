import React from "react";
import { cn } from "@/lib/cn";

interface CardProps extends React.HTMLAttributes<HTMLElement> {
  as?: "div" | "section" | "article";
}

export function Card({ as: Tag = "div", className, ...rest }: CardProps) {
  return (
    <Tag
      className={cn("bg-surface rounded-2xl border border-surface-border shadow-card transition-all duration-200", className)}
      {...rest}
    />
  );
}
