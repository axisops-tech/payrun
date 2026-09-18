"use client";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Button";
import { FlagChip } from "@/components/FlagChip";
import { isUserRejection, useWallet } from "@/components/WalletProvider";
import { fetchCycle, prepareCycle } from "@/lib/client-api";
import type { FlagCode } from "@/lib/flags";
import { formatNim } from "@/lib/money";
import { formatPeriodLabel } from "@/lib/period";
import type { PayCycleView } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function PaydayPage() {
  const wallet = useWallet();
  const router = useRouter();
  const [cycle, setCycle] = useState<PayCycleView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem("payrun-cycle-id");
    if (!saved || !wallet.address) return;
    fetchCycle(wallet.address, saved)
      .then(setCycle)
      .catch(() => sessionStorage.removeItem("payrun-cycle-id"));
  }, [wallet.address]);

  const counts = useMemo(() => {
    const flags = cycle?.items.flatMap((item) => item.flags) ?? [];
    return {
      newName: flags.filter((flag) => flag === "new_name").length,
      jump: flags.filter((flag) => flag === "amount_jump").length,
      unresolved: flags.filter((flag) => flag === "unresolved").length,
    };
  }, [cycle]);

  async function onPrepare() {
    setBusy(true);
    setError(null);
    try {
      const address = wallet.address ?? (await wallet.connect());
      if (!address) {
        setError("Connect an account to prepare payday.");
        return;
      }
      const next = await prepareCycle(address);
      sessionStorage.setItem("payrun-cycle-id", next.id);
      setCycle(next);
    } catch (err) {
      setError(
        isUserRejection(err)
          ? "Account access was cancelled."
          : err instanceof Error
            ? err.message
            : "Could not prepare payday.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell
      title={cycle ? `Payday · ${formatPeriodLabel(cycle.periodKey)}` : "Payday"}
      subtitle="Review the run."
    >
      {!cycle ? (
        <div className="flex flex-col gap-4">
          <p className="text-[15px] leading-6 text-mute">
            Payrun resolves each handle, compares the last cycle, and flags anything weird. You still click send.
          </p>
          <Button type="button" onClick={onPrepare} disabled={busy || wallet.isConnecting}>
            {busy ? "Preparing…" : "Prepare payday"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => router.push("/log")}>
            Past payday log
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-6 flex flex-wrap gap-2">
            <span className="rounded-[4px] bg-rose-wash px-3 py-2 text-[13px] text-rose">
              {counts.newName} new name
            </span>
            <span className="rounded-[4px] bg-amber-wash px-3 py-2 text-[13px] text-amber">
              {counts.jump} amount jump
            </span>
            <span className="rounded-[4px] bg-rose-wash px-3 py-2 text-[13px] text-rose">
              {counts.unresolved} unresolved
            </span>
          </div>
          <ul className="mb-8">
            {cycle.items.map((item) => (
              <li key={item.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 gap-y-2 border-b border-hairline py-4">
                <div className="min-w-0">
                  <p className="break-words text-[18px]">{item.displayHandle}</p>
                  {item.previousAmountLuna !== null ? (
                    <p className="text-[12px] text-mute">was {formatNim(item.previousAmountLuna)}</p>
                  ) : (
                    <p className="text-[12px] text-mute">first cycle</p>
                  )}
                </div>
                <p className="shrink-0 font-mono font-bold tabular-nums text-gold">{formatNim(item.amountLuna)}</p>
                <div className="col-span-2 flex flex-wrap gap-1">
                  {item.flags.length === 0 ? <FlagChip flag="ok" /> : null}
                  {item.flags.map((flag) => (
                    <FlagChip key={flag} flag={flag as FlagCode} />
                  ))}
                </div>
              </li>
            ))}
          </ul>
          <Button type="button" onClick={() => router.push("/payday/send")}>
            Approve and send next
          </Button>
          <p className="mt-3 text-center text-[13px] text-mute">
            One payment at a time. You still click send.
          </p>
          <Button type="button" variant="ghost" className="mt-4" onClick={() => router.push("/log")}>
            Past payday log
          </Button>
        </>
      )}
      {error ? <p className="mt-4 text-[14px] text-rose">{error}</p> : null}
    </AppShell>
  );
}
