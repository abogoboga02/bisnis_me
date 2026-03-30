export type AdminRole = "owner" | "admin";

export type Service = {
  id: number;
  businessId: number;
  name: string;
  description: string;
  icon: string;
};

export type Testimonial = {
  id: number;
  businessId: number;
  name: string;
  role: string;
  quote: string;
  sortOrder: number;
};

export type GalleryItem = {
  id: number;
  businessId: number;
  title: string;
  caption: string;
  imageUrl: string;
  sortOrder: number;
};

export type Business = {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  heroLabel: string;
  heroImage: string | null;
  heroCtaLabel: string;
  heroCtaUrl: string;
  aboutTitle: string;
  aboutIntro: string;
  servicesTitle: string;
  servicesIntro: string;
  testimonialsTitle: string;
  testimonialsIntro: string;
  galleryTitle: string;
  galleryIntro: string;
  contactTitle: string;
  contactIntro: string;
  boardmemoLabel: string;
  boardmemoTitle: string;
  boardmemoBody: string;
  phone: string;
  whatsapp: string;
  address: string;
  metaTitle: string;
  metaDescription: string;
  ogImage: string | null;
  templateId: number | null;
  templateKey?: string | null;
  templateName?: string | null;
  templateAccent?: string | null;
  createdAt: string;
  updatedAt: string;
  services: Service[];
  testimonials: Testimonial[];
  galleryItems: GalleryItem[];
};

export type Template = {
  id: number;
  name: string;
  key: string;
  description: string;
  accent: string | null;
  category: string;
  categoryLabel: string;
  fit: string;
  feature: string;
  previewImage: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminIdentity = {
  id: number;
  email: string;
  name: string;
  role: AdminRole;
};

export type ManagedUser = {
  id: number;
  email: string;
  name: string;
  role: AdminRole;
  businessIds: number[];
  createdAt?: string;
  updatedAt?: string;
};
