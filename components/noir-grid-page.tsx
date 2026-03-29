"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin, MessageCircle, Phone, Quote, ScanSearch } from "lucide-react";
import { AnimatedSection } from "@/components/animated-section";
import { FloatingWhatsApp } from "@/components/floating-whatsapp";
import { iconMap } from "@/lib/icon-map";
import type { Business, GalleryItem, Service, Testimonial } from "@/lib/types";

function getServices(business: Business): Service[] {
  if (business.services.length > 0) {
    return business.services;
  }

  return [
    { id: 1, businessId: 0, name: "Signal Design", description: business.description, icon: "layout-template" },
    { id: 2, businessId: 0, name: "Response Flow", description: business.description, icon: "phone-call" },
    { id: 3, businessId: 0, name: "Proof Layer", description: business.description, icon: "shield" },
  ];
}

function getTestimonials(business: Business): Testimonial[] {
  if (business.testimonials.length > 0) {
    return business.testimonials;
  }

  return [
    { id: 1, businessId: 0, name: "Lead Operator", role: "Commercial Team", quote: business.tagline, sortOrder: 0 },
    {
      id: 2,
      businessId: 0,
      name: "Brand Desk",
      role: "Operations",
      quote: "Layout terasa seperti command center, sangat cocok untuk brand yang ingin tampil tegas.",
      sortOrder: 1,
    },
  ];
}

function getGallery(business: Business): GalleryItem[] {
  if (business.galleryItems.length > 0) {
    return business.galleryItems;
  }

  return [
    { id: 1, businessId: 0, title: "Visual Node", caption: "Tambahkan frame hasil kerja atau dokumentasi brand.", imageUrl: "", sortOrder: 0 },
    { id: 2, businessId: 0, title: "Proof Layer", caption: "Blok visual ini menjaga halaman tetap terasa dinamis.", imageUrl: "", sortOrder: 1 },
    { id: 3, businessId: 0, title: "Output", caption: "Masukkan visual terkuat untuk mempertegas positioning.", imageUrl: "", sortOrder: 2 },
  ];
}

export function NoirGridPage({
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
    <main className="overflow-hidden bg-[#050505] font-tech text-[#f4f4f1]">
      <section className="relative isolate px-6 pb-18 pt-8 md:px-10 lg:px-14">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_16%_10%,rgba(207,255,54,0.14),transparent_20%),radial-gradient(circle_at_84%_18%,rgba(255,255,255,0.06),transparent_18%),linear-gradient(180deg,#050505_0%,#090909_56%,#101010_100%)]" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:36px_36px]" />

        <div className="mx-auto max-w-7xl">
          <header className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
            <Link href="/" className="font-mono-alt text-xs uppercase tracking-[0.34em] text-white/62">
              bisnis.me
            </Link>
            <Link href="/admin/dashboard" className="border border-white/12 bg-white/4 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/8">
              Admin
            </Link>
          </header>

          <div className="grid gap-8 pt-10 lg:grid-cols-[1.22fr_0.78fr]">
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55 }}
                className="inline-flex items-center gap-3 border border-[#d4ff47]/24 bg-[#d4ff47]/10 px-4 py-2 font-mono-alt text-[11px] uppercase tracking-[0.28em] text-[#d4ff47]"
              >
                <span className="h-2 w-2 rounded-full bg-[#d4ff47]" />
                {business.heroLabel || business.templateName || "Noir Grid"}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.06 }}
                className="space-y-6"
              >
                <p className="font-mono-alt text-xs uppercase tracking-[0.32em] text-white/42">
                  Dark signal system for brands that want authority, precision, and edge.
                </p>
                <h1 className="max-w-4xl font-graphic text-[clamp(3rem,8vw,7rem)] uppercase leading-[0.9] tracking-[-0.05em] text-white">
                  {business.name}
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-white/72">{business.tagline}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.14 }}
                className="flex flex-wrap gap-4"
              >
                <a href={business.heroCtaUrl} className="inline-flex items-center gap-2 bg-[#d4ff47] px-6 py-3 font-semibold text-[#050505] transition hover:-translate-y-1">
                  {business.heroCtaLabel}
                  <ArrowUpRight className="h-4 w-4" />
                </a>
                <a href={whatsappHref} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border border-white/14 bg-white/6 px-6 py-3 font-semibold text-white transition hover:-translate-y-1">
                  Direct WhatsApp
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
              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                {[
                  { label: "SYSTEM", value: "ONLINE" },
                  { label: "MODULES", value: String(services.length).padStart(2, "0") },
                  { label: "PROOF", value: String(testimonials.length).padStart(2, "0") },
                ].map((item) => (
                  <div key={item.label} className="border border-white/10 bg-white/4 p-5">
                    <p className="font-mono-alt text-[11px] uppercase tracking-[0.28em] text-white/44">{item.label}</p>
                    <p className="mt-4 font-graphic text-3xl uppercase tracking-[-0.04em] text-[#d4ff47]">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="relative min-h-[26rem] overflow-hidden border border-white/10 bg-[#0b0b0b]">
                {business.heroImage ? (
                  <Image src={business.heroImage} alt={business.name} fill priority unoptimized className="object-cover opacity-72" />
                ) : (
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,#050505_0%,#050505_34%,#d4ff47_34%,#d4ff47_37%,#050505_37%,#050505_62%,#ffffff_62%,#ffffff_64%,#050505_64%,#050505_100%)]" />
                )}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,5,0.1),rgba(5,5,5,0.34),rgba(5,5,5,0.78))]" />
                <div className="absolute left-0 top-0 border-r border-b border-[#d4ff47]/24 bg-[#d4ff47]/8 px-4 py-3 font-mono-alt text-[11px] uppercase tracking-[0.28em] text-[#d4ff47]">
                  Primary View
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <AnimatedSection id="about" className="mx-auto max-w-7xl px-6 py-16 md:px-10 lg:px-14" delay={0.05}>
        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="border border-[#d4ff47]/20 bg-[#0a0a0a] p-8">
            <p className="font-mono-alt text-[11px] uppercase tracking-[0.3em] text-[#d4ff47]">{business.aboutTitle}</p>
            <h2 className="mt-5 font-graphic text-4xl uppercase leading-[0.92] tracking-[-0.04em] text-white">
              Narrative framed like a live operating protocol.
            </h2>
            <p className="mt-5 text-base leading-8 text-white/72">{business.aboutIntro || business.description}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              "Headline besar menjaga first impression tetap tegas.",
              "Grid ketat dan warna neon dipakai secukupnya agar tidak terasa berisik.",
              "Cocok untuk bisnis yang ingin tampil modern, tajam, dan punya rasa kontrol.",
            ].map((copy, index) => (
              <div key={copy} className="border border-white/10 bg-white/4 p-6">
                <p className="font-mono-alt text-[11px] uppercase tracking-[0.28em] text-white/44">
                  0{index + 1}
                </p>
                <p className="mt-4 text-sm leading-7 text-white/74">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection id="services" className="mx-auto max-w-7xl px-6 py-16 md:px-10 lg:px-14" delay={0.08}>
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono-alt text-[11px] uppercase tracking-[0.3em] text-[#d4ff47]">{business.servicesTitle}</p>
            <h2 className="mt-4 font-graphic text-4xl uppercase leading-[0.94] tracking-[-0.04em] text-white">
              Service modules stacked like active channels.
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-white/64">{business.servicesIntro}</p>
        </div>

        <div className="space-y-4">
          {services.map((service, index) => {
            const Icon = iconMap[service.icon] ?? ScanSearch;
            return (
              <motion.article
                key={`${service.id}-${service.name}`}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className="grid gap-4 border border-white/10 bg-white/4 p-5 lg:grid-cols-[0.2fr_0.8fr]"
              >
                <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-4">
                  <span className="font-mono-alt text-sm uppercase tracking-[0.26em] text-[#d4ff47]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-graphic text-2xl uppercase leading-none tracking-[-0.04em] text-white">{service.name}</h3>
                  <p className="mt-4 text-sm leading-7 text-white/72">{service.description}</p>
                </div>
              </motion.article>
            );
          })}
        </div>
      </AnimatedSection>

      <AnimatedSection id="proof" className="mx-auto max-w-7xl px-6 py-16 md:px-10 lg:px-14" delay={0.1}>
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono-alt text-[11px] uppercase tracking-[0.3em] text-[#d4ff47]">{business.testimonialsTitle}</p>
            <h2 className="mt-4 font-graphic text-4xl uppercase leading-[0.94] tracking-[-0.04em] text-white">
              Proof shown as a mixed signal feed.
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-white/64">{business.testimonialsIntro}</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[0.86fr_1.14fr]">
          <div className="space-y-4">
            {testimonials.slice(0, 3).map((item, index) => (
              <div key={`${item.id}-${index}`} className={`border p-6 ${index === 1 ? "border-[#d4ff47]/22 bg-[#d4ff47]/10 text-[#f4f4f1]" : "border-white/10 bg-white/4 text-white"}`}>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-mono-alt text-[11px] uppercase tracking-[0.28em] text-white/44">Signal</p>
                  <Quote className="h-4 w-4 text-[#d4ff47]" />
                </div>
                <p className="mt-4 text-base leading-8">{item.quote}</p>
                <p className="mt-5 text-sm font-semibold">{item.name}</p>
                <p className="text-sm text-white/58">{item.role}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {galleryItems.slice(0, 4).map((item, index) => (
              <div key={`${item.id}-${index}`} className="relative min-h-[14rem] overflow-hidden border border-white/10 bg-[#0b0b0b]">
                {item.imageUrl ? (
                  <Image src={item.imageUrl} alt={item.title} fill unoptimized className="object-cover opacity-82 transition duration-700 hover:scale-105" />
                ) : (
                  <div className="absolute inset-0 bg-[linear-gradient(140deg,#050505_0%,#050505_44%,#d4ff47_44%,#d4ff47_47%,#050505_47%,#050505_100%)]" />
                )}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(5,5,5,0.08)_42%,rgba(5,5,5,0.74)_100%)]" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="font-graphic text-lg uppercase tracking-[-0.03em] text-white">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-white/68">{item.caption}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection id="contact" className="mx-auto max-w-7xl px-6 pb-24 pt-16 md:px-10 lg:px-14" delay={0.12}>
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div className="border border-[#d4ff47]/20 bg-[#d4ff47]/10 p-8 text-white">
            <p className="font-mono-alt text-[11px] uppercase tracking-[0.3em] text-[#d4ff47]">{business.contactTitle}</p>
            <h2 className="mt-5 font-graphic text-4xl uppercase leading-[0.92] tracking-[-0.04em]">
              Final command block.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-white/74">{business.contactIntro}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href={business.heroCtaUrl} className="inline-flex items-center gap-2 bg-[#d4ff47] px-6 py-3 font-semibold text-[#050505]">
                {business.heroCtaLabel}
                <ArrowUpRight className="h-4 w-4" />
              </a>
              <a href={whatsappHref} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border border-white/14 px-6 py-3 font-semibold text-white">
                Direct WhatsApp
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <TerminalCell icon={<Phone className="h-5 w-5" />} label="PHONE" value={business.phone} href={`tel:${business.phone}`} />
            <TerminalCell icon={<MessageCircle className="h-5 w-5" />} label="WHATSAPP" value={business.whatsapp} href={whatsappHref} />
            <TerminalCell icon={<MapPin className="h-5 w-5" />} label="ADDRESS" value={business.address} />
          </div>
        </div>
      </AnimatedSection>

      <FloatingWhatsApp whatsapp={business.whatsapp} />
    </main>
  );
}

function TerminalCell({
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
    <div className="h-full border border-white/10 bg-white/4 p-5">
      <div className="flex h-12 w-12 items-center justify-center border border-[#d4ff47]/30 bg-[#d4ff47]/10 text-[#d4ff47]">
        {icon}
      </div>
      <p className="mt-4 font-mono-alt text-[11px] uppercase tracking-[0.28em] text-white/42">{label}</p>
      <p className="mt-3 text-sm font-semibold leading-7 text-white">{value}</p>
    </div>
  );

  if (!href) return content;
  return <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">{content}</a>;
}
