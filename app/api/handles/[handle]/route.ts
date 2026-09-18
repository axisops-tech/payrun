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
    const record = await prisma.handle.findUnique({ where: { handle: handleName } });
    if (!record) {
      return Response.json({
        handle: handleName,
        displayHandle: displayHandle(handleName),
        claimed: false,
        nimiqAddress: null,
      });
    }
    return Response.json({
      handle: record.handle,
      displayHandle: displayHandle(record.handle),
      claimed: Boolean(record.nimiqAddress),
      nimiqAddress: record.nimiqAddress,
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not look up handle.");
  }
}
