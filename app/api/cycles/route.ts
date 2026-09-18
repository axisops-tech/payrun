import { prisma } from "@/lib/prisma";
import { detectFlags, parseFlags } from "@/lib/flags";
import { displayHandle } from "@/lib/handles";
import { jsonError, requireOwner } from "@/lib/http";
import { buildMemo, periodKeyFromDate } from "@/lib/period";
import type { PayCycleView, PayItemView } from "@/lib/types";

function toItemView(item: {
  id: string;
  amountLuna: number;
  previousAmountLuna: number | null;
  flagsJson: string;
  memo: string;
  txHash: string | null;
  status: string;
  handle: { handle: string; nimiqAddress: string | null };
}): PayItemView {
  return {
    id: item.id,
    handle: item.handle.handle,
    displayHandle: displayHandle(item.handle.handle),
    amountLuna: item.amountLuna,
    previousAmountLuna: item.previousAmountLuna,
    flags: parseFlags(item.flagsJson),
    memo: item.memo,
    txHash: item.txHash,
    status: item.status,
    nimiqAddress: item.handle.nimiqAddress,
  };
}

function toCycleView(cycle: {
  id: string;
  periodKey: string;
  status: string;
  preparedAt: Date;
  completedAt: Date | null;
  items: Parameters<typeof toItemView>[0][];
}): PayCycleView {
  return {
    id: cycle.id,
    periodKey: cycle.periodKey,
    status: cycle.status,
    preparedAt: cycle.preparedAt.toISOString(),
    completedAt: cycle.completedAt?.toISOString() ?? null,
    items: cycle.items.map(toItemView),
  };
}

export async function GET(request: Request) {
  try {
    const owner = requireOwner(request);
    const cycles = await prisma.payCycle.findMany({
      where: { ownerAddress: owner },
      include: { items: { include: { handle: true }, orderBy: { memo: "asc" } } },
      orderBy: { preparedAt: "desc" },
    });
    return Response.json({ cycles: cycles.map(toCycleView) });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not load payday log.");
  }
}

export async function POST(request: Request) {
  try {
    const owner = requireOwner(request);
    const roster = await prisma.rosterEntry.findMany({
      where: { ownerAddress: owner },
      include: { handle: true },
      orderBy: { createdAt: "asc" },
    });
    if (roster.length === 0) {
      return jsonError("Add people to the roster before preparing a payday.");
    }

    const periodKey = periodKeyFromDate();
    const openCycle = await prisma.payCycle.findFirst({
      where: {
        ownerAddress: owner,
        periodKey,
        status: { in: ["prepared", "sending"] },
      },
      include: { items: { include: { handle: true }, orderBy: { memo: "asc" } } },
    });
    if (openCycle) {
      return Response.json({ cycle: toCycleView(openCycle), reused: true });
    }

    const lastCompleted = await prisma.payCycle.findFirst({
      where: { ownerAddress: owner, status: "completed" },
      include: { items: true },
      orderBy: { completedAt: "desc" },
    });
    const previousByHandle = new Map<string, number>();
    for (const item of lastCompleted?.items ?? []) {
      if (item.status === "sent") {
        previousByHandle.set(item.handleId, item.amountLuna);
      }
    }

    const cycle = await prisma.payCycle.create({
      data: {
        ownerAddress: owner,
        periodKey,
        status: "prepared",
        items: {
          create: roster.map((entry) => {
            const previous = previousByHandle.get(entry.handleId) ?? null;
            const flags = detectFlags({
              hasWallet: Boolean(entry.handle.nimiqAddress),
              previousAmountLuna: previous,
              amountLuna: entry.amountLuna,
            });
            return {
              handleId: entry.handleId,
              amountLuna: entry.amountLuna,
              previousAmountLuna: previous,
              flagsJson: JSON.stringify(flags),
              memo: buildMemo(periodKey, entry.handle.handle),
              status: flags.includes("unresolved") ? "unresolved" : "pending",
            };
          }),
        },
      },
      include: { items: { include: { handle: true }, orderBy: { memo: "asc" } } },
    });

    return Response.json({ cycle: toCycleView(cycle), reused: false });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not prepare payday.");
  }
}
