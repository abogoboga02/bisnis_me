"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Grid2x2Plus, MapPin, MessageCircle, Phone } from "lucide-react";
import { AnimatedSection } from "@/components/animated-section";
import { FloatingWhatsApp } from "@/components/floating-whatsapp";
import { iconMap } from "@/lib/icon-map";
import type { Business, GalleryItem, Service, Testimonial } from "@/lib/types";

function fallbackServices(description: string): Service[] {
  return [
    { id: 1, businessId: 0, name: "Brand Positioning", description, icon: "sparkles" },
    { id: 2, businessId: 0, name: "Conversion Layout", description, icon: "layout-template" },
    { id: 3, businessId: 0, name: "Lead Funnel", description, icon: "phone-call" },
  ];
}

function fallbackTestimonials(tagline: string): Testimonial[] {
  return [
    { id: 1, businessId: 0, name: "Client Partner", role: "Business Owner", quote: tagline, sortOrder: 0 },
    {
      id: 2,
      businessId: 0,
      name: "Growth Team",
      role: "Marketing Lead",
      quote: "Strukturnya tajam, pesannya jelas, dan CTA terasa lebih meyakinkan.",
      sortOrder: 1,
    },
    {
      id: 3,
      businessId: 0,
      name: "Operations Team",
      role: "Coordinator",
      quote: "Kontennya lebih rapi, visualnya jelas, dan pengunjung lebih cepat paham layanan yang ditawarkan.",
      sortOrder: 2,
    },
  ];
}

function fallbackGallery(name: string): GalleryItem[] {
  return [
    { id: 1, businessId: 0, title: `${name} Highlight`, caption: "Visual placeholder untuk section proof.", imageUrl: "", sortOrder: 0 },
    { id: 2, businessId: 0, title: "Campaign Cut", caption: "Susun visual terbaik agar headline terasa lebih kuat.", imageUrl: "", sortOrder: 1 },
    { id: 3, businessId: 0, title: "Service Detail", caption: "Detail visual yang memperjelas proses, layanan, atau suasana brand.", imageUrl: "", sortOrder: 2 },
    { id: 4, businessId: 0, title: "Final Result", caption: "Gunakan frame penutup untuk memperkuat hasil akhir dan kepercayaan.", imageUrl: "", sortOrder: 3 },
  ];
}

function getFixedServiceSlots(services: Service[], description: string) {
  const source = services.length > 0 ? services : fallbackServices(description);
  const fallback = fallbackServices(description);

  return Array.from({ length: 3 }, (_, index) => source[index] ?? fallback[index]);
}

function getFixedGallerySlots(galleryItems: GalleryItem[], name: string) {
  const source = galleryItems.length > 0 ? galleryItems : fallbackGallery(name);
  const fallback = fallbackGallery(name);

  return Array.from({ length: 4 }, (_, index) => source[index] ?? fallback[index]);
}

function getProofCards(testimonials: Testimonial[], tagline: string) {
  const source = testimonials.length > 0 ? testimonials : fallbackTestimonials(tagline);
  const fallback = fallbackTestimonials(tagline);

  return Array.from({ length: 2 }, (_, index) => source[index] ?? fallback[index]);
}

function getAboutCards(business: Business) {
  return [
    {
      label: business.servicesTitle || "Approach",
      copy: business.servicesIntro || "Struktur tajam, headline besar, dan CTA yang tidak tenggelam.",
    },
    {
      label: business.testimonialsTitle || "Rhythm",
      copy: business.testimonialsIntro || "Grid geometris menjaga tiap blok tetap rapi walau konten bertambah.",
    },
    {
      label: business.galleryTitle || "Result",
      copy: business.galleryIntro || "Brand terasa lebih solid, modern, dan lebih siap menerima enquiry.",
    },
  ];
}

export function SignalFramePage({
  business,
  whatsappHref,
}: {
  business: Business;
  whatsappHref: string;
}) {
  const services = getFixedServiceSlots(business.services, business.description);
  const testimonials = business.testimonials.length > 0 ? business.testimonials : fallbackTestimonials(business.tagline);
  const proofCards = getProofCards(testimonials, business.tagline);
  const galleryItems = getFixedGallerySlots(business.galleryItems, business.name);
  const aboutCards = getAboutCards(business);
  const aboutHeading = business.boardmemoTitle || business.aboutTitle || "Build trust with a cleaner business narrative.";
  const servicesHeading = business.servicesTitle || "Services arranged like a capability matrix.";
  const proofHeading = business.testimonialsTitle || "One strip for proof, trust, and visual recall.";
  const contactHeading = business.contactTitle || "Close the page with a sharper call to action.";
  const safePhone = business.phone || "Phone belum tersedia";
  const safeWhatsapp = business.whatsapp || "WhatsApp belum tersedia";
  const safeAddress = business.address || "Alamat belum tersedia";
  const primaryCtaClass =
    "inline-flex items-center justify-center gap-2 border border-[#d63f24] bg-[#d63f24] px-6 py-3 font-semibold text-white shadow-[0_14px_30px_rgba(214,63,36,0.18)] transition hover:-translate-y-1 hover:bg-[#bf341b]";
  const secondaryCtaClass =
    "inline-flex items-center justify-center gap-2 border border-[#111111]/14 bg-white/70 px-6 py-3 font-semibold text-[#111111] transition hover:-translate-y-1 hover:bg-white";

  return (
    <main className="overflow-hidden bg-[#f7f0e8] font-expressive text-[#111111]">
      <section className="relative px-5 pb-16 pt-6 md:px-10 md:pb-18 md:pt-8 lg:px-14">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_12%_14%,rgba(214,63,36,0.14),transparent_22%),linear-gradient(180deg,#f7f0e8_0%,#f3e7db_56%,#f8f3ee_100%)]" />
        <div className="absolute left-0 top-24 -z-10 h-px w-full bg-[#111111]/10" />
        <div className="absolute right-12 top-0 -z-10 h-full w-px bg-[#111111]/10" />
        <div className="absolute bottom-10 left-10 -z-10 h-40 w-40 rounded-full bg-[#d63f24]/8 blur-3xl" />

        <div className="mx-auto max-w-7xl">
          <header className="flex items-center justify-between gap-4 border-b border-[#111111]/12 pb-4">
            <Link href="/" className="font-mono-alt text-xs uppercase tracking-[0.34em] text-[#111111]/70">
              bisnis.me
            </Link>
            <Link href="/admin/dashboard" className="border border-[#111111]/14 bg-white/70 px-3 py-2 text-xs font-semibold text-[#111111] transition hover:bg-white sm:px-4 sm:text-sm">
              Admin
            </Link>
          </header>

          <div className="grid gap-8 pt-8 md:gap-10 md:pt-10 lg:grid-cols-[1.24fr_0.76fr] lg:items-start">
            <div className="space-y-6 md:space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55 }}
                className="inline-flex items-center gap-3 border border-[#111111]/12 bg-white/70 px-3 py-2 font-mono-alt text-[10px] uppercase tracking-[0.24em] sm:px-4 sm:text-[11px] sm:tracking-[0.28em]"
              >
                <span className="h-2.5 w-2.5 bg-[#d63f24]" />
                {business.heroLabel || business.templateName || "Signal Frame"}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.08 }}
                className="space-y-6"
              >
                <p className="max-w-xl font-mono-alt text-[11px] uppercase tracking-[0.24em] text-[#111111]/54 sm:text-xs sm:tracking-[0.32em]">
                  {business.heroLabel || business.templateName || "Signal Frame"}
                </p>
                <h1 className="max-w-4xl font-graphic text-[clamp(2.9rem,14vw,7.8rem)] uppercase leading-[0.9] tracking-[-0.05em] text-[#111111]">
                  {business.name}
                </h1>
                <p className="max-w-2xl text-base leading-7 text-[#2d2d2d]/80 md:text-lg md:leading-8 lg:text-xl">{business.tagline}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4"
              >
                <a href={business.heroCtaUrl} className={`${primaryCtaClass} w-full sm:w-auto`}>
                  {business.heroCtaLabel || "Hubungi Kami"}
                  <ArrowUpRight className="h-4 w-4" />
                </a>
                <a href={whatsappHref} target="_blank" rel="noreferrer" className={`${secondaryCtaClass} w-full sm:w-auto`}>
                  {business.whatsapp ? "WhatsApp" : "Kontak"}
                  <MessageCircle className="h-4 w-4" />
                </a>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.16 }}
              className="grid gap-4"
            >
              <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:grid-cols-1">
                {[
                  { label: "Services", value: String(services.length).padStart(2, "0") },
                  { label: "Proof", value: String(testimonials.length).padStart(2, "0") },
                  { label: "Gallery", value: String(galleryItems.length).padStart(2, "0") },
                ].map((item) => (
                  <div key={item.label} className="border border-[#111111]/12 bg-white/82 p-3 sm:p-5">
                    <p className="font-mono-alt text-[9px] uppercase tracking-[0.16em] text-[#111111]/48 sm:text-[11px] sm:tracking-[0.28em]">{item.label}</p>
                    <p className="mt-3 font-graphic text-3xl uppercase tracking-[-0.05em] text-[#111111] sm:mt-4 sm:text-4xl">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="relative min-h-[20rem] overflow-hidden border border-[#111111]/12 bg-[#111111] sm:min-h-[24rem] lg:min-h-[26rem]">
                {business.heroImage ? (
                  <Image src={business.heroImage} alt={business.name} fill priority unoptimized className="object-cover opacity-84" />
                ) : (
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,#161616_0%,#2b2b2b_38%,#d63f24_38%,#d63f24_52%,#f7f0e8_52%,#f7f0e8_68%,#161616_68%,#161616_100%)]" />
                )}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,17,17,0.08),rgba(17,17,17,0.18),rgba(17,17,17,0.58))]" />
                <div className="absolute bottom-0 left-0 right-0 grid gap-3 border-t border-white/10 bg-[#111111]/72 p-4 text-[#f7f0e8] sm:p-5 md:grid-cols-2">
                  <div>
                    <p className="font-mono-alt text-[11px] uppercase tracking-[0.28em] text-[#f7f0e8]/56">Headline</p>
                    <p className="mt-2 text-sm leading-7 text-[#f7f0e8]/84">{business.description}</p>
                  </div>
                  <div className="border-l-0 border-white/10 md:border-l md:pl-5">
                    <p className="font-mono-alt text-[11px] uppercase tracking-[0.28em] text-[#f7f0e8]/56">Contact</p>
                    <p className="mt-2 text-sm leading-7 text-[#f7f0e8]/84">{safePhone}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <AnimatedSection id="about" className="mx-auto max-w-7xl px-6 py-16 md:px-10 lg:px-14" delay={0.05}>
        <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="border border-[#111111]/12 bg-white/84 p-6 sm:p-8">
            <p className="font-mono-alt text-[11px] uppercase tracking-[0.3em] text-[#111111]/48">{business.aboutTitle}</p>
            <h2 className="mt-5 font-graphic text-3xl uppercase leading-[0.92] tracking-[-0.04em] text-[#111111] sm:text-4xl">
              {aboutHeading}
            </h2>
            <p className="mt-5 text-base leading-8 text-[#2b2b2b]/76">{business.aboutIntro || business.description}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {aboutCards.map((item) => (
              <div key={item.label} className="border border-[#111111]/12 bg-[#f1e5da] p-5 sm:p-6">
                <p className="font-mono-alt text-[11px] uppercase tracking-[0.28em] text-[#d63f24]">{item.label}</p>
                <p className="mt-4 text-sm leading-7 text-[#222222]/78">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection id="services" className="mx-auto max-w-7xl px-6 py-16 md:px-10 lg:px-14" delay={0.08}>
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono-alt text-[11px] uppercase tracking-[0.3em] text-[#d63f24]">{business.servicesTitle}</p>
            <h2 className="mt-4 font-graphic text-3xl uppercase leading-[0.94] tracking-[-0.04em] text-[#111111] sm:text-4xl">
              {servicesHeading}
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-[#2d2d2d]/72">{business.servicesIntro}</p>
        </div>

        <div className="grid gap-4 min-[520px]:grid-cols-2 xl:grid-cols-3">
          {services.map((service, index) => {
            const Icon = iconMap[service.icon] ?? Grid2x2Plus;
            return (
              <motion.article
                key={`${service.id}-${service.name}`}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className="group border border-[#111111]/12 bg-white/84 p-5 transition hover:-translate-y-1 sm:p-6"
              >
                <div className="flex items-center justify-between gap-3 border-b border-[#111111]/10 pb-4">
                  <span className="font-mono-alt text-[11px] uppercase tracking-[0.28em] text-[#111111]/48">
                    Module {String(index + 1).padStart(2, "0")}
                  </span>
                  <Icon className="h-5 w-5 text-[#d63f24]" />
                </div>
                <h3 className="mt-5 font-graphic text-xl uppercase leading-none tracking-[-0.04em] text-[#111111] sm:text-2xl">
                  {service.name}
                </h3>
                <p className="mt-4 text-sm leading-7 text-[#2b2b2b]/76">{service.description}</p>
              </motion.article>
            );
          })}
        </div>
      </AnimatedSection>

      <AnimatedSection id="proof" className="mx-auto max-w-7xl px-6 py-16 md:px-10 lg:px-14" delay={0.1}>
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono-alt text-[11px] uppercase tracking-[0.3em] text-[#d63f24]">{business.testimonialsTitle}</p>
            <h2 className="mt-4 font-graphic text-3xl uppercase leading-[0.94] tracking-[-0.04em] text-[#111111] sm:text-4xl">
              {proofHeading}
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-[#2d2d2d]/72">{business.testimonialsIntro}</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="grid gap-4">
            {proofCards.map((item, index) => (
              <div key={`${item.id}-${index}`} className={`border p-5 sm:p-6 ${index === 0 ? "border-[#111111] bg-[#111111] text-[#f7f0e8]" : "border-[#111111]/12 bg-white/82 text-[#111111]"}`}>
                <p className={`font-mono-alt text-[11px] uppercase tracking-[0.28em] ${index === 0 ? "text-[#f7f0e8]/54" : "text-[#111111]/48"}`}>
                  Testimonial
                </p>
                <p className="mt-4 text-lg leading-8">{item.quote}</p>
                <p className={`mt-5 text-sm font-semibold ${index === 0 ? "text-[#f7f0e8]" : "text-[#111111]"}`}>
                  {item.name}
                </p>
                <p className={`text-sm ${index === 0 ? "text-[#f7f0e8]/72" : "text-[#111111]/60"}`}>{item.role}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 min-[520px]:grid-cols-2">
            {galleryItems.slice(0, 4).map((item, index) => (
              <div key={`${item.id}-${index}`} className="relative min-h-[11rem] overflow-hidden border border-[#111111]/12 bg-[#111111] sm:min-h-[15rem]">
                {item.imageUrl ? (
                  <Image src={item.imageUrl} alt={item.title} fill unoptimized className="object-cover transition duration-700 hover:scale-105" />
                ) : (
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,#111111_0%,#111111_28%,#d63f24_28%,#d63f24_46%,#f7f0e8_46%,#f7f0e8_62%,#111111_62%,#111111_100%)]" />
                )}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(17,17,17,0.08)_40%,rgba(17,17,17,0.72)_100%)]" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-[#f7f0e8] sm:p-5">
                  <p className="font-graphic text-lg uppercase tracking-[-0.04em] sm:text-xl">{item.title}</p>
                  <p className="mt-2 text-xs leading-5 text-[#f7f0e8]/78 sm:text-sm sm:leading-6">{item.caption}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection id="contact" className="mx-auto max-w-7xl px-6 pb-24 pt-16 md:px-10 lg:px-14" delay={0.12}>
        <div className="grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="border border-[#111111]/12 bg-[#d63f24] p-6 text-white sm:p-8">
            <p className="font-mono-alt text-[11px] uppercase tracking-[0.3em] text-white/68">{business.contactTitle}</p>
            <h2 className="mt-5 font-graphic text-3xl uppercase leading-[0.92] tracking-[-0.04em] sm:text-4xl">
              {contactHeading}
            </h2>
            <p className="mt-5 text-base leading-8 text-white/82">{business.contactIntro}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
              <a href={business.heroCtaUrl} className="inline-flex w-full items-center justify-center gap-2 border border-[#bf341b] bg-[#bf341b] px-6 py-3 font-semibold text-white shadow-[0_14px_30px_rgba(129,31,16,0.2)] transition hover:-translate-y-1 hover:bg-[#a52d19] sm:w-auto">
                {business.heroCtaLabel || "Hubungi Kami"}
                <ArrowUpRight className="h-4 w-4" />
              </a>
              <a href={whatsappHref} target="_blank" rel="noreferrer" className="inline-flex w-full items-center justify-center gap-2 border border-white/20 px-6 py-3 font-semibold text-white transition hover:-translate-y-1 sm:w-auto">
                {business.whatsapp ? "Chat WhatsApp" : "Kontak"}
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="grid gap-4 min-[520px]:grid-cols-3">
            <ContactCell icon={<Phone className="h-5 w-5" />} label="Phone" value={safePhone} href={business.phone ? `tel:${business.phone}` : undefined} />
            <ContactCell icon={<MessageCircle className="h-5 w-5" />} label="WhatsApp" value={safeWhatsapp} href={business.whatsapp ? whatsappHref : undefined} />
            <ContactCell icon={<MapPin className="h-5 w-5" />} label="Address" value={safeAddress} />
          </div>
        </div>
      </AnimatedSection>

      <FloatingWhatsApp whatsapp={business.whatsapp} />
    </main>
  );
}

function ContactCell({
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
    <div className="h-full border border-[#111111]/12 bg-white/82 p-4 sm:p-5">
      <div className="flex h-12 w-12 items-center justify-center bg-[#111111] text-[#f7f0e8]">{icon}</div>
      <p className="mt-4 font-mono-alt text-[11px] uppercase tracking-[0.28em] text-[#111111]/48">{label}</p>
      <p className="mt-3 text-sm font-semibold leading-6 text-[#111111] sm:leading-7">{value}</p>
    </div>
  );

  if (!href) return content;
  return <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">{content}</a>;
}
