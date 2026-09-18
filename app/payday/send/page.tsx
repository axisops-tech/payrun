"use client";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Button";
import { FlagChip } from "@/components/FlagChip";
import { isUserRejection, useWallet } from "@/components/WalletProvider";
import { fetchCycle, updatePayItem } from "@/lib/client-api";
import type { FlagCode } from "@/lib/flags";
import { formatNim } from "@/lib/money";
import type { PayCycleView, PayItemView } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

function nextSendable(cycle: PayCycleView): PayItemView | null {
  return cycle.items.find((item) => item.status === "pending") ?? null;
}

export default function SendPage() {
  const wallet = useWallet();
  const router = useRouter();
  const [cycle, setCycle] = useState<PayCycleView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    const id = sessionStorage.getItem("payrun-cycle-id");
    const address = wallet.address;
    if (!id || !address) return;
    const next = await fetchCycle(address, id);
    setCycle(next);
  }, [wallet.address]);

  useEffect(() => {
    reload().catch((err: unknown) => {
      setError(err instanceof Error ? err.message : "Could not load payday.");
    });
  }, [reload]);

  const current = cycle ? nextSendable(cycle) : null;
  const remaining = cycle?.items.filter((item) => item.status === "pending" || item.status === "unresolved").length ?? 0;
  const total = cycle?.items.length ?? 0;

  async function onSend() {
    if (!cycle || !current) return;
    if (!current.nimiqAddress) {
      setError("This handle has no wallet yet.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const address = wallet.address ?? (await wallet.connect());
      if (!address) {
        setError("Connect an account to send.");
        return;
      }
      const txHash = await wallet.sendWithData({
        recipient: current.nimiqAddress,
        value: current.amountLuna,
        data: current.memo,
      });
      await updatePayItem(address, cycle.id, current.id, { status: "sent", txHash });
      await reload();
    } catch (err) {
      setError(
        isUserRejection(err)
          ? "Send was cancelled. Nothing left the wallet."
          : err instanceof Error
            ? err.message
            : "Send failed.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function onSkip() {
    if (!cycle || !current) return;
    const address = wallet.address;
    if (!address) return;
    setBusy(true);
    try {
      await updatePayItem(address, cycle.id, current.id, { status: "skipped" });
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not skip.");
    } finally {
      setBusy(false);
    }
  }

  if (cycle && !current) {
    return (
      <AppShell title="Payday" subtitle="This run is done.">
        <p className="mb-6 text-[16px] text-mute">Every payment was sent or skipped. The log keeps the record.</p>
        <Button type="button" onClick={() => router.push("/log")}>
          Open payday log
        </Button>
      </AppShell>
    );
  }

  return (
    <AppShell title="Payrun" subtitle="Send one-by-one">
      {!current ? (
        <p className="text-mute">Prepare a payday first.</p>
      ) : (
        <>
          <p className="text-[13px] text-mute">Handle</p>
          <p className="break-words text-[clamp(1.75rem,8vw,2rem)] tracking-tight">{current.displayHandle}</p>
          <p className="mt-6 text-[13px] text-mute">Amount</p>
          <p className="break-all font-mono text-[clamp(2rem,10vw,2.5rem)] font-bold leading-none tracking-tight text-gold">
            {formatNim(current.amountLuna)}
          </p>
          <div className="nq-card mt-6 break-all px-4 py-4 font-mono text-[14px]">{current.memo}</div>
          <p className="mt-4 text-[13px] text-mute">
            {remaining} of {total} remaining
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {current.flags.map((flag) => (
              <FlagChip key={flag} flag={flag as FlagCode} />
            ))}
          </div>
          <div className="mt-8 flex flex-col gap-3">
            <Button type="button" onClick={onSend} disabled={busy || !wallet.isReady}>
              {busy ? "Waiting for wallet…" : "Send in wallet"}
            </Button>
            <Button type="button" variant="secondary" onClick={onSkip} disabled={busy}>
              Skip this person
            </Button>
          </div>
          <p className="mt-4 text-[13px] leading-5 text-mute">
            Nimiq Pay will ask you to confirm. Do not queue more sends.
          </p>
        </>
      )}
      {error ? <p className="mt-4 text-[14px] text-rose">{error}</p> : null}
    </AppShell>
  );
}
