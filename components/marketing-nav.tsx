import Link from "next/link";
import { productLinks } from "@/lib/marketing-content";

export function MarketingNav() {
  return (
    <header className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <Link
        href="/"
        className="premium-kicker text-sm font-semibold text-[#fffdee] transition duration-300 hover:text-[#e3ef26]"
      >
        bisnis.me
      </Link>

      <nav className="flex flex-wrap gap-2 text-sm text-[#fffdee]/72">
        {productLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="premium-pill rounded-[14px] px-4 py-2.5 transition duration-300 hover:-translate-y-1.5 hover:border-[#e3ef26]/35 hover:text-[#fffdee]"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
