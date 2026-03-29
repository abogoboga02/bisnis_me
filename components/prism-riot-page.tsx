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
    { id: 1, businessId: 0, name: "Concept Direction", description: business.description, icon: "sparkles" },
    { id: 2, businessId: 0, name: "Story Motion", description: business.description, icon: "megaphone" },
    { id: 3, businessId: 0, name: "Lead Capture", description: business.description, icon: "phone-call" },
  ];
}

function getFallbackTestimonials(business: Business): Testimonial[] {
  if (business.testimonials.length > 0) {
    return business.testimonials;
  }

  return [
    { id: 1, businessId: 0, name: "Creative Lead", role: "Brand Client", quote: business.tagline, sortOrder: 0 },
    {
      id: 2,
      businessId: 0,
      name: "Studio Partner",
      role: "Marketing Team",
      quote: "Layout ini terasa seperti campaign landing page yang sangat custom dan berkarakter.",
      sortOrder: 1,
    },
    {
      id: 3,
      businessId: 0,
      name: "Founder",
      role: "Business Owner",
      quote: "Bentuk panel, warna, dan ritmenya langsung memberi identitas yang kuat.",
      sortOrder: 2,
    },
  ];
}

function getFallbackGallery(business: Business): GalleryItem[] {
  if (business.galleryItems.length > 0) {
    return business.galleryItems;
  }

  return [
    { id: 1, businessId: 0, title: "Prism Frame", caption: "Panel visual utama dengan karakter eksperimental.", imageUrl: "", sortOrder: 0 },
    { id: 2, businessId: 0, title: "Color Cut", caption: "Lapisan warna dan bentuk menjaga halaman terasa hidup.", imageUrl: "", sortOrder: 1 },
    { id: 3, businessId: 0, title: "Detail Burst", caption: "Tempatkan detail produk, hasil kerja, atau suasana brand.", imageUrl: "", sortOrder: 2 },
    { id: 4, businessId: 0, title: "Scene Dock", caption: "Frame penutup untuk memperkuat CTA di bagian akhir.", imageUrl: "", sortOrder: 3 },
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
  const services = getFallbackServices(business);
  const testimonials = getFallbackTestimonials(business);
  const galleryItems = getFallbackGallery(business);

  return (
    <main className="overflow-hidden bg-[#fbf5ea] font-tech text-[#0c1f4d]">
      <section className="relative isolate px-6 pb-20 pt-8 md:px-10 lg:px-14">
        <div className="absolute inset-0 -z-30 bg-[radial-gradient(circle_at_8%_10%,rgba(252,95,78,0.18),transparent_18%),radial-gradient(circle_at_78%_14%,rgba(32,92,255,0.16),transparent_20%),linear-gradient(180deg,#fbf5ea_0%,#f8efe0_56%,#fff8ef_100%)]" />
        <div className="prism-float absolute left-[5%] top-18 -z-20 h-48 w-48 bg-[#ff5e4d]/22 blur-3xl" style={prismPanel("12% 0, 100% 18%, 84% 100%, 0 78%")} />
        <div className="prism-float absolute right-[10%] top-24 -z-20 h-52 w-52 bg-[#215cff]/18 blur-3xl" style={prismPanel("18% 0, 100% 10%, 78% 100%, 0 88%")} />
        <div className="prism-float absolute bottom-14 left-[38%] -z-20 h-40 w-40 bg-[#d7ff48]/18 blur-3xl" style={prismPanel("22% 0, 100% 16%, 74% 100%, 0 82%")} />

        <div className="mx-auto max-w-7xl">
          <header className="flex items-center justify-between gap-4 pb-5">
            <Link href="/" className="font-mono-alt text-xs uppercase tracking-[0.34em] text-[#0c1f4d]/58">
              bisnis.me
            </Link>
            <Link href="/admin/dashboard" className="rounded-[1.2rem] border border-[#0c1f4d]/10 bg-white/60 px-4 py-2 text-sm font-semibold text-[#0c1f4d] transition hover:bg-white">
              Admin
            </Link>
          </header>

          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55 }}
                className="inline-flex items-center gap-3 bg-[#0c1f4d] px-4 py-2 font-mono-alt text-[11px] uppercase tracking-[0.3em] text-[#fbf5ea]"
                style={prismPanel("4% 0, 100% 0, 96% 100%, 0 100%")}
              >
                <span className="h-2.5 w-2.5 bg-[#d7ff48]" />
                {business.heroLabel || business.templateName || "Prism Riot"}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.08 }}
                className="space-y-6"
              >
                <div className="max-w-4xl space-y-4">
                  <p className="font-mono-alt text-xs uppercase tracking-[0.34em] text-[#0c1f4d]/48">
                    Hyper-art direction for bold brands, creative services, and statement launches.
                  </p>
                  <h1 className="max-w-4xl font-graphic text-[clamp(3.2rem,9vw,8rem)] uppercase leading-[0.88] tracking-[-0.06em] text-[#0c1f4d]">
                    {business.name}
                  </h1>
                  <p className="max-w-2xl text-lg leading-8 text-[#0c1f4d]/76">{business.tagline}</p>
                </div>

                <div className="flex flex-wrap gap-4">
                  <a
                    href={business.heroCtaUrl}
                    className="inline-flex items-center gap-2 bg-[#ff5e4d] px-6 py-3 font-semibold text-white transition hover:-translate-y-1"
                    style={prismPanel("7% 0, 100% 0, 93% 100%, 0 100%")}
                  >
                    {business.heroCtaLabel}
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 border border-[#0c1f4d]/14 bg-[#215cff] px-6 py-3 font-semibold text-white transition hover:-translate-y-1"
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
                <div className="bg-[#0c1f4d] p-5 text-[#fbf5ea]" style={prismPanel("0 0, 100% 10%, 88% 100%, 8% 88%")}>
                  <p className="font-mono-alt text-[11px] uppercase tracking-[0.3em] text-[#fbf5ea]/56">Mode</p>
                  <p className="mt-4 font-graphic text-3xl uppercase leading-none tracking-[-0.04em]">Creative</p>
                </div>
                <div className="bg-[#d7ff48] p-5 text-[#0c1f4d]" style={prismPanel("10% 0, 100% 12%, 94% 100%, 0 92%")}>
                  <p className="font-mono-alt text-[11px] uppercase tracking-[0.3em] text-[#0c1f4d]/58">Services</p>
                  <p className="mt-4 font-graphic text-3xl uppercase leading-none tracking-[-0.04em]">
                    {String(services.length).padStart(2, "0")}
                  </p>
                </div>
              </div>

              <div className="relative min-h-[29rem] overflow-hidden bg-[#0c1f4d]" style={prismPanel("8% 0, 100% 6%, 92% 100%, 0 94%")}>
                {business.heroImage ? (
                  <Image src={business.heroImage} alt={business.name} fill priority unoptimized className="object-cover opacity-82" />
                ) : (
                  <div className="absolute inset-0 bg-[linear-gradient(145deg,#0c1f4d_0%,#0c1f4d_32%,#215cff_32%,#215cff_48%,#ff5e4d_48%,#ff5e4d_64%,#d7ff48_64%,#d7ff48_80%,#fbf5ea_80%,#fbf5ea_100%)]" />
                )}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,31,77,0.06),rgba(12,31,77,0.22),rgba(12,31,77,0.64))]" />
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                  <div className="inline-flex bg-[#ff5e4d] px-3 py-1 font-mono-alt text-[11px] uppercase tracking-[0.28em]" style={prismPanel("6% 0, 100% 0, 94% 100%, 0 100%")}>
                    Scene Zero
                  </div>
                  <p className="mt-4 max-w-sm text-sm leading-7 text-white/84">{business.description}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <AnimatedSection id="about" className="mx-auto max-w-7xl px-6 py-16 md:px-10 lg:px-14" delay={0.05}>
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono-alt text-[11px] uppercase tracking-[0.3em] text-[#215cff]">{business.aboutTitle}</p>
            <h2 className="mt-4 max-w-3xl font-graphic text-4xl uppercase leading-[0.92] tracking-[-0.05em] text-[#0c1f4d]">
              A brand atlas built from angles, contrast, and directional energy.
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-[#0c1f4d]/72">{business.aboutIntro || business.description}</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[0.62fr_0.38fr]">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { title: "Edge", copy: "Bentuk panel dipotong dan digeser agar ritmenya jauh dari layout standar." },
              { title: "Contrast", copy: "Warna cobalt, coral, dan acid dipakai sebagai arsitektur, bukan dekorasi." },
              { title: "Focus", copy: "Meski liar secara bentuk, CTA dan hirarki tetap dibaca dengan cepat." },
            ].map((item, index) => (
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
            <p className="font-mono-alt text-[11px] uppercase tracking-[0.3em] text-white/58">Atlas Note</p>
            <p className="mt-5 text-base leading-8 text-white/84">
              Template ini sengaja dibuat sangat berbeda: box tidak simetris, ritme section tidak seragam, dan tipografinya terasa seperti poster campaign high-end.
            </p>
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection id="services" className="mx-auto max-w-7xl px-6 py-16 md:px-10 lg:px-14" delay={0.08}>
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono-alt text-[11px] uppercase tracking-[0.3em] text-[#ff5e4d]">{business.servicesTitle}</p>
            <h2 className="mt-4 font-graphic text-4xl uppercase leading-[0.92] tracking-[-0.05em] text-[#0c1f4d]">
              Services become totems, not ordinary cards.
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-[#0c1f4d]/72">{business.servicesIntro}</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[0.36fr_0.64fr]">
          <div className="bg-[#d7ff48] p-8 text-[#0c1f4d]" style={prismPanel("14% 0, 100% 8%, 86% 100%, 0 90%")}>
            <p className="font-mono-alt text-[11px] uppercase tracking-[0.3em] text-[#0c1f4d]/58">Totem Note</p>
            <p className="mt-5 text-base leading-8">
              Panel layanan disusun dengan tinggi, warna, dan potongan sudut yang berbeda agar setiap layanan punya identitas visual sendiri.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
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

      <AnimatedSection id="proof" className="mx-auto max-w-7xl px-6 py-16 md:px-10 lg:px-14" delay={0.1}>
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono-alt text-[11px] uppercase tracking-[0.3em] text-[#215cff]">{business.testimonialsTitle}</p>
            <h2 className="mt-4 font-graphic text-4xl uppercase leading-[0.92] tracking-[-0.05em] text-[#0c1f4d]">
              Proof is arranged like a moving collage.
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
                  <Image src={item.imageUrl} alt={item.title} fill unoptimized className="object-cover transition duration-700 hover:scale-105" />
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
                    Fragment
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

      <AnimatedSection id="contact" className="mx-auto max-w-7xl px-6 pb-24 pt-16 md:px-10 lg:px-14" delay={0.12}>
        <div className="grid gap-4 lg:grid-cols-[0.64fr_0.36fr]">
          <div className="grid gap-4 md:grid-cols-[0.58fr_0.42fr]">
            <div className="bg-[#0c1f4d] p-8 text-white" style={prismPanel("10% 0, 100% 10%, 92% 100%, 0 90%")}>
              <p className="font-mono-alt text-[11px] uppercase tracking-[0.3em] text-white/58">{business.contactTitle}</p>
              <h2 className="mt-5 font-graphic text-4xl uppercase leading-[0.92] tracking-[-0.05em]">
                Dock the visitor into one clear next move.
              </h2>
              <p className="mt-5 text-base leading-8 text-white/82">{business.contactIntro}</p>
              <div className="mt-8 flex flex-wrap gap-4">
                <a href={business.heroCtaUrl} className="inline-flex items-center gap-2 bg-[#ff5e4d] px-6 py-3 font-semibold text-white" style={prismPanel("6% 0, 100% 0, 94% 100%, 0 100%")}>
                  {business.heroCtaLabel}
                  <ArrowUpRight className="h-4 w-4" />
                </a>
                <a href={whatsappHref} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-[#215cff] px-6 py-3 font-semibold text-white" style={prismPanel("0 0, 94% 0, 100% 100%, 6% 100%")}>
                  Chat WhatsApp
                  <MessageCircle className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div className="grid gap-4">
              <DockCell icon={<Phone className="h-5 w-5" />} label="Phone" value={business.phone} href={`tel:${business.phone}`} color="bg-[#d7ff48] text-[#0c1f4d]" shape="12% 0, 100% 12%, 88% 100%, 0 88%" />
              <DockCell icon={<MessageCircle className="h-5 w-5" />} label="WhatsApp" value={business.whatsapp} href={whatsappHref} color="bg-white text-[#0c1f4d]" shape="0 0, 94% 0, 100% 100%, 6% 100%" />
              <DockCell icon={<MapPin className="h-5 w-5" />} label="Address" value={business.address} color="bg-[#ff5e4d] text-white" shape="10% 0, 100% 0, 90% 100%, 0 92%" />
            </div>
          </div>

          <div className="bg-[#215cff] p-8 text-white" style={prismPanel("0 0, 92% 0, 100% 100%, 8% 100%")}>
            <p className="font-mono-alt text-[11px] uppercase tracking-[0.3em] text-white/58">Design Note</p>
            <p className="mt-5 text-base leading-8 text-white/84">
              Template 3 sengaja dibuat ekstrem berbeda dari template lain: bukan rounded card biasa, bukan grid simetris standar, dan bukan palet lembut. Ini adalah opsi untuk brand yang memang ingin tampil memorabel.
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
      <p className="mt-3 text-sm font-semibold leading-7">{value}</p>
    </div>
  );

  if (!href) return content;
  return <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">{content}</a>;
}
