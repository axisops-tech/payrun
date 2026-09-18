"use client";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Button";
import { isUserRejection, useWallet } from "@/components/WalletProvider";
import { fetchCycles } from "@/lib/client-api";
import { formatNim } from "@/lib/money";
import { formatPeriodLabel } from "@/lib/period";
import type { PayCycleView } from "@/lib/types";
import { useEffect, useState } from "react";

export default function LogPage() {
  const wallet = useWallet();
  const [cycles, setCycles] = useState<PayCycleView[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!wallet.address) return;
    fetchCycles(wallet.address)
      .then(setCycles)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not load log."));
  }, [wallet.address]);

  async function onConnect() {
    try {
      const address = await wallet.connect();
      if (address) setCycles(await fetchCycles(address));
    } catch (err) {
      setError(
        isUserRejection(err)
          ? "Account access was cancelled."
          : err instanceof Error
            ? err.message
            : "Could not connect.",
      );
    }
  }

  return (
    <AppShell title="Past runs" subtitle="Every payday, kept.">
      {!wallet.address ? (
        <Button type="button" onClick={onConnect} disabled={!wallet.isReady}>
          Connect to see your log
        </Button>
      ) : null}

      {cycles.length === 0 && wallet.address ? (
        <p className="text-mute">No payday has been prepared yet.</p>
      ) : (
        <ul>
          {cycles.map((cycle) => {
            const sent = cycle.items.filter((item) => item.status === "sent").length;
            const skipped = cycle.items.filter((item) => item.status === "skipped").length;
            const open = openId === cycle.id;
            return (
              <li key={cycle.id} className="border-b border-hairline py-5">
                <button
                  type="button"
                  className="flex min-h-[52px] w-full min-w-0 flex-col items-start gap-1 text-left"
                  onClick={() => setOpenId(open ? null : cycle.id)}
                >
                  <span className="text-[22px] tracking-tight">{formatPeriodLabel(cycle.periodKey)}</span>
                  <span className="font-mono text-[13px] text-mute">
                    {cycle.items.length} people · {sent} sent · {skipped} skipped
                  </span>
                </button>
                {open ? (
                  <ul className="mt-3">
                    {cycle.items.map((item) => (
                      <li key={item.id} className="flex min-w-0 justify-between gap-3 py-2 text-[14px]">
                        <span className="min-w-0">
                          {item.displayHandle}
                          <span className="block break-all font-mono text-[11px] text-mute">{item.memo}</span>
                        </span>
                        <span className="text-right">
                          <span className="font-mono text-gold">{formatNim(item.amountLuna)}</span>
                          <span
                            className={`block text-[11px] font-bold uppercase ${
                              item.status === "sent"
                                ? "text-green"
                                : item.status === "skipped"
                                  ? "text-mute"
                                  : "text-amber"
                            }`}
                          >
                            {item.status}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
      {error ? <p className="mt-4 text-[14px] text-rose">{error}</p> : null}
    </AppShell>
  );
}
