import type { Business } from "@/lib/types";

export type TemplateFormConfig = {
  key: string;
  specialAdminForm: boolean;
  fixedGalleryCount?: number;
  fixedTestimonialCount?: number;
  defaults: Partial<Business>;
};

export const templateFormConfig: Record<string, TemplateFormConfig> = {
  "signal-frame": {
    key: "signal-frame",
    specialAdminForm: false,
    defaults: {
      heroLabel: "Signal Frame",
      aboutTitle: "Brand Snapshot",
      aboutIntro: "Tampilkan positioning, angka utama, dan ringkasan bisnis dalam komposisi poster yang tegas.",
      servicesTitle: "Capability Matrix",
      servicesIntro: "Layanan ditata seperti modul Swiss-grid agar cepat dipindai dan terasa profesional.",
      testimonialsTitle: "Client Proof",
      testimonialsIntro: "Gabungkan testimoni dan bukti visual agar kredibilitas terasa langsung.",
      galleryTitle: "Visual Strip",
      galleryIntro: "Pilih frame visual paling kuat untuk mempercepat kesan pertama.",
      contactTitle: "Contact Grid",
      contactIntro: "Tutup halaman dengan CTA yang jelas dan jalur kontak yang mudah diikuti.",
    },
  },
  "noir-grid": {
    key: "noir-grid",
    specialAdminForm: false,
    defaults: {
      heroLabel: "Noir Grid",
      aboutTitle: "Protocol",
      aboutIntro: "Narasi brand dibentuk seperti briefing operasional yang solid, ringkas, dan penuh kontrol.",
      servicesTitle: "System Modules",
      servicesIntro: "Setiap layanan tampil seperti modul aktif dengan label yang mudah dipahami.",
      testimonialsTitle: "Signal Feed",
      testimonialsIntro: "Ulasan pelanggan dan proof visual dipadukan seperti live feed yang meyakinkan.",
      galleryTitle: "Visual Evidence",
      galleryIntro: "Gunakan visual sebagai bukti kerja, hasil, atau suasana brand secara langsung.",
      contactTitle: "Command Link",
      contactIntro: "CTA utama, telepon, dan WhatsApp ditampilkan seperti panel kontrol akhir.",
    },
  },
  "prism-riot": {
    key: "prism-riot",
    specialAdminForm: false,
    defaults: {
      heroLabel: "Prism Riot",
      aboutTitle: "Studio Atlas",
      aboutIntro: "Template ini cocok untuk brand berani yang ingin tampil artistik, eksperimental, dan tetap terstruktur.",
      servicesTitle: "Service Totems",
      servicesIntro: "Layanan ditampilkan sebagai blok visual ekspresif yang tetap mudah dibaca.",
      testimonialsTitle: "Proof Fragments",
      testimonialsIntro: "Potongan testimoni dan proof visual disusun seperti kolase modern yang hidup.",
      galleryTitle: "Scene Fragments",
      galleryIntro: "Setiap visual menjadi bagian dari komposisi besar, bukan hanya daftar gambar biasa.",
      contactTitle: "Dock",
      contactIntro: "Bagian akhir dirancang seperti hub aksi: jelas, tajam, dan mudah mengarahkan pengunjung.",
    },
  },
  "harbor-ledger": {
    key: "harbor-ledger",
    specialAdminForm: false,
    defaults: {
      heroLabel: "Harbor Ledger",
      aboutTitle: "Business Ledger",
      aboutIntro: "Nuansa blueprint dan laporan premium untuk bisnis yang ingin tampil presisi dan matang.",
      servicesTitle: "Blueprint Services",
      servicesIntro: "Layanan tersusun seperti dokumen kerja dengan ritme yang rapi dan profesional.",
      testimonialsTitle: "Partner Notes",
      testimonialsIntro: "Masukkan testimoni pilihan agar brand terlihat terpercaya dan berpengalaman.",
      galleryTitle: "Visual Bay",
      galleryIntro: "Frame visual diletakkan sebagai bagian dari manifest proyek dan pencapaian.",
      contactTitle: "Manifest Contact",
      contactIntro: "Semua kanal kontak ditutup dalam panel yang tenang, formal, dan sangat jelas.",
    },
  },
  "atelier-mosaic": {
    key: "atelier-mosaic",
    specialAdminForm: true,
    fixedGalleryCount: 4,
    fixedTestimonialCount: 3,
    defaults: {
      heroLabel: "Atelier Mosaic",
      aboutTitle: "About",
      aboutIntro: "Cerita brand, value, dan pendekatan kreatif yang membuat bisnis terasa lebih premium.",
      servicesTitle: "Services",
      servicesIntro: "Empat layanan utama yang disusun seperti editorial menu agar mudah dibaca.",
      testimonialsTitle: "Testimonials",
      testimonialsIntro: "Tiga testimoni pilihan untuk membangun rasa percaya dengan ritme yang ringan.",
      galleryTitle: "Gallery",
      galleryIntro: "Empat frame visual yang menjadi pusat komposisi halaman.",
      contactTitle: "Contact",
      contactIntro: "Ajak pengunjung menghubungi bisnis lewat WhatsApp, telepon, atau alamat aktif.",
    },
  },
};

export function getTemplateFormConfig(templateKey: string | null | undefined) {
  if (!templateKey) {
    return null;
  }

  return templateFormConfig[templateKey] ?? null;
}

export function applyTemplateDefaults<T extends Pick<
  Business,
  | "heroLabel"
  | "aboutTitle"
  | "aboutIntro"
  | "servicesTitle"
  | "servicesIntro"
  | "testimonialsTitle"
  | "testimonialsIntro"
  | "galleryTitle"
  | "galleryIntro"
  | "contactTitle"
  | "contactIntro"
>>(value: T, templateKey: string | null | undefined) {
  const config = getTemplateFormConfig(templateKey);
  if (!config) {
    return value;
  }

  return {
    ...value,
    heroLabel: value.heroLabel || config.defaults.heroLabel || "",
    aboutTitle: value.aboutTitle || config.defaults.aboutTitle || "",
    aboutIntro: value.aboutIntro || config.defaults.aboutIntro || "",
    servicesTitle: value.servicesTitle || config.defaults.servicesTitle || "",
    servicesIntro: value.servicesIntro || config.defaults.servicesIntro || "",
    testimonialsTitle: value.testimonialsTitle || config.defaults.testimonialsTitle || "",
    testimonialsIntro: value.testimonialsIntro || config.defaults.testimonialsIntro || "",
    galleryTitle: value.galleryTitle || config.defaults.galleryTitle || "",
    galleryIntro: value.galleryIntro || config.defaults.galleryIntro || "",
    contactTitle: value.contactTitle || config.defaults.contactTitle || "",
    contactIntro: value.contactIntro || config.defaults.contactIntro || "",
  };
}
