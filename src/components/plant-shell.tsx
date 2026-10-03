"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ClipboardList, Library, Radio, Shuffle, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Shift board", icon: Radio },
  { href: "/faults", label: "Fault log", icon: ClipboardList },
  { href: "/work-orders", label: "Work orders", icon: Wrench },
  { href: "/library", label: "Library", icon: Library },
  { href: "/handoff", label: "Handoff", icon: Shuffle },
];

export function PlantShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [clock, setClock] = useState("");

  useEffect(() => {
    const tick = () => {
      setClock(
        new Intl.DateTimeFormat("en-US", {
          weekday: "short",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: "America/Chicago",
        }).format(new Date()) + " CT",
      );
    };
    tick();
    const id = setInterval(tick, 15_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur">
        <div className="h-1 w-full bg-primary" />
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.18em] text-primary uppercase">
              CNH plant desk
            </p>
            <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
              Fargo combine final + Racine dealer-prep
            </h1>
            <p className="text-xs text-muted-foreground">
              Radio and paper tags still exist. This desk is the ranked fault
              log for the tablet on the stand.
            </p>
          </div>
          <div className="text-right font-mono text-sm">
            <div className="text-foreground">{clock || "—"}</div>
            <div className="text-xs text-muted-foreground">No login · plant LAN</div>
          </div>
        </div>
        <nav className="mx-auto flex w-full max-w-7xl gap-1 overflow-x-auto px-3 pb-2">
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex min-h-11 min-w-fit items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-5">{children}</main>
    </div>
  );
}
