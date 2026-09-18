"use client";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Button";
import { isUserRejection, useWallet } from "@/components/WalletProvider";
import { CADENCES, cadenceLabel } from "@/lib/handles";
import { fetchRoster, removeRosterPerson, saveRosterPerson } from "@/lib/client-api";
import { formatNim } from "@/lib/money";
import type { RosterPerson } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function RosterPage() {
  const wallet = useWallet();
  const router = useRouter();
  const [people, setPeople] = useState<RosterPerson[]>([]);
  const [handle, setHandle] = useState("");
  const [amount, setAmount] = useState("");
  const [cadence, setCadence] = useState("weekly");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async (address: string) => {
    const rows = await fetchRoster(address);
    setPeople(rows);
  }, []);

  useEffect(() => {
    if (!wallet.address) return;
    load(wallet.address).catch((err: unknown) => {
      setError(err instanceof Error ? err.message : "Could not load roster.");
    });
  }, [load, wallet.address]);

  async function ensureAddress(): Promise<string | null> {
    if (wallet.address) return wallet.address;
    if (!wallet.isReady) {
      setError("Open Payrun inside Nimiq Pay to manage a roster.");
      return null;
    }
    try {
      setError(null);
      return await wallet.connect();
    } catch (err) {
      setError(
        isUserRejection(err)
          ? "Account access was cancelled. The roster is unchanged."
          : err instanceof Error
            ? err.message
            : "Could not connect.",
      );
      return null;
    }
  }

  async function onAdd(event: React.FormEvent) {
    event.preventDefault();
    const address = await ensureAddress();
    if (!address) return;
    setBusy(true);
    try {
      await saveRosterPerson(address, { handle, amount, cadence });
      await load(address);
      setHandle("");
      setAmount("");
      setCadence("weekly");
      setShowForm(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add person.");
    } finally {
      setBusy(false);
    }
  }

  async function onRemove(id: string) {
    const address = await ensureAddress();
    if (!address) return;
    try {
      await removeRosterPerson(address, id);
      await load(address);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove person.");
    }
  }

  return (
    <AppShell title="Team" subtitle="Roster of handles and amounts.">
      {people.length === 0 && !showForm ? (
        <p className="mb-8 text-[16px] leading-6 text-mute">
          No one on the roster yet. Add people by name, not address.
        </p>
      ) : (
        <ul className="mb-8">
          {people.map((person) => (
            <li key={person.id} className="grid min-h-[64px] grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 border-b border-hairline py-4">
              <p className="min-w-0 break-words text-[18px] text-ink">{person.displayHandle}</p>
              <p className="font-mono text-[16px] font-bold tabular-nums text-gold">{formatNim(person.amountLuna)}</p>
              <p className="text-[12px] text-mute">
                {cadenceLabel(person.cadence)}
                {!person.claimed ? " · Unresolved" : ""}
              </p>
              <button
                type="button"
                className="min-h-[44px] justify-self-end text-[13px] text-mute underline"
                onClick={() => onRemove(person.id)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      {showForm ? (
        <form onSubmit={onAdd} className="nq-card flex flex-col gap-4 p-4">
          <label className="block text-[13px] text-mute">
            Handle
            <input
              value={handle}
              onChange={(event) => setHandle(event.target.value)}
              placeholder="@raph"
              className="mt-1 min-h-[52px] w-full rounded-[8px] border border-hairline bg-paper px-3 text-ink outline-none focus:ring-2 focus:ring-olive/40"
            />
          </label>
          <label className="block text-[13px] text-mute">
            Amount (NIM)
            <input
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              inputMode="decimal"
              placeholder="240"
              className="mt-1 min-h-[52px] w-full rounded-[8px] border border-hairline bg-paper px-3 font-mono text-ink outline-none focus:ring-2 focus:ring-olive/40"
            />
          </label>
          <label className="block text-[13px] text-mute">
            Cadence
            <select
              value={cadence}
              onChange={(event) => setCadence(event.target.value)}
              className="mt-1 min-h-[52px] w-full rounded-[8px] border border-hairline bg-paper px-3 text-ink outline-none"
            >
              {CADENCES.map((item) => (
                <option key={item} value={item}>
                  {cadenceLabel(item)}
                </option>
              ))}
            </select>
          </label>
          <Button type="submit" disabled={busy}>
            {busy ? "Saving…" : "Save person"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
            Cancel
          </Button>
        </form>
      ) : (
        <div className="flex flex-col gap-3">
          <Button type="button" onClick={() => setShowForm(true)}>
            Add person
          </Button>
          <Button type="button" variant="ghost" onClick={() => router.push("/payday")}>
            Prepare payday
          </Button>
        </div>
      )}

      {error ? <p className="mt-4 text-[14px] text-rose">{error}</p> : null}
    </AppShell>
  );
}
