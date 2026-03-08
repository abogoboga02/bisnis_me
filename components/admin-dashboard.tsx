import Link from "next/link";
import { ArrowRight, Building2, LayoutTemplate, MessageCircleMore, ShieldCheck } from "lucide-react";
import type { Business, Template } from "@/lib/types";

export function AdminDashboard({
  businesses,
  templates,
}: {
  businesses: Business[];
  templates: Template[];
}) {
  const totalServices = businesses.reduce((total, business) => total + business.services.length, 0);

  return (
    <main className="admin-grid min-h-screen px-6 py-10 md:px-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="glass-panel rounded-[2rem] p-8">
          <p className="text-sm uppercase tracking-[0.28em] text-cyan-200/70">Admin dashboard</p>
          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="font-display text-4xl font-bold text-white md:text-5xl">
                Content control for every business slug
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">
                Manage public landing pages, tweak hero content, and keep service cards current from a
                single workspace.
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/admin/business" className="rounded-full bg-cyan-300 px-5 py-3 font-semibold text-slate-950">
                Manage businesses
              </Link>
              <Link href="/admin/templates" className="rounded-full border border-white/12 bg-white/5 px-5 py-3 font-semibold text-white">
                View templates
              </Link>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          {[
            { label: "Businesses", value: businesses.length, icon: Building2 },
            { label: "Templates", value: templates.length, icon: LayoutTemplate },
            { label: "Services", value: totalServices, icon: ShieldCheck },
            { label: "WhatsApp ready", value: `${businesses.length}/${businesses.length}`, icon: MessageCircleMore },
          ].map((item) => (
            <div key={item.label} className="glass-panel rounded-3xl p-6">
              <item.icon className="h-5 w-5 text-cyan-300" />
              <p className="mt-6 text-3xl font-bold text-white">{item.value}</p>
              <p className="mt-2 text-sm text-slate-400">{item.label}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="glass-panel rounded-[2rem] p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold text-white">Recent business pages</h2>
              <Link href="/admin/business" className="flex items-center gap-2 text-sm text-cyan-200">
                Open manager
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-4">
              {businesses.map((business) => (
                <div key={business.id} className="rounded-3xl border border-white/10 bg-slate-950/35 p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-white">{business.name}</p>
                      <p className="mt-1 text-sm text-slate-400">/{business.slug}</p>
                    </div>
                    <Link
                      href={`/${business.slug}`}
                      className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100"
                    >
                      Preview live page
                    </Link>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{business.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-[2rem] p-6">
            <h2 className="text-xl font-semibold text-white">Template system</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Keep multiple visual presets ready while reusing the same business schema.
            </p>
            <div className="mt-6 space-y-4">
              {templates.map((template) => (
                <div key={template.id} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-white">{template.name}</p>
                      <p className="mt-1 text-sm text-slate-400">{template.description}</p>
                    </div>
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: template.accent ?? "#67e8f9" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
