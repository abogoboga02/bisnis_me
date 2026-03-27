const seedTemplates = [
  {
    name: "Aurora SaaS",
    key: "aurora-saas",
    description: "Glassmorphism hero, layered gradients, and animated service cards.",
    accent: "#4f46e5",
  },
  {
    name: "Solar Studio",
    key: "solar-studio",
    description: "Warm editorial look for food, retail, and hospitality brands.",
    accent: "#f97316",
  },
  {
    name: "Atelier Mosaic",
    key: "atelier-mosaic",
    description: "Editorial storytelling layout with testimonials, gallery, and golden-ratio rhythm.",
    accent: "#c86f4d",
  },
];

const seedBusinesses = [
  {
    slug: "ptanugrah",
    name: "PT Anugrah Digital Nusantara",
    tagline: "Launch premium business pages without rebuilding your stack every time.",
    description:
      "We design conversion-focused landing pages for growing Indonesian brands, complete with service storytelling and direct WhatsApp leads.",
    heroImage: "/uploads/seed/aurora-digital.svg",
    heroCtaLabel: "Book a Strategy Call",
    heroCtaUrl: "#contact",
    phone: "+62 812-3456-7890",
    whatsapp: "6281234567890",
    address: "Jl. Sudirman No. 88, Jakarta Pusat",
    metaTitle: "PT Anugrah Digital Nusantara",
    metaDescription:
      "Multi-service digital agency landing page with animated hero, services, and WhatsApp contact.",
    ogImage: "/uploads/seed/aurora-digital.svg",
    templateKey: "aurora-saas",
    services: [
      {
        name: "Landing Page Design",
        description: "SaaS-style, mobile-first landing pages tailored for each business vertical.",
        icon: "layout-template",
      },
      {
        name: "Lead Funnel Setup",
        description: "CTA flows, WhatsApp routing, and trust-building sections that drive enquiries.",
        icon: "sparkles",
      },
      {
        name: "Content Refresh",
        description: "Hero copy, service narratives, and SEO metadata for every slug page.",
        icon: "pen-square",
      },
    ],
  },
  {
    slug: "tokobudi",
    name: "Toko Budi Elektronik",
    tagline: "Electronics retail pages that feel fast, modern, and ready for promotions.",
    description:
      "A neighborhood electronics business using a high-converting landing page for catalog highlights, offers, and direct customer contact.",
    heroImage: "/uploads/seed/toko-budi.svg",
    heroCtaLabel: "Chat via WhatsApp",
    heroCtaUrl: "#contact",
    phone: "+62 811-9988-7766",
    whatsapp: "6281199887766",
    address: "Jl. Diponegoro No. 15, Surabaya",
    metaTitle: "Toko Budi Elektronik",
    metaDescription:
      "Retail landing page template with gradient hero, service cards, and sticky WhatsApp contact.",
    ogImage: "/uploads/seed/toko-budi.svg",
    templateKey: "solar-studio",
    services: [
      {
        name: "Produk Unggulan",
        description: "Highlight featured devices, accessories, and bundle deals in flexible cards.",
        icon: "smartphone",
      },
      {
        name: "Servis Cepat",
        description: "Promote repair, installation, and after-sales support for local customers.",
        icon: "wrench",
      },
      {
        name: "Promo Mingguan",
        description: "Swap banners and copy quickly to support flash sales and campaign periods.",
        icon: "badge-percent",
      },
    ],
  },
];

module.exports = {
  seedBusinesses,
  seedTemplates,
};
