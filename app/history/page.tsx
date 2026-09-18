"use client";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Button";
import { fetchHistory } from "@/lib/client-api";
import { formatNim } from "@/lib/money";
import { formatPeriodLabel } from "@/lib/period";
import { useState } from "react";

type HistoryPayload = Awaited<ReturnType<typeof fetchHistory>>;

export default function HistoryPage() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<HistoryPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function lookup() {
    setError(null);
    try {
      setResult(await fetchHistory(query));
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : "Could not look up handle.");
    }
  }

  return (
    <AppShell title="History" subtitle="Look up a handle.">
      <form
        className="nq-card flex flex-col gap-3 p-4"
        onSubmit={(event) => {
          event.preventDefault();
          void lookup();
        }}
      >
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="@raph"
          className="min-h-[52px] rounded-[8px] border border-hairline bg-paper px-3 text-[16px] outline-none focus:ring-2 focus:ring-olive/40"
        />
        <Button type="button" onClick={() => void lookup()}>
          Look up
        </Button>
      </form>

      {result ? (
        <section className="mt-8">
          <h2 className="text-[32px] tracking-tight">{result.displayHandle}</h2>
          <p className="mt-1 text-[13px] text-mute">
            {result.claimed ? "Claimed wallet on file." : "Not claimed yet."}
          </p>
          {result.payments.length === 0 ? (
            <p className="mt-6 text-mute">No payments recorded for this handle.</p>
          ) : (
            <ul className="mt-6">
              {result.payments.map((payment) => (
                <li key={payment.id} className="flex min-h-[64px] min-w-0 items-baseline justify-between gap-3 border-b border-hairline py-4">
                  <div className="min-w-0">
                    <p className="text-[16px]">{formatPeriodLabel(payment.periodKey)}</p>
                    <p className="break-all font-mono text-[12px] text-mute">{payment.memo}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-mono font-bold tabular-nums text-gold">{formatNim(payment.amountLuna)}</p>
                    <p className="text-[12px] font-bold text-green">Sent</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      <p className="mt-10 text-[13px] text-mute">
        Paid on a team? <a className="underline" href="/claim">Claim your handle</a> so payday can resolve it.
      </p>
      {error ? <p className="mt-4 text-[14px] text-rose">{error}</p> : null}
    </AppShell>
  );
}
