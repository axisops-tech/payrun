import type { RosterPerson, PayCycleView } from "@/lib/types";

async function parseJson<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(data.error || "Request failed.");
  }
  return data;
}

function withOwner(owner: string | null, init?: RequestInit): RequestInit {
  const headers = new Headers(init?.headers);
  if (owner) headers.set("x-nimiq-address", owner);
  headers.set("content-type", "application/json");
  return { ...init, headers };
}

export async function fetchRoster(owner: string): Promise<RosterPerson[]> {
  const data = await parseJson<{ people: RosterPerson[] }>(
    await fetch(`/api/roster?owner=${encodeURIComponent(owner)}`, withOwner(owner)),
  );
  return data.people;
}

export async function saveRosterPerson(
  owner: string,
  input: { handle: string; amount: string; cadence: string },
): Promise<RosterPerson> {
  const data = await parseJson<{ person: RosterPerson }>(
    await fetch(
      "/api/roster",
      withOwner(owner, { method: "POST", body: JSON.stringify(input) }),
    ),
  );
  return data.person;
}

export async function removeRosterPerson(owner: string, id: string): Promise<void> {
  await parseJson(
    await fetch(`/api/roster?id=${encodeURIComponent(id)}`, withOwner(owner, { method: "DELETE" })),
  );
}

export async function prepareCycle(owner: string): Promise<PayCycleView> {
  const data = await parseJson<{ cycle: PayCycleView }>(
    await fetch("/api/cycles", withOwner(owner, { method: "POST", body: JSON.stringify({}) })),
  );
  return data.cycle;
}

export async function fetchCycles(owner: string): Promise<PayCycleView[]> {
  const data = await parseJson<{ cycles: PayCycleView[] }>(
    await fetch(`/api/cycles?owner=${encodeURIComponent(owner)}`, withOwner(owner)),
  );
  return data.cycles;
}

export async function fetchCycle(owner: string, id: string): Promise<PayCycleView> {
  const data = await parseJson<{ cycle: PayCycleView }>(
    await fetch(`/api/cycles/${id}?owner=${encodeURIComponent(owner)}`, withOwner(owner)),
  );
  return data.cycle;
}

export async function updatePayItem(
  owner: string,
  cycleId: string,
  itemId: string,
  body: { status: "sent" | "skipped"; txHash?: string },
): Promise<{ remaining: number }> {
  return parseJson(
    await fetch(
      `/api/cycles/${cycleId}/items/${itemId}`,
      withOwner(owner, { method: "PATCH", body: JSON.stringify(body) }),
    ),
  );
}

export async function claimHandle(
  owner: string,
  input: { handle: string; message: string; signature: string; publicKey: string },
): Promise<void> {
  await parseJson(
    await fetch("/api/handles/claim", withOwner(owner, { method: "POST", body: JSON.stringify(input) })),
  );
}

export async function fetchHistory(handle: string) {
  return parseJson<{
    handle: string;
    displayHandle: string;
    claimed: boolean;
    nimiqAddress?: string | null;
    payments: Array<{
      id: string;
      amountLuna: number;
      memo: string;
      txHash: string | null;
      periodKey: string;
      sentAt: string;
    }>;
  }>(await fetch(`/api/history/${encodeURIComponent(handle)}`));
}
