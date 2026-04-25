"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
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
import { deleteBusinessById, saveBusiness, uploadAdminImage } from "@/lib/client-api";
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
import type { AdminIdentity, Business, GalleryItem, Service, Template, Testimonial } from "@/lib/types";

type Notice = { type: "success" | "error" | "info"; message: string };

export function BusinessManager({
  currentAdmin,
  initialBusinesses,
  templates,
}: {
  currentAdmin: AdminIdentity;
  initialBusinesses: Business[];
  templates: Template[];
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

  const canCreate = currentAdmin.role === "owner" || (currentAdmin.role === "admin" && businesses.length === 0);
  const canDelete = currentAdmin.role === "owner" && Boolean(draft.id);
  const selectedTemplate = draft.templateId ? templateById.get(draft.templateId) ?? null : null;
  const selectedTemplateConfig = getTemplateFormConfig(selectedTemplate?.key);
  const isAtelier = selectedTemplate?.key === "atelier-mosaic";

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

  function chooseTemplate(templateId: number) {
    setDraft((current) => hydrateDraft(current, templateById.get(templateId) ?? null));
  }

  function selectBusiness(id: number) {
    setSelectedId(id);
    const target = businesses.find((business) => business.id === id);
    if (target) setDraft(hydrateDraft(structuredClone(target), templateById.get(target.templateId ?? -1) ?? null));
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
    setSelectedId(0);
    setDraft(emptyBusiness());
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
        setSelectedId(nextBusinesses[0].id);
        setDraft(hydrateDraft(structuredClone(nextBusinesses[0]), templateById.get(nextBusinesses[0].templateId ?? -1) ?? null));
      } else {
        setSelectedId(0);
        setDraft(emptyBusiness());
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
          <div className="space-y-3">
            {businesses.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm leading-7 text-slate-300">Belum ada bisnis dalam scope akun ini.</div>
            ) : businesses.map((business) => (
              <button key={business.id} onClick={() => selectBusiness(business.id)} type="button" className={`w-full rounded-3xl border p-4 text-left transition-colors duration-150 ${selectedId === business.id ? "border-cyan-300/35 bg-cyan-300/10" : "border-white/10 bg-white/5 hover:border-white/16 hover:bg-white/7"}`}>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-white">{business.name}</p>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">Edit</span>
                </div>
                <p className="mt-1 text-sm text-slate-400">/{business.slug}</p>
              </button>
            ))}
          </div>
        </aside>

        <section className="glass-panel rounded-[2rem] p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-white">{draft.id ? `Edit ${draft.name}` : "Create new business"}</h2>
              <p className="text-sm text-slate-400">
                Pilih template dulu. Setiap template langsung memuat struktur default section tanpa pindah halaman.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/admin/dashboard" className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-white/10">
                Back to Dashboard
              </Link>
              {draft.slug ? (
                <Link href={`/${draft.slug}`} className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm font-semibold text-white">
                  Preview page
                </Link>
              ) : null}
              <button onClick={handleDelete} type="button" disabled={isDeleting || !canDelete} className="rounded-full border border-rose-400/25 bg-rose-400/10 px-4 py-2 text-sm font-semibold text-rose-100 disabled:opacity-60">
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
              <button onClick={handleSave} type="button" disabled={isSaving || !selectedTemplate} className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60">
                {isSaving ? "Saving..." : draft.id ? "Save changes" : "Save business"}
              </button>
            </div>
          </div>

          <div className="mb-6 grid gap-4 md:grid-cols-1">
            <InfoCard label="Template active" title={selectedTemplate?.name ?? "Belum dipilih"} description={selectedTemplate?.description ?? "Pilih template agar struktur form dan output halaman mengikuti desain yang tepat."} />
          </div>

          <Section title="Pilih template dulu" eyebrow="Step 1" description="Setiap template punya identitas visual berbeda, tetapi jumlah slot testimoni dan galeri sekarang tetap mengikuti struktur template.">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {templates.map((template) => {
                const previewImage = resolveTemplatePreviewImage(template.key, template.previewImage);

                return (
                  <button key={template.id} type="button" onClick={() => chooseTemplate(template.id)} className={`overflow-hidden rounded-[1.6rem] border text-left transition-colors duration-200 ${template.id === draft.templateId ? "border-cyan-300/40 bg-cyan-300/10" : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8"}`}>
                    <div className="h-28 w-full" style={{ background: previewImage ? undefined : `linear-gradient(135deg, ${template.accent ?? "#44d6e8"}22, rgba(255,255,255,0.08), rgba(15,23,42,0.18))` }}>
                      {previewImage ? <Image src={previewImage} alt={template.name} width={720} height={320} loading="lazy" className="h-full w-full object-cover" /> : null}
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/70">{template.categoryLabel}</p>
                          <h3 className="mt-2 text-lg font-semibold text-white">{template.name}</h3>
                        </div>
                        <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${template.id === draft.templateId ? "border-cyan-300/30 bg-cyan-300/12 text-cyan-100" : "border-white/10 bg-white/5 text-slate-300"}`}>
                          {template.id === draft.templateId ? "Dipilih" : "Fixed slots"}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-300">{template.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </Section>

          <AnimatePresence mode="wait">
            {!selectedTemplate ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18, ease: "easeOut" }} className="mt-8 rounded-[1.75rem] border border-dashed border-white/12 bg-white/5 p-6 text-sm leading-7 text-slate-300">
                Pilih salah satu template di atas dulu. Setelah itu box form akan muncul di bawah dan default title seperti About, Services, Testimonials, Gallery, dan Contact akan langsung terisi.
              </motion.div>
            ) : (
              <motion.div key={selectedTemplate.key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2, ease: "easeOut" }} className="mt-8 space-y-8">
                {isAtelier ? (
                  <section className=" gap-6 xl:grid-cols-[0.34fr_0.66fr]">
                    <div className="space-y-8">
                      <Section title="Isi identitas utama dulu" eyebrow="Brand core" description="Atelier Mosaic memakai hero editorial, jadi nama, tagline, dan deskripsi sebaiknya lebih kuat." className="border-[#d4b089]/20 bg-white/6"><CoreFields draft={draft} updateField={updateField} /></Section>
                      <Section title="Default copy sudah terisi" eyebrow="Section copy" description="Header section di frontend sudah punya default. Client boleh ubah, tapi kalau dibiarkan kosong tetap aman." className="border-[#d4b089]/20 bg-white/6"><CopyFields draft={draft} updateField={updateField} /></Section>
                      <Section title="Boardmemo hero" eyebrow="Boardmemo" description="Memo ini tampil di panel hero Atelier Mosaic. Cocok untuk arahan singkat, positioning, atau catatan formal." className="border-[#d4b089]/20 bg-white/6"><BoardmemoFields draft={draft} updateField={updateField} /></Section>
                      <Section title="Layanan utama" eyebrow="Services" description="Atelier Mosaic memakai 4 slot statis. Layanan 1-3 wajib diisi, slot 4 opsional untuk layout empat kartu.">
                        <ServicesEditorBlock
                          services={draft.services}
                          updateArrayItem={updateArrayItem}
                          fixed
                          minFilledCount={selectedTemplateConfig?.minFilledServiceCount ?? 3}
                        />
                      </Section>
                      <Section title={`Wajib ${selectedTemplateConfig?.fixedTestimonialCount ?? 4} testimoni`} eyebrow="Testimonials" description="Jumlah testimoni dikunci agar ritme layout tetap stabil dan seluruh slot wajib diisi."><TestimonialsBlock testimonials={draft.testimonials} updateArrayItem={updateArrayItem} fixed /></Section>
                      <Section title={`Wajib ${selectedTemplateConfig?.fixedGalleryCount ?? 4} frame galeri`} eyebrow="Gallery" description="User tidak mengetik URL gambar. Upload saja, backend menyimpan path otomatis."><GalleryBlock galleryItems={draft.galleryItems} updateArrayItem={updateArrayItem} removeArrayItem={removeArrayItem} addArrayItem={addArrayItem} uploadImage={uploadImage} uploadTarget={uploadTarget} fixed /></Section>
                      <Section title="Kontak dan gambar utama" eyebrow="Contact" description="Cukup isi kontak bisnis dan upload gambar utama. Detail teknis lain akan diatur otomatis."><ContactBlock draft={draft} updateField={updateField} uploadImage={uploadImage} uploadTarget={uploadTarget} /></Section>
                    </div>
                  </section>
                ) : (
                  <>
                    <Section title={selectedTemplate.name} eyebrow="Template mode" description="Template ini memakai struktur form yang dikunci. Fokuskan pengisian pada konten inti, karena jumlah galeri dan testimoni tidak bisa diubah."><CoreFields draft={draft} updateField={updateField} /></Section>
                    <Section title="Copy per section" eyebrow="Section copy" description="Judul setiap section dikunci mengikuti template. Admin hanya mengisi isi kontennya."><CopyFields draft={draft} updateField={updateField} /></Section>
                    <Section title="Layanan yang tampil di halaman" eyebrow="Services" description={selectedTemplateConfig?.serviceSlotCount ? `Template ini memakai ${selectedTemplateConfig.serviceSlotCount} slot layanan tetap dan semuanya wajib diisi.` : undefined}><ServicesEditorBlock services={draft.services} updateArrayItem={updateArrayItem} addArrayItem={addArrayItem} removeArrayItem={removeArrayItem} fixed={Boolean(selectedTemplateConfig?.serviceSlotCount)} minFilledCount={selectedTemplateConfig?.minFilledServiceCount ?? selectedTemplateConfig?.serviceSlotCount ?? 1} /></Section>
                    <Section title={`Wajib ${selectedTemplateConfig?.fixedTestimonialCount ?? 3} testimoni`} eyebrow="Testimonials" description="Jumlah testimoni dikunci dan seluruh field wajib diisi."><TestimonialsBlock testimonials={draft.testimonials} updateArrayItem={updateArrayItem} fixed /></Section>
                    <Section title={`Wajib ${selectedTemplateConfig?.fixedGalleryCount ?? 4} frame galeri`} eyebrow="Gallery" description="Jumlah galeri dikunci dan setiap item wajib punya judul, keterangan, dan gambar."><GalleryBlock galleryItems={draft.galleryItems} updateArrayItem={updateArrayItem} removeArrayItem={removeArrayItem} addArrayItem={addArrayItem} uploadImage={uploadImage} uploadTarget={uploadTarget} fixed /></Section>
                    <Section title="Kontak dan gambar utama" eyebrow="Contact" description="Semua field kontak wajib diisi dan nomor telepon/WhatsApp harus diawali 62."><ContactBlock draft={draft} updateField={updateField} uploadImage={uploadImage} uploadTarget={uploadTarget} /></Section>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>

      {notice ? <NoticeToast notice={notice} onClose={() => setNotice(null)} /> : null}
    </main>
  );
}
