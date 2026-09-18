import { prisma } from "@/lib/prisma";
import { jsonError, requireOwner } from "@/lib/http";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string; itemId: string }> },
) {
  try {
    const owner = requireOwner(request);
    const { id, itemId } = await context.params;
    const body = (await request.json()) as { status?: string; txHash?: string };
    const cycle = await prisma.payCycle.findFirst({
      where: { id, ownerAddress: owner },
      include: { items: true },
    });
    if (!cycle) return jsonError("Payday not found.", 404);
    const item = cycle.items.find((row) => row.id === itemId);
    if (!item) return jsonError("Payment not found.", 404);

    if (body.status === "skipped") {
      await prisma.payItem.update({
        where: { id: itemId },
        data: { status: "skipped" },
      });
    } else if (body.status === "sent") {
      if (item.status === "unresolved") {
        return jsonError("This handle has no wallet yet.");
      }
      if (!body.txHash) {
        return jsonError("Transaction hash is required after send.");
      }
      await prisma.payItem.update({
        where: { id: itemId },
        data: { status: "sent", txHash: body.txHash },
      });
    } else {
      return jsonError("Status must be sent or skipped.");
    }

    const remaining = await prisma.payItem.count({
      where: { cycleId: id, status: { in: ["pending", "unresolved"] } },
    });
    if (remaining === 0) {
      await prisma.payCycle.update({
        where: { id },
        data: { status: "completed", completedAt: new Date() },
      });
    } else {
      await prisma.payCycle.update({
        where: { id },
        data: { status: "sending" },
      });
    }

    return Response.json({ ok: true, remaining });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not update payment.");
  }
}
