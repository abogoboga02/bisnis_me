import type { Business, Template } from "@/lib/types";

export const fallbackTemplates: Template[] = [
  {
    id: 1,
    name: "Aurora SaaS",
    key: "aurora-saas",
    description: "Glassmorphism hero, layered gradients, and animated service cards.",
    accent: "#4f46e5",
  },
  {
    id: 2,
    name: "Solar Studio",
    key: "solar-studio",
    description: "Warm editorial look for food, retail, and hospitality brands.",
    accent: "#f97316",
  },
];

export const fallbackBusinesses: Business[] = [
  {
    id: 1,
    slug: "ptanugrah",
    name: "PT Anugrah Digital Nusantara",
    tagline: "Launch premium business pages without rebuilding your stack every time.",
    description:
      "We design conversion-focused landing pages for growing Indonesian brands, complete with service storytelling and direct WhatsApp leads.",
    heroImage:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=80",
    heroCtaLabel: "Book a Strategy Call",
    heroCtaUrl: "#contact",
    phone: "+62 812-3456-7890",
    whatsapp: "6281234567890",
    address: "Jl. Sudirman No. 88, Jakarta Pusat",
    metaTitle: "PT Anugrah Digital Nusantara",
    metaDescription:
      "Multi-service digital agency landing page with animated hero, services, and WhatsApp contact.",
    ogImage:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=80",
    templateId: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    services: [
      {
        id: 11,
        businessId: 1,
        name: "Landing Page Design",
        description: "SaaS-style, mobile-first landing pages tailored for each business vertical.",
        icon: "layout-template",
      },
      {
        id: 12,
        businessId: 1,
        name: "Lead Funnel Setup",
        description: "CTA flows, WhatsApp routing, and trust-building sections that drive enquiries.",
        icon: "sparkles",
      },
      {
        id: 13,
        businessId: 1,
        name: "Content Refresh",
        description: "Hero copy, service narratives, and SEO metadata for every slug page.",
        icon: "pen-square",
      },
    ],
  },
  {
    id: 2,
    slug: "tokobudi",
    name: "Toko Budi Elektronik",
    tagline: "Electronics retail pages that feel fast, modern, and ready for promotions.",
    description:
      "A neighborhood electronics business using a high-converting landing page for catalog highlights, offers, and direct customer contact.",
    heroImage: null,
    heroCtaLabel: "Chat via WhatsApp",
    heroCtaUrl: "#contact",
    phone: "+62 811-9988-7766",
    whatsapp: "6281199887766",
    address: "Jl. Diponegoro No. 15, Surabaya",
    metaTitle: "Toko Budi Elektronik",
    metaDescription:
      "Retail landing page template with gradient hero, service cards, and sticky WhatsApp contact.",
    ogImage:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1600&q=80",
    templateId: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    services: [
      {
        id: 21,
        businessId: 2,
        name: "Produk Unggulan",
        description: "Highlight featured devices, accessories, and bundle deals in flexible cards.",
        icon: "smartphone",
      },
      {
        id: 22,
        businessId: 2,
        name: "Servis Cepat",
        description: "Promote repair, installation, and after-sales support for local customers.",
        icon: "wrench",
      },
      {
        id: 23,
        businessId: 2,
        name: "Promo Mingguan",
        description: "Swap banners and copy quickly to support flash sales and campaign periods.",
        icon: "badge-percent",
      },
    ],
  },
];
