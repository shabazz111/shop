"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart";

const links = [
  { href: "/", label: "Shop" },
  { href: "/dashboard", label: "Dashboard" },
];

export function Header() {
  const pathname = usePathname();
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-surface/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Shop<span className="text-accent">Pulse</span>
        </Link>
        <div className="flex gap-4 text-sm">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={pathname === l.href ? "font-medium" : "text-muted hover:text-foreground"}
            >
              {l.label}
            </Link>
          ))}
        </div>
        <Link
          href="/cart"
          className="ml-auto rounded-full border border-border px-4 py-1.5 text-sm hover:border-accent"
        >
          Cart <span className="ml-1 font-semibold tabular-nums">{itemCount}</span>
        </Link>
      </nav>
    </header>
  );
}
