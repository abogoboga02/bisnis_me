import Link from "next/link";
import { ArrowRight, Palette, WandSparkles } from "lucide-react";
import type { Template } from "@/lib/types";

export function TemplateGallery({ templates }: { templates: Template[] }) {
  return (
    <main className="admin-grid min-h-screen px-6 py-10 md:px-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="glass-panel rounded-[2rem] p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-cyan-200/70">Template catalog</p>
              <h1 className="mt-3 font-display text-4xl font-bold text-white">Reusable visual systems</h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">
                Templates let you keep a consistent structure while swapping tone, gradients, and accents per business.
              </p>
            </div>
            <Link href="/admin/business" className="flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-5 py-3 font-semibold text-white">
              Assign templates
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          {templates.map((template) => (
            <article key={template.id} className="glass-panel rounded-[2rem] p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="rounded-3xl bg-white/5 p-4">
                  <Palette className="h-6 w-6 text-cyan-200" />
                </div>
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: template.accent ?? "#67e8f9" }}
                />
              </div>
              <h2 className="mt-6 text-2xl font-semibold text-white">{template.name}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">{template.description}</p>
              <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/35 p-5">
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <WandSparkles className="h-4 w-4 text-cyan-200" />
                  Glass hero, animated services, responsive CTA blocks
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
