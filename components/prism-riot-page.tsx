"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin, MessageCircle, Phone, Quote } from "lucide-react";
import { AnimatedSection } from "@/components/animated-section";
import { FloatingWhatsApp } from "@/components/floating-whatsapp";
import { iconMap } from "@/lib/icon-map";
import type { Business, GalleryItem, Service, Testimonial } from "@/lib/types";

function getFallbackServices(business: Business): Service[] {
  if (business.services.length > 0) {
    return business.services;
  }

  return [
    {
      id: 1,
      businessId: 0,
      name: business.servicesTitle || business.aboutTitle || business.name || "",
      description: business.servicesIntro || business.aboutIntro || business.description || business.tagline || "",
      icon: "sparkles",
    },
    {
      id: 2,
      businessId: 0,
      name: business.testimonialsTitle || business.contactTitle || business.name || "",
      description: business.testimonialsIntro || business.contactIntro || business.description || business.tagline || "",
      icon: "megaphone",
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

function getFallbackTestimonials(business: Business): Testimonial[] {
  if (business.testimonials.length > 0) {
    return business.testimonials;
  }

  return [
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

function getFallbackGallery(business: Business): GalleryItem[] {
  if (business.galleryItems.length > 0) {
    return business.galleryItems;
  }

  return [
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

function prismPanel(points: string) {
  return { clipPath: `polygon(${points})` };
}

export function PrismRiotPage({
  business,
  whatsappHref,
}: {
  business: Business;
  whatsappHref: string;
}) {
  const services = getFallbackServices(business).slice(0, 3);
  const testimonials = getFallbackTestimonials(business).slice(0, 3);
  const galleryItems = getFallbackGallery(business).slice(0, 4);
  const heroEyebrow = business.aboutIntro || business.description || business.contactIntro || business.heroLabel || business.name;
  const aboutHeading = business.aboutTitle || business.name;
  const servicesHeading = business.servicesTitle || business.heroLabel || business.name;
  const proofHeading = business.testimonialsTitle || business.galleryTitle || business.name;
  const contactHeading = business.contactTitle || business.heroCtaLabel || business.name;
  const aboutLabel = business.aboutTitle || business.heroLabel || business.templateName || business.name;
  const servicesLabel = business.servicesTitle || business.heroLabel || business.templateName || business.name;
  const proofLabel = business.testimonialsTitle || business.galleryTitle || business.templateName || business.name;
  const contactLabel = business.contactTitle || business.heroLabel || business.templateName || business.name;
  const atlasLabel = business.boardmemoLabel || business.aboutTitle || business.heroLabel || business.templateName;
  const atlasBody = business.boardmemoBody || business.description || business.contactIntro || business.tagline;
  const totemLabel = business.servicesTitle || business.boardmemoLabel || business.heroLabel || business.templateName;
  const totemBody = business.servicesIntro || business.boardmemoBody || business.description || business.tagline;
  const fragmentLabel = business.testimonialsTitle || business.heroLabel || business.templateName;
  const designNoteLabel = business.boardmemoLabel || business.contactTitle || business.heroLabel || business.templateName;
  const designNoteBody = business.boardmemoBody || business.contactIntro || business.description || business.tagline;
  const safePhone = business.phone || business.whatsapp || business.heroCtaLabel || business.name;
  const safeWhatsapp = business.whatsapp || business.phone || business.heroCtaLabel || business.name;
  const safeAddress = business.address || business.contactIntro || business.description || business.name;
  const aboutCards = [
    {
      title: business.aboutTitle || business.heroLabel || business.name,
      copy: business.aboutIntro || business.description || business.tagline,
    },
    {
      title: business.servicesTitle || business.heroLabel || business.name,
      copy: business.servicesIntro || business.description || business.tagline,
    },
    {
      title: business.galleryTitle || business.testimonialsTitle || business.contactTitle || business.name,
      copy: business.galleryIntro || business.testimonialsIntro || business.contactIntro || business.description || business.tagline,
    },
  ];
  const prismStats = [
    {
      label: business.heroLabel || business.templateName || business.aboutTitle || business.name,
      value: business.aboutTitle || business.heroLabel || business.templateName || business.name,
    },
    {
      label: business.servicesTitle || business.heroLabel || business.templateName,
      value: String(services.length).padStart(2, "0"),
    },
  ];

  return (
    <main className="overflow-hidden bg-[#fbf5ea] font-tech text-[#0c1f4d]">
      <section className="relative isolate px-5 pb-16 pt-6 md:px-10 md:pb-20 md:pt-8 lg:px-14">
        <div className="absolute inset-0 -z-30 bg-[radial-gradient(circle_at_8%_10%,rgba(252,95,78,0.18),transparent_18%),radial-gradient(circle_at_78%_14%,rgba(32,92,255,0.16),transparent_20%),linear-gradient(180deg,#fbf5ea_0%,#f8efe0_56%,#fff8ef_100%)]" />
        <div className="prism-float absolute left-[5%] top-18 -z-20 h-48 w-48 bg-[#ff5e4d]/22 blur-3xl" style={prismPanel("12% 0, 100% 18%, 84% 100%, 0 78%")} />
        <div className="prism-float absolute right-[10%] top-24 -z-20 h-52 w-52 bg-[#215cff]/18 blur-3xl" style={prismPanel("18% 0, 100% 10%, 78% 100%, 0 88%")} />
        <div className="prism-float absolute bottom-14 left-[38%] -z-20 h-40 w-40 bg-[#d7ff48]/18 blur-3xl" style={prismPanel("22% 0, 100% 16%, 74% 100%, 0 82%")} />

        <div className="mx-auto max-w-7xl">
          <header className="flex items-center justify-between gap-4 pb-5">
            <Link href="/" className="font-mono-alt text-xs uppercase tracking-[0.34em] text-[#0c1f4d]/58">
              bisnis.me
            </Link>
            <Link href="/admin/dashboard" className="rounded-[1.2rem] border border-[#0c1f4d]/10 bg-white/60 px-3 py-2 text-xs font-semibold text-[#0c1f4d] transition hover:bg-white sm:px-4 sm:text-sm">
              Admin
            </Link>
          </header>

          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55 }}
                className="inline-flex items-center gap-3 bg-[#0c1f4d] px-4 py-2 font-mono-alt text-[10px] uppercase tracking-[0.26em] text-[#fbf5ea] sm:text-[11px] sm:tracking-[0.3em]"
                style={prismPanel("4% 0, 100% 0, 96% 100%, 0 100%")}
              >
                <span className="h-2.5 w-2.5 bg-[#d7ff48]" />
                {business.heroLabel || business.templateName || business.name}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.08 }}
                className="space-y-6"
              >
                <div className="max-w-4xl space-y-4">
                  <p className="font-mono-alt text-[10px] uppercase tracking-[0.28em] text-[#0c1f4d]/48 sm:text-xs sm:tracking-[0.34em]">
                    {heroEyebrow}
                  </p>
                  <h1 className="max-w-4xl font-graphic text-[clamp(2.7rem,12vw,8rem)] uppercase leading-[0.88] tracking-[-0.06em] text-[#0c1f4d]">
                    {business.name}
                  </h1>
                  <p className="max-w-2xl text-base leading-7 text-[#0c1f4d]/76 sm:text-lg sm:leading-8">{business.tagline}</p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
                  <a
                    href={business.heroCtaUrl}
                    className="inline-flex w-full items-center justify-center gap-2 bg-[#ff5e4d] px-6 py-3 font-semibold text-white transition hover:-translate-y-1 sm:w-auto"
                    style={prismPanel("7% 0, 100% 0, 93% 100%, 0 100%")}
                  >
                    {business.heroCtaLabel}
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 border border-[#0c1f4d]/14 bg-[#215cff] px-6 py-3 font-semibold text-white transition hover:-translate-y-1 sm:w-auto"
                    style={prismPanel("0 0, 92% 0, 100% 100%, 8% 100%")}
                  >
                    WhatsApp
                    <MessageCircle className="h-4 w-4" />
                  </a>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.16 }}
              className="grid gap-4 lg:grid-cols-[0.42fr_0.58fr]"
            >
              <div className="grid gap-4">
                {prismStats.map((item, index) => (
                  <div
                    key={`${item.label}-${index}`}
                    className={`${index === 0 ? "bg-[#0c1f4d] text-[#fbf5ea]" : "bg-[#d7ff48] text-[#0c1f4d]"} p-5`}
                    style={prismPanel(index === 0 ? "0 0, 100% 10%, 88% 100%, 8% 88%" : "10% 0, 100% 12%, 94% 100%, 0 92%")}
                  >
                    <p className={`font-mono-alt text-[11px] uppercase tracking-[0.3em] ${index === 0 ? "text-[#fbf5ea]/56" : "text-[#0c1f4d]/58"}`}>
                      {item.label}
                    </p>
                    <p className="mt-4 font-graphic text-[1.75rem] uppercase leading-none tracking-[-0.04em] sm:text-3xl">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="relative min-h-[24rem] overflow-hidden bg-[#0c1f4d] sm:min-h-[29rem]" style={prismPanel("8% 0, 100% 6%, 92% 100%, 0 94%")}>
                {business.heroImage ? (
                  <Image src={business.heroImage} alt={business.name} fill priority className="object-cover opacity-82" />
                ) : (
                  <div className="absolute inset-0 bg-[linear-gradient(145deg,#0c1f4d_0%,#0c1f4d_32%,#215cff_32%,#215cff_48%,#ff5e4d_48%,#ff5e4d_64%,#d7ff48_64%,#d7ff48_80%,#fbf5ea_80%,#fbf5ea_100%)]" />
                )}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,31,77,0.06),rgba(12,31,77,0.22),rgba(12,31,77,0.64))]" />
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                  <div className="inline-flex bg-[#ff5e4d] px-3 py-1 font-mono-alt text-[11px] uppercase tracking-[0.28em]" style={prismPanel("6% 0, 100% 0, 94% 100%, 0 100%")}>
                    {business.galleryTitle || business.heroLabel || business.templateName || business.name}
                  </div>
                  <p className="mt-4 max-w-sm text-sm leading-7 text-white/84">{business.description}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <AnimatedSection id="about" className="mx-auto max-w-7xl px-5 py-14 md:px-10 md:py-16 lg:px-14" delay={0.05}>
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono-alt text-[11px] uppercase tracking-[0.3em] text-[#215cff]">{aboutLabel}</p>
            <h2 className="mt-4 max-w-3xl font-graphic text-[2.1rem] uppercase leading-[0.92] tracking-[-0.05em] text-[#0c1f4d] sm:text-4xl">
              {aboutHeading}
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-[#0c1f4d]/72">{business.aboutIntro || business.description}</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[0.62fr_0.38fr]">
          <div className="grid gap-4 md:grid-cols-3">
            {aboutCards.map((item, index) => (
              <div
                key={item.title}
                className={`p-6 ${index === 1 ? "bg-[#215cff] text-white" : "bg-white/86 text-[#0c1f4d]"}`}
                style={prismPanel(index === 1 ? "6% 0, 100% 12%, 92% 100%, 0 88%" : "0 0, 94% 0, 100% 100%, 6% 100%")}
              >
                <p className={`font-mono-alt text-[11px] uppercase tracking-[0.3em] ${index === 1 ? "text-white/62" : "text-[#0c1f4d]/54"}`}>
                  {item.title}
                </p>
                <p className="mt-4 text-sm leading-7">{item.copy}</p>
              </div>
            ))}
          </div>
          <div className="bg-[#0c1f4d] p-8 text-white" style={prismPanel("10% 0, 100% 8%, 90% 100%, 0 92%")}>
            <p className="font-mono-alt text-[11px] uppercase tracking-[0.3em] text-white/58">{atlasLabel}</p>
            <p className="mt-5 text-base leading-8 text-white/84">
              {atlasBody}
            </p>
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection id="services" className="mx-auto max-w-7xl px-5 py-14 md:px-10 md:py-16 lg:px-14" delay={0.08}>
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono-alt text-[11px] uppercase tracking-[0.3em] text-[#ff5e4d]">{servicesLabel}</p>
            <h2 className="mt-4 font-graphic text-[2.1rem] uppercase leading-[0.92] tracking-[-0.05em] text-[#0c1f4d] sm:text-4xl">
              {servicesHeading}
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-[#0c1f4d]/72">{business.servicesIntro}</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[0.36fr_0.64fr]">
          <div className="bg-[#d7ff48] p-8 text-[#0c1f4d]" style={prismPanel("14% 0, 100% 8%, 86% 100%, 0 90%")}>
            <p className="font-mono-alt text-[11px] uppercase tracking-[0.3em] text-[#0c1f4d]/58">{totemLabel}</p>
            <p className="mt-5 text-base leading-8">
              {totemBody}
            </p>
          </div>
          <div className="grid gap-4 min-[520px]:grid-cols-3">
            {services.map((service, index) => {
              const Icon = iconMap[service.icon] ?? MessageCircle;
              const palette = [
                "bg-[#0c1f4d] text-white",
                "bg-white text-[#0c1f4d]",
                "bg-[#ff5e4d] text-white",
              ][index % 3];
              const shape = [
                "8% 0, 100% 10%, 92% 100%, 0 88%",
                "0 0, 94% 0, 100% 100%, 8% 100%",
                "12% 0, 100% 0, 88% 100%, 0 92%",
              ][index % 3];

              return (
                <motion.article
                  key={`${service.id}-${service.name}`}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                  className={`${palette} p-6`}
                  style={prismPanel(shape)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono-alt text-[11px] uppercase tracking-[0.3em] opacity-60">
                      Totem 0{index + 1}
                    </span>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 font-graphic text-2xl uppercase leading-none tracking-[-0.04em]">{service.name}</h3>
                  <p className="mt-4 text-sm leading-7 opacity-82">{service.description}</p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection id="proof" className="mx-auto max-w-7xl px-5 py-14 md:px-10 md:py-16 lg:px-14" delay={0.1}>
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono-alt text-[11px] uppercase tracking-[0.3em] text-[#215cff]">{proofLabel}</p>
            <h2 className="mt-4 font-graphic text-[2.1rem] uppercase leading-[0.92] tracking-[-0.05em] text-[#0c1f4d] sm:text-4xl">
              {proofHeading}
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-[#0c1f4d]/72">{business.testimonialsIntro}</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[0.54fr_0.46fr]">
          <div className="grid gap-4 md:grid-cols-2">
            {galleryItems.slice(0, 4).map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                className="relative min-h-[16rem] overflow-hidden"
                style={prismPanel(index % 2 === 0 ? "0 0, 94% 0, 100% 100%, 8% 100%" : "8% 0, 100% 8%, 92% 100%, 0 92%")}
              >
                {item.imageUrl ? (
                  <Image src={item.imageUrl} alt={item.title} fill loading="lazy" className="object-cover transition duration-700 hover:scale-105" />
                ) : (
                  <div className={`absolute inset-0 ${index % 2 === 0 ? "bg-[linear-gradient(145deg,#215cff_0%,#215cff_40%,#fbf5ea_40%,#fbf5ea_56%,#ff5e4d_56%,#ff5e4d_100%)]" : "bg-[linear-gradient(145deg,#0c1f4d_0%,#0c1f4d_34%,#d7ff48_34%,#d7ff48_52%,#fbf5ea_52%,#fbf5ea_100%)]"}`} />
                )}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(12,31,77,0.08)_42%,rgba(12,31,77,0.68)_100%)]" />
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                  <p className="font-graphic text-xl uppercase tracking-[-0.04em]">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-white/80">{item.caption}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            {testimonials.slice(0, 3).map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                className={`${index === 1 ? "bg-[#0c1f4d] text-white" : "bg-white text-[#0c1f4d]"} p-6`}
                style={prismPanel(index === 1 ? "10% 0, 100% 10%, 90% 100%, 0 92%" : "0 0, 96% 0, 100% 100%, 6% 100%")}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className={`font-mono-alt text-[11px] uppercase tracking-[0.3em] ${index === 1 ? "text-white/56" : "text-[#0c1f4d]/54"}`}>
                    {fragmentLabel}
                  </span>
                  <Quote className="h-4 w-4 text-[#ff5e4d]" />
                </div>
                <p className="mt-4 text-base leading-8">{item.quote}</p>
                <p className="mt-5 text-sm font-semibold">{item.name}</p>
                <p className={`text-sm ${index === 1 ? "text-white/64" : "text-[#0c1f4d]/60"}`}>{item.role}</p>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection id="contact" className="mx-auto max-w-7xl px-5 pb-20 pt-14 md:px-10 md:pb-24 md:pt-16 lg:px-14" delay={0.12}>
        <div className="grid gap-4 lg:grid-cols-[0.64fr_0.36fr]">
          <div className="grid gap-4 md:grid-cols-[0.58fr_0.42fr]">
            <div className="bg-[#0c1f4d] p-8 text-white" style={prismPanel("10% 0, 100% 10%, 92% 100%, 0 90%")}>
              <p className="font-mono-alt text-[11px] uppercase tracking-[0.3em] text-white/58">{contactLabel}</p>
              <h2 className="mt-5 font-graphic text-[2.1rem] uppercase leading-[0.92] tracking-[-0.05em] sm:text-4xl">
                {contactHeading}
              </h2>
              <p className="mt-5 text-base leading-8 text-white/82">{business.contactIntro}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
                <a href={business.heroCtaUrl} className="inline-flex w-full items-center justify-center gap-2 bg-[#ff5e4d] px-6 py-3 font-semibold text-white sm:w-auto" style={prismPanel("6% 0, 100% 0, 94% 100%, 0 100%")}>
                  {business.heroCtaLabel}
                  <ArrowUpRight className="h-4 w-4" />
                </a>
                <a href={whatsappHref} target="_blank" rel="noreferrer" className="inline-flex w-full items-center justify-center gap-2 bg-[#215cff] px-6 py-3 font-semibold text-white sm:w-auto" style={prismPanel("0 0, 94% 0, 100% 100%, 6% 100%")}>
                  WhatsApp
                  <MessageCircle className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div className="grid gap-4">
              <DockCell icon={<Phone className="h-5 w-5" />} label="Phone" value={safePhone} href={business.phone ? `tel:${business.phone}` : undefined} color="bg-[#d7ff48] text-[#0c1f4d]" shape="12% 0, 100% 12%, 88% 100%, 0 88%" />
              <DockCell icon={<MessageCircle className="h-5 w-5" />} label="WhatsApp" value={safeWhatsapp} href={business.whatsapp ? whatsappHref : undefined} color="bg-white text-[#0c1f4d]" shape="0 0, 94% 0, 100% 100%, 6% 100%" />
              <DockCell icon={<MapPin className="h-5 w-5" />} label="Address" value={safeAddress} color="bg-[#ff5e4d] text-white" shape="10% 0, 100% 0, 90% 100%, 0 92%" />
            </div>
          </div>

          <div className="bg-[#215cff] p-8 text-white" style={prismPanel("0 0, 92% 0, 100% 100%, 8% 100%")}>
            <p className="font-mono-alt text-[11px] uppercase tracking-[0.3em] text-white/58">{designNoteLabel}</p>
            <p className="mt-5 text-base leading-8 text-white/84">
              {designNoteBody}
            </p>
          </div>
        </div>
      </AnimatedSection>

      <FloatingWhatsApp whatsapp={business.whatsapp} />
    </main>
  );
}

function DockCell({
  icon,
  label,
  value,
  href,
  color,
  shape,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
  color: string;
  shape: string;
}) {
  const content = (
    <div className={`p-5 ${color}`} style={prismPanel(shape)}>
      <div className="flex h-12 w-12 items-center justify-center bg-black/10">{icon}</div>
      <p className="mt-4 font-mono-alt text-[11px] uppercase tracking-[0.3em] opacity-62">{label}</p>
      <p className="mt-3 text-sm font-semibold leading-6 sm:leading-7">{value}</p>
    </div>
  );

  if (!href) return content;
  return <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">{content}</a>;
}
