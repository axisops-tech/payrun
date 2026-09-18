export type FlagCode = "new_name" | "amount_jump" | "unresolved";

export const AMOUNT_JUMP_RATIO = 0.25;

export function detectFlags(input: {
  hasWallet: boolean;
  previousAmountLuna: number | null;
  amountLuna: number;
}): FlagCode[] {
  const flags: FlagCode[] = [];
  if (!input.hasWallet) {
    flags.push("unresolved");
  }
  if (input.previousAmountLuna === null) {
    flags.push("new_name");
  } else if (
    input.previousAmountLuna > 0 &&
    Math.abs(input.amountLuna - input.previousAmountLuna) / input.previousAmountLuna >
      AMOUNT_JUMP_RATIO
  ) {
    flags.push("amount_jump");
  }
  return flags;
}

export function parseFlags(flagsJson: string): FlagCode[] {
  try {
    const parsed = JSON.parse(flagsJson) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (flag): flag is FlagCode =>
        flag === "new_name" || flag === "amount_jump" || flag === "unresolved",
    );
  } catch {
    return [];
  }
}

export function flagLabel(flag: FlagCode): string {
  if (flag === "new_name") return "New name";
  if (flag === "amount_jump") return "Amount jump";
  return "Unresolved";
}
