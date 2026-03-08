"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { MapPin, MessageCircle, Phone } from "lucide-react";
import { AnimatedSection } from "@/components/animated-section";
import { FloatingWhatsApp } from "@/components/floating-whatsapp";
import { iconMap } from "@/lib/icon-map";
import type { Business } from "@/lib/types";

export function LandingPage({ business }: { business: Business }) {
  const whatsappHref = business.whatsapp ? `https://wa.me/${business.whatsapp.replace(/\D/g, "")}` : "#";

  return (
    <main className="overflow-hidden">
      <section className="relative isolate min-h-screen px-6 pb-14 pt-8 md:px-10">
        <motion.div
          initial={{ scale: 1.05, opacity: 0.65 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0 -z-20"
        >
          {business.heroImage ? (
            <Image
              src={business.heroImage}
              alt={business.name}
              fill
              priority
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="h-full w-full bg-[radial-gradient(circle_at_top_left,_rgba(103,232,249,0.38),_transparent_26%),radial-gradient(circle_at_80%_20%,_rgba(192,132,252,0.32),_transparent_22%),linear-gradient(135deg,_#0f172a_0%,_#111827_42%,_#172554_100%)]" />
          )}
        </motion.div>

        <div className="absolute inset-0 -z-10 bg-slate-950/45" />

        <div className="mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-between">
          <header className="flex items-center justify-between gap-4 py-4">
            <Link href="/" className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-100/80">
              bisnis.me
            </Link>
            <Link
              href="/admin/dashboard"
              className="rounded-full border border-white/14 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Admin
            </Link>
          </header>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="grid gap-10 pb-10 pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-end"
          >
            <div className="space-y-6">
              <span className="inline-flex items-center rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm text-cyan-100/90">
                Modern landing page experience
              </span>
              <div className="space-y-5">
                <h1 className="max-w-4xl font-display text-5xl font-bold tracking-tight text-white md:text-7xl">
                  {business.name}
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-slate-200">{business.tagline}</p>
              </div>
              <div className="flex flex-wrap gap-4">
                <motion.a
                  href={business.heroCtaUrl}
                  whileHover={{ scale: 1.03, boxShadow: "0 0 28px rgba(103, 232, 249, 0.4)" }}
                  className="rounded-full bg-cyan-300 px-6 py-3 font-semibold text-slate-950"
                >
                  {business.heroCtaLabel}
                </motion.a>
                <motion.a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  whileHover={{ scale: 1.03 }}
                  className="rounded-full border border-white/14 bg-white/5 px-6 py-3 font-semibold text-white"
                >
                  Chat via WhatsApp
                </motion.a>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.15 }}
              className="glass-panel rounded-[2rem] p-7"
            >
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-100/70">About the business</p>
              <p className="mt-5 text-base leading-8 text-slate-100">{business.description}</p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-slate-400">Services</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{business.services.length}</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-slate-400">Contact</p>
                  <p className="mt-2 text-2xl font-semibold text-white">WhatsApp Ready</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <AnimatedSection className="mx-auto max-w-7xl px-6 py-18 md:px-10" delay={0.05}>
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.26em] text-cyan-200/70">Services</p>
          <h2 className="mt-3 font-display text-4xl font-bold text-white">Animated cards with clear offers</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {business.services.map((service, index) => {
            const Icon = iconMap[service.icon] ?? iconMap.sparkles;
            return (
              <motion.article
                key={`${service.id}-${service.name}`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.55, delay: index * 0.08 }}
                whileHover={{ y: -10 }}
                className="glass-panel rounded-[1.75rem] p-6"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-300/12 text-cyan-200">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-white">{service.name}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">{service.description}</p>
              </motion.article>
            );
          })}
        </div>
      </AnimatedSection>

      <AnimatedSection id="contact" className="mx-auto max-w-7xl px-6 pb-20 pt-8 md:px-10" delay={0.1}>
        <div className="glass-panel rounded-[2rem] p-8">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-sm uppercase tracking-[0.26em] text-cyan-200/70">Contact</p>
              <h2 className="mt-3 font-display text-4xl font-bold text-white">Ready to take enquiries</h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
                Give visitors a direct route to your business with phone, address, and a persistent
                WhatsApp call to action.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <ContactCard
                icon={<Phone className="h-5 w-5" />}
                title="Phone"
                value={business.phone}
                href={`tel:${business.phone}`}
              />
              <ContactCard
                icon={<MessageCircle className="h-5 w-5" />}
                title="WhatsApp"
                value={business.whatsapp}
                href={whatsappHref}
              />
              <ContactCard
                icon={<MapPin className="h-5 w-5" />}
                title="Address"
                value={business.address}
              />
            </div>
          </div>
        </div>
      </AnimatedSection>

      <FloatingWhatsApp whatsapp={business.whatsapp} />
    </main>
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
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-300/12 text-cyan-200">
        {icon}
      </div>
      <p className="mt-4 text-sm text-slate-400">{title}</p>
      <p className="mt-2 text-base font-semibold leading-7 text-white">{value}</p>
    </div>
  );

  if (!href) {
    return content;
  }

  return (
    <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
      {content}
    </a>
  );
}
