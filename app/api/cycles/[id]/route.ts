import { prisma } from "@/lib/prisma";
import { parseFlags } from "@/lib/flags";
import { displayHandle } from "@/lib/handles";
import { jsonError, requireOwner } from "@/lib/http";
import type { PayCycleView } from "@/lib/types";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const owner = requireOwner(request);
    const { id } = await context.params;
    const cycle = await prisma.payCycle.findFirst({
      where: { id, ownerAddress: owner },
      include: { items: { include: { handle: true }, orderBy: { memo: "asc" } } },
    });
    if (!cycle) return jsonError("Payday not found.", 404);
    const view: PayCycleView = {
      id: cycle.id,
      periodKey: cycle.periodKey,
      status: cycle.status,
      preparedAt: cycle.preparedAt.toISOString(),
      completedAt: cycle.completedAt?.toISOString() ?? null,
      items: cycle.items.map((item) => ({
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
      })),
    };
    return Response.json({ cycle: view });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not load payday.");
  }
}
