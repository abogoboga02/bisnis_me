import Link from "next/link";
import { ArrowRight, Building2, ImageIcon, LayoutTemplate, MessageCircleMore, ShieldCheck } from "lucide-react";
import { AdminLogoutButton } from "@/components/admin-logout-button";
import { OwnerUserManager } from "@/components/owner-user-manager";
import type { AdminIdentity, Business, ManagedUser, Template } from "@/lib/types";

export function AdminDashboard({
  currentAdmin,
  businesses,
  templates,
  users,
}: {
  currentAdmin: AdminIdentity;
  businesses: Business[];
  templates: Template[];
  users: ManagedUser[];
}) {
  const totalServices = businesses.reduce((total, business) => total + business.services.length, 0);
  const totalTestimonials = businesses.reduce((total, business) => total + business.testimonials.length, 0);
  const totalGalleryItems = businesses.reduce((total, business) => total + business.galleryItems.length, 0);

  return (
    <main className="admin-grid min-h-screen px-6 py-10 md:px-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="glass-panel rounded-[2rem] p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-cyan-200/70">Admin dashboard</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <h1 className="font-display text-4xl font-bold text-white md:text-5xl">Control panel from database</h1>
                <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
                  {currentAdmin.role === "owner" ? "Owner" : "Admin"}
                </span>
              </div>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">
                {currentAdmin.role === "owner"
                  ? "Owner melihat seluruh bisnis, template, dan statistik konten dari database."
                  : "Admin hanya melihat bisnis dan template yang memang diberikan akses lewat database."}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/admin/business" className="rounded-full bg-cyan-300 px-5 py-3 font-semibold text-slate-950">
                Manage businesses
              </Link>
              <Link href="/admin/templates" className="rounded-full border border-white/12 bg-white/5 px-5 py-3 font-semibold text-white">
                View templates
              </Link>
              <AdminLogoutButton className="rounded-full border border-white/12 bg-white/5 px-5 py-3 font-semibold text-white" />
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-5">
          {[
            { label: "Businesses", value: businesses.length, icon: Building2 },
            { label: "Templates", value: templates.length, icon: LayoutTemplate },
            { label: "Services", value: totalServices, icon: ShieldCheck },
            { label: "Testimonials", value: totalTestimonials, icon: MessageCircleMore },
            { label: "Gallery items", value: totalGalleryItems, icon: ImageIcon },
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
              <div>
                <h2 className="text-xl font-semibold text-white">Business scope</h2>
                <p className="mt-1 text-sm text-slate-400">
                  {currentAdmin.role === "owner"
                    ? "Semua website yang tersimpan di database."
                    : "Hanya website yang diizinkan untuk akun ini."}
                </p>
              </div>
              <Link href="/admin/business" className="flex items-center gap-2 text-sm text-cyan-200">
                Open manager
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {businesses.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-5 text-sm leading-7 text-slate-300">
                Belum ada bisnis yang bisa diakses oleh akun ini.
              </div>
            ) : (
              <div className="space-y-4">
                {businesses.map((business) => (
                  <div key={business.id} className="rounded-3xl border border-white/10 bg-slate-950/35 p-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-lg font-semibold text-white">{business.name}</p>
                        <p className="mt-1 text-sm text-slate-400">/{business.slug}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
                          {business.templateName ?? "No template"}
                        </span>
                        <Link
                          href={`/${business.slug}`}
                          className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100"
                        >
                          Preview live page
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-panel rounded-[2rem] p-6">
            <h2 className="text-xl font-semibold text-white">Template visibility</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Template ditarik langsung dari tabel database dan difilter sesuai scope akun.
            </p>
            <div className="mt-6 space-y-4">
              {templates.length === 0 ? (
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm leading-7 text-slate-300">
                  Belum ada template yang terhubung ke scope akun ini.
                </div>
              ) : (
                templates.map((template) => (
                  <div key={template.id} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-white">{template.name}</p>
                        <p className="mt-1 text-sm text-slate-400">{template.description}</p>
                        <p className="mt-2 text-xs uppercase tracking-[0.18em] text-cyan-200/70">
                          {template.categoryLabel || template.category}
                        </p>
                      </div>
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: template.accent ?? "#67e8f9" }} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {currentAdmin.role === "owner" ? (
          <OwnerUserManager businesses={businesses} initialUsers={users} />
        ) : null}
      </div>
    </main>
  );
}
