import type { Metadata } from "next";
import { TemplateCatalogBrowser } from "@/components/template-catalog-browser";
import { MarketingNav } from "@/components/marketing-nav";
import { getCachedPublicTemplates } from "@/lib/business-store";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Template Website Bisnis",
  description:
    "Lihat semua template website bisnis yang tersedia, filter berdasarkan kategori bisnis, dan temukan desain yang paling cocok untuk UMKM, travel, restoran, jasa, toko online, dan personal brand.",
};

export default async function TemplatesPage() {
  let liveTemplates = await Promise.resolve([] as Awaited<ReturnType<typeof getCachedPublicTemplates>>);
  let dataError = "";

  try {
    liveTemplates = await getCachedPublicTemplates();
  } catch (error) {
    dataError = error instanceof Error ? error.message : "Gagal memuat template dari database.";
  }

  return (
    <main className="nature-stage min-h-screen overflow-x-hidden px-6 py-8 md:px-10 lg:px-16">
      <section className="glass-panel relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] border border-[#e3ef26]/14 px-6 py-8 md:px-8 lg:px-10">
        <MarketingNav />

        <div className="relative z-10 mt-10 max-w-4xl">
          <p className="marketing-kicker">Template website</p>
          <h1 className="marketing-title mt-4">
            Semua template website bisnis dalam satu halaman
          </h1>
          <p className="marketing-copy mt-5">
            Pilih template berdasarkan kategori bisnis agar Anda bisa mulai lebih cepat. Setiap
            template dirancang untuk membantu bisnis tampil profesional, mudah dipahami pengunjung,
            dan siap digunakan untuk promosi online.
          </p>
        </div>

        <div className="marketing-note relative z-10 mt-8 rounded-[1.75rem] px-5 py-4 text-sm leading-7">
          Template aktif di sistem saat ini: {liveTemplates.length}. Gunakan filter kategori untuk
          melihat template yang paling relevan dengan model bisnis Anda.
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-7xl">
        <div className="glass-panel rounded-[2rem] border border-[#e3ef26]/14 p-6 md:p-8">
          {dataError ? (
            <div className="mb-6 rounded-[1.5rem] border border-amber-200/20 bg-amber-100/10 px-5 py-4 text-sm leading-7 text-amber-100">
              {dataError}
            </div>
          ) : null}
          <TemplateCatalogBrowser templates={liveTemplates} />
        </div>
      </section>
    </main>
  );
}
