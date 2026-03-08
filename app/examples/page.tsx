import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { MarketingNav } from "@/components/marketing-nav";
import { showcaseSites } from "@/lib/marketing-content";
import { getBusinesses } from "@/lib/api";

export const metadata: Metadata = {
  title: "Contoh Website Bisnis",
  description:
    "Lihat contoh website bisnis yang dibuat dengan platform bisnis.me untuk travel, restoran, jasa, toko online, dan personal brand.",
};

export default async function ExamplesPage() {
  const businesses = await getBusinesses();
  const previewBusiness = businesses[0];

  return (
    <main className="min-h-screen px-6 py-8 md:px-10 lg:px-16">
      <section className="mx-auto max-w-7xl rounded-[2.5rem] border border-white/10 bg-[linear-gradient(135deg,rgba(7,17,31,0.96),rgba(11,31,52,0.9),rgba(8,18,36,0.98))] px-6 py-8 shadow-[0_30px_120px_rgba(2,8,23,0.45)] md:px-8 lg:px-10">
        <MarketingNav />

        <div className="mt-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-4xl">
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-200/80">Examples</p>
            <h1 className="mt-3 font-display text-5xl font-bold text-white md:text-6xl">
              Contoh website yang membantu bisnis tampil lebih profesional
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              Gunakan halaman ini untuk melihat hasil akhir yang mungkin dicapai dengan platform
              website builder. Cocok untuk memberi gambaran visual sebelum mulai free trial.
            </p>
          </div>

          {previewBusiness ? (
            <Link
              href={`/${previewBusiness.slug}`}
              className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/5 px-5 py-3 font-semibold text-white transition hover:border-cyan-300/40 hover:bg-white/10"
            >
              Lihat demo live
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          ) : null}
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-7xl">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {showcaseSites.map((site) => (
            <article
              key={site.url}
              className="glass-panel rounded-[1.75rem] p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-white">{site.name}</h2>
                  <p className="mt-2 text-sm text-slate-400">{site.type}</p>
                </div>
                <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-cyan-300" />
              </div>
              <p className="mt-5 text-sm text-slate-400">Contoh URL</p>
              <p className="mt-1 break-all text-sm leading-7 text-cyan-100">{site.url}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-7xl pb-10">
        <div className="glass-panel rounded-[2rem] p-6 md:p-8">
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-200/80">Website aktif</p>
          <h2 className="mt-3 font-display text-4xl font-bold text-white">
            Preview bisnis yang sudah tersedia di sistem
          </h2>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {businesses.map((business) => (
              <Link
                key={business.id}
                href={`/${business.slug}`}
                className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 transition hover:-translate-y-1 hover:border-cyan-300/25 hover:bg-white/8"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-white">{business.name}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{business.tagline}</p>
                  </div>
                  <ArrowUpRight className="mt-1 h-5 w-5 shrink-0 text-cyan-200" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
