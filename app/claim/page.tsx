"use client";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Button";
import { isUserRejection, useWallet } from "@/components/WalletProvider";
import { claimHandle } from "@/lib/client-api";
import { normalizeHandle } from "@/lib/handles";
import { FormEvent, useState } from "react";

export default function ClaimPage() {
  const wallet = useWallet();
  const [handle, setHandle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onClaim(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const normalized = normalizeHandle(handle);
      const message = `payrun:claim:@${normalized}`;
      const address = wallet.address ?? (await wallet.connect());
      if (!address) {
        setError("Connect a Nimiq account to claim.");
        return;
      }
      const signed = await wallet.signMessage(message);
      await claimHandle(address, {
        handle: normalized,
        message,
        signature: signed.signature,
        publicKey: signed.publicKey,
      });
      setDone(true);
    } catch (err) {
      setError(
        isUserRejection(err)
          ? "Signing was cancelled. The handle was not claimed."
          : err instanceof Error
            ? err.message
            : "Could not claim handle.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell title="Claim" subtitle="Bind your handle to this wallet.">
      {done ? (
        <p className="text-[16px]">Handle claimed. Payday can resolve it on the next run.</p>
      ) : (
        <form onSubmit={onClaim} className="nq-card flex flex-col gap-4 p-4">
          <label className="text-[13px] text-mute">
            Handle
            <input
              value={handle}
              onChange={(event) => setHandle(event.target.value)}
              placeholder="@raph"
              className="mt-1 min-h-[52px] w-full rounded-[8px] border border-hairline bg-paper px-3 outline-none focus:ring-2 focus:ring-olive/40"
            />
          </label>
          <Button type="submit" disabled={busy || !wallet.isReady}>
            {busy ? "Waiting for signature…" : "Sign and claim"}
          </Button>
          <p className="text-[13px] text-mute">
            One confirmation. Message is payrun:claim:@handle.
          </p>
        </form>
      )}
      {error ? <p className="mt-4 text-[14px] text-rose">{error}</p> : null}
    </AppShell>
  );
}
