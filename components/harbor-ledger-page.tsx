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
        {
          id: 1,
          businessId: 0,
          name: business.servicesTitle || business.aboutTitle || business.name || "",
          description: business.servicesIntro || business.aboutIntro || business.description || business.tagline || "",
          icon: "layout-template",
        },
        {
          id: 2,
          businessId: 0,
          name: business.testimonialsTitle || business.contactTitle || business.name || "",
          description: business.testimonialsIntro || business.contactIntro || business.description || business.tagline || "",
          icon: "briefcase-business",
        },
        {
          id: 3,
          businessId: 0,
          name: business.galleryTitle || business.heroLabel || business.name || "",
          description: business.galleryIntro || business.boardmemoBody || business.description || business.tagline || "",
          icon: "phone-call",
        },
      ];
}

function getTestimonials(business: Business): Testimonial[] {
  return business.testimonials.length > 0
    ? business.testimonials
    : [
        {
          id: 1,
          businessId: 0,
          name: business.name,
          role: business.aboutTitle || business.heroLabel || business.templateName || "",
          quote: business.tagline || business.description || "",
          sortOrder: 0,
        },
        {
          id: 2,
          businessId: 0,
          name: business.servicesTitle || business.name || "",
          role: business.servicesTitle || business.heroLabel || business.templateName || "",
          quote: business.testimonialsIntro || business.servicesIntro || business.description || business.tagline || "",
          sortOrder: 1,
        },
        {
          id: 3,
          businessId: 0,
          name: business.contactTitle || business.name || "",
          role: business.contactTitle || business.galleryTitle || business.templateName || "",
          quote: business.contactIntro || business.boardmemoBody || business.description || business.tagline || "",
          sortOrder: 2,
        },
      ];
}

function getGallery(business: Business): GalleryItem[] {
  return business.galleryItems.length > 0
    ? business.galleryItems
    : [
        {
          id: 1,
          businessId: 0,
          title: business.galleryTitle || business.name || "",
          caption: business.galleryIntro || business.description || business.tagline || "",
          imageUrl: "",
          sortOrder: 0,
        },
        {
          id: 2,
          businessId: 0,
          title: business.aboutTitle || business.name || "",
          caption: business.aboutIntro || business.description || business.tagline || "",
          imageUrl: "",
          sortOrder: 1,
        },
        {
          id: 3,
          businessId: 0,
          title: business.servicesTitle || business.name || "",
          caption: business.servicesIntro || business.description || business.tagline || "",
          imageUrl: "",
          sortOrder: 2,
        },
        {
          id: 4,
          businessId: 0,
          title: business.contactTitle || business.name || "",
          caption: business.contactIntro || business.boardmemoBody || business.description || business.tagline || "",
          imageUrl: "",
          sortOrder: 3,
        },
      ];
}

export function HarborLedgerPage({
  business,
  whatsappHref,
}: {
  business: Business;
  whatsappHref: string;
}) {
  const services = getServices(business).slice(0, 3);
  const testimonials = getTestimonials(business).slice(0, 3);
  const galleryItems = getGallery(business).slice(0, 4);
  const heroEyebrow = business.aboutIntro || business.description || business.contactIntro || business.heroLabel || business.name;
  const aboutHeading = business.aboutTitle || business.name;
  const servicesHeading = business.servicesTitle || business.heroLabel || business.name;
  const proofHeading = business.testimonialsTitle || business.galleryTitle || business.name;
  const contactHeading = business.contactTitle || business.heroCtaLabel || business.name;
  const aboutLabel = business.aboutTitle || business.heroLabel || business.templateName || business.name;
  const servicesLabel = business.servicesTitle || business.heroLabel || business.templateName || business.name;
  const proofLabel = business.testimonialsTitle || business.galleryTitle || business.templateName || business.name;
  const contactLabel = business.contactTitle || business.heroLabel || business.templateName || business.name;
  const ledgerLabel = business.boardmemoLabel || business.heroLabel || business.templateName;
  const manifestLabel = business.galleryTitle || business.heroLabel || business.templateName;
  const partnerNoteLabel = business.testimonialsTitle || business.heroLabel || business.templateName;
  const safePhone = business.phone || business.whatsapp || business.heroCtaLabel || business.name;
  const safeWhatsapp = business.whatsapp || business.phone || business.heroCtaLabel || business.name;
  const safeAddress = business.address || business.contactIntro || business.description || business.name;
  const aboutCards = [
    business.aboutIntro || business.description || business.tagline,
    business.servicesIntro || business.description || business.tagline,
    business.galleryIntro || business.contactIntro || business.description || business.tagline,
  ];
  const ledgerStats = [
    {
      label: ledgerLabel,
      value: business.aboutTitle || business.heroLabel || business.templateName || business.name,
    },
    {
      label: business.servicesTitle || business.heroLabel || business.templateName,
      value: String(services.length).padStart(2, "0"),
    },
    {
      label: business.testimonialsTitle || business.galleryTitle || business.templateName,
      value: String(testimonials.length).padStart(2, "0"),
    },
  ];

  return (
    <main className="ledger-grid overflow-hidden bg-[#eef3f6] font-expressive text-[#112f47]">
      <section className="relative isolate px-5 pb-16 pt-6 md:px-10 md:pb-20 md:pt-8 lg:px-14">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_12%_14%,rgba(191,121,83,0.14),transparent_24%),radial-gradient(circle_at_86%_16%,rgba(17,47,71,0.12),transparent_22%),linear-gradient(180deg,#eef3f6_0%,#e6edf1_58%,#f5f8fb_100%)]" />
        <div className="ledger-scan absolute inset-x-0 top-0 -z-10 h-full opacity-55" />

        <div className="mx-auto max-w-7xl">
          <header className="flex items-center justify-between gap-4 border-b border-[#112f47]/12 pb-4">
            <Link href="/" className="font-mono-alt text-xs uppercase tracking-[0.34em] text-[#112f47]/60">
              bisnis.me
            </Link>
            <Link href="/admin/dashboard" className="rounded-[1.1rem] border border-[#112f47]/12 bg-white/70 px-3 py-2 text-xs font-semibold text-[#112f47] transition hover:bg-white sm:px-4 sm:text-sm">
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
                {business.heroLabel || business.templateName || business.name}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.08 }}
                className="space-y-6"
              >
                <p className="font-mono-alt text-[10px] uppercase tracking-[0.28em] text-[#112f47]/46 sm:text-xs sm:tracking-[0.34em]">
                  {heroEyebrow}
                </p>
                <h1 className="max-w-4xl font-editorial-alt text-[clamp(2.8rem,11vw,7rem)] leading-[0.9] tracking-[-0.05em] text-[#112f47]">
                  {business.name}
                </h1>
                <p className="max-w-2xl text-base leading-7 text-[#112f47]/72 sm:text-lg sm:leading-8">{business.tagline}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.14 }}
                className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4"
              >
                <a href={business.heroCtaUrl} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#112f47] px-6 py-3 font-semibold text-[#eef3f6] transition hover:-translate-y-1 sm:w-auto">
                  {business.heroCtaLabel}
                  <ArrowUpRight className="h-4 w-4" />
                </a>
                <a href={whatsappHref} target="_blank" rel="noreferrer" className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#112f47]/14 bg-[#bf7953] px-6 py-3 font-semibold text-white transition hover:-translate-y-1 sm:w-auto">
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
                {ledgerStats.map((item) => (
                  <div key={item.label} className="rounded-[1.6rem] border border-[#112f47]/12 bg-white/76 p-5">
                    <p className="font-mono-alt text-[11px] uppercase tracking-[0.28em] text-[#112f47]/48">{item.label}</p>
                    <p className="mt-4 font-editorial-alt text-[1.7rem] font-semibold text-[#112f47] sm:text-3xl">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="relative min-h-[23rem] overflow-hidden rounded-[2rem] border border-[#112f47]/12 bg-[#c7d7e2] shadow-[0_24px_80px_rgba(17,47,71,0.08)] sm:min-h-[27rem]">
                {business.heroImage ? (
                  <Image src={business.heroImage} alt={business.name} fill priority unoptimized className="object-cover opacity-82" />
                ) : (
                  <div className="absolute inset-0 bg-[linear-gradient(145deg,#d8e5ec_0%,#d8e5ec_40%,#bf7953_40%,#bf7953_44%,#eef3f6_44%,#eef3f6_70%,#112f47_70%,#112f47_100%)]" />
                )}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(238,243,246,0.08),rgba(17,47,71,0.08),rgba(17,47,71,0.44))]" />
                <div className="absolute bottom-0 left-0 right-0 border-t border-white/20 bg-[#112f47]/68 p-5 text-white">
                  <p className="font-mono-alt text-[11px] uppercase tracking-[0.3em] text-white/54">{manifestLabel}</p>
                  <p className="mt-3 max-w-md text-sm leading-7 text-white/84">{business.description}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <AnimatedSection id="about" className="mx-auto max-w-7xl px-5 py-14 md:px-10 md:py-16 lg:px-14" delay={0.05}>
        <div className="grid gap-4 lg:grid-cols-[0.78fr_1.22fr]">
          <div className="rounded-[2rem] border border-[#112f47]/12 bg-white/80 p-8">
            <p className="font-mono-alt text-[11px] uppercase tracking-[0.3em] text-[#bf7953]">{aboutLabel}</p>
            <h2 className="mt-5 font-editorial-alt text-[2.4rem] font-semibold leading-[0.94] text-[#112f47] sm:text-5xl">
              {aboutHeading}
            </h2>
            <p className="mt-5 text-base leading-8 text-[#112f47]/74">{business.aboutIntro || business.description}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {aboutCards.map((copy, index) => (
              <div key={copy} className={`rounded-[1.8rem] border p-6 ${index === 1 ? "border-[#bf7953]/18 bg-[#bf7953]/12" : "border-[#112f47]/12 bg-white/76"}`}>
                <p className="font-mono-alt text-[11px] uppercase tracking-[0.28em] text-[#112f47]/48">0{index + 1}</p>
                <p className="mt-4 text-sm leading-7 text-[#112f47]/76">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection id="services" className="mx-auto max-w-7xl px-5 py-14 md:px-10 md:py-16 lg:px-14" delay={0.08}>
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono-alt text-[11px] uppercase tracking-[0.3em] text-[#bf7953]">{servicesLabel}</p>
            <h2 className="mt-4 font-editorial-alt text-[2.4rem] font-semibold leading-[0.94] text-[#112f47] sm:text-5xl">
              {servicesHeading}
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

      <AnimatedSection id="proof" className="mx-auto max-w-7xl px-5 py-14 md:px-10 md:py-16 lg:px-14" delay={0.1}>
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono-alt text-[11px] uppercase tracking-[0.3em] text-[#bf7953]">{proofLabel}</p>
            <h2 className="mt-4 font-editorial-alt text-[2.4rem] font-semibold leading-[0.94] text-[#112f47] sm:text-5xl">
              {proofHeading}
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
              <p className="font-editorial-alt text-3xl font-semibold">{galleryItems[0]?.title || manifestLabel}</p>
              <p className="mt-2 max-w-md text-sm leading-7 text-white/80">{galleryItems[0]?.caption || business.galleryIntro || business.description || business.tagline}</p>
            </div>
          </div>

          <div className="grid gap-4">
            {testimonials.slice(0, 2).map((item, index) => (
              <div key={`${item.id}-${index}`} className={`rounded-[1.8rem] border p-6 ${index === 0 ? "border-[#112f47]/12 bg-white/80" : "border-[#bf7953]/18 bg-[#bf7953]/12"}`}>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-mono-alt text-[11px] uppercase tracking-[0.28em] text-[#112f47]/48">{partnerNoteLabel}</p>
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

      <AnimatedSection id="contact" className="mx-auto max-w-7xl px-5 pb-20 pt-14 md:px-10 md:pb-24 md:pt-16 lg:px-14" delay={0.12}>
        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-[#112f47]/12 bg-[#112f47] p-8 text-[#eef3f6]">
            <p className="font-mono-alt text-[11px] uppercase tracking-[0.3em] text-[#eef3f6]/56">{contactLabel}</p>
            <h2 className="mt-5 font-editorial-alt text-[2.4rem] font-semibold leading-[0.92] sm:text-5xl">
              {contactHeading}
            </h2>
            <p className="mt-5 text-base leading-8 text-[#eef3f6]/80">{business.contactIntro}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
              <a href={business.heroCtaUrl} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#bf7953] px-6 py-3 font-semibold text-white sm:w-auto">
                {business.heroCtaLabel}
                <ArrowUpRight className="h-4 w-4" />
              </a>
              <a href={whatsappHref} target="_blank" rel="noreferrer" className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/16 px-6 py-3 font-semibold text-white sm:w-auto">
                WhatsApp
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <LedgerCell icon={<Phone className="h-5 w-5" />} label="Phone" value={safePhone} href={business.phone ? `tel:${business.phone}` : undefined} />
            <LedgerCell icon={<MessageCircle className="h-5 w-5" />} label="WhatsApp" value={safeWhatsapp} href={business.whatsapp ? whatsappHref : undefined} />
            <LedgerCell icon={<MapPin className="h-5 w-5" />} label="Address" value={safeAddress} />
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
      <p className="mt-3 text-sm font-semibold leading-6 text-[#112f47] sm:leading-7">{value}</p>
    </div>
  );

  if (!href) return content;
  return <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">{content}</a>;
}
