"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  children: ReactNode;
};

export function Button({ variant = "primary", className = "", children, ...props }: Props) {
  const base =
    "inline-flex min-h-[52px] w-full items-center justify-center px-4 text-[16px] font-bold transition-transform duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] disabled:opacity-40";
  const styles =
    variant === "primary"
      ? "nq-btn rounded-[8px]"
      : variant === "secondary"
        ? "rounded-[8px] border border-hairline bg-paper text-ink"
        : "rounded-[8px] text-olive underline decoration-olive underline-offset-4";
  return (
    <button className={`${base} ${styles} ${className}`} {...props}>
      {children}
    </button>
  );
}
