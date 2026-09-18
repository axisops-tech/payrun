"use client";

import { BottomNav } from "@/components/BottomNav";
import { HexMark } from "@/components/HexMark";
import { WalletBanner } from "@/components/WalletBanner";
import type { ReactNode } from "react";

export function AppShell({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-[430px] flex-col overflow-x-clip bg-bone">
      <WalletBanner />
      <header className="fade-up px-5 pb-2 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <div className="inline-flex min-w-0 items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-ink text-gold">
            <HexMark className="h-4 w-4" />
          </span>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-ink">Payrun</p>
        </div>
        <h1 className="mt-4 break-words text-balance font-sans text-[clamp(1.75rem,8vw,2.25rem)] font-extrabold leading-[1.05] tracking-tight text-ink">
          {title}
        </h1>
        {subtitle ? <p className="mt-3 max-w-[34ch] text-[15px] leading-6 text-mute">{subtitle}</p> : null}
      </header>
      <main className="fade-up min-w-0 flex-1 px-5 pb-8 pt-4" style={{ animationDelay: "80ms" }}>
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
