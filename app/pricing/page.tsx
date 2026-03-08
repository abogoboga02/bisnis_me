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
    <main className="min-h-screen px-6 py-8 md:px-10 lg:px-16">
      <section className="mx-auto max-w-7xl rounded-[2.5rem] border border-white/10 bg-[linear-gradient(135deg,rgba(7,17,31,0.96),rgba(11,31,52,0.9),rgba(8,18,36,0.98))] px-6 py-8 shadow-[0_30px_120px_rgba(2,8,23,0.45)] md:px-8 lg:px-10">
        <MarketingNav />

        <div className="mt-10 max-w-4xl">
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-200/80">Pricing</p>
          <h1 className="mt-3 font-display text-5xl font-bold text-white md:text-6xl">
            Mulai gratis, upgrade saat bisnis Anda butuh lebih banyak
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-300">
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
                  ? "border-cyan-300/30 bg-[linear-gradient(180deg,rgba(103,232,249,0.14),rgba(255,255,255,0.05))]"
                  : "glass-panel"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                      plan.highlight
                        ? "border border-cyan-300/30 bg-cyan-300/12 text-cyan-100"
                        : "border border-white/10 bg-white/6 text-slate-200"
                    }`}
                  >
                    {plan.badge}
                  </span>
                  <h2 className="mt-4 text-3xl font-bold text-white">{plan.name}</h2>
                </div>
              </div>

              <p className="mt-4 text-sm leading-7 text-slate-300">{plan.description}</p>

              <div className="mt-6">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Fitur yang didapat
                </p>
                <ul className="mt-4 grid gap-3 text-sm leading-7 text-slate-200">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-cyan-300" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Batasan penggunaan
                </p>
                <ul className="mt-4 grid gap-3 text-sm leading-7 text-slate-300">
                  {plan.limits.map((limit) => (
                    <li
                      key={limit}
                      className="rounded-2xl border border-white/8 bg-slate-950/30 px-4 py-3"
                    >
                      {limit}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                <Link
                  href={plan.highlight ? "/admin/business" : "/templates"}
                  className={`inline-flex items-center gap-2 rounded-full px-5 py-3 font-semibold transition ${
                    plan.highlight
                      ? "bg-cyan-300 text-slate-950 hover:-translate-y-0.5"
                      : "border border-white/14 bg-white/5 text-white hover:border-cyan-300/40 hover:bg-white/10"
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
        <div className="glass-panel rounded-[2rem] p-6 md:p-8">
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-200/80">FAQ pricing</p>
          <h2 className="mt-3 font-display text-4xl font-bold text-white">
            Pertanyaan yang sering muncul sebelum mencoba
          </h2>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {faqItems.map((item) => (
              <article
                key={item.question}
                className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5"
              >
                <h3 className="text-xl font-semibold text-white">{item.question}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">{item.answer}</p>
              </article>
            ))}
          </div>
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
