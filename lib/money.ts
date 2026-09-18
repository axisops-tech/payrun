export const LUNA_PER_NIM = 100_000;

export function nimToLuna(nim: number): number {
  return Math.round(nim * LUNA_PER_NIM);
}

export function lunaToNim(luna: number): number {
  return luna / LUNA_PER_NIM;
}

export function formatNim(luna: number): string {
  const nim = lunaToNim(luna);
  if (Number.isInteger(nim)) {
    return `${nim} NIM`;
  }
  return `${nim.toLocaleString("en-US", { maximumFractionDigits: 5 })} NIM`;
}

export function parseNimInput(raw: string): number {
  const value = Number.parseFloat(raw.trim());
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error("Enter an amount greater than zero.");
  }
  return nimToLuna(value);
}
