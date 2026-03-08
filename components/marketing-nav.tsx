import Link from "next/link";
import { productLinks } from "@/lib/marketing-content";

export function MarketingNav() {
  return (
    <header className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <Link href="/" className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-100/90">
        bisnis.me
      </Link>

      <nav className="flex flex-wrap gap-2 text-sm text-slate-300">
        {productLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 transition hover:border-cyan-300/25 hover:bg-white/8"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
