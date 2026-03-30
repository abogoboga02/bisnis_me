import { applyTemplateDefaults, getTemplateFormConfig } from "@/lib/template-form-config";
import { isValidIndonesiaInternationalNumber } from "@/lib/contact-utils";
import type { Business, GalleryItem, Service, Template, Testimonial } from "@/lib/types";

export type ArrayFieldKey = "services" | "testimonials" | "galleryItems";
export type ImageTarget = "heroImage" | "ogImage" | `gallery-${number}`;

export function localId() {
  return Date.now() + Math.floor(Math.random() * 100_000);
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export const emptyService = (): Service => ({ id: localId(), businessId: 0, name: "", description: "", icon: "sparkles" });

export const emptyTestimonial = (sortOrder = 0): Testimonial => ({
  id: localId(),
  businessId: 0,
  name: "",
  role: "",
  quote: "",
  sortOrder,
});

export const emptyGalleryItem = (sortOrder = 0): GalleryItem => ({
  id: localId(),
  businessId: 0,
  title: "",
  caption: "",
  imageUrl: "",
  sortOrder,
});

export const emptyBusiness = (): Business => ({
  id: 0,
  slug: "",
  name: "",
  tagline: "",
  description: "",
  heroLabel: "Business website",
  heroImage: null,
  heroCtaLabel: "Contact Us",
  heroCtaUrl: "#contact",
  aboutTitle: "Tentang bisnis",
  aboutIntro: "",
  servicesTitle: "Layanan utama",
  servicesIntro: "",
  testimonialsTitle: "Testimoni klien",
  testimonialsIntro: "",
  galleryTitle: "Galeri",
  galleryIntro: "",
  contactTitle: "Hubungi kami",
  contactIntro: "",
  boardmemoLabel: "",
  boardmemoTitle: "",
  boardmemoBody: "",
  phone: "",
  whatsapp: "",
  address: "",
  metaTitle: "",
  metaDescription: "",
  ogImage: null,
  templateId: null,
  templateKey: null,
  templateName: null,
  templateAccent: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  services: [emptyService()],
  testimonials: [emptyTestimonial()],
  galleryItems: [emptyGalleryItem()],
});

export function hydrateDraft(draft: Business, template: Template | null) {
  const config = getTemplateFormConfig(template?.key);
  const withTemplate = {
    ...draft,
    templateId: template?.id ?? null,
    templateKey: template?.key ?? null,
    templateName: template?.name ?? null,
    templateAccent: template?.accent ?? null,
  };
  const next = applyTemplateDefaults(withTemplate, template?.key);
  const services =
    next.services.length > 0 ? next.services.map((item) => ({ ...item })) : [emptyService()];
  const testimonials =
    next.testimonials.length > 0 ? next.testimonials.map((item, index) => ({ ...item, sortOrder: index })) : [emptyTestimonial()];
  const galleryItems =
    next.galleryItems.length > 0 ? next.galleryItems.map((item, index) => ({ ...item, sortOrder: index })) : [emptyGalleryItem()];

  return {
    ...next,
    services: config?.serviceSlotCount
      ? Array.from({ length: config.serviceSlotCount }, (_, index) => services[index] ?? emptyService())
      : services,
    testimonials: config?.fixedTestimonialCount
      ? Array.from({ length: config.fixedTestimonialCount }, (_, index) => testimonials[index] ?? emptyTestimonial(index))
      : testimonials,
    galleryItems: config?.fixedGalleryCount
      ? Array.from({ length: config.fixedGalleryCount }, (_, index) => galleryItems[index] ?? emptyGalleryItem(index))
      : galleryItems,
  };
}

export function validateDraft(draft: Business, template: Template | null) {
  const errors: string[] = [];
  const config = getTemplateFormConfig(template?.key);

  if (!draft.templateId) errors.push("Template wajib dipilih lebih dulu.");
  if (!draft.name.trim()) errors.push("Nama bisnis wajib diisi.");
  if (!draft.slug.trim() || !/^[a-z0-9-]+$/.test(draft.slug.trim())) {
    errors.push("Slug wajib diisi dan hanya boleh huruf kecil, angka, atau tanda hubung.");
  }
  if (!draft.tagline.trim()) errors.push("Tagline wajib diisi.");
  if (!draft.description.trim()) errors.push("Deskripsi bisnis wajib diisi.");
  if (!draft.phone.trim()) errors.push("Nomor telepon wajib diisi.");
  if (!draft.whatsapp.trim()) errors.push("Nomor WhatsApp wajib diisi.");
  if (!draft.address.trim()) errors.push("Alamat wajib diisi.");
  if (!draft.heroCtaLabel.trim()) errors.push("Label tombol utama wajib diisi.");
  if (!draft.heroImage) errors.push("Gambar utama wajib di-upload.");
  if (!draft.aboutIntro.trim()) errors.push("Isi section Tentang Bisnis wajib diisi.");
  if (!draft.servicesIntro.trim()) errors.push("Isi section Layanan Utama wajib diisi.");
  if (!draft.testimonialsIntro.trim()) errors.push("Isi section Testimoni wajib diisi.");
  if (!draft.galleryIntro.trim()) errors.push("Isi section Galeri wajib diisi.");
  if (!draft.contactIntro.trim()) errors.push("Isi section Kontak wajib diisi.");
  if (!isValidIndonesiaInternationalNumber(draft.phone)) errors.push("Nomor telepon wajib diawali 62.");
  if (!isValidIndonesiaInternationalNumber(draft.whatsapp)) errors.push("Nomor WhatsApp wajib diawali 62.");
  if (draft.services.length === 0) errors.push("Minimal harus ada satu layanan.");

  const filledServices = draft.services.filter((service) => service.name.trim() || service.description.trim());

  if (config?.serviceSlotCount && draft.services.length !== config.serviceSlotCount) {
    errors.push(`Template ini menyiapkan ${config.serviceSlotCount} slot layanan statis.`);
  }

  if (config?.minFilledServiceCount && filledServices.length < config.minFilledServiceCount) {
    errors.push(`Minimal ${config.minFilledServiceCount} layanan wajib diisi.`);
  }

  if (config?.maxFilledServiceCount && filledServices.length > config.maxFilledServiceCount) {
    errors.push(`Maksimal ${config.maxFilledServiceCount} layanan yang boleh diisi.`);
  }

  draft.services.forEach((service, index) => {
    const touched = service.name.trim() || service.description.trim() || Boolean(config?.serviceSlotCount && index < (config.minFilledServiceCount ?? 0));
    if (!touched) {
      return;
    }

    if (!service.name.trim()) errors.push(`Nama layanan ke-${index + 1} wajib diisi.`);
    if (!service.description.trim()) errors.push(`Deskripsi layanan ke-${index + 1} wajib diisi.`);
  });

  if (config?.fixedTestimonialCount && draft.testimonials.length !== config.fixedTestimonialCount) {
    errors.push(`Template ini wajib punya ${config.fixedTestimonialCount} testimoni.`);
  }

  if (config?.fixedGalleryCount && draft.galleryItems.length !== config.fixedGalleryCount) {
    errors.push(`Template ini wajib punya ${config.fixedGalleryCount} item galeri.`);
  }

  draft.testimonials.forEach((item, index) => {
    const touched = item.name.trim() || item.role.trim() || item.quote.trim() || Boolean(config?.fixedTestimonialCount);
    if (touched && (!item.name.trim() || !item.role.trim() || !item.quote.trim())) {
      errors.push(`Testimoni ke-${index + 1} wajib punya nama, jabatan, dan kutipan.`);
    }
  });

  draft.galleryItems.forEach((item, index) => {
    const touched = item.title.trim() || item.caption.trim() || item.imageUrl.trim() || Boolean(config?.fixedGalleryCount);
    if (touched && (!item.title.trim() || !item.caption.trim() || !item.imageUrl.trim())) {
      errors.push(`Galeri ke-${index + 1} wajib punya judul, keterangan, dan gambar.`);
    }
  });

  return errors;
}
