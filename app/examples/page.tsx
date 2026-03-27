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
    <main className="nature-stage min-h-screen px-6 py-8 md:px-10 lg:px-16">
      <section className="marketing-hero nature-graffiti mx-auto max-w-7xl rounded-[2.5rem] px-6 py-8 md:px-8 lg:px-10">
        <MarketingNav />

        <div className="relative z-10 mt-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-4xl">
            <p className="marketing-kicker">Examples</p>
            <h1 className="marketing-title mt-4">
              Contoh website yang membantu bisnis tampil lebih profesional
            </h1>
            <p className="marketing-copy mt-5">
              Gunakan halaman ini untuk melihat hasil akhir yang mungkin dicapai dengan platform
              website builder. Cocok untuk memberi gambaran visual sebelum mulai free trial.
            </p>
          </div>

          {previewBusiness ? (
            <Link
              href={`/${previewBusiness.slug}`}
              className="premium-button-secondary inline-flex items-center gap-2 rounded-[14px] px-5 py-3 font-semibold"
            >
              Lihat website live
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
              className="premium-card rounded-[1.75rem] p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-[#fffdee]">{site.name}</h2>
                  <p className="mt-2 text-sm text-[#fffdee]/52">{site.type}</p>
                </div>
                <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-[#e3ef26]" />
              </div>
              <p className="mt-5 text-sm text-[#fffdee]/52">Contoh URL</p>
              <p className="mt-1 break-all text-sm leading-7 text-[#e2fbce]">{site.url}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-7xl pb-10">
        <div className="glass-panel rounded-[2rem] border border-[#e3ef26]/14 p-6 md:p-8">
          <p className="marketing-kicker">Website aktif</p>
          <h2 className="mt-3 font-display text-[42px] font-semibold leading-[1.04] text-[#fffdee]">
            Preview bisnis yang sudah tersedia di sistem
          </h2>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {businesses.map((business) => (
              <Link
                key={business.id}
                href={`/${business.slug}`}
                className="premium-card rounded-[1.75rem] p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-[#fffdee]">{business.name}</p>
                    <p className="mt-2 text-sm leading-6 text-[#fffdee]/70">{business.tagline}</p>
                  </div>
                  <ArrowUpRight className="mt-1 h-5 w-5 shrink-0 text-[#e3ef26]" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
