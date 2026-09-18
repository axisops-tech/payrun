import { prisma } from "@/lib/prisma";
import { displayHandle, normalizeHandle } from "@/lib/handles";
import { jsonError } from "@/lib/http";

export async function GET(
  _request: Request,
  context: { params: Promise<{ handle: string }> },
) {
  try {
    const { handle: raw } = await context.params;
    const handleName = normalizeHandle(raw);
    const record = await prisma.handle.findUnique({
      where: { handle: handleName },
      include: {
        payItems: {
          where: { status: "sent" },
          include: { cycle: true },
          orderBy: { updatedAt: "desc" },
        },
      },
    });
    if (!record) {
      return Response.json({
        handle: handleName,
        displayHandle: displayHandle(handleName),
        claimed: false,
        payments: [],
      });
    }
    return Response.json({
      handle: record.handle,
      displayHandle: displayHandle(record.handle),
      claimed: Boolean(record.nimiqAddress),
      nimiqAddress: record.nimiqAddress,
      payments: record.payItems.map((item) => ({
        id: item.id,
        amountLuna: item.amountLuna,
        memo: item.memo,
        txHash: item.txHash,
        periodKey: item.cycle.periodKey,
        sentAt: item.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not load history.");
  }
}
