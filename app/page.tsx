import Link from "next/link";
import { ArrowRight, LayoutTemplate, ShieldCheck, Sparkles } from "lucide-react";
import { getBusinesses, getTemplates } from "@/lib/api";

export default async function HomePage() {
  const [businesses, templates] = await Promise.all([getBusinesses(), getTemplates()]);

  return (
    <main className="min-h-screen px-6 py-10 md:px-10 lg:px-16">
      <section className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-cyan-100">
            <Sparkles className="h-4 w-4" />
            Multi business landing page builder
          </div>
          <div className="space-y-5">
            <h1 className="max-w-3xl font-display text-5xl font-bold tracking-tight text-white md:text-7xl">
              Build branded landing pages for every business slug.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-300">
              Generate a polished landing page for each business, manage hero content and services from
              the admin area, and route enquiries straight into WhatsApp.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/admin/dashboard"
              className="glow-ring rounded-full bg-cyan-300 px-6 py-3 font-semibold text-slate-950 transition hover:-translate-y-0.5"
            >
              Open admin dashboard
            </Link>
            <Link
              href={businesses[0] ? `/${businesses[0].slug}` : "/admin/business"}
              className="rounded-full border border-white/14 bg-white/5 px-6 py-3 font-semibold text-white transition hover:border-cyan-300/40 hover:bg-white/10"
            >
              Preview live business
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: LayoutTemplate,
                title: "Dynamic templates",
                copy: "Hero, services, and contact sections adapt per business slug.",
              },
              {
                icon: ShieldCheck,
                title: "Admin managed",
                copy: "Create, edit, and delete businesses from a single dashboard flow.",
              },
              {
                icon: ArrowRight,
                title: "Lead ready",
                copy: "Direct CTA, floating WhatsApp button, and SEO-ready metadata.",
              },
            ].map((item) => (
              <div key={item.title} className="glass-panel rounded-3xl p-5">
                <item.icon className="h-6 w-6 text-cyan-300" />
                <h2 className="mt-4 text-lg font-semibold text-white">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-[2rem] p-6">
          <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/40 p-5">
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-200/80">Active businesses</p>
            <div className="mt-6 space-y-4">
              {businesses.map((business) => (
                <Link
                  key={business.id}
                  href={`/${business.slug}`}
                  className="block rounded-2xl border border-white/8 bg-white/5 p-4 transition hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-white/8"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-white">{business.name}</h2>
                      <p className="mt-1 text-sm text-slate-300">{business.tagline}</p>
                    </div>
                    <ArrowRight className="mt-1 h-5 w-5 text-cyan-200" />
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-white/8 bg-white/5 p-4">
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-200/80">Templates</p>
              <div className="mt-4 space-y-3">
                {templates.map((template) => (
                  <div key={template.id} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-950/30 px-4 py-3">
                    <div>
                      <p className="font-semibold text-white">{template.name}</p>
                      <p className="text-sm text-slate-400">{template.description}</p>
                    </div>
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: template.accent ?? "#67e8f9" }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
