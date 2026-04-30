import { applyTemplateDefaults } from "@/lib/template-form-config";
import { resolveTemplatePreviewImage } from "@/lib/template-preview-image";
import type { Business, Template } from "@/lib/types";

function createServices(template: Template) {
  return [
    {
      id: 1,
      businessId: 0,
      name: "Strategic Layout",
      description: `Direction utama untuk ${template.name.toLowerCase()} dengan headline, ritme visual, dan CTA yang terasa kuat.`,
      icon: "layout-template",
    },
    {
      id: 2,
      businessId: 0,
      name: "Brand Messaging",
      description: `Copy dan struktur section dibuat agar ${template.categoryLabel || template.category} langsung terlihat profesional.`,
      icon: "megaphone",
    },
    {
      id: 3,
      businessId: 0,
      name: "Lead Contact Flow",
      description: "Hubungkan pengunjung ke WhatsApp, telepon, dan CTA utama tanpa membuat halaman terasa berat.",
      icon: "phone-call",
    },
  ];
}

function createTestimonials(template: Template) {
  return [
    {
      id: 1,
      businessId: 0,
      name: "Rania Putri",
      role: "Founder",
      quote: `${template.name} terasa jauh lebih meyakinkan dibanding landing biasa. Struktur visualnya langsung memberi kesan premium.`,
      sortOrder: 0,
    },
    {
      id: 2,
      businessId: 0,
      name: "Dimas Prakoso",
      role: "Marketing Lead",
      quote: "Preview ini menunjukkan bagaimana brand bisa tampil jelas, berbeda, dan lebih mudah mengarahkan pengunjung ke CTA.",
      sortOrder: 1,
    },
    {
      id: 3,
      businessId: 0,
      name: "Salsa Nadhira",
      role: "Business Owner",
      quote: `Template ${template.name} punya karakter yang kuat tapi tetap mudah dibaca di desktop maupun mobile.`,
      sortOrder: 2,
    },
  ];
}

function createGallery(template: Template) {
  const previewImage = resolveTemplatePreviewImage(template.key, template.previewImage);

  return [
    {
      id: 1,
      businessId: 0,
      title: `${template.name} Hero`,
      caption: "Frame visual utama untuk memberi first impression yang tegas sejak awal.",
      imageUrl: previewImage || "",
      sortOrder: 0,
    },
    {
      id: 2,
      businessId: 0,
      title: "Section Rhythm",
      caption: "Contoh ritme antar blok agar halaman terasa hidup, rapi, dan profesional.",
      imageUrl: "",
      sortOrder: 1,
    },
    {
      id: 3,
      businessId: 0,
      title: "Proof Area",
      caption: "Area untuk menunjukkan hasil kerja, testimoni, atau visual pendukung brand.",
      imageUrl: "",
      sortOrder: 2,
    },
    {
      id: 4,
      businessId: 0,
      title: "Contact Finale",
      caption: "Bagian penutup dengan CTA dan jalur kontak yang jelas.",
      imageUrl: "",
      sortOrder: 3,
    },
  ];
}

function getPreviewIdentity(template: Template) {
  const identities: Record<string, { name: string; tagline: string; description: string }> = {
    "atelier-mosaic": {
      name: "Atelier Meridian",
      tagline: "Corporate geometric presence for brands that need a sharper, more executive first impression.",
      description:
        "Atelier Mosaic kini diarahkan ke komposisi corporate yang tegas dengan blok geometris, kontras navy-merah, dan ritme presentasi yang lebih formal.",
    },
    "signal-frame": {
      name: "Signal Works",
      tagline: "Swiss-grid company profile for businesses that want a sharper, more decisive digital presence.",
      description:
        "Signal Frame menekan hirarki yang jelas, headline besar, grid geometris, dan penempatan CTA yang sangat lugas.",
    },
    "noir-grid": {
      name: "Noir Systems",
      tagline: "Dark modular template for operational, tech-forward, and high-control business brands.",
      description:
        "Noir Grid menggabungkan terminal rhythm, modular proof blocks, dan palet gelap beraksen neon agar brand terasa tegas.",
    },
    "prism-riot": {
      name: "Prism Bureau",
      tagline: "Angular campaign page for bold launches, creative studios, and statement-driven brands.",
      description:
        "Prism Riot dibuat untuk brand yang ingin terasa artistik, berani, dan sangat berbeda dari website template standar.",
    },
    "harbor-ledger": {
      name: "Harbor Advisory",
      tagline: "Blueprint-inspired corporate layout for consulting, logistics, and formal service brands.",
      description:
        "Harbor Ledger memberi rasa presisi, kepercayaan, dan struktur bisnis yang matang melalui ritme layout yang lebih tenang.",
    },
  };

  return identities[template.key] ?? {
    name: template.name,
    tagline: template.description,
    description: template.feature || template.description,
  };
}

export function buildTemplatePreviewBusiness(template: Template): Business {
  const identity = getPreviewIdentity(template);
  const previewImage = resolveTemplatePreviewImage(template.key, template.previewImage);

  const business: Business = {
    id: 0,
    slug: `preview-${template.key}`,
    name: identity.name,
    tagline: identity.tagline,
    description: identity.description,
    heroLabel: template.name,
    heroImage: previewImage,
    heroCtaLabel: "Book a Consultation",
    heroCtaUrl: "#contact",
    aboutTitle: "About",
    aboutIntro: template.fit,
    servicesTitle: "Services",
    servicesIntro: template.feature,
    testimonialsTitle: "Testimonials",
    testimonialsIntro:
      "Potongan social proof untuk memperlihatkan cara template ini membawa brand terasa lebih terpercaya.",
    galleryTitle: "Gallery",
    galleryIntro: "Visual preview ini mensimulasikan ritme section yang akan dilihat calon pelanggan.",
    contactTitle: "Contact",
    contactIntro:
      "Gunakan CTA utama, telepon, dan WhatsApp untuk menutup pengalaman dengan jalur tindakan yang jelas.",
    boardmemoLabel: "",
    boardmemoTitle: "",
    boardmemoBody: "",
    phone: "+62 812-0000-1234",
    whatsapp: "6281200001234",
    address: "Jl. Gatot Subroto No. 21, Jakarta",
    metaTitle: `${template.name} Preview`,
    metaDescription: template.description,
    ogImage: previewImage,
    templateId: template.id,
    templateKey: template.key,
    templateName: template.name,
    templateAccent: template.accent,
    createdAt: new Date(0).toISOString(),
    updatedAt: new Date(0).toISOString(),
    services: createServices(template),
    testimonials: createTestimonials(template),
    galleryItems: createGallery(template),
  };

  return applyTemplateDefaults(business, template.key);
}
