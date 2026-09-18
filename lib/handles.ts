export const CADENCES = ["weekly", "biweekly", "monthly"] as const;

export type Cadence = (typeof CADENCES)[number];

export function normalizeHandle(input: string): string {
  const handle = input.trim().replace(/^@+/, "").toLowerCase();
  if (!/^[a-z0-9_]{2,24}$/.test(handle)) {
    throw new Error("Handles are 2–24 letters, numbers, or underscores.");
  }
  return handle;
}

export function displayHandle(handle: string): string {
  return `@${handle.replace(/^@+/, "")}`;
}

export function isCadence(value: string): value is Cadence {
  return (CADENCES as readonly string[]).includes(value);
}

export function cadenceLabel(cadence: string): string {
  if (cadence === "biweekly") return "Biweekly";
  if (cadence === "monthly") return "Monthly";
  return "Weekly";
}
