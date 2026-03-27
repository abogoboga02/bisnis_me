import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { MarketingNav } from "@/components/marketing-nav";
import { blogIdeas, finalCta } from "@/lib/marketing-content";

export const metadata: Metadata = {
  title: "Ide Artikel Blog SEO",
  description:
    "Daftar 20 ide artikel blog SEO untuk platform pembuat website bisnis, dengan target keyword seperti cara membuat website bisnis, website untuk UMKM, website company profile, dan website bisnis murah.",
};

export default function BlogPage() {
  return (
    <main className="nature-stage min-h-screen px-6 py-8 md:px-10 lg:px-16">
      <section className="marketing-hero nature-graffiti mx-auto max-w-7xl rounded-[2.5rem] px-6 py-8 md:px-8 lg:px-10">
        <MarketingNav />

        <div className="relative z-10 mt-10 max-w-4xl">
          <p className="marketing-kicker">Blog SEO</p>
          <h1 className="marketing-title mt-4">
            20 ide artikel blog untuk menarik traffic organik
          </h1>
          <p className="marketing-copy mt-5">
            Halaman ini bisa menjadi dasar content plan SEO untuk platform pembuat website bisnis,
            dengan target keyword utama seputar pembuatan website bisnis, UMKM, company profile,
            dan website bisnis murah.
          </p>
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-7xl">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {blogIdeas.map((idea, index) => (
            <article
              key={idea.title}
              className="premium-card rounded-[1.75rem] p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="premium-pill premium-kicker rounded-[14px] px-3 py-1.5 text-[11px] font-semibold text-[#fffdee]/78">
                  Artikel {index + 1}
                </span>
                <FileText className="h-5 w-5 text-[#e3ef26]" />
              </div>
              <h2 className="mt-5 text-[26px] font-semibold text-[#fffdee]">{idea.title}</h2>
              <p className="mt-4 text-sm text-[#fffdee]/52">Target keyword</p>
              <p className="mt-1 text-sm leading-7 text-[#e2fbce]">{idea.keyword}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-7xl pb-10">
        <div className="glass-panel rounded-[2rem] border border-[#e3ef26]/14 p-8 text-center md:p-10">
          <h2 className="mx-auto max-w-3xl font-display text-[42px] font-semibold leading-[1.04] text-[#fffdee] md:text-[68px]">
            {finalCta.headline}
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-[#fffdee]/70">
            {finalCta.subheadline}
          </p>
          <div className="mt-8">
            <Link
              href={finalCta.primaryHref}
              className="glow-ring premium-button inline-flex items-center gap-2 rounded-[14px] px-6 py-3 font-semibold"
            >
              {finalCta.primaryLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
