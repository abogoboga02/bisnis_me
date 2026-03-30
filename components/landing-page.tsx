"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { MapPin, MessageCircle, Phone, Quote } from "lucide-react";
import { AnimatedSection } from "@/components/animated-section";
import { AtelierMosaicPage } from "@/components/atelier-mosaic-page";
import { FloatingWhatsApp } from "@/components/floating-whatsapp";
import { HarborLedgerPage } from "@/components/harbor-ledger-page";
import { NoirGridPage } from "@/components/noir-grid-page";
import { PrismRiotPage } from "@/components/prism-riot-page";
import { SignalFramePage } from "@/components/signal-frame-page";
import { buildWhatsAppHref } from "@/lib/contact-utils";
import { iconMap } from "@/lib/icon-map";
import type { Business } from "@/lib/types";

const templateRenderers = {
  "signal-frame": SignalFramePage,
  "noir-grid": NoirGridPage,
  "prism-riot": PrismRiotPage,
  "harbor-ledger": HarborLedgerPage,
  "atelier-mosaic": AtelierMosaicPage,
} as const;

export function LandingPage({ business }: { business: Business }) {
  const whatsappHref = buildWhatsAppHref(business.whatsapp);
  const TemplateRenderer = business.templateKey ? templateRenderers[business.templateKey as keyof typeof templateRenderers] : null;

  if (TemplateRenderer) {
    return <TemplateRenderer business={business} whatsappHref={whatsappHref} />;
  }

  const templateTheme = {
    overlay: "bg-slate-950/50",
    badge: "border-white/12 bg-white/5 text-cyan-100/90",
    primaryButton: "bg-cyan-300 text-slate-950",
    panelAccent: "text-cyan-100/70",
    cardAccent: "bg-cyan-300/12 text-cyan-200",
    fallbackBackground:
      "bg-[radial-gradient(circle_at_top_left,_rgba(103,232,249,0.38),_transparent_26%),radial-gradient(circle_at_80%_20%,_rgba(192,132,252,0.32),_transparent_22%),linear-gradient(135deg,_#0f172a_0%,_#111827_42%,_#172554_100%)]",
  };

  return (
    <main className="overflow-hidden">
      <section className="relative isolate min-h-screen px-6 pb-14 pt-8 md:px-10">
        <motion.div initial={{ scale: 1.05, opacity: 0.65 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1.2 }} className="absolute inset-0 -z-20">
          {business.heroImage ? (
            <Image src={business.heroImage} alt={business.name} fill priority className="object-cover" unoptimized />
          ) : (
            <div className={`h-full w-full ${templateTheme.fallbackBackground}`} />
          )}
        </motion.div>
        <div className={`absolute inset-0 -z-10 ${templateTheme.overlay}`} />

        <div className="mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-between">
          <header className="flex items-center justify-between gap-4 py-4">
            <Link href="/" className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-100/80">
              bisnis.me
            </Link>
            <Link href="/admin/dashboard" className="rounded-full border border-white/14 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10">
              Admin
            </Link>
          </header>

          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} className="grid gap-10 pb-10 pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div className="space-y-6">
              <span className={`inline-flex items-center rounded-full border px-4 py-2 text-sm ${templateTheme.badge}`}>
                {business.heroLabel || business.templateName || "Business website"}
              </span>
              <div className="space-y-5">
                <h1 className="max-w-4xl font-display text-5xl font-bold tracking-tight text-white md:text-7xl">{business.name}</h1>
                <p className="max-w-2xl text-lg leading-8 text-slate-200">{business.tagline}</p>
              </div>
              <div className="flex flex-wrap gap-4">
                <motion.a href={business.heroCtaUrl} whileHover={{ scale: 1.03, boxShadow: "0 0 28px rgba(103, 232, 249, 0.4)" }} className={`rounded-full px-6 py-3 font-semibold ${templateTheme.primaryButton}`}>
                  {business.heroCtaLabel}
                </motion.a>
                <motion.a href={whatsappHref} target="_blank" rel="noreferrer" whileHover={{ scale: 1.03 }} className="rounded-full border border-white/14 bg-white/5 px-6 py-3 font-semibold text-white">
                  Chat via WhatsApp
                </motion.a>
              </div>
            </div>

            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.85, delay: 0.15 }} className="glass-panel rounded-[2rem] p-7">
              <p className={`text-sm uppercase tracking-[0.3em] ${templateTheme.panelAccent}`}>{business.aboutTitle}</p>
              <p className="mt-5 text-base leading-8 text-slate-100">{business.aboutIntro || business.description}</p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-slate-400">Services</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{business.services.length}</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-slate-400">Testimonials</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{business.testimonials.length}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <AnimatedSection id="about" className="mx-auto max-w-7xl px-6 py-18 md:px-10" delay={0.03}>
        <SectionHeading label="About" title={business.aboutTitle} intro={business.aboutIntro || business.description} />
      </AnimatedSection>

      <AnimatedSection id="services" className="mx-auto max-w-7xl px-6 py-10 md:px-10" delay={0.05}>
        <SectionHeading label="Services" title={business.servicesTitle} intro={business.servicesIntro} />
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {business.services.map((service, index) => {
            const Icon = iconMap[service.icon] ?? iconMap.sparkles;
            return (
              <motion.article key={`${service.id}-${service.name}`} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.55, delay: index * 0.08 }} whileHover={{ y: -10 }} className="glass-panel rounded-[1.75rem] p-6">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${templateTheme.cardAccent}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-white">{service.name}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">{service.description}</p>
              </motion.article>
            );
          })}
        </div>
      </AnimatedSection>

      <AnimatedSection id="testimonials" className="mx-auto max-w-7xl px-6 py-10 md:px-10" delay={0.08}>
        <SectionHeading label="Testimonials" title={business.testimonialsTitle} intro={business.testimonialsIntro} />
        <div className="mt-8 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="glass-panel rounded-[2rem] p-7">
            <Quote className="h-8 w-8 text-cyan-200" />
            <p className="mt-5 text-xl leading-8 text-white">
              {business.testimonials[0]?.quote || business.description}
            </p>
            {business.testimonials[0] ? (
              <p className="mt-4 text-sm text-slate-300">
                {business.testimonials[0].name}
                {business.testimonials[0].role ? `, ${business.testimonials[0].role}` : ""}
              </p>
            ) : null}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {business.testimonials.slice(1).map((item) => (
              <div key={`${item.id}-${item.name}`} className="glass-panel rounded-[2rem] p-6">
                <p className="text-sm leading-7 text-slate-300">{item.quote}</p>
                <p className="mt-4 font-semibold text-white">{item.name}</p>
                <p className="text-sm text-slate-400">{item.role}</p>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection id="gallery" className="mx-auto max-w-7xl px-6 py-10 md:px-10" delay={0.1}>
        <SectionHeading label="Gallery" title={business.galleryTitle} intro={business.galleryIntro} />
        <div className="mt-8 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          {business.galleryItems.map((item, index) => (
            <div key={`${item.id}-${index}`} className={`overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 ${index === 0 ? "lg:row-span-2" : ""}`}>
              {item.imageUrl ? (
                <Image src={item.imageUrl} alt={item.title} width={1200} height={900} unoptimized className="h-full min-h-64 w-full object-cover" />
              ) : (
                <div className="flex min-h-64 items-center justify-center bg-slate-950/30 text-sm text-slate-400">Belum ada gambar galeri.</div>
              )}
              <div className="p-5">
                <p className="text-lg font-semibold text-white">{item.title}</p>
                <p className="mt-2 text-sm leading-7 text-slate-300">{item.caption}</p>
              </div>
            </div>
          ))}
        </div>
      </AnimatedSection>

      <AnimatedSection id="contact" className="mx-auto max-w-7xl px-6 pb-20 pt-10 md:px-10" delay={0.12}>
        <div className="glass-panel rounded-[2rem] p-8">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <SectionHeading label="Contact" title={business.contactTitle} intro={business.contactIntro} compact />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <ContactCard icon={<Phone className="h-5 w-5" />} title="Phone" value={business.phone} href={`tel:${business.phone}`} />
              <ContactCard icon={<MessageCircle className="h-5 w-5" />} title="WhatsApp" value={business.whatsapp} href={whatsappHref} />
              <ContactCard icon={<MapPin className="h-5 w-5" />} title="Address" value={business.address} />
            </div>
          </div>
        </div>
      </AnimatedSection>

      <FloatingWhatsApp whatsapp={business.whatsapp} />
    </main>
  );
}

function SectionHeading({
  label,
  title,
  intro,
  compact = false,
}: {
  label: string;
  title: string;
  intro: string;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "" : "max-w-3xl"}>
      <p className="text-sm uppercase tracking-[0.26em] text-cyan-200/70">{label}</p>
      <h2 className="mt-3 font-display text-4xl font-bold text-white">{title}</h2>
      {intro ? <p className="mt-4 text-base leading-7 text-slate-300">{intro}</p> : null}
    </div>
  );
}

function ContactCard({
  icon,
  title,
  value,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 transition hover:border-cyan-300/25 hover:bg-white/8">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-300/12 text-cyan-200">{icon}</div>
      <p className="mt-4 text-sm text-slate-400">{title}</p>
      <p className="mt-2 text-base font-semibold leading-7 text-white">{value}</p>
    </div>
  );

  if (!href) return content;
  return <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">{content}</a>;
}
