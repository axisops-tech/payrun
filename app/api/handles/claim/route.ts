import { prisma } from "@/lib/prisma";
import { normalizeHandle } from "@/lib/handles";
import { jsonError, requireOwner } from "@/lib/http";

export async function POST(request: Request) {
  try {
    const address = requireOwner(request);
    const body = (await request.json()) as {
      handle?: string;
      message?: string;
      signature?: string;
      publicKey?: string;
    };
    const handleName = normalizeHandle(body.handle ?? "");
    const expected = `payrun:claim:@${handleName}`;
    if (body.message !== expected) {
      return jsonError("Sign the exact claim message shown in the app.");
    }
    if (!body.signature || !body.publicKey) {
      return jsonError("Wallet signature is required to claim a handle.");
    }

    const takenByOther = await prisma.handle.findFirst({
      where: { nimiqAddress: address, handle: { not: handleName } },
    });
    if (takenByOther) {
      return jsonError(`This wallet already claimed @${takenByOther.handle}.`);
    }

    const existing = await prisma.handle.findUnique({ where: { handle: handleName } });
    if (existing?.nimiqAddress && existing.nimiqAddress !== address) {
      return jsonError("That handle is already claimed.");
    }

    const record = await prisma.handle.upsert({
      where: { handle: handleName },
      create: {
        handle: handleName,
        nimiqAddress: address,
        claimedAt: new Date(),
      },
      update: {
        nimiqAddress: address,
        claimedAt: new Date(),
      },
    });

    return Response.json({
      handle: record.handle,
      nimiqAddress: record.nimiqAddress,
      proof: { message: body.message, signature: body.signature, publicKey: body.publicKey },
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not claim handle.");
  }
}
