"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Compass, MapPin, MessageCircle, Phone, Quote } from "lucide-react";
import { AnimatedSection } from "@/components/animated-section";
import { FloatingWhatsApp } from "@/components/floating-whatsapp";
import { iconMap } from "@/lib/icon-map";
import type { Business, GalleryItem, Service, Testimonial } from "@/lib/types";

function getServices(business: Business): Service[] {
  return business.services.length > 0
    ? business.services
    : [
        { id: 1, businessId: 0, name: "Planning Layer", description: business.description, icon: "layout-template" },
        { id: 2, businessId: 0, name: "Execution Notes", description: business.description, icon: "briefcase-business" },
        { id: 3, businessId: 0, name: "Lead Routes", description: business.description, icon: "phone-call" },
      ];
}

function getTestimonials(business: Business): Testimonial[] {
  return business.testimonials.length > 0
    ? business.testimonials
    : [
        { id: 1, businessId: 0, name: "Partner Office", role: "Director", quote: business.tagline, sortOrder: 0 },
        { id: 2, businessId: 0, name: "Client Team", role: "Procurement", quote: "Nuansanya presisi, formal, tapi tetap modern dan tidak kaku.", sortOrder: 1 },
      ];
}

function getGallery(business: Business): GalleryItem[] {
  return business.galleryItems.length > 0
    ? business.galleryItems
    : [
        { id: 1, businessId: 0, title: "Manifest Cover", caption: "Visual utama untuk mempertegas identitas brand.", imageUrl: "", sortOrder: 0 },
        { id: 2, businessId: 0, title: "Project Notes", caption: "Tambahkan foto hasil kerja, fasilitas, atau suasana layanan.", imageUrl: "", sortOrder: 1 },
        { id: 3, businessId: 0, title: "Dock View", caption: "Frame penutup yang membantu CTA terasa lebih matang.", imageUrl: "", sortOrder: 2 },
      ];
}

export function HarborLedgerPage({
  business,
  whatsappHref,
}: {
  business: Business;
  whatsappHref: string;
}) {
  const services = getServices(business);
  const testimonials = getTestimonials(business);
  const galleryItems = getGallery(business);

  return (
    <main className="ledger-grid overflow-hidden bg-[#eef3f6] font-expressive text-[#112f47]">
      <section className="relative isolate px-6 pb-20 pt-8 md:px-10 lg:px-14">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_12%_14%,rgba(191,121,83,0.14),transparent_24%),radial-gradient(circle_at_86%_16%,rgba(17,47,71,0.12),transparent_22%),linear-gradient(180deg,#eef3f6_0%,#e6edf1_58%,#f5f8fb_100%)]" />
        <div className="ledger-scan absolute inset-x-0 top-0 -z-10 h-full opacity-55" />

        <div className="mx-auto max-w-7xl">
          <header className="flex items-center justify-between gap-4 border-b border-[#112f47]/12 pb-4">
            <Link href="/" className="font-mono-alt text-xs uppercase tracking-[0.34em] text-[#112f47]/60">
              bisnis.me
            </Link>
            <Link href="/admin/dashboard" className="rounded-[1.1rem] border border-[#112f47]/12 bg-white/70 px-4 py-2 text-sm font-semibold text-[#112f47] transition hover:bg-white">
              Admin
            </Link>
          </header>

          <div className="grid gap-8 pt-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55 }}
                className="inline-flex items-center gap-3 rounded-full border border-[#112f47]/12 bg-white/72 px-4 py-2 font-mono-alt text-[11px] uppercase tracking-[0.28em] text-[#112f47]"
              >
                <span className="h-2.5 w-2.5 rounded-full bg-[#bf7953]" />
                {business.heroLabel || business.templateName || "Harbor Ledger"}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.08 }}
                className="space-y-6"
              >
                <p className="font-mono-alt text-xs uppercase tracking-[0.34em] text-[#112f47]/46">
                  Blueprint calm, ledger precision, and a premium administrative feel.
                </p>
                <h1 className="max-w-4xl font-editorial-alt text-[clamp(3.4rem,8vw,7rem)] leading-[0.9] tracking-[-0.05em] text-[#112f47]">
                  {business.name}
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-[#112f47]/72">{business.tagline}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.14 }}
                className="flex flex-wrap gap-4"
              >
                <a href={business.heroCtaUrl} className="inline-flex items-center gap-2 rounded-full bg-[#112f47] px-6 py-3 font-semibold text-[#eef3f6] transition hover:-translate-y-1">
                  {business.heroCtaLabel}
                  <ArrowUpRight className="h-4 w-4" />
                </a>
                <a href={whatsappHref} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-[#112f47]/14 bg-[#bf7953] px-6 py-3 font-semibold text-white transition hover:-translate-y-1">
                  WhatsApp
                  <MessageCircle className="h-4 w-4" />
                </a>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.18 }}
              className="grid gap-4"
            >
              <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3">
                {[
                  { label: "Ledger", value: "Active" },
                  { label: "Services", value: String(services.length).padStart(2, "0") },
                  { label: "Proof", value: String(testimonials.length).padStart(2, "0") },
                ].map((item) => (
                  <div key={item.label} className="rounded-[1.6rem] border border-[#112f47]/12 bg-white/76 p-5">
                    <p className="font-mono-alt text-[11px] uppercase tracking-[0.28em] text-[#112f47]/48">{item.label}</p>
                    <p className="mt-4 font-editorial-alt text-3xl font-semibold text-[#112f47]">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="relative min-h-[27rem] overflow-hidden rounded-[2rem] border border-[#112f47]/12 bg-[#c7d7e2] shadow-[0_24px_80px_rgba(17,47,71,0.08)]">
                {business.heroImage ? (
                  <Image src={business.heroImage} alt={business.name} fill priority unoptimized className="object-cover opacity-82" />
                ) : (
                  <div className="absolute inset-0 bg-[linear-gradient(145deg,#d8e5ec_0%,#d8e5ec_40%,#bf7953_40%,#bf7953_44%,#eef3f6_44%,#eef3f6_70%,#112f47_70%,#112f47_100%)]" />
                )}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(238,243,246,0.08),rgba(17,47,71,0.08),rgba(17,47,71,0.44))]" />
                <div className="absolute bottom-0 left-0 right-0 border-t border-white/20 bg-[#112f47]/68 p-5 text-white">
                  <p className="font-mono-alt text-[11px] uppercase tracking-[0.3em] text-white/54">Manifest Header</p>
                  <p className="mt-3 max-w-md text-sm leading-7 text-white/84">{business.description}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <AnimatedSection id="about" className="mx-auto max-w-7xl px-6 py-16 md:px-10 lg:px-14" delay={0.05}>
        <div className="grid gap-4 lg:grid-cols-[0.78fr_1.22fr]">
          <div className="rounded-[2rem] border border-[#112f47]/12 bg-white/80 p-8">
            <p className="font-mono-alt text-[11px] uppercase tracking-[0.3em] text-[#bf7953]">{business.aboutTitle}</p>
            <h2 className="mt-5 font-editorial-alt text-5xl font-semibold leading-[0.94] text-[#112f47]">
              A calmer, more architectural business story.
            </h2>
            <p className="mt-5 text-base leading-8 text-[#112f47]/74">{business.aboutIntro || business.description}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              "Blueprint rhythm memberi rasa presisi tanpa terasa dingin.",
              "Warna biru baja dan tembaga terasa profesional, matang, dan terpercaya.",
              "Sangat cocok untuk bisnis jasa, konsultan, konstruksi, logistik, atau corporate service.",
            ].map((copy, index) => (
              <div key={copy} className={`rounded-[1.8rem] border p-6 ${index === 1 ? "border-[#bf7953]/18 bg-[#bf7953]/12" : "border-[#112f47]/12 bg-white/76"}`}>
                <p className="font-mono-alt text-[11px] uppercase tracking-[0.28em] text-[#112f47]/48">0{index + 1}</p>
                <p className="mt-4 text-sm leading-7 text-[#112f47]/76">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection id="services" className="mx-auto max-w-7xl px-6 py-16 md:px-10 lg:px-14" delay={0.08}>
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono-alt text-[11px] uppercase tracking-[0.3em] text-[#bf7953]">{business.servicesTitle}</p>
            <h2 className="mt-4 font-editorial-alt text-5xl font-semibold leading-[0.94] text-[#112f47]">
              Services mapped like blueprint modules.
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-[#112f47]/70">{business.servicesIntro}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service, index) => {
            const Icon = iconMap[service.icon] ?? Compass;
            return (
              <motion.article
                key={`${service.id}-${service.name}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className="rounded-[1.9rem] border border-[#112f47]/12 bg-white/80 p-6 shadow-[0_16px_50px_rgba(17,47,71,0.05)]"
              >
                <div className="flex items-center justify-between gap-3 border-b border-dashed border-[#112f47]/16 pb-4">
                  <span className="font-mono-alt text-[11px] uppercase tracking-[0.28em] text-[#112f47]/48">
                    Module 0{index + 1}
                  </span>
                  <Icon className="h-5 w-5 text-[#bf7953]" />
                </div>
                <h3 className="mt-5 font-editorial-alt text-3xl font-semibold leading-none text-[#112f47]">{service.name}</h3>
                <p className="mt-4 text-sm leading-7 text-[#112f47]/74">{service.description}</p>
              </motion.article>
            );
          })}
        </div>
      </AnimatedSection>

      <AnimatedSection id="proof" className="mx-auto max-w-7xl px-6 py-16 md:px-10 lg:px-14" delay={0.1}>
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono-alt text-[11px] uppercase tracking-[0.3em] text-[#bf7953]">{business.testimonialsTitle}</p>
            <h2 className="mt-4 font-editorial-alt text-5xl font-semibold leading-[0.94] text-[#112f47]">
              Proof presented like a polished project manifest.
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-[#112f47]/70">{business.testimonialsIntro}</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative min-h-[20rem] overflow-hidden rounded-[2rem] border border-[#112f47]/12 bg-[#c7d7e2]">
            {galleryItems[0]?.imageUrl ? (
              <Image src={galleryItems[0].imageUrl} alt={galleryItems[0].title} fill unoptimized className="object-cover" />
            ) : (
              <div className="absolute inset-0 bg-[linear-gradient(145deg,#d8e5ec_0%,#d8e5ec_44%,#bf7953_44%,#bf7953_48%,#eef3f6_48%,#eef3f6_100%)]" />
            )}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(17,47,71,0.08)_42%,rgba(17,47,71,0.62)_100%)]" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <p className="font-editorial-alt text-3xl font-semibold">{galleryItems[0]?.title || "Manifest Cover"}</p>
              <p className="mt-2 max-w-md text-sm leading-7 text-white/80">{galleryItems[0]?.caption || "Tambahkan visual utama untuk memperkuat kredibilitas halaman."}</p>
            </div>
          </div>

          <div className="grid gap-4">
            {testimonials.slice(0, 2).map((item, index) => (
              <div key={`${item.id}-${index}`} className={`rounded-[1.8rem] border p-6 ${index === 0 ? "border-[#112f47]/12 bg-white/80" : "border-[#bf7953]/18 bg-[#bf7953]/12"}`}>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-mono-alt text-[11px] uppercase tracking-[0.28em] text-[#112f47]/48">Partner Note</p>
                  <Quote className="h-4 w-4 text-[#bf7953]" />
                </div>
                <p className="mt-4 text-base leading-8 text-[#112f47]/80">{item.quote}</p>
                <p className="mt-5 text-sm font-semibold text-[#112f47]">{item.name}</p>
                <p className="text-sm text-[#112f47]/58">{item.role}</p>
              </div>
            ))}
            <div className="grid gap-4 md:grid-cols-2">
              {galleryItems.slice(1, 3).map((item, index) => (
                <div key={`${item.id}-${index}`} className="rounded-[1.6rem] border border-[#112f47]/12 bg-white/80 p-5">
                  <p className="font-mono-alt text-[11px] uppercase tracking-[0.28em] text-[#112f47]/48">Frame 0{index + 2}</p>
                  <p className="mt-3 font-editorial-alt text-2xl font-semibold text-[#112f47]">{item.title}</p>
                  <p className="mt-3 text-sm leading-7 text-[#112f47]/72">{item.caption}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection id="contact" className="mx-auto max-w-7xl px-6 pb-24 pt-16 md:px-10 lg:px-14" delay={0.12}>
        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-[#112f47]/12 bg-[#112f47] p-8 text-[#eef3f6]">
            <p className="font-mono-alt text-[11px] uppercase tracking-[0.3em] text-[#eef3f6]/56">{business.contactTitle}</p>
            <h2 className="mt-5 font-editorial-alt text-5xl font-semibold leading-[0.92]">
              Close with a formal, confident contact manifest.
            </h2>
            <p className="mt-5 text-base leading-8 text-[#eef3f6]/80">{business.contactIntro}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href={business.heroCtaUrl} className="inline-flex items-center gap-2 rounded-full bg-[#bf7953] px-6 py-3 font-semibold text-white">
                {business.heroCtaLabel}
                <ArrowUpRight className="h-4 w-4" />
              </a>
              <a href={whatsappHref} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/16 px-6 py-3 font-semibold text-white">
                Chat WhatsApp
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <LedgerCell icon={<Phone className="h-5 w-5" />} label="Phone" value={business.phone} href={`tel:${business.phone}`} />
            <LedgerCell icon={<MessageCircle className="h-5 w-5" />} label="WhatsApp" value={business.whatsapp} href={whatsappHref} />
            <LedgerCell icon={<MapPin className="h-5 w-5" />} label="Address" value={business.address} />
          </div>
        </div>
      </AnimatedSection>

      <FloatingWhatsApp whatsapp={business.whatsapp} />
    </main>
  );
}

function LedgerCell({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="h-full rounded-[1.7rem] border border-[#112f47]/12 bg-white/80 p-5">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#112f47] text-[#eef3f6]">{icon}</div>
      <p className="mt-4 font-mono-alt text-[11px] uppercase tracking-[0.28em] text-[#112f47]/48">{label}</p>
      <p className="mt-3 text-sm font-semibold leading-7 text-[#112f47]">{value}</p>
    </div>
  );

  if (!href) return content;
  return <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">{content}</a>;
}
