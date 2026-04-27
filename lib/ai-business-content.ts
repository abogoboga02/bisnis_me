import { emptyGalleryItem, emptyService, emptyTestimonial, hydrateDraft, slugify } from "@/lib/business-draft";
import { iconOptions } from "@/lib/icon-map";
import type { Business, Template } from "@/lib/types";

export type AiBusinessTemplateContext = Pick<
  Template,
  "id" | "key" | "name" | "description" | "category" | "categoryLabel" | "fit" | "feature"
>;

export type AiBusinessSectionTarget =
  | "aboutIntro"
  | "servicesIntro"
  | "testimonialsIntro"
  | "galleryIntro"
  | "contactIntro"
  | "services";

export type AiBusinessServiceDraft = {
  name: string;
  description: string;
  icon: string;
};

export type AiBusinessContent = {
  businessName: string;
  tagline: string;
  description: string;
  heroLabel: string;
  heroCtaLabel: string;
  heroCtaUrl: string;
  aboutIntro: string;
  servicesIntro: string;
  testimonialsIntro: string;
  galleryIntro: string;
  contactIntro: string;
  boardmemoLabel: string;
  boardmemoTitle: string;
  boardmemoBody: string;
  phone: string;
  whatsapp: string;
  address: string;
  metaTitle: string;
  metaDescription: string;
  heroImagePrompt: string;
  heroImage: string | null;
  services: AiBusinessServiceDraft[];
  testimonials: Array<{
    name: string;
    role: string;
    quote: string;
  }>;
  galleryItems: Array<{
    title: string;
    caption: string;
    imagePrompt: string;
    imageUrl?: string | null;
  }>;
  reviewNotes: string[];
};

export type AiBusinessSectionResult = {
  target: AiBusinessSectionTarget;
  text?: string;
  services?: AiBusinessServiceDraft[];
  reviewNotes: string[];
};

export type GenerateAiBusinessContentPayload =
  | {
      mode: "full";
      brief: string;
      template: AiBusinessTemplateContext;
      currentDraft?: Partial<Business>;
    }
  | {
      mode: "section";
      brief: string;
      target: AiBusinessSectionTarget;
      template: AiBusinessTemplateContext;
      currentDraft: Partial<Business>;
    };

export type AiGenerationMeta = {
  remainingCreditsTenths: number | null;
  unlimited: boolean;
  costTenths: number;
};

export type GenerateAiBusinessContentResponse =
  | {
      mode: "full";
      data: AiBusinessContent;
      meta: AiGenerationMeta;
    }
  | {
      mode: "section";
      data: AiBusinessSectionResult;
      meta: AiGenerationMeta;
    };

export const DEFAULT_ADMIN_AI_CREDITS_TENTHS = 30;
export const FULL_GENERATION_COST_TENTHS = 10;
export const SECTION_GENERATION_COST_TENTHS = 3;

export const AI_SECTION_TARGET_META: Record<
  AiBusinessSectionTarget,
  { label: string; guide: string; placeholder: string }
> = {
  aboutIntro: {
    label: "Tentang bisnis",
    guide: "Tulis arah singkat tentang positioning, cerita brand, atau siapa target pasar Anda.",
    placeholder: "Contoh: tonjolkan bahwa bisnis ini fokus pada pelayanan cepat untuk UMKM kuliner lokal.",
  },
  servicesIntro: {
    label: "Intro layanan",
    guide: "Gunakan bila Anda butuh pembuka singkat sebelum daftar layanan tampil.",
    placeholder: "Contoh: buat intro layanan yang terasa profesional, tegas, dan mudah dipahami calon klien.",
  },
  testimonialsIntro: {
    label: "Intro testimoni",
    guide: "Tulis konteks singkat agar blok testimoni terasa lebih meyakinkan.",
    placeholder: "Contoh: tekankan rasa percaya, hasil kerja, dan pengalaman pelanggan yang konsisten.",
  },
  galleryIntro: {
    label: "Intro galeri",
    guide: "Isi brief singkat tentang jenis visual yang ingin ditonjolkan di galeri.",
    placeholder: "Contoh: fokus pada hasil proyek, suasana toko, dan momen pelayanan pelanggan.",
  },
  contactIntro: {
    label: "Intro kontak",
    guide: "Gunakan untuk CTA penutup yang mendorong pengunjung segera menghubungi bisnis.",
    placeholder: "Contoh: ajak calon pelanggan konsultasi via WhatsApp dengan bahasa ramah tapi profesional.",
  },
  services: {
    label: "Daftar layanan",
    guide: "AI akan mengisi kartu layanan sesuai slot template dengan brief singkat dari Anda.",
    placeholder: "Contoh: kami menawarkan desain interior cafe, pengawasan proyek, dan konsultasi branding ruang.",
  },
};

export const AI_CONTACT_DEFAULTS = {
  phone: "620000000000",
  whatsapp: "620000000000",
  address: "Alamat bisnis belum dilengkapi. Mohon perbarui sebelum website dipublikasikan.",
} as const;

const iconKeys = new Set(iconOptions.map((option) => option.key));

function pickText(value: string | null | undefined, fallback: string) {
  return value?.trim() || fallback;
}

function pickIcon(value: string | undefined, fallback = "sparkles") {
  const normalized = value?.trim().toLowerCase() || "";
  return iconKeys.has(normalized) ? normalized : fallback;
}

function mergeReviewNotes(...groups: Array<Array<string | undefined> | undefined>) {
  return [...new Set(groups.flatMap((group) => (group ?? []).map((note) => note?.trim() || "").filter(Boolean)))];
}

export function formatAiCredits(tenths: number | null) {
  if (tenths === null) {
    return "Unlimited";
  }

  return (tenths / 10).toFixed(1);
}

export function applyAiBusinessContentToDraft(
  draft: Business,
  generated: AiBusinessContent,
  template: Template,
) {
  const hydrated = hydrateDraft(structuredClone(draft), template);
  const name = pickText(generated.businessName, hydrated.name);

  return {
    ...hydrated,
    name,
    slug: hydrated.slug.trim() || slugify(name),
    tagline: pickText(generated.tagline, hydrated.tagline),
    description: pickText(generated.description, hydrated.description),
    heroLabel: pickText(generated.heroLabel, hydrated.heroLabel),
    heroCtaLabel: pickText(generated.heroCtaLabel, hydrated.heroCtaLabel),
    heroCtaUrl: pickText(generated.heroCtaUrl, hydrated.heroCtaUrl || "#contact"),
    aboutIntro: pickText(generated.aboutIntro, hydrated.aboutIntro),
    servicesIntro: pickText(generated.servicesIntro, hydrated.servicesIntro),
    testimonialsIntro: pickText(generated.testimonialsIntro, hydrated.testimonialsIntro),
    galleryIntro: pickText(generated.galleryIntro, hydrated.galleryIntro),
    contactIntro: pickText(generated.contactIntro, hydrated.contactIntro),
    boardmemoLabel: pickText(generated.boardmemoLabel, hydrated.boardmemoLabel),
    boardmemoTitle: pickText(generated.boardmemoTitle, hydrated.boardmemoTitle),
    boardmemoBody: pickText(generated.boardmemoBody, hydrated.boardmemoBody),
    phone: pickText(generated.phone, hydrated.phone),
    whatsapp: pickText(generated.whatsapp, hydrated.whatsapp),
    address: pickText(generated.address, hydrated.address),
    heroImage: generated.heroImage || hydrated.heroImage,
    ogImage: generated.heroImage || hydrated.ogImage || hydrated.heroImage,
    metaTitle: pickText(generated.metaTitle, hydrated.metaTitle || name),
    metaDescription: pickText(generated.metaDescription, hydrated.metaDescription || hydrated.description),
    services: hydrated.services.map((service, index) => {
      const generatedService = generated.services[index] ?? emptyService();
      return {
        ...service,
        name: pickText(generatedService.name, service.name),
        description: pickText(generatedService.description, service.description),
        icon: pickIcon(generatedService.icon, service.icon || "sparkles"),
      };
    }),
    testimonials: hydrated.testimonials.map((testimonial, index) => {
      const generatedTestimonial = generated.testimonials[index] ?? emptyTestimonial(index);
      return {
        ...testimonial,
        name: pickText(generatedTestimonial.name, testimonial.name),
        role: pickText(generatedTestimonial.role, testimonial.role),
        quote: pickText(generatedTestimonial.quote, testimonial.quote),
      };
    }),
    galleryItems: hydrated.galleryItems.map((item, index) => {
      const generatedItem = generated.galleryItems[index] ?? emptyGalleryItem(index);
      return {
        ...item,
        title: pickText(generatedItem.title, item.title),
        caption: pickText(generatedItem.caption, item.caption),
        imageUrl: generatedItem.imageUrl || item.imageUrl,
      };
    }),
  };
}

export function applyAiSectionResultToDraft(
  draft: Business,
  generated: AiBusinessSectionResult,
  template: Template,
) {
  const hydrated = hydrateDraft(structuredClone(draft), template);

  if (generated.target === "services") {
    return {
      ...hydrated,
      services: hydrated.services.map((service, index) => {
        const generatedService = generated.services?.[index] ?? emptyService();
        return {
          ...service,
          name: pickText(generatedService.name, service.name),
          description: pickText(generatedService.description, service.description),
          icon: pickIcon(generatedService.icon, service.icon || "sparkles"),
        };
      }),
    };
  }

  if (!generated.text?.trim()) {
    return hydrated;
  }

  return {
    ...hydrated,
    [generated.target]: generated.text.trim(),
  };
}

export function buildFallbackReviewNotes(
  draft: Partial<Business> | undefined,
  generated: Pick<AiBusinessContent, "phone" | "whatsapp" | "address" | "reviewNotes">,
) {
  const notes = [...generated.reviewNotes];

  if (!draft?.phone?.trim() && generated.phone === AI_CONTACT_DEFAULTS.phone) {
    notes.push("Nomor telepon masih memakai placeholder default. Mohon ganti dengan nomor aktif bisnis.");
  }

  if (!draft?.whatsapp?.trim() && generated.whatsapp === AI_CONTACT_DEFAULTS.whatsapp) {
    notes.push("Nomor WhatsApp masih memakai placeholder default. Mohon ganti sebelum publish.");
  }

  if (!draft?.address?.trim() && generated.address === AI_CONTACT_DEFAULTS.address) {
    notes.push("Alamat bisnis masih memakai placeholder default. Mohon lengkapi dengan alamat sebenarnya.");
  }

  return mergeReviewNotes(notes);
}
