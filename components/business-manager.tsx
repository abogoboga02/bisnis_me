"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Check, Loader2, PenSquare, Plus, RefreshCcw, Sparkles, WandSparkles } from "lucide-react";
import { AdminLogoutButton } from "@/components/admin-logout-button";
import {
  BoardmemoFields,
  ContactBlock,
  CopyFields,
  CoreFields,
  GalleryBlock,
  InfoCard,
  NoticeToast,
  Section,
  ServicesEditorBlock,
  TestimonialsBlock,
} from "@/components/business-manager-fields";
import {
  AI_SECTION_TARGET_META,
  FULL_GENERATION_COST_TENTHS,
  SECTION_GENERATION_COST_TENTHS,
  applyAiBusinessContentToDraft,
  applyAiSectionResultToDraft,
  formatAiCredits,
  type AiBusinessSectionTarget,
  type AiBusinessTemplateContext,
} from "@/lib/ai-business-content";
import { deleteBusinessById, generateAiBusinessContent, saveBusiness, uploadAdminImage } from "@/lib/client-api";
import {
  emptyBusiness,
  emptyGalleryItem,
  emptyService,
  emptyTestimonial,
  hydrateDraft,
  slugify,
  validateDraft,
  type ArrayFieldKey,
  type ImageTarget,
} from "@/lib/business-draft";
import { ADMIN_UPLOAD_HELPER_TEXT, ADMIN_UPLOAD_MAX_FILE_SIZE } from "@/lib/admin-upload";
import { getTemplateFormConfig } from "@/lib/template-form-config";
import { resolveTemplatePreviewImage } from "@/lib/template-preview-image";
import type { AdminAiQuota, AdminIdentity, Business, GalleryItem, Service, Template, Testimonial } from "@/lib/types";

type Notice = { type: "success" | "error" | "info"; message: string };
type InputMode = "manual" | "ai";

function hasMeaningfulDraftContent(draft: Business) {
  return Boolean(
    draft.name.trim() ||
      draft.tagline.trim() ||
      draft.description.trim() ||
      draft.aboutIntro.trim() ||
      draft.servicesIntro.trim() ||
      draft.testimonialsIntro.trim() ||
      draft.galleryIntro.trim() ||
      draft.contactIntro.trim() ||
      draft.boardmemoBody.trim() ||
      draft.phone.trim() ||
      draft.whatsapp.trim() ||
      draft.address.trim() ||
      draft.services.some((service) => service.name.trim() || service.description.trim()) ||
      draft.testimonials.some((item) => item.name.trim() || item.role.trim() || item.quote.trim()) ||
      draft.galleryItems.some((item) => item.title.trim() || item.caption.trim() || item.imageUrl.trim()),
  );
}

function toAiTemplateContext(template: Template): AiBusinessTemplateContext {
  return {
    id: template.id,
    key: template.key,
    name: template.name,
    description: template.description,
    category: template.category,
    categoryLabel: template.categoryLabel,
    fit: template.fit,
    feature: template.feature,
  };
}

function buildAiBriefFromDraft(draft: Business) {
  const serviceLines = draft.services
    .map((service) => {
      if (!service.name.trim() && !service.description.trim()) {
        return "";
      }

      return `- ${service.name.trim() || "Layanan"}: ${service.description.trim() || "-"}`;
    })
    .filter(Boolean);

  return [
    draft.name.trim() ? `Nama bisnis: ${draft.name.trim()}` : "",
    draft.tagline.trim() ? `Tagline: ${draft.tagline.trim()}` : "",
    draft.description.trim() ? `Deskripsi bisnis: ${draft.description.trim()}` : "",
    draft.address.trim() ? `Alamat: ${draft.address.trim()}` : "",
    draft.phone.trim() ? `Telepon: ${draft.phone.trim()}` : "",
    draft.whatsapp.trim() ? `WhatsApp: ${draft.whatsapp.trim()}` : "",
    serviceLines.length > 0 ? `Layanan:\n${serviceLines.join("\n")}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function applyLockedTemplateFields(draft: Business, template: Template | null) {
  const config = getTemplateFormConfig(template?.key);

  if (!config) {
    return draft;
  }

  return {
    ...draft,
    heroLabel: config.defaults.heroLabel ?? draft.heroLabel,
    aboutTitle: config.defaults.aboutTitle ?? draft.aboutTitle,
    servicesTitle: config.defaults.servicesTitle ?? draft.servicesTitle,
    testimonialsTitle: config.defaults.testimonialsTitle ?? draft.testimonialsTitle,
    galleryTitle: config.defaults.galleryTitle ?? draft.galleryTitle,
    contactTitle: config.defaults.contactTitle ?? draft.contactTitle,
  };
}

function mergeNotes(current: string[], incoming: string[]) {
  return [...new Set([...incoming, ...current].map((note) => note.trim()).filter(Boolean))];
}

function getModeLabel(mode: InputMode | null) {
  if (mode === "ai") return "Generate AI";
  if (mode === "manual") return "Manual";
  return "Belum dipilih";
}

function canAffordAi(quota: AdminAiQuota, costTenths: number) {
  return quota.unlimited || (quota.remainingTenths ?? 0) >= costTenths;
}

export function BusinessManager({
  currentAdmin,
  initialBusinesses,
  templates,
  initialAiQuota,
}: {
  currentAdmin: AdminIdentity;
  initialBusinesses: Business[];
  templates: Template[];
  initialAiQuota: AdminAiQuota;
}) {
  const templateById = useMemo(() => new Map(templates.map((template) => [template.id, template])), [templates]);
  const initialHydrated = useMemo(
    () =>
      initialBusinesses.map((business) =>
        hydrateDraft(structuredClone(business), templateById.get(business.templateId ?? -1) ?? null),
      ),
    [initialBusinesses, templateById],
  );
  const [businesses, setBusinesses] = useState(initialHydrated);
  const [selectedId, setSelectedId] = useState(initialHydrated[0]?.id ?? 0);
  const [draft, setDraft] = useState<Business>(initialHydrated[0] ? structuredClone(initialHydrated[0]) : emptyBusiness());
  const [notice, setNotice] = useState<Notice | null>(null);
  const [uploadTarget, setUploadTarget] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pendingTemplateId, setPendingTemplateId] = useState<number | null>(initialHydrated[0]?.templateId ?? null);
  const [confirmedTemplateId, setConfirmedTemplateId] = useState<number | null>(initialHydrated[0]?.templateId ?? null);
  const [pendingInputMode, setPendingInputMode] = useState<InputMode | null>(null);
  const [confirmedInputMode, setConfirmedInputMode] = useState<InputMode | null>(null);
  const [editorUnlocked, setEditorUnlocked] = useState(false);
  const [aiBrief, setAiBrief] = useState(initialHydrated[0] ? buildAiBriefFromDraft(initialHydrated[0]) : "");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isGeneratingSection, setIsGeneratingSection] = useState(false);
  const [aiReviewNotes, setAiReviewNotes] = useState<string[]>([]);
  const [aiQuota, setAiQuota] = useState(initialAiQuota);
  const [sectionAssistant, setSectionAssistant] = useState<{
    target: AiBusinessSectionTarget;
    brief: string;
  } | null>(null);

  const canCreate = currentAdmin.role === "owner" || (currentAdmin.role === "admin" && businesses.length === 0);
  const canDelete = currentAdmin.role === "owner" && Boolean(draft.id);
  const selectedTemplate = draft.templateId ? templateById.get(draft.templateId) ?? null : null;
  const pendingTemplate = pendingTemplateId ? templateById.get(pendingTemplateId) ?? null : null;
  const selectedTemplateConfig = getTemplateFormConfig(selectedTemplate?.key);
  const isAtelier = selectedTemplate?.key === "atelier-mosaic";
  const aiCreditsLabel = aiQuota.unlimited ? "Unlimited" : formatAiCredits(aiQuota.remainingTenths);

  useEffect(() => {
    if (!notice) return undefined;
    const timeout = window.setTimeout(() => setNotice(null), 3500);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  function updateField<Key extends keyof Business>(key: Key, value: Business[Key]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function updateArrayItem<T extends Service | Testimonial | GalleryItem>(
    key: ArrayFieldKey,
    index: number,
    patch: Partial<T>,
  ) {
    setDraft((current) => ({
      ...current,
      [key]: current[key].map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
    }));
  }

  function addArrayItem(key: ArrayFieldKey) {
    if (key === "services") setDraft((current) => ({ ...current, services: [...current.services, emptyService()] }));
    if (key === "testimonials") {
      setDraft((current) => ({ ...current, testimonials: [...current.testimonials, emptyTestimonial(current.testimonials.length)] }));
    }
    if (key === "galleryItems") {
      setDraft((current) => ({ ...current, galleryItems: [...current.galleryItems, emptyGalleryItem(current.galleryItems.length)] }));
    }
  }

  function removeArrayItem(key: ArrayFieldKey, index: number) {
    setDraft((current) => ({ ...current, [key]: current[key].filter((_, itemIndex) => itemIndex !== index) }));
  }

  function resetWorkflowState(nextDraft: Business) {
    setPendingTemplateId(nextDraft.templateId ?? null);
    setConfirmedTemplateId(nextDraft.templateId ?? null);
    setPendingInputMode(null);
    setConfirmedInputMode(null);
    setEditorUnlocked(false);
    setSectionAssistant(null);
    setAiReviewNotes([]);
    setAiBrief(buildAiBriefFromDraft(nextDraft));
  }

  function selectBusiness(id: number) {
    setSelectedId(id);
    const target = businesses.find((business) => business.id === id);

    if (target) {
      const hydratedTarget = hydrateDraft(structuredClone(target), templateById.get(target.templateId ?? -1) ?? null);
      setDraft(hydratedTarget);
      resetWorkflowState(hydratedTarget);
    }
  }

  function startCreate() {
    if (!canCreate) {
      setNotice({
        type: "info",
        message:
          currentAdmin.role === "owner"
            ? "Pembuatan bisnis baru sedang tidak tersedia."
            : "Akun admin hanya boleh membuat satu website.",
      });
      return;
    }

    const nextDraft = emptyBusiness();
    setSelectedId(0);
    setDraft(nextDraft);
    resetWorkflowState(nextDraft);
  }

  function confirmTemplateSelection() {
    if (!pendingTemplate) {
      setNotice({ type: "error", message: "Pilih template dulu sebelum lanjut." });
      return;
    }

    setAiReviewNotes([]);
    setSectionAssistant(null);
    setConfirmedTemplateId(pendingTemplate.id);
    setDraft((current) => hydrateDraft(applyLockedTemplateFields(current, pendingTemplate), pendingTemplate));
    setNotice({ type: "success", message: `Template ${pendingTemplate.name} siap digunakan.` });
  }

  function confirmInputModeSelection() {
    if (!pendingInputMode) {
      setNotice({ type: "error", message: "Pilih metode pengisian konten dulu sebelum lanjut." });
      return;
    }

    setConfirmedInputMode(pendingInputMode);

    if (pendingInputMode === "ai" && !aiBrief.trim()) {
      setAiBrief(buildAiBriefFromDraft(draft));
    }

    setNotice({
      type: "success",
      message:
        pendingInputMode === "manual"
          ? "Mode manual dipilih. Anda bisa lanjut isi detail satu per satu."
          : "Mode AI dipilih. Lanjutkan dengan brief lengkap agar draft lebih akurat.",
    });
  }

  function reopenSetup() {
    setPendingTemplateId(draft.templateId ?? null);
    setConfirmedTemplateId(draft.templateId ?? null);
    setPendingInputMode(confirmedInputMode);
    setEditorUnlocked(false);
    setSectionAssistant(null);
  }

  async function handleGenerateAiContent() {
    if (!selectedTemplate) {
      setNotice({ type: "error", message: "Pilih template dulu sebelum generate konten AI." });
      return;
    }

    if (!aiBrief.trim()) {
      setNotice({ type: "error", message: "Isi brief bisnis dulu agar AI bisa membuat draft yang relevan." });
      return;
    }

    if (!canAffordAi(aiQuota, FULL_GENERATION_COST_TENTHS)) {
      setNotice({
        type: "error",
        message: "Token AI Anda habis. Hubungi admin untuk menambah token sebelum generate lagi.",
      });
      return;
    }

    setIsGeneratingAi(true);
    setAiReviewNotes([]);

    try {
      const response = await generateAiBusinessContent({
        mode: "full",
        brief: aiBrief.trim(),
        template: toAiTemplateContext(selectedTemplate),
        currentDraft: draft,
      });

      if (response.mode !== "full") {
        throw new Error("Respons AI penuh tidak valid.");
      }

      const mergedDraft = applyAiBusinessContentToDraft(
        {
          ...draft,
          slug: draft.slug.trim() || slugify(draft.name),
        },
        response.data,
        selectedTemplate,
      );

      setDraft(mergedDraft);
      setAiBrief(buildAiBriefFromDraft(mergedDraft));
      setAiReviewNotes(response.data.reviewNotes);
      setAiQuota({
        remainingTenths: response.meta.remainingCreditsTenths,
        unlimited: response.meta.unlimited,
      });
      setEditorUnlocked(true);
      setNotice({
        type: "success",
        message: "Draft AI berhasil dibuat. Silakan review konten, kontak, dan gambar sebelum disimpan.",
      });
    } catch (error) {
      setNotice({
        type: "error",
        message: error instanceof Error ? error.message : "Gagal membuat draft bisnis dengan AI.",
      });
    } finally {
      setIsGeneratingAi(false);
    }
  }

  function openSectionAssistant(target: AiBusinessSectionTarget) {
    setSectionAssistant({
      target,
      brief: "",
    });
  }

  async function handleGenerateSection() {
    if (!selectedTemplate || !sectionAssistant) {
      return;
    }

    if (!sectionAssistant.brief.trim()) {
      setNotice({ type: "error", message: "Isi brief singkat dulu sebelum generate section." });
      return;
    }

    if (!canAffordAi(aiQuota, SECTION_GENERATION_COST_TENTHS)) {
      setNotice({
        type: "error",
        message: "Token AI Anda habis. Hubungi admin untuk menambah token sebelum generate section lagi.",
      });
      return;
    }

    setIsGeneratingSection(true);

    try {
      const response = await generateAiBusinessContent({
        mode: "section",
        brief: sectionAssistant.brief.trim(),
        target: sectionAssistant.target,
        template: toAiTemplateContext(selectedTemplate),
        currentDraft: draft,
      });

      if (response.mode !== "section") {
        throw new Error("Respons AI section tidak valid.");
      }

      setDraft((current) => applyAiSectionResultToDraft(current, response.data, selectedTemplate));
      setAiReviewNotes((current) => mergeNotes(current, response.data.reviewNotes));
      setAiQuota({
        remainingTenths: response.meta.remainingCreditsTenths,
        unlimited: response.meta.unlimited,
      });
      setNotice({
        type: "success",
        message:
          sectionAssistant.target === "services"
            ? "Layanan berhasil dibantu AI. Silakan rapikan jika masih perlu."
            : `Bagian ${AI_SECTION_TARGET_META[sectionAssistant.target].label} berhasil dibantu AI.`,
      });
      setSectionAssistant(null);
    } catch (error) {
      setNotice({
        type: "error",
        message: error instanceof Error ? error.message : "Gagal membuat section dengan AI.",
      });
    } finally {
      setIsGeneratingSection(false);
    }
  }

  async function handleSave() {
    const autoSlug = draft.slug.trim() || slugify(draft.name);
    const preparedDraft = {
      ...draft,
      slug: autoSlug,
      heroCtaUrl: draft.heroCtaUrl.trim() || "#contact",
      metaTitle: draft.metaTitle.trim() || draft.name,
      metaDescription: draft.metaDescription.trim() || draft.description,
      ogImage: draft.ogImage || draft.heroImage,
    };
    const prepared = selectedTemplate ? hydrateDraft(preparedDraft, selectedTemplate) : preparedDraft;
    const errors = validateDraft(prepared, selectedTemplate);
    if (errors.length > 0) {
      setDraft(prepared);
      setNotice({ type: "error", message: errors[0] });
      return;
    }

    setIsSaving(true);
    try {
      const saved = await saveBusiness(prepared);
      const hydrated = hydrateDraft(saved, templateById.get(saved.templateId ?? -1) ?? null);
      const nextBusinesses = businesses.some((item) => item.id === hydrated.id)
        ? businesses.map((item) => (item.id === hydrated.id ? hydrated : item))
        : [hydrated, ...businesses];
      setBusinesses(nextBusinesses);
      setSelectedId(hydrated.id);
      setDraft(structuredClone(hydrated));
      setPendingTemplateId(hydrated.templateId ?? null);
      setConfirmedTemplateId(hydrated.templateId ?? null);
      setAiBrief(buildAiBriefFromDraft(hydrated));
      setNotice({ type: "success", message: draft.id ? "Perubahan bisnis berhasil disimpan." : "Bisnis baru berhasil dibuat." });
    } catch (error) {
      setNotice({ type: "error", message: error instanceof Error ? error.message : "Failed to save business." });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!canDelete) {
      setNotice({
        type: "info",
        message: currentAdmin.role === "owner" ? "Pilih bisnis yang akan dihapus." : "Hanya owner yang bisa menghapus bisnis.",
      });
      return;
    }

    if (!window.confirm(`Hapus bisnis "${draft.name}"? Tindakan ini tidak bisa dibatalkan.`)) return;

    setIsDeleting(true);
    try {
      await deleteBusinessById(draft.id);
      const nextBusinesses = businesses.filter((item) => item.id !== draft.id);
      setBusinesses(nextBusinesses);

      if (nextBusinesses[0]) {
        const hydratedNext = hydrateDraft(
          structuredClone(nextBusinesses[0]),
          templateById.get(nextBusinesses[0].templateId ?? -1) ?? null,
        );
        setSelectedId(nextBusinesses[0].id);
        setDraft(hydratedNext);
        resetWorkflowState(hydratedNext);
      } else {
        const nextDraft = emptyBusiness();
        setSelectedId(0);
        setDraft(nextDraft);
        resetWorkflowState(nextDraft);
      }

      setNotice({ type: "success", message: "Bisnis berhasil dihapus." });
    } catch (error) {
      setNotice({ type: "error", message: error instanceof Error ? error.message : "Failed to delete business." });
    } finally {
      setIsDeleting(false);
    }
  }

  async function uploadImage(target: ImageTarget, file: File | null) {
    if (!file) return;

    if (file.size > ADMIN_UPLOAD_MAX_FILE_SIZE) {
      setNotice({ type: "error", message: `File terlalu besar. ${ADMIN_UPLOAD_HELPER_TEXT}` });
      return;
    }

    setUploadTarget(target);
    try {
      const uploadedPath = await uploadAdminImage(file);
      if (target === "heroImage" || target === "ogImage") {
        updateField(target, uploadedPath);
      } else {
        const index = Number(target.replace("gallery-", ""));
        updateArrayItem<GalleryItem>("galleryItems", index, { imageUrl: uploadedPath });
      }
      setNotice({ type: "success", message: "Gambar berhasil di-upload." });
    } catch (error) {
      setNotice({ type: "error", message: error instanceof Error ? error.message : "Failed to upload image." });
    } finally {
      setUploadTarget(null);
    }
  }

  function renderSectionAssistant(target: AiBusinessSectionTarget) {
    if (sectionAssistant?.target !== target) {
      return null;
    }

    const meta = AI_SECTION_TARGET_META[target];

    return (
      <div className="mb-4 rounded-[1.35rem] border border-cyan-300/20 bg-cyan-300/10 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/80">AI section helper</p>
            <h4 className="mt-2 text-base font-semibold text-white">{meta.label}</h4>
            <p className="mt-1 text-sm leading-6 text-cyan-50/85">{meta.guide}</p>
          </div>
          <span className="rounded-full border border-cyan-200/25 bg-cyan-200/10 px-3 py-1 text-xs font-semibold text-cyan-50">
            {formatAiCredits(SECTION_GENERATION_COST_TENTHS)} token
          </span>
        </div>
        <textarea
          value={sectionAssistant.brief}
          onChange={(event) =>
            setSectionAssistant((current) => (current ? { ...current, brief: event.target.value } : current))
          }
          className="input mt-4 min-h-28"
          placeholder={meta.placeholder}
        />
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleGenerateSection}
            disabled={isGeneratingSection || !sectionAssistant.brief.trim() || !canAffordAi(aiQuota, SECTION_GENERATION_COST_TENTHS)}
            className="inline-flex items-center gap-2 rounded-[1rem] bg-cyan-300 px-4 py-3 font-semibold text-slate-950 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isGeneratingSection ? <Loader2 className="h-4 w-4 animate-spin" /> : <WandSparkles className="h-4 w-4" />}
            {isGeneratingSection ? "Membuat section..." : "Generate section ini"}
          </button>
          <button
            type="button"
            onClick={() => setSectionAssistant(null)}
            className="rounded-[1rem] border border-white/12 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Batal
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="admin-grid min-h-screen px-6 py-10 md:px-10">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.34fr_0.66fr]">
        <aside className="glass-panel rounded-[2rem] p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-bold text-white">Businesses</h1>
              <p className="text-sm text-slate-400">
                {currentAdmin.role === "owner"
                  ? "Owner bisa membuat dan menghapus semua website."
                  : businesses.length === 0
                    ? "Admin bisa membuat 1 website pertama, lalu hanya bisa mengelola website itu."
                    : "Admin hanya bisa mengelola 1 website yang terhubung ke akun ini."}
              </p>
            </div>
            <button onClick={startCreate} type="button" disabled={!canCreate} className="rounded-full bg-cyan-300 p-2 text-slate-950 disabled:cursor-not-allowed disabled:opacity-50">
              <Plus className="h-5 w-5" />
            </button>
          </div>
          <div className="mb-4 rounded-3xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/70">Signed in</p>
            <p className="mt-3 text-base font-semibold text-white">{currentAdmin.name}</p>
            <p className="mt-1 text-sm text-slate-400">{currentAdmin.email}</p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">{currentAdmin.role}</span>
              <AdminLogoutButton className="rounded-full border border-white/12 bg-white/5 px-3 py-2 text-xs font-semibold text-white" />
            </div>
          </div>
          <div className="mb-4 rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/75">Token AI</p>
            <p className="mt-3 text-2xl font-semibold text-white">{aiCreditsLabel}</p>
            <p className="mt-1 text-sm leading-6 text-cyan-50/85">
              {aiQuota.unlimited
                ? "Akun owner tidak dibatasi token AI."
                : "Generate awal memakai 1.0 token. Generate section atau layanan memakai 0.3 token."}
            </p>
          </div>
          
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/70">Business registry</p>
              <p className="mt-1 text-sm text-slate-400">Semua website yang bisa Anda buka dipusatkan di panel ini.</p>
            </div>
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
              {businesses.length} bisnis
            </span>
          </div>
          <div className="space-y-3">
            {businesses.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm leading-7 text-slate-300">
                Belum ada bisnis dalam scope akun ini.
              </div>
            ) : businesses.map((business) => (
              <button
                key={business.id}
                onClick={() => selectBusiness(business.id)}
                type="button"
                className={`w-full rounded-3xl border p-4 text-left ${
                  selectedId === business.id ? "border-cyan-300/35 bg-cyan-300/10" : "border-white/10 bg-white/5"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-white">{business.name}</p>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">Edit</span>
                </div>
                <p className="mt-1 text-sm text-slate-400">/{business.slug}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span
                    className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                      business.templateName
                        ? "border-cyan-300/20 bg-cyan-300/10 text-cyan-100"
                        : "border-amber-300/20 bg-amber-300/10 text-amber-100"
                    }`}
                  >
                    {business.templateName ?? "Belum ada template"}
                  </span>
                  <span className="rounded-full border border-white/10 bg-slate-950/35 px-3 py-1 text-[11px] text-slate-300">
                    {business.services.length} layanan
                  </span>
                  <span className="rounded-full border border-white/10 bg-slate-950/35 px-3 py-1 text-[11px] text-slate-300">
                    {business.testimonials.length} testimoni
                  </span>
                  <span className="rounded-full border border-white/10 bg-slate-950/35 px-3 py-1 text-[11px] text-slate-300">
                    {business.galleryItems.length} galeri
                  </span>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <section className="glass-panel rounded-[2rem] p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-white">{draft.id ? `Edit ${draft.name || "business"}` : "Create new business"}</h2>
              <p className="text-sm text-slate-400">
                Mulai dari Step 1 pilih template, lalu Step 2 pilih cara isi konten. Setelah itu barulah editor dibuka.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/admin/dashboard"
                className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Dashboard overview
              </Link>
              {draft.slug ? (
                <Link href={`/${draft.slug}`} className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm font-semibold text-white">
                  Preview page
                </Link>
              ) : null}
              {editorUnlocked ? (
                <button onClick={reopenSetup} type="button" className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10">
                  <RefreshCcw className="h-4 w-4" />
                  Ubah template / mode
                </button>
              ) : null}
              <button onClick={handleDelete} type="button" disabled={isDeleting || !canDelete} className="rounded-full border border-rose-400/25 bg-rose-400/10 px-4 py-2 text-sm font-semibold text-rose-100 disabled:opacity-60">
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
              <button onClick={handleSave} type="button" disabled={isSaving || !selectedTemplate || !editorUnlocked} className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60">
                {isSaving ? "Saving..." : draft.id ? "Save changes" : "Save business"}
              </button>
            </div>
          </div>

          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <InfoCard label="Template active" title={selectedTemplate?.name ?? "Belum dipilih"} description={selectedTemplate?.description ?? "Pilih template agar struktur form dan output halaman mengikuti desain yang tepat."} />
            <InfoCard label="Mode input" title={getModeLabel(confirmedInputMode)} description={confirmedInputMode === "ai" ? "Satu brief lengkap untuk generate draft awal, lalu tetap bisa dirapikan manual." : confirmedInputMode === "manual" ? "Semua detail diisi satu per satu secara manual." : "Pilih manual atau AI agar proses berikutnya terbuka."} />
            <InfoCard label="Sisa token AI" title={aiCreditsLabel} description={aiQuota.unlimited ? "Akun owner dapat menggunakan AI tanpa batas token." : "Hubungi admin bila token habis dan perlu ditambah lagi."} />
          </div>

          {!editorUnlocked ? (
            <>
              <Section
                title="Pilih template dulu"
                eyebrow="Step 1"
                description="Template tetap bisa diganti lagi nanti. Saat Anda konfirmasi template, struktur halaman akan menyesuaikan desain yang dipilih."
                actions={
                  pendingTemplate ? (
                    <button
                      type="button"
                      onClick={confirmTemplateSelection}
                      className="inline-flex items-center gap-2 rounded-[1rem] bg-cyan-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5"
                    >
                      <Check className="h-4 w-4" />
                      Yakin pakai template ini
                    </button>
                  ) : null
                }
              >
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {templates.map((template) => {
                    const previewImage = resolveTemplatePreviewImage(template.key, template.previewImage);
                    const isPending = template.id === pendingTemplateId;
                    const isConfirmed = template.id === confirmedTemplateId;

                    return (
                      <button key={template.id} type="button" onClick={() => setPendingTemplateId(template.id)} className={`overflow-hidden rounded-[1.6rem] border text-left transition ${isPending ? "border-cyan-300/40 bg-cyan-300/10" : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8"}`}>
                        <div className="h-28 w-full" style={{ background: previewImage ? undefined : `linear-gradient(135deg, ${template.accent ?? "#44d6e8"}22, rgba(255,255,255,0.08), rgba(15,23,42,0.18))` }}>
                          {previewImage ? <Image src={previewImage} alt={template.name} width={720} height={320} loading="lazy" className="h-full w-full object-cover" /> : null}
                        </div>
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/70">{template.categoryLabel}</p>
                              <h3 className="mt-2 text-lg font-semibold text-white">{template.name}</h3>
                            </div>
                            <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${isPending ? "border-cyan-300/30 bg-cyan-300/12 text-cyan-100" : "border-white/10 bg-white/5 text-slate-300"}`}>
                              {isConfirmed ? "Aktif" : isPending ? "Dipilih" : "Pilih"}
                            </span>
                          </div>
                          <p className="mt-3 text-sm leading-6 text-slate-300">{template.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {pendingTemplate ? (
                  <div className="mt-4 rounded-[1.35rem] border border-white/10 bg-slate-950/35 p-4 text-sm leading-6 text-slate-300">
                    <span className="font-semibold text-white">{pendingTemplate.name}</span> siap dipakai. Klik tombol konfirmasi di kanan atas section ini bila Anda yakin dengan pilihan template di atas.
                  </div>
                ) : null}
              </Section>

              <Section
                title="Pilih metode pengisian konten"
                eyebrow="Step 2"
                description="Manual berarti isi semua field satu per satu. Generate AI berarti cukup beri satu brief lengkap, lalu AI menyusun draft awal sesuai template."
                className="mt-8"
                actions={
                  pendingInputMode ? (
                    <button
                      type="button"
                      onClick={confirmInputModeSelection}
                      disabled={!confirmedTemplateId}
                      className="inline-flex items-center gap-2 rounded-[1rem] bg-cyan-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Check className="h-4 w-4" />
                      Yakin pilih mode ini
                    </button>
                  ) : null
                }
              >
                <div className="grid gap-4 xl:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setPendingInputMode("manual")}
                    className={`rounded-[1.4rem] border p-4 text-left transition ${
                      pendingInputMode === "manual"
                        ? "border-cyan-300/35 bg-cyan-300/10"
                        : "border-white/10 bg-white/5 hover:bg-white/8"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="rounded-2xl bg-slate-950/35 p-3 text-cyan-100">
                        <PenSquare className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-base font-semibold text-white">Isi manual</p>
                        <p className="mt-1 text-sm leading-6 text-slate-300">
                          Template bawaan langsung muncul, lalu admin mengedit semua detail bisnis hingga kontak satu per satu.
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPendingInputMode("ai")}
                    className={`rounded-[1.4rem] border p-4 text-left transition ${
                      pendingInputMode === "ai"
                        ? "border-cyan-300/35 bg-cyan-300/10"
                        : "border-white/10 bg-white/5 hover:bg-white/8"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="rounded-2xl bg-slate-950/35 p-3 text-cyan-100">
                        <Sparkles className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-base font-semibold text-white">Generate AI</p>
                        <p className="mt-1 text-sm leading-6 text-slate-300">
                          Satu brief lengkap untuk nama bisnis, layanan, alamat, dan detail lain. AI akan isi draft awal dan gambar terkait.
                        </p>
                      </div>
                    </div>
                  </button>
                </div>

                {pendingInputMode ? (
                  <div className="mt-4 rounded-[1.35rem] border border-white/10 bg-slate-950/35 p-4 text-sm leading-6 text-slate-300">
                    Klik tombol konfirmasi di kanan atas section ini bila Anda yakin memilih{" "}
                    <span className="font-semibold text-white">{pendingInputMode === "manual" ? "mode manual" : "mode AI"}</span>.
                  </div>
                ) : null}
              </Section>

              {confirmedTemplateId && confirmedInputMode === "manual" ? (
                <div className="mt-8 rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
                  <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/70">Lanjut proses</p>
                  <h3 className="mt-3 text-xl font-semibold text-white">Workflow manual siap dibuka</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-400">
                    Template bawaan sudah siap. Anda akan mengisi identitas bisnis, copy per section, layanan, testimoni, galeri, dan kontak secara manual.
                  </p>
                  <button
                    type="button"
                    onClick={() => setEditorUnlocked(true)}
                    className="mt-4 inline-flex items-center gap-2 rounded-[1rem] bg-cyan-300 px-4 py-3 font-semibold text-slate-950 transition hover:-translate-y-0.5"
                  >
                    <Check className="h-4 w-4" />
                    Mulai isi manual
                  </button>
                </div>
              ) : null}

              {confirmedTemplateId && confirmedInputMode === "ai" ? (
                <div className="mt-8 rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/70">Brief AI</p>
                      <h3 className="mt-3 text-xl font-semibold text-white">Ceritakan bisnis Anda dalam satu form</h3>
                      <p className="mt-2 text-sm leading-7 text-slate-400">
                        Jelaskan nama bisnis, layanan, target pasar, lokasi, telepon, WhatsApp, gaya brand, dan hal penting lain. Jika ada data yang belum lengkap, sistem akan memakai placeholder default dan menandainya untuk Anda review.
                      </p>
                    </div>
                    <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">
                      Biaya {formatAiCredits(FULL_GENERATION_COST_TENTHS)} token
                    </span>
                  </div>
                  <textarea
                    value={aiBrief}
                    onChange={(event) => setAiBrief(event.target.value)}
                    className="input mt-4 min-h-52"
                    placeholder={"Contoh:\nNama bisnis: Studio Arunika\nLayanan: foto produk, video promosi, desain feed\nAlamat: Bandung\nTarget pasar: UMKM kuliner\nGaya brand: hangat, modern, premium\nNomor telepon: ..."}
                  />
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={handleGenerateAiContent}
                      disabled={isGeneratingAi || !aiBrief.trim() || !canAffordAi(aiQuota, FULL_GENERATION_COST_TENTHS)}
                      className="inline-flex items-center gap-2 rounded-[1rem] bg-cyan-300 px-4 py-3 font-semibold text-slate-950 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isGeneratingAi ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                      {isGeneratingAi ? "Membuat draft AI..." : "Generate semua konten + gambar"}
                    </button>
                    {hasMeaningfulDraftContent(draft) ? (
                      <button
                        type="button"
                        onClick={() => setEditorUnlocked(true)}
                        className="rounded-[1rem] border border-white/12 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                      >
                        Buka editor tanpa generate ulang
                      </button>
                    ) : null}
                  </div>
                  {!canAffordAi(aiQuota, FULL_GENERATION_COST_TENTHS) ? (
                    <div className="mt-4 rounded-[1.2rem] border border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                      Token AI Anda habis. Hubungi admin untuk menambah token sebelum generate lagi.
                    </div>
                  ) : null}
                </div>
              ) : null}
            </>
          ) : (
            <>
              <Section
                title="Setup aktif"
                eyebrow="Workflow"
                description="Template dan mode di bawah sedang aktif. Anda bisa kembali ke wizard kapan pun untuk mengganti pilihan."
                actions={
                  <button
                    type="button"
                    onClick={reopenSetup}
                    className="inline-flex items-center gap-2 rounded-[1rem] border border-white/12 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    <RefreshCcw className="h-4 w-4" />
                    Kembali ke Step 1 & 2
                  </button>
                }
              >
                <div className="grid gap-4 md:grid-cols-3">
                  <InfoCard label="Template" title={selectedTemplate?.name ?? "-"} description="Template masih bisa diganti lagi dari wizard tanpa harus membuat bisnis baru." />
                  <InfoCard label="Mode aktif" title={getModeLabel(confirmedInputMode)} description={confirmedInputMode === "ai" ? "Draft awal dibuat dengan AI, lalu editor tetap bisa dirapikan manual." : "Semua field sedang dikelola manual dari editor ini."} />
                  <InfoCard label="Token AI" title={aiCreditsLabel} description="Generate section tetap tersedia jika Anda butuh bantuan di bagian tertentu." />
                </div>
              </Section>

              {aiReviewNotes.length > 0 ? (
                <div className="mt-6 rounded-[1.35rem] border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm text-cyan-50">
                  <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/75">Catatan review AI</p>
                  <div className="mt-3 space-y-2">
                    {aiReviewNotes.map((note, index) => (
                      <p key={`${note}-${index}`} className="leading-6">
                        {note}
                      </p>
                    ))}
                  </div>
                </div>
              ) : null}

              <AnimatePresence mode="wait">
                <motion.div key={selectedTemplate?.key ?? "editor"} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.28, ease: "easeOut" }} className="mt-8 space-y-8">
                  {isAtelier ? (
                    <section className="gap-6 xl:grid-cols-[0.34fr_0.66fr]">
                      <div className="space-y-8">
                        <Section title="Isi identitas utama dulu" eyebrow="Brand core" description="Atelier Mosaic memakai hero editorial, jadi nama, tagline, dan deskripsi sebaiknya lebih kuat." className="border-[#d4b089]/20 bg-white/6">
                          <CoreFields draft={draft} updateField={updateField} />
                        </Section>
                        <Section
                          title="Default copy sudah terisi"
                          eyebrow="Section copy"
                          description="Header section di frontend sudah punya default. Anda bisa meminta bantuan AI per bagian jika sedang butuh ide cepat."
                          className="border-[#d4b089]/20 bg-white/6"
                        >
                          <div className="mb-4 flex flex-wrap gap-2">
                            {(["aboutIntro", "servicesIntro", "testimonialsIntro", "galleryIntro", "contactIntro"] as AiBusinessSectionTarget[]).map((target) => (
                              <button
                                key={target}
                                type="button"
                                onClick={() => openSectionAssistant(target)}
                                disabled={isGeneratingSection || !canAffordAi(aiQuota, SECTION_GENERATION_COST_TENTHS)}
                                className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
                                  sectionAssistant?.target === target
                                    ? "border-cyan-300/30 bg-cyan-300/12 text-cyan-100"
                                    : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                                } disabled:cursor-not-allowed disabled:opacity-60`}
                              >
                                AI {AI_SECTION_TARGET_META[target].label}
                              </button>
                            ))}
                          </div>
                          {(["aboutIntro", "servicesIntro", "testimonialsIntro", "galleryIntro", "contactIntro"] as AiBusinessSectionTarget[]).map((target) => renderSectionAssistant(target))}
                          <CopyFields draft={draft} updateField={updateField} />
                        </Section>
                        <Section title="Boardmemo hero" eyebrow="Boardmemo" description="Memo ini tampil di panel hero Atelier Mosaic. Cocok untuk arahan singkat, positioning, atau catatan formal." className="border-[#d4b089]/20 bg-white/6">
                          <BoardmemoFields draft={draft} updateField={updateField} />
                        </Section>
                        <Section
                          title="Layanan utama"
                          eyebrow="Services"
                          description="Atelier Mosaic memakai 4 slot statis. Layanan 1-3 wajib diisi, slot 4 opsional untuk layout empat kartu."
                          actions={
                            <button
                              type="button"
                              onClick={() => openSectionAssistant("services")}
                              disabled={isGeneratingSection || !canAffordAi(aiQuota, SECTION_GENERATION_COST_TENTHS)}
                              className="inline-flex items-center gap-2 rounded-[1rem] border border-white/12 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <WandSparkles className="h-4 w-4" />
                              Generate layanan dengan AI
                            </button>
                          }
                        >
                          {renderSectionAssistant("services")}
                          <ServicesEditorBlock
                            services={draft.services}
                            updateArrayItem={updateArrayItem}
                            fixed
                            minFilledCount={selectedTemplateConfig?.minFilledServiceCount ?? 3}
                          />
                        </Section>
                        <Section title={`Wajib ${selectedTemplateConfig?.fixedTestimonialCount ?? 4} testimoni`} eyebrow="Testimonials" description="Jumlah testimoni dikunci agar ritme layout tetap stabil dan seluruh slot wajib diisi.">
                          <TestimonialsBlock testimonials={draft.testimonials} updateArrayItem={updateArrayItem} fixed />
                        </Section>
                        <Section title={`Wajib ${selectedTemplateConfig?.fixedGalleryCount ?? 4} frame galeri`} eyebrow="Gallery" description="User tidak mengetik URL gambar. Upload saja, backend menyimpan path otomatis.">
                          <GalleryBlock galleryItems={draft.galleryItems} updateArrayItem={updateArrayItem} removeArrayItem={removeArrayItem} addArrayItem={addArrayItem} uploadImage={uploadImage} uploadTarget={uploadTarget} fixed />
                        </Section>
                        <Section title="Kontak dan gambar utama" eyebrow="Contact" description="Cukup isi kontak bisnis dan upload gambar utama. Detail teknis lain akan diatur otomatis.">
                          <ContactBlock draft={draft} updateField={updateField} uploadImage={uploadImage} uploadTarget={uploadTarget} />
                        </Section>
                      </div>
                    </section>
                  ) : (
                    <>
                      <Section title={selectedTemplate?.name ?? "Template"} eyebrow="Template mode" description="Template ini memakai struktur form yang dikunci. Fokuskan pengisian pada konten inti, karena jumlah galeri dan testimoni tidak bisa diubah.">
                        <CoreFields draft={draft} updateField={updateField} />
                      </Section>
                      <Section title="Copy per section" eyebrow="Section copy" description="Judul setiap section dikunci mengikuti template. Anda bisa meminta AI membantu bagian tertentu saat sedang buntu.">
                        <div className="mb-4 flex flex-wrap gap-2">
                          {(["aboutIntro", "servicesIntro", "testimonialsIntro", "galleryIntro", "contactIntro"] as AiBusinessSectionTarget[]).map((target) => (
                            <button
                              key={target}
                              type="button"
                              onClick={() => openSectionAssistant(target)}
                              disabled={isGeneratingSection || !canAffordAi(aiQuota, SECTION_GENERATION_COST_TENTHS)}
                              className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
                                sectionAssistant?.target === target
                                  ? "border-cyan-300/30 bg-cyan-300/12 text-cyan-100"
                                  : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                              } disabled:cursor-not-allowed disabled:opacity-60`}
                            >
                              AI {AI_SECTION_TARGET_META[target].label}
                            </button>
                          ))}
                        </div>
                        {(["aboutIntro", "servicesIntro", "testimonialsIntro", "galleryIntro", "contactIntro"] as AiBusinessSectionTarget[]).map((target) => renderSectionAssistant(target))}
                        <CopyFields draft={draft} updateField={updateField} />
                      </Section>
                      <Section
                        title="Layanan yang tampil di halaman"
                        eyebrow="Services"
                        description={selectedTemplateConfig?.serviceSlotCount ? `Template ini memakai ${selectedTemplateConfig.serviceSlotCount} slot layanan tetap dan semuanya wajib diisi.` : undefined}
                        actions={
                          <button
                            type="button"
                            onClick={() => openSectionAssistant("services")}
                            disabled={isGeneratingSection || !canAffordAi(aiQuota, SECTION_GENERATION_COST_TENTHS)}
                            className="inline-flex items-center gap-2 rounded-[1rem] border border-white/12 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <WandSparkles className="h-4 w-4" />
                            Generate layanan dengan AI
                          </button>
                        }
                      >
                        {renderSectionAssistant("services")}
                        <ServicesEditorBlock services={draft.services} updateArrayItem={updateArrayItem} addArrayItem={addArrayItem} removeArrayItem={removeArrayItem} fixed={Boolean(selectedTemplateConfig?.serviceSlotCount)} minFilledCount={selectedTemplateConfig?.minFilledServiceCount ?? selectedTemplateConfig?.serviceSlotCount ?? 1} />
                      </Section>
                      <Section title={`Wajib ${selectedTemplateConfig?.fixedTestimonialCount ?? 3} testimoni`} eyebrow="Testimonials" description="Jumlah testimoni dikunci dan seluruh field wajib diisi.">
                        <TestimonialsBlock testimonials={draft.testimonials} updateArrayItem={updateArrayItem} fixed />
                      </Section>
                      <Section title={`Wajib ${selectedTemplateConfig?.fixedGalleryCount ?? 4} frame galeri`} eyebrow="Gallery" description="Jumlah galeri dikunci dan setiap item wajib punya judul, keterangan, dan gambar.">
                        <GalleryBlock galleryItems={draft.galleryItems} updateArrayItem={updateArrayItem} removeArrayItem={removeArrayItem} addArrayItem={addArrayItem} uploadImage={uploadImage} uploadTarget={uploadTarget} fixed />
                      </Section>
                      <Section title="Kontak dan gambar utama" eyebrow="Contact" description="Semua field kontak wajib diisi dan nomor telepon/WhatsApp harus diawali 62.">
                        <ContactBlock draft={draft} updateField={updateField} uploadImage={uploadImage} uploadTarget={uploadTarget} />
                      </Section>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </>
          )}
        </section>
      </div>

      {notice ? <NoticeToast notice={notice} onClose={() => setNotice(null)} /> : null}
    </main>
  );
}
