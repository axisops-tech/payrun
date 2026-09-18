"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarBlank, ClockCounterClockwise, UsersThree } from "@phosphor-icons/react";

const ITEMS = [
  { href: "/roster", label: "Roster", icon: UsersThree },
  { href: "/payday", label: "Payday", icon: CalendarBlank },
  { href: "/history", label: "History", icon: ClockCounterClockwise },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="sticky bottom-0 z-20 w-full border-t border-hairline bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm">
      <ul className="grid w-full grid-cols-3 px-2 py-1">
        {ITEMS.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/roster" && pathname.startsWith(item.href)) ||
            (item.href === "/payday" && pathname.startsWith("/log"));
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-[10px] text-[12px] font-bold tracking-wide ${
                  active ? "bg-[rgba(5,130,202,0.1)] text-olive" : "text-mute"
                }`}
              >
                <Icon size={22} weight={active ? "fill" : "regular"} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
