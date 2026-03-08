import Link from "next/link";
import { ArrowRight, ArrowUpRight, CheckCircle2, LayoutTemplate, MonitorSmartphone, Sparkles } from "lucide-react";
import { MarketingNav } from "@/components/marketing-nav";
import {
  commonProblems,
  faqItems,
  finalCta,
  heroBenefits,
  howItWorks,
  platformFeatures,
  pricingPlans,
  showcaseSites,
  socialProofStats,
  solutionBenefits,
  templateCatalog,
  testimonials,
  problemIcon as ProblemIcon,
} from "@/lib/marketing-content";
import { getBusinesses, getTemplates } from "@/lib/api";

export default async function HomePage() {
  const [businesses, templates] = await Promise.all([getBusinesses(), getTemplates()]);
  const previewBusiness = businesses[0];

  return (
    <main className="min-h-screen overflow-hidden px-6 py-8 md:px-10 lg:px-16">
      <section className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-[linear-gradient(135deg,rgba(6,23,44,0.96),rgba(9,37,62,0.88)_48%,rgba(8,18,36,0.98))] px-6 py-8 shadow-[0_30px_120px_rgba(2,8,23,0.45)] md:px-8 lg:px-10 lg:py-10">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent" />
        <div className="absolute -left-16 top-16 h-56 w-56 rounded-full bg-cyan-300/12 blur-3xl" />
        <div className="absolute right-0 top-10 h-72 w-72 rounded-full bg-sky-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-indigo-300/10 blur-3xl" />

        <MarketingNav />

        <div className="relative z-10 mt-10 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="max-w-2xl space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100">
              <Sparkles className="h-4 w-4" />
              Free trial website builder untuk bisnis modern
            </div>

            <div className="space-y-5">
              <h1 className="max-w-3xl font-display text-5xl font-bold tracking-tight text-white md:text-6xl lg:text-7xl">
                Website Bisnis Profesional Siap Online Dalam Hitungan Menit
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-300">
                Buat website profesional dengan template siap pakai untuk UMKM, travel agent,
                perusahaan kecil, dan bisnis jasa. Lebih cepat diluncurkan, lebih rapi
                tampilannya, dan lebih meyakinkan di mata calon pelanggan.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/admin/business"
                className="glow-ring rounded-full bg-cyan-300 px-6 py-3 font-semibold text-slate-950 transition hover:-translate-y-0.5"
              >
                Coba Gratis
              </Link>
              <Link
                href="/templates"
                className="rounded-full border border-white/14 bg-white/5 px-6 py-3 font-semibold text-white transition hover:border-cyan-300/40 hover:bg-white/10"
              >
                Lihat Template
              </Link>
            </div>

            <ul className="grid gap-3 text-sm leading-7 text-slate-200">
              {heroBenefits.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/5 px-4 py-3"
                >
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-cyan-300" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <div className="absolute -right-3 top-8 rounded-full border border-cyan-300/20 bg-slate-950/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100 shadow-[0_18px_48px_rgba(2,8,23,0.45)]">
              Free Trial
            </div>

            <div className="glass-panel relative overflow-hidden rounded-[2rem] p-5">
              <div className="absolute right-5 top-5 rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs font-medium text-slate-200">
                No Coding
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/45 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-cyan-200/80">Preview Hero</p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">Template website bisnis</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-rose-400/80" />
                    <span className="h-3 w-3 rounded-full bg-amber-300/80" />
                    <span className="h-3 w-3 rounded-full bg-emerald-300/80" />
                  </div>
                </div>

                <div className="mt-6 grid gap-4">
                  <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[linear-gradient(135deg,rgba(16,185,129,0.16),rgba(56,189,248,0.18),rgba(15,23,42,0.65))] p-5">
                    <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.24em] text-slate-200/80">
                      <span>Homepage</span>
                      <span>Mobile Friendly</span>
                    </div>
                    <div className="mt-6 max-w-sm space-y-4">
                      <p className="text-sm uppercase tracking-[0.24em] text-cyan-100/80">Travel | Jasa | UMKM</p>
                      <h3 className="text-3xl font-semibold leading-tight text-white">
                        Website yang membuat bisnis terlihat lebih dipercaya
                      </h3>
                      <p className="text-sm leading-7 text-slate-200/85">
                        Pilih template, isi informasi bisnis, lalu publikasikan website profesional
                        dengan lebih cepat.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <span className="rounded-full bg-white/12 px-4 py-2 text-sm font-medium text-white">
                          CTA jelas
                        </span>
                        <span className="rounded-full bg-white/12 px-4 py-2 text-sm font-medium text-white">
                          Responsive
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
                    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                      <p className="text-sm text-slate-400">Template aktif</p>
                      <p className="mt-2 text-3xl font-semibold text-white">{templates.length}</p>
                      <p className="mt-3 text-sm leading-6 text-slate-300">
                        Siap dipakai untuk berbagai kebutuhan bisnis dan promosi online.
                      </p>
                    </div>

                    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm text-slate-400">Visual direction</p>
                          <p className="mt-2 text-lg font-semibold text-white">Mockup desktop + mobile</p>
                        </div>
                        <MonitorSmartphone className="h-6 w-6 text-cyan-300" />
                      </div>
                      <div className="mt-4 grid grid-cols-[1.3fr_0.7fr] gap-3">
                        <div className="rounded-[1.35rem] border border-white/8 bg-slate-950/50 p-3">
                          <div className="h-2 w-20 rounded-full bg-cyan-300/70" />
                          <div className="mt-3 h-24 rounded-2xl bg-[linear-gradient(135deg,rgba(103,232,249,0.35),rgba(15,23,42,0.15),rgba(255,255,255,0.04))]" />
                          <div className="mt-3 grid grid-cols-3 gap-2">
                            <div className="h-8 rounded-xl bg-white/8" />
                            <div className="h-8 rounded-xl bg-white/8" />
                            <div className="h-8 rounded-xl bg-white/8" />
                          </div>
                        </div>
                        <div className="rounded-[1.35rem] border border-white/8 bg-slate-950/50 p-3">
                          <div className="mx-auto h-2 w-10 rounded-full bg-white/12" />
                          <div className="mt-3 h-32 rounded-[1.2rem] bg-[linear-gradient(180deg,rgba(56,189,248,0.3),rgba(15,23,42,0.08))]" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-7xl">
        <div className="glass-panel rounded-[2rem] p-6 md:p-8">
          <div className="flex flex-col lg:flex-row gap-8 lg:items-start">
            <div className="flex-1">
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-200/80">Masalah umum & Solusi platform</p>
              <h2 className="mt-3 font-display text-4xl font-bold text-white">
                Kenapa banyak bisnis kecil belum punya website?
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-300">
                Banyak pemilik bisnis sebenarnya sudah tahu website itu penting, tetapi masih merasa
                prosesnya rumit, mahal, dan tidak tahu harus mulai dari mana.
              </p>
              <div className="mt-6 grid gap-3">
                {commonProblems.slice(0, 2).map((problem, index) => (
                  <article
                    key={problem.title}
                    className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4"
                  >
                    <h3 className="text-lg font-semibold text-white">{problem.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{problem.copy}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="flex-1">
              <h3 className="font-display text-2xl font-bold text-white">Solusi praktis untuk bisnis</h3>
              <p className="mt-2 text-base leading-7 text-slate-300">
                Platform ini membantu bisnis kecil membuat website profesional tanpa proses teknis
                yang merepotkan.
              </p>
              <div className="mt-6 grid gap-3">
                {solutionBenefits.map((benefit) => (
                  <article
                    key={benefit.title}
                    className="flex items-center gap-3 rounded-[1.5rem] border border-white/10 bg-white/5 p-4"
                  >
                    <benefit.icon className="h-5 w-5 text-cyan-300" />
                    <div>
                      <h4 className="text-lg font-semibold text-white">{benefit.title}</h4>
                      <p className="text-sm text-slate-300">{benefit.copy}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-7xl">
        <div className="glass-panel rounded-[2rem] p-6 md:p-8">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-200/80">Cara kerja</p>
            <h2 className="mt-3 font-display text-4xl font-bold text-white">
              Tiga langkah sederhana sampai website online
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-300">
              Alurnya dibuat sederhana agar pemilik bisnis bisa fokus pada isi website dan promosi,
              bukan pada proses teknis yang memakan waktu.
            </p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {howItWorks.map((step, index) => (
              <article
                key={step.title}
                className="relative rounded-[1.75rem] border border-white/10 bg-white/5 p-6"
              >
                <div className="absolute right-5 top-5 text-sm font-semibold text-cyan-200/70">
                  0{index + 1}
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-300/12 text-cyan-200">
                  <step.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-2xl font-semibold text-white">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">{step.copy}</p>
                <p className="mt-4 rounded-2xl border border-white/8 bg-slate-950/35 px-4 py-3 text-sm text-slate-300">
                  {step.idea}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-7xl">
        <div className="glass-panel rounded-[2rem] p-6 md:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-200/80">Template website</p>
              <h2 className="mt-3 font-display text-4xl font-bold text-white">
                Pilihan template untuk berbagai jenis bisnis
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-300">
                Tersedia berbagai template siap pakai yang bisa disesuaikan dengan karakter bisnis.
                Setiap template dirancang agar informasi penting cepat terbaca dan CTA terlihat jelas.
              </p>
            </div>
            <Link
              href="/templates"
              className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/5 px-5 py-3 font-semibold text-white transition hover:border-cyan-300/40 hover:bg-white/10"
            >
              Buka Semua Template
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {templateCatalog.map((template) => (
              <article
                key={template.name}
                className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 transition hover:-translate-y-1 hover:border-cyan-300/25 hover:bg-white/8"
              >
                <div className="aspect-video rounded-lg bg-slate-800 mb-4 flex items-center justify-center">
                  <span className="text-slate-400 text-sm">Preview Image</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span
                    className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-950"
                    style={{ backgroundColor: template.accent }}
                  >
                    {template.categoryLabel}
                  </span>
                  <LayoutTemplate className="h-5 w-5 text-cyan-300" />
                </div>
                <h3 className="mt-3 text-xl font-semibold text-white">{template.name}</h3>
              </article>
            ))}
          </div>

          <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-slate-950/30 px-5 py-4 text-sm leading-7 text-slate-300">
            Template aktif di sistem saat ini: {templates.length}. Untuk filter kategori bisnis dan
            tampilan katalog penuh, gunakan halaman `/templates`.
          </div>
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-7xl">
        <div className="glass-panel rounded-[2rem] p-6 md:p-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-200/80">Fitur utama</p>
              <h2 className="mt-3 font-display text-3xl font-bold text-white">
                Fitur penting untuk website bisnis
              </h2>
              <div className="mt-6 space-y-4">
                {platformFeatures.slice(0, 3).map((feature) => (
                  <article
                    key={feature.title}
                    className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-4"
                  >
                    <feature.icon className="h-5 w-5 text-cyan-300" />
                    <div>
                      <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                      <p className="text-sm text-slate-300">{feature.copy}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="flex-1">
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-200/80">Contoh website</p>
              <h2 className="mt-3 font-display text-3xl font-bold text-white">
                Contoh bisnis yang bisa tampil profesional
              </h2>
              <div className="mt-6 space-y-4">
                {showcaseSites.map((site) => (
                  <article
                    key={site.url}
                    className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-white">{site.name}</h3>
                      <p className="text-sm text-slate-400">{site.type}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-cyan-300" />
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-7xl">
        <div className="glass-panel rounded-[2rem] p-6 md:p-8">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-200/80">FAQ</p>
            <h2 className="mt-3 font-display text-4xl font-bold text-white">
              Pertanyaan yang sering ditanyakan
            </h2>
          </div>

          <div className="mt-8 space-y-4">
            {faqItems.slice(0, 4).map((item) => (
              <details
                key={item.question}
                className="group rounded-[1.5rem] border border-white/10 bg-white/5 p-5"
              >
                <summary className="cursor-pointer text-xl font-semibold text-white group-open:mb-3">
                  {item.question}
                </summary>
                <p className="text-sm leading-7 text-slate-300">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-7xl pb-10">
        <div className="glass-panel rounded-[2rem] p-8 text-center md:p-10">
          <h2 className="mx-auto max-w-4xl font-display text-4xl font-bold text-white md:text-5xl">
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
