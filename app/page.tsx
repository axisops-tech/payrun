import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { HexMark } from "@/components/HexMark";

export default function HomePage() {
  return (
    <main className="paper-lines min-h-[100dvh] overflow-x-clip">
      <section className="fade-up mx-auto flex min-h-[100dvh] w-full max-w-[430px] flex-col justify-center px-5 py-16">
        <div className="mb-8 inline-flex min-w-0 items-center gap-2">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-ink text-gold">
            <HexMark className="h-5 w-5" />
          </span>
          <p className="text-[12px] font-extrabold uppercase tracking-[0.18em] text-ink">Payrun</p>
        </div>
        <p className="font-mono text-[12px] tracking-[0.08em] text-olive">weekly · biweekly · monthly</p>
        <h1 className="mt-6 text-balance text-[clamp(2rem,10vw,2.75rem)] font-extrabold leading-[1.05] tracking-tight text-ink">
          Pay people by name. Not by address.
        </h1>
        <Link
          href="/roster"
          className="nq-btn mt-10 inline-flex min-h-[52px] w-full max-w-full items-center justify-center gap-3 rounded-[8px] px-5 text-[16px] font-bold transition-transform duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
        >
          Open roster
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
            <ArrowRight size={16} weight="bold" />
          </span>
        </Link>
      </section>

      <section className="mx-auto grid w-full max-w-[430px] grid-cols-1 gap-0 border-t border-hairline bg-paper">
        <article className="border-b border-hairline p-5">
          <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-olive">Roster</p>
          <p className="mt-4 break-words font-mono text-[16px] text-ink">
            @raph · <span className="text-gold">240 NIM</span> · weekly
          </p>
          <p className="mt-2 break-words font-mono text-[16px] text-ink">
            @sarah · <span className="text-gold">180 NIM</span> · biweekly
          </p>
        </article>
        <article className="border-b border-hairline p-5">
          <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-olive">Flags</p>
          <p className="mt-4 text-[16px] text-rose">New name · Unresolved</p>
          <p className="mt-2 text-[16px] text-amber">Amount jump</p>
        </article>
        <article className="border-b border-hairline p-5">
          <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-olive">Memo</p>
          <p className="mt-4 break-all font-mono text-[16px] text-ink">payrun:sep-18:@raph</p>
        </article>
        <article className="p-5">
          <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-olive">Log</p>
          <p className="mt-4 text-[16px] text-ink">Every past run. No spreadsheet.</p>
        </article>
      </section>
    </main>
  );
}
