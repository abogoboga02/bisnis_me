import type { Metadata } from "next";
import { TemplateCatalogBrowser } from "@/components/template-catalog-browser";
import { MarketingNav } from "@/components/marketing-nav";
import { templateCatalog } from "@/lib/marketing-content";
import { getTemplates } from "@/lib/api";

export const metadata: Metadata = {
  title: "Template Website Bisnis",
  description:
    "Lihat semua template website bisnis yang tersedia, filter berdasarkan kategori bisnis, dan temukan desain yang paling cocok untuk UMKM, travel, restoran, jasa, toko online, dan personal brand.",
};

export default async function TemplatesPage() {
  const liveTemplates = await getTemplates();

  return (
    <main className="min-h-screen px-6 py-8 md:px-10 lg:px-16">
      <section className="mx-auto max-w-7xl rounded-[2.5rem] border border-white/10 bg-[linear-gradient(135deg,rgba(7,17,31,0.96),rgba(11,31,52,0.9),rgba(8,18,36,0.98))] px-6 py-8 shadow-[0_30px_120px_rgba(2,8,23,0.45)] md:px-8 lg:px-10">
        <MarketingNav />

        <div className="mt-10 max-w-4xl">
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-200/80">Template website</p>
          <h1 className="mt-3 font-display text-5xl font-bold text-white md:text-6xl">
            Semua template website bisnis dalam satu halaman
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-300">
            Pilih template berdasarkan kategori bisnis agar Anda bisa mulai lebih cepat. Setiap
            template dirancang untuk membantu bisnis tampil profesional, mudah dipahami pengunjung,
            dan siap digunakan untuk promosi online.
          </p>
        </div>

        <div className="mt-8 rounded-[1.75rem] border border-white/10 bg-white/5 px-5 py-4 text-sm leading-7 text-slate-300">
          Template aktif di sistem saat ini: {liveTemplates.length}. Gunakan filter kategori untuk
          melihat template yang paling relevan dengan model bisnis Anda.
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-7xl">
        <div className="glass-panel rounded-[2rem] p-6 md:p-8">
          <TemplateCatalogBrowser templates={templateCatalog} />
        </div>
      </section>
    </main>
  );
}
