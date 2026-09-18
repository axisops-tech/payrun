import { flagLabel, type FlagCode } from "@/lib/flags";

export function FlagChip({ flag }: { flag: FlagCode | "ok" }) {
  if (flag === "ok") {
    return (
      <span className="rounded-[4px] bg-[rgba(33,188,165,0.12)] px-2 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-green">
        OK
      </span>
    );
  }
  const rose = flag === "new_name" || flag === "unresolved";
  return (
    <span
      className={`rounded-[4px] px-2 py-1 text-[11px] font-bold uppercase tracking-[0.08em] ${
        rose ? "bg-rose-wash text-rose" : "bg-amber-wash text-amber"
      }`}
    >
      {flagLabel(flag)}
    </span>
  );
}
