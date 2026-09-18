export function readOwner(request: Request): string | null {
  const header = request.headers.get("x-nimiq-address");
  if (header?.trim()) return header.trim();
  const url = new URL(request.url);
  const query = url.searchParams.get("owner");
  return query?.trim() || null;
}

export function requireOwner(request: Request): string {
  const owner = readOwner(request);
  if (!owner) {
    throw new Error("Connect a Nimiq address first.");
  }
  return owner;
}

export function jsonError(message: string, status = 400): Response {
  return Response.json({ error: message }, { status });
}
