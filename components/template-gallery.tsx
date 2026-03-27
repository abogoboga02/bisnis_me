import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Palette, WandSparkles } from "lucide-react";
import { AdminLogoutButton } from "@/components/admin-logout-button";
import type { AdminIdentity, Template } from "@/lib/types";

export function TemplateGallery({
  currentAdmin,
  templates,
}: {
  currentAdmin: AdminIdentity;
  templates: Template[];
}) {
  return (
    <main className="admin-grid min-h-screen px-6 py-10 md:px-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="glass-panel rounded-[2rem] p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-cyan-200/70">Template catalog</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <h1 className="font-display text-4xl font-bold text-white">Template data from database</h1>
                <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
                  {currentAdmin.role === "owner" ? "Owner" : "Admin"}
                </span>
              </div>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">
                {currentAdmin.role === "owner"
                  ? "Owner melihat semua template aktif di sistem."
                  : "Admin hanya melihat template yang dipakai oleh website dalam scope aksesnya."}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/admin/business" className="flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-5 py-3 font-semibold text-white">
                Assign templates
                <ArrowRight className="h-4 w-4" />
              </Link>
              <AdminLogoutButton className="rounded-full border border-white/12 bg-white/5 px-5 py-3 font-semibold text-white" />
            </div>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          {templates.length === 0 ? (
            <div className="glass-panel rounded-[2rem] p-6 text-sm leading-7 text-slate-300">
              Belum ada template yang muncul untuk akun ini.
            </div>
          ) : (
            templates.map((template) => (
              <article key={template.id} className="glass-panel rounded-[2rem] p-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="rounded-3xl bg-white/5 p-4">
                    <Palette className="h-6 w-6 text-cyan-200" />
                  </div>
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: template.accent ?? "#67e8f9" }} />
                </div>

                <div className="mt-6 overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950/35">
                  {template.previewImage ? (
                    <Image
                      src={template.previewImage}
                      alt={template.name}
                      width={1200}
                      height={720}
                      unoptimized
                      className="aspect-video w-full object-cover"
                    />
                  ) : (
                    <div className="flex aspect-video items-center justify-center bg-[linear-gradient(135deg,rgba(103,232,249,0.14),rgba(255,255,255,0.04),rgba(14,165,233,0.12))] text-sm text-slate-400">
                      Preview image belum diisi
                    </div>
                  )}
                </div>

                <h2 className="mt-6 text-2xl font-semibold text-white">{template.name}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">{template.description}</p>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-5">
                    <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/70">Kategori</p>
                    <p className="mt-3 text-base font-semibold text-white">{template.categoryLabel || template.category}</p>
                    <p className="mt-3 text-sm leading-6 text-slate-300">{template.fit || "Belum ada deskripsi kecocokan bisnis."}</p>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-5">
                    <div className="flex items-center gap-3 text-sm text-slate-300">
                      <WandSparkles className="h-4 w-4 text-cyan-200" />
                      Highlight template
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-300">{template.feature || "Belum ada fitur unggulan yang diisi."}</p>
                  </div>
                </div>
              </article>
            ))
          )}
        </section>
      </div>
    </main>
  );
}
