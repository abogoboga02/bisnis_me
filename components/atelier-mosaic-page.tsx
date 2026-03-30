"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight, MapPin, MessageCircle, Phone, Quote } from "lucide-react";
import { AnimatedSection } from "@/components/animated-section";
import { FloatingWhatsApp } from "@/components/floating-whatsapp";
import { iconMap } from "@/lib/icon-map";
import type { Business } from "@/lib/types";

const red = "#e11e25";

function geoClip(value: string) {
  return { clipPath: value };
}

function splitAboutNarrative(value: string) {
  return value
    .split(/\n+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function uniqueTextList(values: string[]) {
  const seen = new Set<string>();

  return values.filter((value) => {
    const normalized = value.trim().toLowerCase();
    if (!normalized || seen.has(normalized)) {
      return false;
    }

    seen.add(normalized);
    return true;
  });
}

export function AtelierMosaicPage({
  business,
  whatsappHref,
}: {
  business: Business;
  whatsappHref: string;
}) {
  const heroImage = business.heroImage || business.ogImage;
  const services = business.services.slice(0, 4);
  const testimonials = business.testimonials.slice(0, 4);
  const galleryItems = business.galleryItems.slice(0, 4);
  const boardmemoLabel = business.boardmemoLabel || "Board Memo";
  const boardmemoTitle = business.boardmemoTitle || "Structured direction for a sharper first impression.";
  const boardmemoBody =
    business.boardmemoBody ||
    "Gunakan boardmemo untuk menaruh ringkasan positioning, arahan presentasi, atau catatan formal yang mendukung panel hero tanpa memakan fokus gambar utama.";
  const aboutNarrative = business.aboutIntro || business.description;
  const aboutParagraphs = splitAboutNarrative(aboutNarrative);
  const aboutSupport = aboutParagraphs.slice(1);
  const aboutSupportText = uniqueTextList([...aboutSupport, business.description]).slice(0, 2);

  return (
    <main className="atelier-mosaic-page overflow-hidden bg-[#edf1f7] text-[#15203a]">
      <section className="atelier-hero-shell relative overflow-hidden px-6 pb-20 pt-8 md:px-10 lg:px-14">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top_left,rgba(225,30,37,0.12),transparent_28%),radial-gradient(circle_at_85%_10%,rgba(21,32,58,0.12),transparent_26%),linear-gradient(180deg,#edf1f7_0%,#f7f8fb_55%,#eef2f7_100%)]" />
        <HeroBackdrop />
        <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#15203a_0%,#e11e25_35%,#15203a_100%)]" />

        <div className="mx-auto max-w-7xl">
          <header className="atelier-header flex items-center justify-between gap-4 border-b border-[#15203a]/10 pb-5">
            <Link href="/" className="atelier-header-brand text-sm font-semibold uppercase tracking-[0.34em] text-[#15203a]">
              bisnis.me
            </Link>
            <Link
              href="/admin/dashboard"
              className="atelier-header-admin rounded-full border border-[#15203a]/12 bg-white/80 px-4 py-2 text-sm font-semibold text-[#15203a] transition hover:bg-white"
            >
              Admin
            </Link>
          </header>

          <nav className="atelier-mobile-nav" aria-label="Quick navigation">
            <a href="#about">About</a>
            <a href="#services">Layanan</a>
            <a href="#testimonials">Testimoni</a>
            <a href="#gallery">Galeri</a>
            <a href="#contact">Kontak</a>
          </nav>

          <div className="atelier-hero-grid grid gap-10 pt-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
            <div className="atelier-hero-copy space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="atelier-hero-badge inline-flex items-center gap-3 rounded-full border border-[#15203a]/12 bg-white/85 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#15203a]"
              >
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: red }} />
                {business.heroLabel || business.templateName || "Atelier Mosaic"}
              </motion.div>

              <div className="atelier-hero-copy-grid grid gap-6 lg:grid-cols-[1fr_0.34fr]">
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.08 }}
                  className="atelier-hero-copy-body space-y-6"
                >
                  <h1 className="atelier-hero-title max-w-5xl font-display text-[clamp(3.5rem,8vw,7rem)] font-semibold leading-[0.9] tracking-[-0.05em] text-[#15203a]">
                    {business.name}
                  </h1>
                  <p className="atelier-hero-tagline max-w-2xl text-lg leading-8 text-[#31405f] md:text-xl">{business.tagline}</p>
                  <p className="atelier-hero-description max-w-2xl text-sm leading-7 text-[#4c5975]">{business.description}</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.14 }}
                  className="atelier-hero-aside grid gap-4"
                >
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="atelier-hero-actions flex flex-wrap gap-4"
              >
                <motion.a
                  href={business.heroCtaUrl}
                  whileHover={{ y: -2 }}
                  className="atelier-hero-primary inline-flex items-center gap-2 bg-[#15203a] px-6 py-3 font-semibold text-white"
                  style={geoClip("0 0, 100% 0, 96% 100%, 0 100%")}
                >
                  <span className="text-white">{business.heroCtaLabel || "Hubungi Kami"}</span>
                  <ArrowUpRight className="h-4 w-4 text-white" />
                </motion.a>
                <motion.a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  whileHover={{ y: -2 }}
                  className="atelier-hero-secondary inline-flex items-center gap-2 border border-[#15203a]/12 bg-white px-6 py-3 font-semibold text-[#15203a]"
                  style={geoClip("4% 0, 100% 0, 100% 100%, 0 100%")}
                >
                  Chat via WhatsApp
                  <MessageCircle className="h-4 w-4" />
                </motion.a>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.16 }}
              className="atelier-hero-visual-frame grid gap-4 self-start md:min-h-[26rem] md:grid-cols-[0.74fr_1.26fr] md:grid-rows-[10rem_1fr] lg:min-h-[31rem]"
            >
              <div
                className="atelier-hero-visual relative min-h-[22rem] overflow-hidden border border-[#15203a]/10 bg-[#dfe5ef] shadow-[0_28px_90px_rgba(21,32,58,0.10)] md:col-span-2 md:row-span-2 lg:min-h-[31rem]"
                style={geoClip("0 0, 100% 0, 100% 92%, 94% 100%, 0 100%")}
              >
                {heroImage ? (
                  <Image src={heroImage} alt={business.name} fill priority unoptimized className="object-cover" />
                ) : (
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_22%,rgba(225,30,37,0.18),transparent_24%),linear-gradient(140deg,#15203a_0%,#243250_48%,#eef2f7_48%,#eef2f7_100%)]" />
                )}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(21,32,58,0.02),rgba(21,32,58,0.1)_42%,rgba(21,32,58,0.74)_100%)]" />
                <div
                  className="atelier-boardmemo-box absolute inset-x-5 bottom-5 max-w-[22rem] border border-white/14 bg-[#15203a]/82 p-5 text-white backdrop-blur-sm md:inset-x-auto md:bottom-6 md:left-6 md:max-w-[26rem] md:p-6"
                  style={geoClip("0 0, 100% 0, 94% 100%, 0 100%")}
                >
                  <p className="atelier-boardmemo-label text-[11px] uppercase tracking-[0.32em] text-[#ff6a6f]">{boardmemoLabel}</p>
                  <h2 className="atelier-boardmemo-title mt-3 text-2xl font-semibold leading-tight text-white">{boardmemoTitle}</h2>
                  <p className="atelier-boardmemo-body mt-3 text-sm leading-7 text-white/82">{boardmemoBody}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <CorporateSection id="about" label="About" title={business.aboutTitle} intro="">
        <div className="atelier-about-grid grid gap-6 lg:grid-cols-[1.618fr_1fr] lg:items-stretch">
          <div
            className="atelier-about-primary flex h-full min-h-[31rem] flex-col overflow-hidden border border-[#15203a]/10 bg-[#15203a] text-white shadow-[0_28px_90px_rgba(21,32,58,0.1)]"
            style={geoClip("0 0, 100% 0, 96% 100%, 0 100%")}
          >
            <div className="flex-1 px-8 py-8 md:px-10 md:py-10">
              <p className="text-[11px] uppercase tracking-[0.3em] text-white/46">{business.aboutTitle}</p>
              <h3 className="mt-5 max-w-3xl font-display text-[clamp(2.5rem,4.2vw,4.2rem)] font-semibold leading-[0.93] tracking-[-0.05em]">
                {business.name}
              </h3>
              <div className="mt-8 max-w-3xl space-y-4">
                <p className="text-[15px] leading-8 text-white/78 md:text-base">{business.aboutIntro}</p>
              </div>
            </div>
          </div>

          <div className="atelier-about-side grid h-full min-h-[31rem] gap-4 lg:grid-rows-[1.18fr_0.82fr]">
            <div
              className="atelier-about-secondary flex h-full flex-col justify-between overflow-hidden border border-[#15203a]/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(247,248,251,0.98))] shadow-[0_18px_55px_rgba(21,32,58,0.06)]"
              style={geoClip("0 0, 100% 0, 95% 100%, 0 100%")}
            >
              <div className="px-6 py-6">
                <p className="mt-4 max-w-md font-display text-[clamp(2rem,3vw,2.7rem)] font-semibold leading-[0.98] tracking-[-0.04em] text-[#15203a]">
                  {business.tagline}
                </p>
                {aboutSupportText.map((paragraph, index) => (
                  <p key={`${paragraph}-${index}`} className="mt-10 text-[15px] leading-8 text-black/78 md:text-base">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            <div
              className="atelier-about-metrics flex h-full flex-col overflow-hidden border border-[#15203a]/10 bg-white shadow-[0_18px_55px_rgba(21,32,58,0.06)]"
              style={geoClip("4% 0, 100% 0, 96% 100%, 0 100%")}
            >
              <div className="grid flex-1 divide-y divide-[#15203a]/10">
                <div className="px-6 py-5">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-[#7b89a3]">Business</p>
                  <p className="mt-3 text-lg font-semibold leading-7 text-[#15203a]">{business.name}</p>
                </div>
                <div className="grid gap-px bg-[#15203a]/10 md:grid-cols-2">
                  <div className="bg-white px-6 py-5">
                    <p className="text-[11px] uppercase tracking-[0.28em] text-[#7b89a3]">Services</p>
                    <p className="mt-3 text-sm font-semibold leading-7 text-[#15203a]">{business.services.length} layanan utama</p>
                  </div>
                  <div className="bg-white px-6 py-5">
                    <p className="text-[11px] uppercase tracking-[0.28em] text-[#7b89a3]">Contact</p>
                    <p className="mt-3 text-sm font-semibold leading-7 text-[#15203a]">{business.heroCtaLabel || "Hubungi Kami"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CorporateSection>

      <CorporateSection id="services" label="Services" title={business.servicesTitle} intro={business.servicesIntro}>
        <div className={`atelier-services-grid grid gap-5 ${services.length === 4 ? "lg:grid-cols-2" : "lg:grid-cols-3"}`}>
          {services.map((service, index) => {
            const Icon = iconMap[service.icon] ?? iconMap.sparkles;
            return (
              <motion.article
                key={`${service.id}-${service.name}`}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="atelier-service-card border border-[#15203a]/10 bg-white p-6 shadow-[0_20px_60px_rgba(21,32,58,0.06)]"
                style={geoClip(
                  services.length === 4
                    ? index % 2 === 0
                      ? "0 0, 100% 0, 96% 100%, 0 100%"
                      : "4% 0, 100% 0, 100% 100%, 0 100%"
                    : index === 1
                      ? "4% 0, 100% 0, 96% 100%, 0 100%"
                      : "0 0, 100% 0, 100% 92%, 94% 100%, 0 100%"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="font-display text-5xl font-semibold tracking-[-0.05em] text-[#15203a]/18">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="flex h-12 w-12 items-center justify-center bg-[#15203a] text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <h3 className="mt-8 text-2xl font-semibold text-[#15203a]">{service.name}</h3>
                <p className="mt-4 text-sm leading-7 text-[#485571]">{service.description}</p>
              </motion.article>
            );
          })}
        </div>
      </CorporateSection>

      <CorporateSection id="testimonials" label="Testimonials" title={business.testimonialsTitle} intro={business.testimonialsIntro}>
        <div className="atelier-testimonials-grid grid gap-5 lg:grid-cols-[0.86fr_1.14fr]">
          <div className="atelier-testimonial-feature bg-[#e11e25] p-8 text-white" style={geoClip("0 0, 100% 0, 92% 100%, 0 100%")}>
            <Quote className="h-10 w-10 text-white/82" />
            <p className="mt-6 font-display text-3xl leading-[1.05]">
              {testimonials[0]?.quote || business.description}
            </p>
            {testimonials[0] ? (
              <div className="mt-8 border-t border-white/16 pt-4">
                <p className="font-semibold text-white">{testimonials[0].name}</p>
                <p className="mt-1 text-sm text-white/68">{testimonials[0].role}</p>
              </div>
            ) : null}
          </div>
          <div className="atelier-testimonials-list grid gap-4 md:grid-cols-3">
            {testimonials.slice(1).map((testimonial, index) => (
              <motion.article
                key={`${testimonial.id}-${index}`}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className={`atelier-testimonial-card ${index === 1 ? "bg-[#15203a] text-white" : "bg-white text-[#15203a]"} border border-[#15203a]/10 p-6`}
                style={geoClip(
                  index === 1
                    ? "6% 0, 100% 0, 94% 100%, 0 100%"
                    : index === 2
                      ? "0 0, 100% 0, 100% 92%, 90% 100%, 0 100%"
                      : "0 0, 100% 0, 100% 100%, 6% 100%"
                )}
              >
                <p className={`text-sm leading-7 ${index === 1 ? "text-white/78" : "text-[#51607d]"}`}>{testimonial.quote}</p>
                <div className="mt-6 border-t border-current/10 pt-4">
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className={`text-sm ${index === 1 ? "text-white/62" : "text-[#65748f]"}`}>{testimonial.role}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </CorporateSection>

      <CorporateSection id="gallery" label="Gallery" title={business.galleryTitle} intro={business.galleryIntro}>
        <div className="atelier-gallery-grid grid gap-1 bg-[#15203a]/10 p-1 lg:grid-cols-[1.18fr_0.82fr] lg:grid-rows-[16rem_16rem_12rem]">
          {galleryItems[0] ? (
            <div className="lg:row-span-2">
              <CorporateGalleryCard item={galleryItems[0]} tall />
            </div>
          ) : null}
          {galleryItems[1] ? <CorporateGalleryCard item={galleryItems[1]} /> : null}
          {galleryItems[2] ? <CorporateGalleryCard item={galleryItems[2]} /> : null}
          {galleryItems[3] ? (
            <div className="lg:col-span-2">
              <CorporateGalleryCard item={galleryItems[3]} wide />
            </div>
          ) : null}
        </div>
      </CorporateSection>

      <AnimatedSection id="contact" className="mx-auto max-w-7xl px-6 pb-24 pt-20 md:px-10 lg:px-14" delay={0.12}>
        <div className="atelier-contact-grid grid gap-6 lg:grid-cols-[0.74fr_1.26fr] lg:items-stretch">
          <div className="atelier-contact-primary flex min-h-[21rem] flex-col bg-[#15203a] p-8 text-white" style={geoClip("0 0, 100% 0, 96% 100%, 0 100%")}>
            <p className="text-[11px] uppercase tracking-[0.34em] text-[#ff7c80]">{business.contactTitle}</p>
            <h2 className="mt-5 font-display text-4xl font-semibold leading-[1.02]">
              Hubungi {business.name}
            </h2>
            <p className="mt-5 text-sm leading-7 text-white/78">{business.contactIntro}</p>
          </div>
          <div className="atelier-contact-side grid h-full min-h-[21rem] gap-4 lg:grid-rows-[1fr_auto]">
            <div className="atelier-contact-cards grid auto-rows-fr gap-4 md:grid-cols-3">
              <ContactCell icon={<Phone className="h-5 w-5" />} label="Phone" value={business.phone} href={`tel:${business.phone}`} />
              <ContactCell icon={<MessageCircle className="h-5 w-5" />} label="WhatsApp" value={business.whatsapp} href={whatsappHref} />
              <ContactCell icon={<MapPin className="h-5 w-5" />} label="Address" value={business.address} />
            </div>
            <div className="atelier-contact-actions grid gap-4 bg-white p-6 shadow-[0_18px_60px_rgba(21,32,58,0.05)] md:grid-cols-2" style={geoClip("4% 0, 100% 0, 96% 100%, 0 100%")}>
              <a href={business.heroCtaUrl} className="atelier-contact-action inline-flex h-12 items-center justify-center gap-2 bg-[#e11e25] px-6 py-3 font-semibold text-white">
                <span className="text-white">{business.heroCtaLabel || "Hubungi Kami"}</span>
                <ArrowUpRight className="h-4 w-4 text-white" />
              </a>
              <a href={whatsappHref} target="_blank" rel="noreferrer" className="atelier-contact-action inline-flex h-12 items-center justify-center gap-2 border border-[#15203a]/10 bg-[#15203a] px-6 py-3 font-semibold text-white">
                <span className="text-white">Chat via WhatsApp</span>
                <MessageCircle className="h-4 w-4 text-white" />
              </a>
            </div>
          </div>
        </div>
      </AnimatedSection>

      <FloatingWhatsApp whatsapp={business.whatsapp} />
    </main>
  );
}

function HeroBackdrop() {
  return (
    <>
      <div className="absolute inset-0 -z-10 opacity-70 [background-image:linear-gradient(rgba(21,32,58,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(21,32,58,0.06)_1px,transparent_1px)] [background-position:center] [background-size:72px_72px]" />
      <div className="absolute -left-24 top-20 -z-10 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(225,30,37,0.18)_0%,rgba(225,30,37,0.02)_56%,transparent_72%)] blur-2xl" />
      <div className="absolute right-[-6rem] top-[-2rem] -z-10 h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,rgba(21,32,58,0.18)_0%,rgba(21,32,58,0.03)_54%,transparent_74%)] blur-3xl" />
      <div className="absolute bottom-12 left-[12%] -z-10 h-24 w-64 rotate-[-8deg] border border-[#15203a]/10 bg-white/35 backdrop-blur-[1px]" />
      <div className="absolute bottom-20 right-[10%] -z-10 h-16 w-44 rotate-[10deg] border border-[#e11e25]/16 bg-white/45 backdrop-blur-[1px]" />
      <svg
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full opacity-70"
        viewBox="0 0 1440 720"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="atelier-board-line" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(21,32,58,0.08)" />
            <stop offset="50%" stopColor="rgba(225,30,37,0.18)" />
            <stop offset="100%" stopColor="rgba(21,32,58,0.08)" />
          </linearGradient>
        </defs>
        <path d="M128 132L404 132L552 280L868 280" fill="none" stroke="url(#atelier-board-line)" strokeWidth="2" />
        <path d="M980 96L1218 96L1312 198L1312 340" fill="none" stroke="rgba(21,32,58,0.14)" strokeWidth="2" />
        <path d="M120 592L348 592L420 520L716 520" fill="none" stroke="rgba(21,32,58,0.12)" strokeWidth="2" />
        <circle cx="404" cy="132" r="7" fill="rgba(225,30,37,0.34)" />
        <circle cx="868" cy="280" r="7" fill="rgba(21,32,58,0.22)" />
        <circle cx="1218" cy="96" r="7" fill="rgba(225,30,37,0.3)" />
        <circle cx="348" cy="592" r="7" fill="rgba(21,32,58,0.22)" />
      </svg>
    </>
  );
}

function CorporateSection({
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
  children: ReactNode;
}) {
  return (
    <AnimatedSection id={id} className="atelier-section-shell mx-auto max-w-7xl px-6 py-20 md:px-10 lg:px-14" delay={0.06}>
      <div className="atelier-section-head mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="atelier-section-label text-[11px] uppercase tracking-[0.34em] text-[#6e7c98]">{label}</p>
          <h2 className="atelier-section-title mt-4 font-display text-5xl font-semibold leading-[0.98] text-[#15203a]">{title}</h2>
        </div>
        {intro ? <p className="atelier-section-intro max-w-xl text-sm leading-7 text-[#55627f]">{intro}</p> : null}
      </div>
      {children}
    </AnimatedSection>
  );
}

function CorporateGalleryCard({
  item,
  tall = false,
  wide = false,
}: {
  item: Business["galleryItems"][number];
  tall?: boolean;
  wide?: boolean;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5 }}
      className={`atelier-gallery-card group relative overflow-hidden bg-white ${wide ? "min-h-[12rem]" : tall ? "min-h-[32rem]" : "min-h-[16rem]"}`}
      style={geoClip("0 0, 100% 0, 100% 100%, 0 100%")}
    >
      {item.imageUrl ? (
        <Image src={item.imageUrl} alt={item.title} fill unoptimized className="object-fill transition duration-700 group-hover:scale-[1.02]" />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(225,30,37,0.14),transparent_28%),linear-gradient(135deg,#15203a_0%,#344361_52%,#eef2f7_52%,#eef2f7_100%)]" />
      )}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(21,32,58,0.04),rgba(21,32,58,0.08),rgba(21,32,58,0.72))]" />
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <h3 className="text-2xl font-semibold">{item.title}</h3>
        <p className="mt-3 max-w-md text-sm leading-7 text-white/82">{item.caption}</p>
      </div>
    </motion.article>
  );
}

function ContactCell({
  icon,
  label,
  value,
  href,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="atelier-contact-cell flex h-full min-h-[13.5rem] flex-col border border-[#15203a]/10 bg-white p-5" style={geoClip("0 0, 100% 0, 92% 100%, 0 100%")}>
      <div className="flex h-12 w-12 items-center justify-center bg-[#15203a] text-white">{icon}</div>
      <p className="mt-4 text-[11px] uppercase tracking-[0.28em] text-[#70809b]">{label}</p>
      <p className="mt-3 text-sm font-semibold leading-8 text-[#15203a]">{value}</p>
    </div>
  );

  if (!href) return content;
  return <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="atelier-contact-link block h-full">{content}</a>;
}
