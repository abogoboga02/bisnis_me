import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { MarketingNav } from "@/components/marketing-nav";
import { faqItems, finalCta, pricingPlans } from "@/lib/marketing-content";

export const metadata: Metadata = {
  title: "Pricing Website Builder",
  description:
    "Bandingkan paket FREE dan PRO untuk platform pembuat website bisnis, lihat fitur dan batasannya, lalu mulai free trial untuk mencoba tanpa risiko.",
};

export default function PricingPage() {
  return (
    <main className="nature-stage min-h-screen px-6 py-8 md:px-10 lg:px-16">
      <section className="marketing-hero nature-graffiti mx-auto max-w-7xl rounded-[2.5rem] px-6 py-8 md:px-8 lg:px-10">
        <MarketingNav />

        <div className="relative z-10 mt-10 max-w-4xl">
          <p className="marketing-kicker">Pricing</p>
          <h1 className="marketing-title mt-4">
            Mulai gratis, upgrade saat bisnis Anda butuh lebih banyak
          </h1>
          <p className="marketing-copy mt-5">
            Paket gratis dibuat untuk membantu bisnis mencoba platform tanpa risiko. Setelah
            website mulai aktif dipakai dan kebutuhan bertambah, paket Pro tersedia untuk mendukung
            branding dan promosi yang lebih serius.
          </p>
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-7xl">
        <div className="grid gap-4 lg:grid-cols-2">
          {pricingPlans.map((plan) => (
            <article
              key={plan.name}
              className={`rounded-[1.9rem] border p-6 ${
                plan.highlight
                  ? "border-[#e3ef26]/26 bg-[linear-gradient(180deg,rgba(226,251,206,0.18),rgba(227,239,38,0.1),rgba(12,52,44,0.46))] shadow-[0_24px_60px_rgba(227,239,38,0.08)]"
                  : "premium-card"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span
                    className={`rounded-[14px] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] ${
                      plan.highlight
                        ? "border border-[#e3ef26]/28 bg-[#e3ef26]/12 text-[#fffdee]"
                        : "premium-pill text-[#fffdee]/78"
                    }`}
                  >
                    {plan.badge}
                  </span>
                  <h2 className="mt-4 text-[42px] font-semibold leading-none text-[#fffdee]">{plan.name}</h2>
                </div>
              </div>

              <p className="mt-4 text-sm leading-7 text-[#fffdee]/70">{plan.description}</p>

              <div className="mt-6">
                <p className="premium-kicker text-[11px] text-[#fffdee]/54">
                  Fitur yang didapat
                </p>
                <ul className="mt-4 grid gap-3 text-sm leading-7 text-[#fffdee]/82">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-[#e3ef26]" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6">
                <p className="premium-kicker text-[11px] text-[#fffdee]/54">
                  Batasan penggunaan
                </p>
                <ul className="mt-4 grid gap-3 text-sm leading-7 text-[#fffdee]/68">
                  {plan.limits.map((limit) => (
                    <li
                      key={limit}
                      className="rounded-2xl border border-[#e3ef26]/10 bg-[#06231d]/38 px-4 py-3"
                    >
                      {limit}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                <Link
                  href={plan.highlight ? "/admin/business" : "/templates"}
                  className={`inline-flex items-center gap-2 rounded-[14px] px-5 py-3 font-semibold transition ${
                    plan.highlight
                      ? "premium-button"
                      : "premium-button-secondary"
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-7xl">
        <div className="glass-panel rounded-[2rem] border border-[#e3ef26]/14 p-6 md:p-8">
          <p className="marketing-kicker">FAQ pricing</p>
          <h2 className="mt-3 font-display text-[42px] font-semibold leading-[1.04] text-[#fffdee]">
            Pertanyaan yang sering muncul sebelum mencoba
          </h2>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {faqItems.map((item) => (
              <article
                key={item.question}
                className="premium-card rounded-[1.75rem] p-5"
              >
                <h3 className="text-xl font-semibold text-[#fffdee]">{item.question}</h3>
                <p className="mt-3 text-sm leading-7 text-[#fffdee]/70">{item.answer}</p>
              </article>
            ))}
          </div>
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
