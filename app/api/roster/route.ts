import { prisma } from "@/lib/prisma";
import { displayHandle, isCadence, normalizeHandle } from "@/lib/handles";
import { jsonError, requireOwner } from "@/lib/http";
import { parseNimInput } from "@/lib/money";
import type { RosterPerson } from "@/lib/types";

function toPerson(entry: {
  id: string;
  amountLuna: number;
  cadence: string;
  handle: { handle: string; nimiqAddress: string | null };
}): RosterPerson {
  return {
    id: entry.id,
    handle: entry.handle.handle,
    displayHandle: displayHandle(entry.handle.handle),
    amountLuna: entry.amountLuna,
    cadence: entry.cadence,
    nimiqAddress: entry.handle.nimiqAddress,
    claimed: Boolean(entry.handle.nimiqAddress),
  };
}

export async function GET(request: Request) {
  try {
    const owner = requireOwner(request);
    const entries = await prisma.rosterEntry.findMany({
      where: { ownerAddress: owner },
      include: { handle: true },
      orderBy: { createdAt: "asc" },
    });
    return Response.json({ people: entries.map(toPerson) });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not load roster.");
  }
}

export async function POST(request: Request) {
  try {
    const owner = requireOwner(request);
    const body = (await request.json()) as {
      handle?: string;
      amount?: string | number;
      cadence?: string;
    };
    const handleName = normalizeHandle(body.handle ?? "");
    const cadence = body.cadence ?? "weekly";
    if (!isCadence(cadence)) {
      return jsonError("Cadence must be weekly, biweekly, or monthly.");
    }
    const amountLuna = parseNimInput(String(body.amount ?? ""));
    const handle = await prisma.handle.upsert({
      where: { handle: handleName },
      create: { handle: handleName },
      update: {},
    });
    const entry = await prisma.rosterEntry.upsert({
      where: {
        ownerAddress_handleId: { ownerAddress: owner, handleId: handle.id },
      },
      create: {
        ownerAddress: owner,
        handleId: handle.id,
        amountLuna,
        cadence,
      },
      update: { amountLuna, cadence },
      include: { handle: true },
    });
    return Response.json({ person: toPerson(entry) });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not save person.");
  }
}

export async function DELETE(request: Request) {
  try {
    const owner = requireOwner(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return jsonError("Missing roster id.");
    const existing = await prisma.rosterEntry.findFirst({
      where: { id, ownerAddress: owner },
    });
    if (!existing) return jsonError("Person not on this roster.", 404);
    await prisma.rosterEntry.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not remove person.");
  }
}
