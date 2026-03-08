export type Service = {
  id: number;
  businessId: number;
  name: string;
  description: string;
  icon: string;
};

export type Business = {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  heroImage: string | null;
  heroCtaLabel: string;
  heroCtaUrl: string;
  phone: string;
  whatsapp: string;
  address: string;
  metaTitle: string;
  metaDescription: string;
  ogImage: string | null;
  templateId: number | null;
  createdAt: string;
  updatedAt: string;
  services: Service[];
};

export type Template = {
  id: number;
  name: string;
  key: string;
  description: string;
  accent: string | null;
  createdAt?: string;
  updatedAt?: string;
};
