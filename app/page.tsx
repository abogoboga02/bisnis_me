"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
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
import type { Business, Template } from "@/lib/types";

export default function HomePage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [businessesResponse, templatesResponse] = await Promise.all([
          fetch("/api/public/businesses", { cache: "no-store" }),
          fetch("/api/public/templates", { cache: "no-store" }),
        ]);

        if (!businessesResponse.ok || !templatesResponse.ok) {
          throw new Error("Failed to fetch live data.");
        }

        const businessesPayload = (await businessesResponse.json()) as { data?: Business[] };
        const templatesPayload = (await templatesResponse.json()) as { data?: Template[] };

        setBusinesses(businessesPayload.data ?? []);
        setTemplates(templatesPayload.data ?? []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const previewBusiness = businesses[0];

  return (
    <main className="nature-stage homepage-stage min-h-screen overflow-hidden px-5 py-6 md:px-8 md:py-8 lg:px-12 lg:py-10">
      <section
        className="nature-graffiti homepage-hero relative mx-auto max-w-7xl overflow-hidden border border-[#e3ef26]/14 bg-[linear-gradient(135deg,rgba(12,52,44,0.94),rgba(7,102,83,0.78)_44%,rgba(6,35,29,0.98))] px-6 py-8 shadow-[0_40px_140px_rgba(2,15,12,0.34)] md:px-8 lg:px-10 lg:py-10"
        style={{ borderRadius: "3.5rem" }}
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#e3ef26]/70 to-transparent" />
        <div
          className="premium-orb -left-16 top-12 h-56 w-56 bg-[#e3ef26]/18"
          style={{ borderRadius: "9999px" }}
        ></div>
        <div
          className="premium-orb right-0 top-10 h-72 w-72 bg-[#e2fbce]/10"
          style={{ borderRadius: "9999px" }}
        ></div>
        <div className="premium-orb bottom-0 left-1/3 h-64 w-64 bg-[#076653]/28" style={{ borderRadius: "9999px" }} />

        <MarketingNav />

        <div className="relative z-10 mt-10 grid gap-10 lg:grid-cols-[1.618fr_1fr] lg:items-center lg:gap-12">
          <div className="max-w-3xl space-y-8 lg:space-y-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="premium-pill premium-kicker inline-flex items-center gap-2 rounded-[14px] px-4 py-2 text-[11px] font-medium text-[#fffdee]"
            >
              <Sparkles className="h-4 w-4" />
              Free trial website builder untuk bisnis modern
            </motion.div>

            <div className="space-y-6">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-balance max-w-4xl font-display text-[42px] font-semibold leading-[0.95] text-[#fffdee] md:text-[68px] lg:text-[96px] xl:text-[110px]"
              >
                Website Bisnis Profesional Siap Online Dalam Hitungan Menit
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="max-w-2xl text-[16px] leading-8 text-[#fffdee]/74 md:text-[18px]"
              >
                Buat website profesional dengan template siap pakai untuk UMKM, travel agent,
                perusahaan kecil, dan bisnis jasa. Lebih cepat diluncurkan, lebih rapi
                tampilannya, dan lebih meyakinkan di mata calon pelanggan.
              </motion.p>
            </div>

            <motion.div
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/admin/business"
                  className="glow-ring premium-button inline-flex items-center rounded-[14px] px-6 py-3.5 font-semibold"
                >
                  Coba Gratis
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/templates"
                  className="premium-button-secondary inline-flex items-center rounded-[14px] px-6 py-3.5 font-semibold"
                >
                  Lihat Template
                </Link>
              </motion.div>
            </motion.div>

            <motion.ul
              className="grid gap-4 text-sm leading-7 text-[#fffdee]/82"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                    delayChildren: 0.6,
                  },
                },
              }}
            >
              {heroBenefits.map((benefit) => (
                <motion.li
                  key={benefit}
                  className="premium-card flex items-start gap-3 rounded-[24px] px-5 py-4"
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
                  }}
                  whileHover={{ x: 6 }}
                >
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-[#e3ef26]" />
                  <span>{benefit}</span>
                </motion.li>
              ))}
            </motion.ul>
          </div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <div
              className="premium-pill premium-kicker absolute -right-3 top-8 rounded-[14px] px-4 py-2 text-[11px] font-semibold text-[#fffdee] shadow-[0_18px_48px_rgba(2,15,12,0.34)]"
            >
              Free Trial
            </div>

            <motion.div
              className="glass-panel relative overflow-hidden border border-[#e3ef26]/14 p-5"
              style={{ borderRadius: "2.5rem" }}
              whileHover={{ boxShadow: "0 32px 70px rgba(2, 15, 12, 0.28)" }}
            >
              <div
                className="premium-pill absolute right-5 top-5 rounded-[14px] px-3 py-1 text-xs font-medium text-[#fffdee]/84"
              >
                No Coding
              </div>

              <motion.div
                className="rounded-[1.75rem] border border-[#fffdee]/8 bg-[#06231d]/40 p-5"
                style={{ borderRadius: "1.75rem" }}
                whileHover={{ backgroundColor: "rgba(6,35,29,0.55)" }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="premium-kicker text-[11px] text-[#fffdee]/54">Preview Hero</p>
                    <h2 className="mt-3 text-[26px] font-semibold text-[#fffdee]">Template website bisnis</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 bg-rose-400/80" style={{ borderRadius: "50%" }} />
                    <span className="h-3 w-3 bg-amber-300/80" style={{ borderRadius: "50%" }} />
                    <span className="h-3 w-3 bg-emerald-300/80" style={{ borderRadius: "50%" }} />
                  </div>
                </div>

                <div className="mt-6 grid gap-4">
                  <motion.div
                    className="overflow-hidden rounded-[2rem] border border-[#e3ef26]/16 bg-[linear-gradient(135deg,rgba(226,251,206,0.2),rgba(227,239,38,0.18),rgba(7,102,83,0.28),rgba(6,35,29,0.76))] p-5"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="premium-kicker flex items-center justify-between gap-3 text-[11px] text-[#fffdee]/72">
                      <span>Homepage</span>
                      <span>Mobile Friendly</span>
                    </div>
                    <div className="mt-6 max-w-sm space-y-4">
                      <p className="premium-kicker text-[11px] text-[#fffdee]/68">Travel | Jasa | UMKM</p>
                      <h3 className="text-[42px] font-semibold leading-[1.02] text-[#fffdee]">
                        Website yang membuat bisnis terlihat lebih dipercaya
                      </h3>
                      <p className="text-sm leading-7 text-[#fffdee]/74">
                        Pilih template, isi informasi bisnis, lalu publikasikan website profesional
                        dengan lebih cepat.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <motion.span
                          className="premium-pill rounded-[14px] px-4 py-2 text-sm font-medium text-[#fffdee]"
                          whileHover={{ backgroundColor: "rgba(255,253,238,0.16)" }}
                        >
                          CTA jelas
                        </motion.span>
                        <motion.span
                          className="premium-pill rounded-[14px] px-4 py-2 text-sm font-medium text-[#fffdee]"
                          whileHover={{ backgroundColor: "rgba(255,253,238,0.16)" }}
                        >
                          Responsive
                        </motion.span>
                      </div>
                    </div>
                  </motion.div>

                  <div className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
                    <motion.div
                      className="premium-card rounded-[2rem] p-4"
                      whileHover={{ backgroundColor: "rgba(255,253,238,0.05)" }}
                    >
                      <p className="text-sm text-[#fffdee]/54">Template aktif</p>
                      <p className="mt-2 text-[42px] font-semibold leading-none text-[#fffdee]">{templates.length}</p>
                      <p className="mt-3 text-sm leading-6 text-[#fffdee]/68">
                        Siap dipakai untuk berbagai kebutuhan bisnis dan promosi online.
                      </p>
                    </motion.div>

                    <motion.div
                      className="premium-card rounded-[1.75rem] p-4"
                      whileHover={{ backgroundColor: "rgba(255,253,238,0.05)" }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm text-[#fffdee]/54">Visual direction</p>
                          <p className="mt-2 text-lg font-semibold text-[#fffdee]">Mockup desktop + mobile</p>
                        </div>
                        <MonitorSmartphone className="h-6 w-6 text-[#e3ef26]" />
                      </div>
                      <div className="mt-4 grid grid-cols-[1.3fr_0.7fr] gap-3">
                        <div
                          className="rounded-[1.5rem] border border-[#fffdee]/8 bg-[#06231d]/48 p-3"
                          style={{ borderRadius: "1.5rem" }}
                        >
                          <div className="h-2 w-20 bg-[linear-gradient(135deg,#fffdee,#e3ef26)]" style={{ borderRadius: "1rem" }} />
                          <div className="mt-3 h-24 bg-[linear-gradient(135deg,rgba(226,251,206,0.34),rgba(227,239,38,0.18),rgba(7,102,83,0.22))]" style={{ borderRadius: "1.5rem" }} />
                          <div className="mt-3 grid grid-cols-3 gap-2">
                            <div className="h-8 bg-[#fffdee]/10" style={{ borderRadius: "0.75rem" }} />
                            <div className="h-8 bg-[#fffdee]/10" style={{ borderRadius: "0.75rem" }} />
                            <div className="h-8 bg-[#fffdee]/10" style={{ borderRadius: "0.75rem" }} />
                          </div>
                        </div>
                        <div
                          className="rounded-[1.5rem] border border-[#fffdee]/8 bg-[#06231d]/48 p-3"
                          style={{ borderRadius: "1.5rem" }}
                        >
                          <div className="mx-auto h-2 w-10 bg-[#fffdee]/14" style={{ borderRadius: "1rem" }} />
                          <div className="mt-3 h-32 bg-[linear-gradient(180deg,rgba(227,239,38,0.26),rgba(7,102,83,0.18),rgba(6,35,29,0.08))]" style={{ borderRadius: "1.2rem" }} />
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>



      <section className="mx-auto mt-[130px] max-w-7xl px-6">
        <div className="mx-auto mb-16 max-w-4xl text-center md:mb-20">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="premium-kicker text-[11px] text-[#e3ef26]"
          >
            Cara kerja
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="mt-5 text-balance font-display text-[42px] font-semibold leading-[1.04] text-[#fffdee] md:text-[68px]"
          >
            Tiga langkah sederhana sampai website online
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="mx-auto mt-6 max-w-2xl text-[16px] leading-8 text-[#fffdee]/68"
          >
            Alurnya dibuat sederhana agar pemilik bisnis bisa fokus pada isi website dan promosi,
            bukan pada proses teknis yang memakan waktu.
          </motion.p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {howItWorks.map((step, index) => (
            <motion.article
              key={step.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              viewport={{ once: true }}
              whileHover={{ y: -6, boxShadow: "0 30px 60px rgba(2, 15, 12, 0.26)" }}
              className="premium-card rounded-[28px] p-8 transition-all duration-300"
            >
              <motion.div
                whileHover={{ scale: 1.2, rotate: 8 }}
                className="mb-6 flex h-16 w-16 items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,#e3ef26,#076653,#0c342c)] text-[#fffdee]"
              >
                <step.icon className="h-8 w-8" />
              </motion.div>
              <div className="premium-kicker mb-3 text-[11px] font-bold text-[#e3ef26]">
                Langkah 0{index + 1}
              </div>
              <h3 className="mb-3 text-[26px] font-semibold text-[#fffdee]">{step.title}</h3>
              <p className="mb-4 text-sm leading-7 text-[#fffdee]/70">{step.copy}</p>
              <p className="text-xs font-medium italic text-[#e2fbce]/68">{step.idea}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-[130px] max-w-7xl px-6">
        <div className="mx-auto mb-16 max-w-4xl text-center md:mb-20">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="premium-kicker text-[11px] text-[#e3ef26]"
          >
            Template website
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="mt-5 text-balance font-display text-[42px] font-semibold leading-[1.04] text-[#fffdee] md:text-[68px]"
          >
            Pilihan template untuk berbagai jenis bisnis
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="mx-auto mt-6 max-w-2xl text-[16px] leading-8 text-[#fffdee]/68"
          >
            Tersedia berbagai template siap pakai yang bisa disesuaikan dengan karakter bisnis.
            Setiap template dirancang agar informasi penting cepat terbaca dan CTA terlihat jelas.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          className="mb-12 flex justify-center"
        >
          <Link
            href="/templates"
            className="premium-button-secondary inline-flex items-center gap-2 rounded-[14px] px-5 py-3 font-semibold"
          >
            Buka Semua Template
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {templateCatalog.map((template, idx) => (
            <motion.article
              key={template.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -6, boxShadow: "0 30px 60px rgba(2, 15, 12, 0.26)" }}
              className="premium-card rounded-[28px] p-6 transition-all duration-300"
            >
              <motion.div
                className="mb-5 flex aspect-video items-center justify-center rounded-[22px] border border-[#e3ef26]/14 bg-[linear-gradient(135deg,rgba(226,251,206,0.18),rgba(227,239,38,0.14),rgba(7,102,83,0.2),rgba(6,35,29,0.72))]"
                whileHover={{ scale: 1.05 }}
              >
                <span className="text-sm font-medium text-[#fffdee]/62">Preview Image</span>
              </motion.div>
              <div className="mb-4 flex items-center justify-between gap-3">
                <span
                  className="premium-kicker rounded-[14px] px-3 py-1.5 text-[11px] font-bold text-[#06231d]"
                  style={{ backgroundImage: `linear-gradient(135deg, ${template.accent}, #E3EF26)` }}
                >
                  {template.categoryLabel}
                </span>
                <LayoutTemplate className="h-5 w-5 text-[#e3ef26]" />
              </div>
              <h3 className="text-[26px] font-semibold text-[#fffdee]">{template.name}</h3>
            </motion.article>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-10 text-center text-sm leading-7 text-[#fffdee]/56"
        >
          Template aktif di sistem saat ini: <span className="font-bold text-[#e3ef26]">{templates.length}</span>. Untuk filter kategori bisnis dan tampilan katalog penuh, gunakan halaman `/templates`.
        </motion.p>
      </section>


      <section className="mx-auto mt-[210px] max-w-4xl px-6 py-20 pb-10 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-balance font-display text-[42px] font-semibold leading-[1.02] text-[#fffdee] md:text-[68px]"
        >
          {finalCta.headline}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          className="mx-auto mt-8 max-w-2xl text-[16px] leading-8 text-[#fffdee]/70 md:text-[18px]"
        >
          {finalCta.subheadline}
        </motion.p>
        <motion.div
          className="mt-10"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              href={finalCta.primaryHref}
              className="glow-ring premium-button inline-flex items-center gap-2 rounded-[14px] px-6 py-3.5 font-semibold"
            >
              {finalCta.primaryLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </main>
  );
}
