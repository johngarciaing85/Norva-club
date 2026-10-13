"use client";

import { cn } from "cn";

interface LogoProps {
  variant?: "light" | "dark";
  className?: string;
}

export function Logo({ variant = "dark", className }: LogoProps) {
  return (
    <span
      className={cn(
        "font-heading font-black tracking-[0.15em] uppercase select-none",
        variant === "dark" ? "text-foreground" : "text-white",
        className
      )}
    >
      N&Oacute;RVA STYLE
    </span>
  );
}
