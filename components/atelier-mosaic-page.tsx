"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin, MessageCircle, Phone, Quote } from "lucide-react";
import { AnimatedSection } from "@/components/animated-section";
import { FloatingWhatsApp } from "@/components/floating-whatsapp";
import { iconMap } from "@/lib/icon-map";
import type { Business } from "@/lib/types";

export function AtelierMosaicPage({
  business,
  whatsappHref,
}: {
  business: Business;
  whatsappHref: string;
}) {
  const heroImage = business.heroImage || business.ogImage;
  const galleryItems = business.galleryItems;
  const testimonials = business.testimonials;

  return (
    <main className="overflow-hidden bg-[#f4ead8] text-[#1c302a]">
      <section className="relative isolate overflow-hidden px-6 pb-20 pt-8 md:px-10 lg:px-14">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top_left,rgba(200,111,77,0.18),transparent_28%),radial-gradient(circle_at_78%_12%,rgba(34,85,74,0.22),transparent_26%),linear-gradient(180deg,#f4ead8_0%,#efe2cf_42%,#f8f1e6_100%)]" />
        <div className="absolute -left-10 top-20 -z-10 h-48 w-48 rounded-full bg-[#c86f4d]/10 blur-3xl" />
        <div className="absolute bottom-10 right-0 -z-10 h-64 w-64 rounded-full bg-[#315a4f]/12 blur-3xl" />

        <div className="mx-auto max-w-7xl">
          <header className="flex items-center justify-between gap-4 border-b border-[#1c302a]/10 pb-4">
            <Link href="/" className="text-sm font-semibold uppercase tracking-[0.32em] text-[#315a4f]">
              bisnis.me
            </Link>
            <Link href="/admin/dashboard" className="rounded-full border border-[#1c302a]/10 bg-white/40 px-4 py-2 text-sm font-semibold text-[#1c302a] transition hover:bg-white/70">
              Admin
            </Link>
          </header>

          <div className="grid gap-10 pt-10 lg:grid-cols-[1.618fr_1fr] lg:items-start">
            <div className="space-y-8">
              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="inline-flex items-center gap-3 rounded-full border border-[#1c302a]/10 bg-white/45 px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-[#315a4f]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#c86f4d]" />
                {business.heroLabel || business.templateName || "Atelier Mosaic"}
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.08 }} className="grid gap-6 lg:grid-cols-[1fr_0.52fr]">
                <div className="space-y-5">
                  <h1 className="max-w-5xl font-display text-[clamp(3.6rem,8vw,7.5rem)] font-semibold leading-[0.9] tracking-[-0.04em] text-[#17312a]">{business.name}</h1>
                  <p className="max-w-2xl text-lg leading-8 text-[#31463f] md:text-xl">{business.tagline}</p>
                </div>
                <div className="rounded-[2rem] border border-[#1c302a]/10 bg-white/45 p-5 text-sm leading-7 text-[#365048] shadow-[0_24px_60px_rgba(28,48,42,0.08)]">
                  <p className="text-[11px] uppercase tracking-[0.32em] text-[#8b5a45]">Editorial note</p>
                  <p className="mt-4">
                    Hero, About, Service, Testimoni, Galeri, dan Contact dibangun dari database dengan grid yang mengikuti ritme golden ratio.
                  </p>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75, delay: 0.16 }} className="flex flex-wrap gap-4">
                <motion.a href={business.heroCtaUrl} whileHover={{ y: -2, boxShadow: "0 18px 40px rgba(200,111,77,0.24)" }} className="inline-flex items-center gap-2 rounded-full bg-[#c86f4d] px-6 py-3 font-semibold text-[#fff7ec]">
                  {business.heroCtaLabel}
                  <ArrowUpRight className="h-4 w-4" />
                </motion.a>
                <motion.a href={whatsappHref} target="_blank" rel="noreferrer" whileHover={{ y: -2 }} className="inline-flex items-center gap-2 rounded-full border border-[#1c302a]/10 bg-white/55 px-6 py-3 font-semibold text-[#1c302a]">
                  Chat via WhatsApp
                  <MessageCircle className="h-4 w-4" />
                </motion.a>
              </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, y: 36 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.85, delay: 0.18 }} className="grid gap-4 lg:grid-cols-[0.72fr_1fr] lg:grid-rows-[1.05fr_0.95fr]">
              <div className="rounded-[2.2rem] border border-[#1c302a]/10 bg-[#1f3d35] p-6 text-[#f6ead7] shadow-[0_28px_80px_rgba(28,48,42,0.18)]">
                <p className="text-[11px] uppercase tracking-[0.3em] text-[#e8be9a]">{business.aboutTitle}</p>
                <p className="mt-4 text-base leading-8 text-[#f6ead7]/84">{business.aboutIntro || business.description}</p>
              </div>
              <div className="relative row-span-2 overflow-hidden rounded-[2.6rem] border border-[#1c302a]/10 bg-[#e8dbc6] shadow-[0_36px_100px_rgba(28,48,42,0.16)]">
                {heroImage ? (
                  <Image src={heroImage} alt={business.name} fill priority unoptimized className="object-cover" />
                ) : (
                  <div className="h-full w-full bg-[radial-gradient(circle_at_top_left,rgba(200,111,77,0.28),transparent_32%),radial-gradient(circle_at_75%_18%,rgba(34,85,74,0.24),transparent_28%),linear-gradient(160deg,#d4b08a_0%,#f2e2cb_52%,#d6c0a5_100%)]" />
                )}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(20,32,28,0.08)_42%,rgba(20,32,28,0.42)_100%)]" />
              </div>
              <div className="rounded-[2rem] border border-[#1c302a]/10 bg-white/60 p-5 shadow-[0_22px_60px_rgba(28,48,42,0.08)]">
                <p className="text-[11px] uppercase tracking-[0.28em] text-[#8b5a45]">{business.contactTitle}</p>
                <div className="mt-4 space-y-3 text-sm text-[#29443d]">
                  <p>{business.phone}</p>
                  <p>{business.address}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <EditorialSection id="about" label="About" title={business.aboutTitle} intro={business.aboutIntro || business.description}>
        <div className="grid gap-8 lg:grid-cols-[0.618fr_1fr] lg:items-start">
          <div className="rounded-[2.4rem] bg-[#17312a] p-8 text-[#f6ead7] shadow-[0_28px_90px_rgba(23,49,42,0.24)]">
            <p className="text-[11px] uppercase tracking-[0.34em] text-[#e0b98e]">Story</p>
            <p className="mt-5 text-base leading-8 text-[#f6ead7]/76">{business.description}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-[1fr_1.618fr]">
            <MetricCard label="Ratio" value="1.618" copy="Komposisi kolom, jarak, dan ritme tipografi diatur agar terasa stabil namun tetap hidup." />
            <div className="rounded-[2rem] border border-[#1c302a]/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.68),rgba(245,227,204,0.76))] p-6">
              <p className="text-[11px] uppercase tracking-[0.32em] text-[#8b5a45]">Positioning</p>
              <h3 className="mt-4 text-2xl font-semibold text-[#17312a]">Warna hangat, base terang, dan aksen hijau tua untuk rasa premium yang tenang.</h3>
            </div>
          </div>
        </div>
      </EditorialSection>

      <EditorialSection id="services" label="Services" title={business.servicesTitle} intro={business.servicesIntro}>
        <div className="space-y-5">
          {business.services.map((service, index) => {
            const Icon = iconMap[service.icon] ?? iconMap.sparkles;
            return (
              <motion.article key={`${service.id}-${service.name}`} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.55, delay: index * 0.08 }} className={`grid gap-4 rounded-[2rem] border border-[#1c302a]/10 p-5 shadow-[0_20px_60px_rgba(28,48,42,0.06)] lg:grid-cols-[0.38fr_1fr] ${index % 2 === 0 ? "bg-white/70" : "bg-[#efe2cf]"}`}>
                <div className="flex items-center gap-4 rounded-[1.6rem] bg-[#17312a] px-5 py-5 text-[#f7ecda]">
                  <span className="font-display text-4xl tracking-[-0.06em]">{String(index + 1).padStart(2, "0")}</span>
                  <Icon className="h-6 w-6 text-[#e3b88b]" />
                </div>
                <div className="rounded-[1.6rem] bg-white/58 px-5 py-5">
                  <h3 className="text-2xl font-semibold text-[#17312a]">{service.name}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#4b625c]">{service.description}</p>
                </div>
              </motion.article>
            );
          })}
        </div>
      </EditorialSection>

      <EditorialSection id="testimonials" label="Testimonials" title={business.testimonialsTitle} intro={business.testimonialsIntro}>
        <div className="grid gap-5 lg:grid-cols-[1fr_1.618fr]">
          <div className="rounded-[2.2rem] bg-[#c86f4d] p-8 text-[#fff6eb] shadow-[0_26px_80px_rgba(200,111,77,0.24)]">
            <Quote className="h-10 w-10 text-[#ffe0c7]" />
            <p className="mt-5 font-display text-3xl leading-[1.06]">{testimonials[0]?.quote || business.description}</p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {testimonials.map((testimonial, index) => (
              <motion.article key={`${testimonial.id}-${index}`} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.5, delay: index * 0.08 }} className={`rounded-[2rem] border border-[#1c302a]/10 p-6 ${index === 1 ? "bg-[#17312a] text-[#f5ebd7]" : "bg-white/65 text-[#1c302a]"}`}>
                <p className={`text-sm leading-7 ${index === 1 ? "text-[#f5ebd7]/82" : "text-[#4d655f]"}`}>{testimonial.quote}</p>
                <div className="mt-6">
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className={`text-sm ${index === 1 ? "text-[#e3c29f]/80" : "text-[#6b817b]"}`}>{testimonial.role}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </EditorialSection>

      <EditorialSection id="gallery" label="Gallery" title={business.galleryTitle} intro={business.galleryIntro}>
        <div className="grid gap-5 lg:grid-cols-[1.618fr_1fr]">
          <div className="grid gap-5">
            {galleryItems.slice(0, 2).map((item, index) => <GalleryCard key={`${item.id}-${index}`} item={item} tall={index === 0} />)}
          </div>
          <div className="grid gap-5">
            {galleryItems.slice(2).map((item, index) => <GalleryCard key={`${item.id}-${index + 2}`} item={item} tall={index === 0} />)}
          </div>
        </div>
      </EditorialSection>

      <AnimatedSection id="contact" className="mx-auto max-w-7xl px-6 pb-24 pt-20 md:px-10 lg:px-14" delay={0.12}>
        <div className="grid gap-6 lg:grid-cols-[0.618fr_1fr]">
          <div className="rounded-[2.4rem] border border-[#1c302a]/10 bg-[#17312a] p-8 text-[#f7ecda] shadow-[0_28px_90px_rgba(23,49,42,0.22)]">
            <p className="text-[11px] uppercase tracking-[0.34em] text-[#e0b98e]">{business.contactTitle}</p>
            <h2 className="mt-5 font-display text-4xl font-semibold leading-[1.02]">Penutup yang hangat, jelas, dan siap menerima enquiry.</h2>
            <p className="mt-5 text-sm leading-7 text-[#f7ecda]/82">{business.contactIntro}</p>
            <div className="mt-8 space-y-4 text-sm leading-7 text-[#f7ecda]/82">
              <p>{business.phone}</p>
              <p>{business.whatsapp}</p>
              <p>{business.address}</p>
            </div>
          </div>
          <div className="rounded-[2.4rem] border border-[#1c302a]/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.7),rgba(240,225,203,0.82),rgba(200,111,77,0.18))] p-8 shadow-[0_28px_80px_rgba(28,48,42,0.08)]">
            <div className="grid gap-4 md:grid-cols-2">
              <ContactTile icon={<Phone className="h-5 w-5" />} label="Phone" value={business.phone} href={`tel:${business.phone}`} />
              <ContactTile icon={<MessageCircle className="h-5 w-5" />} label="WhatsApp" value={business.whatsapp} href={whatsappHref} />
              <ContactTile icon={<MapPin className="h-5 w-5" />} label="Address" value={business.address} />
              <MetricCard label="CTA" value={business.heroCtaLabel} copy="Gunakan CTA utama dan kontak langsung agar pengunjung bergerak tanpa kebingungan." compact />
            </div>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href={business.heroCtaUrl} className="inline-flex items-center gap-2 rounded-full bg-[#c86f4d] px-6 py-3 font-semibold text-[#fff7ec]">
                {business.heroCtaLabel}
                <ArrowUpRight className="h-4 w-4" />
              </a>
              <a href={whatsappHref} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-[#1c302a]/10 bg-white/60 px-6 py-3 font-semibold text-[#1c302a]">
                Chat via WhatsApp
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </AnimatedSection>

      <FloatingWhatsApp whatsapp={business.whatsapp} />
    </main>
  );
}

function EditorialSection({
  id,
  label,
  title,
  intro,
  children,
}: {
  id: string;
  label: string;
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <AnimatedSection id={id} className="mx-auto max-w-7xl px-6 py-20 md:px-10 lg:px-14" delay={0.06}>
      <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.34em] text-[#8b5a45]">{label}</p>
          <h2 className="mt-4 font-display text-5xl font-semibold leading-[0.98] text-[#17312a]">{title}</h2>
        </div>
        {intro ? <p className="max-w-xl text-sm leading-7 text-[#506760]">{intro}</p> : null}
      </div>
      {children}
    </AnimatedSection>
  );
}

function MetricCard({
  label,
  value,
  copy,
  compact = false,
}: {
  label: string;
  value: string;
  copy: string;
  compact?: boolean;
}) {
  return (
    <div className="rounded-[2rem] border border-[#1c302a]/10 bg-white/60 p-6">
      <p className="text-[11px] uppercase tracking-[0.32em] text-[#8b5a45]">{label}</p>
      <p className={`mt-4 ${compact ? "text-xl" : "font-display text-6xl tracking-[-0.06em]"} font-semibold text-[#17312a]`}>{value}</p>
      <p className="mt-4 text-sm leading-7 text-[#47605a]">{copy}</p>
    </div>
  );
}

function GalleryCard({
  item,
  tall = false,
}: {
  item: Business["galleryItems"][number];
  tall?: boolean;
}) {
  return (
    <motion.article initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.55 }} className={`group relative overflow-hidden rounded-[2.2rem] border border-[#1c302a]/10 bg-white/55 shadow-[0_20px_70px_rgba(28,48,42,0.08)] ${tall ? "min-h-[23rem]" : "min-h-[18rem]"}`}>
      {item.imageUrl ? (
        <Image src={item.imageUrl} alt={item.title} fill unoptimized className="object-cover transition duration-700 group-hover:scale-105" />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(200,111,77,0.14),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.76),rgba(242,226,203,0.88),rgba(49,90,79,0.16))]" />
      )}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(20,32,28,0.06),rgba(20,32,28,0.58))]" />
      <div className="absolute bottom-0 left-0 right-0 p-6 text-[#fff7ec]">
        <h3 className="text-2xl font-semibold">{item.title}</h3>
        <p className="mt-3 max-w-md text-sm leading-7 text-[#fff7ec]/82">{item.caption}</p>
      </div>
    </motion.article>
  );
}

function ContactTile({
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
    <div className="rounded-[1.6rem] border border-[#1c302a]/10 bg-white/58 p-5">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#17312a] text-[#f7ecda]">{icon}</div>
      <p className="mt-4 text-[11px] uppercase tracking-[0.28em] text-[#8b5a45]">{label}</p>
      <p className="mt-3 text-sm font-semibold leading-7 text-[#203a33]">{value}</p>
    </div>
  );

  if (!href) return content;
  return <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">{content}</a>;
}
