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
    <main className="min-h-screen px-6 py-8 md:px-10 lg:px-16">
      <section className="mx-auto max-w-7xl rounded-[2.5rem] border border-white/10 bg-[linear-gradient(135deg,rgba(7,17,31,0.96),rgba(11,31,52,0.9),rgba(8,18,36,0.98))] px-6 py-8 shadow-[0_30px_120px_rgba(2,8,23,0.45)] md:px-8 lg:px-10">
        <MarketingNav />

        <div className="mt-10 max-w-4xl">
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-200/80">Blog SEO</p>
          <h1 className="mt-3 font-display text-5xl font-bold text-white md:text-6xl">
            20 ide artikel blog untuk menarik traffic organik
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-300">
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
              className="glass-panel rounded-[1.75rem] p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                  Artikel {index + 1}
                </span>
                <FileText className="h-5 w-5 text-cyan-300" />
              </div>
              <h2 className="mt-5 text-2xl font-semibold text-white">{idea.title}</h2>
              <p className="mt-4 text-sm text-slate-400">Target keyword</p>
              <p className="mt-1 text-sm leading-7 text-cyan-100">{idea.keyword}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-7xl pb-10">
        <div className="glass-panel rounded-[2rem] p-8 text-center md:p-10">
          <h2 className="mx-auto max-w-3xl font-display text-4xl font-bold text-white md:text-5xl">
            {finalCta.headline}
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-slate-300">
            {finalCta.subheadline}
          </p>
          <div className="mt-8">
            <Link
              href={finalCta.primaryHref}
              className="glow-ring inline-flex items-center gap-2 rounded-full bg-cyan-300 px-6 py-3 font-semibold text-slate-950 transition hover:-translate-y-0.5"
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
