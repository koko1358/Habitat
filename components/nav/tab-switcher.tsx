"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav-items";
import { cn } from "@/lib/utils";

const TAB_SIZE = 40;
const TAB_GAP = 2;
const TAB_STEP = TAB_SIZE + TAB_GAP;

function isActiveHref(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

/** The pill icon tab switcher from taphabit:design.html's `.tabs`/`.halo`/`.tab-btn`. */
export function TabSwitcher() {
  const pathname = usePathname();
  const activeIndex = NAV_ITEMS.findIndex((item) => isActiveHref(pathname, item.href));

  return (
    <div className="relative inline-flex gap-0.5 rounded-hb-pill bg-hb-tab-bg p-[5px]">
      {activeIndex !== -1 ? (
        <div
          className="absolute top-[5px] left-[5px] size-10 rounded-hb-btn bg-hb-card transition-transform duration-[380ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{
            transform: `translateX(${activeIndex * TAB_STEP}px)`,
            boxShadow: "0 6px 14px -8px rgba(20,20,15,0.35)",
          }}
        />
      ) : null}

      {NAV_ITEMS.map((item) => {
        const isActive = isActiveHref(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            title={item.label}
            aria-label={item.label}
            className={cn(
              "relative z-10 flex size-10 items-center justify-center rounded-hb-btn transition-colors",
              isActive && "text-hb-ink"
            )}
            // Mockup's `.tab-btn` uses rgba(28,29,26,.4) specifically —
            // subtly different from the --hb-ink-dim (.42) used for text
            // elsewhere, so it's not reused here to stay exact.
            style={!isActive ? { color: "rgba(28,29,26,0.4)" } : undefined}
          >
            <Icon className="size-[18px]" />
          </Link>
        );
      })}
    </div>
  );
}
