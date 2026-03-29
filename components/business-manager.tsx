"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, ExternalLink, Plus, Search, Trash2, X } from "lucide-react";
import { AdminLogoutButton } from "@/components/admin-logout-button";
import { deleteBusinessById, saveBusiness, uploadAdminImage } from "@/lib/client-api";
import { iconOptions } from "@/lib/icon-map";
import { applyTemplateDefaults, getTemplateFormConfig } from "@/lib/template-form-config";
import type { AdminIdentity, Business, GalleryItem, Service, Template, Testimonial } from "@/lib/types";

type Notice = { type: "success" | "error" | "info"; message: string };
type ArrayFieldKey = "services" | "testimonials" | "galleryItems";
type ImageTarget = "heroImage" | "ogImage" | `gallery-${number}`;

function localId() {
  return Date.now() + Math.floor(Math.random() * 100_000);
}

const emptyService = (): Service => ({ id: localId(), businessId: 0, name: "", description: "", icon: "sparkles" });
const emptyTestimonial = (sortOrder = 0): Testimonial => ({
  id: localId(),
  businessId: 0,
  name: "",
  role: "",
  quote: "",
  sortOrder,
});
const emptyGalleryItem = (sortOrder = 0): GalleryItem => ({
  id: localId(),
  businessId: 0,
  title: "",
  caption: "",
  imageUrl: "",
  sortOrder,
});

const emptyBusiness = (): Business => ({
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

function hydrateDraft(draft: Business, template: Template | null) {
  const config = getTemplateFormConfig(template?.key);
  const withTemplate = {
    ...draft,
    templateId: template?.id ?? null,
    templateKey: template?.key ?? null,
    templateName: template?.name ?? null,
    templateAccent: template?.accent ?? null,
  };
  const next = applyTemplateDefaults(withTemplate, template?.key);
  const testimonials =
    next.testimonials.length > 0 ? next.testimonials.map((item, index) => ({ ...item, sortOrder: index })) : [emptyTestimonial()];
  const galleryItems =
    next.galleryItems.length > 0 ? next.galleryItems.map((item, index) => ({ ...item, sortOrder: index })) : [emptyGalleryItem()];

  return {
    ...next,
    services: next.services.length > 0 ? next.services : [emptyService()],
    testimonials: config?.fixedTestimonialCount
      ? Array.from({ length: config.fixedTestimonialCount }, (_, index) => testimonials[index] ?? emptyTestimonial(index))
      : testimonials,
    galleryItems: config?.fixedGalleryCount
      ? Array.from({ length: config.fixedGalleryCount }, (_, index) => galleryItems[index] ?? emptyGalleryItem(index))
      : galleryItems,
  };
}

function validateDraft(draft: Business, template: Template | null) {
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
  if (draft.services.length === 0) errors.push("Minimal harus ada satu layanan.");

  draft.services.forEach((service, index) => {
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
    if (touched && (!item.name.trim() || !item.quote.trim())) {
      errors.push(`Testimoni ke-${index + 1} wajib punya nama dan kutipan.`);
    }
  });

  draft.galleryItems.forEach((item, index) => {
    const touched = item.title.trim() || item.caption.trim() || item.imageUrl.trim() || Boolean(config?.fixedGalleryCount);
    if (touched && (!item.title.trim() || !item.imageUrl.trim())) {
      errors.push(`Galeri ke-${index + 1} wajib punya judul dan gambar.`);
    }
  });

  return errors;
}

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

  const canCreate = currentAdmin.role === "owner";
  const canDelete = currentAdmin.role === "owner" && Boolean(draft.id);
  const usesSupabaseStorage = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
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
      setNotice({ type: "info", message: "Akun admin biasa tidak bisa membuat bisnis baru." });
      return;
    }
    setSelectedId(0);
    setDraft(emptyBusiness());
  }

  async function handleSave() {
    const prepared = selectedTemplate ? hydrateDraft(draft, selectedTemplate) : draft;
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
                  : "Admin hanya bisa edit website yang diberi akses."}
              </p>
            </div>
            <button onClick={startCreate} type="button" disabled={!canCreate} className="rounded-full bg-cyan-300 p-2 text-slate-950 disabled:opacity-50">
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
              <button key={business.id} onClick={() => selectBusiness(business.id)} type="button" className={`w-full rounded-3xl border p-4 text-left ${selectedId === business.id ? "border-cyan-300/35 bg-cyan-300/10" : "border-white/10 bg-white/5"}`}>
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

          <div className="mb-6 grid gap-4 md:grid-cols-2">
            <InfoCard label="Template active" title={selectedTemplate?.name ?? "Belum dipilih"} description={selectedTemplate?.description ?? "Pilih template agar struktur form dan output halaman mengikuti desain yang tepat."} />
            <InfoCard label="Storage strategy" title={usesSupabaseStorage ? "Supabase Storage + path di database" : "File path only in database"} description={usesSupabaseStorage ? "User tidak mengetik URL gambar. Upload file dulu, database hanya menyimpan path publiknya." : "User tidak mengetik URL gambar. File di-upload lalu database hanya menyimpan path."} />
          </div>

          <Section title="Pilih template dulu" eyebrow="Step 1" description="Setiap template punya identitas visual berbeda. Atelier Mosaic masih memakai layout fixed; template lain tetap memakai form generik yang fleksibel.">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {templates.map((template) => (
                <button key={template.id} type="button" onClick={() => chooseTemplate(template.id)} className={`overflow-hidden rounded-[1.6rem] border text-left transition ${template.id === draft.templateId ? "border-cyan-300/40 bg-cyan-300/10" : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8"}`}>
                  <div className="h-28 w-full" style={{ background: template.previewImage ? undefined : `linear-gradient(135deg, ${template.accent ?? "#44d6e8"}22, rgba(255,255,255,0.08), rgba(15,23,42,0.18))` }}>
                    {template.previewImage ? <Image src={template.previewImage} alt={template.name} width={720} height={320} unoptimized className="h-full w-full object-cover" /> : null}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/70">{template.categoryLabel}</p>
                        <h3 className="mt-2 text-lg font-semibold text-white">{template.name}</h3>
                      </div>
                      <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${template.id === draft.templateId ? "border-cyan-300/30 bg-cyan-300/12 text-cyan-100" : "border-white/10 bg-white/5 text-slate-300"}`}>
                        {template.id === draft.templateId ? "Dipilih" : template.key === "atelier-mosaic" ? "Fixed layout" : "Flexible"}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-300">{template.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </Section>

          <AnimatePresence mode="wait">
            {!selectedTemplate ? (
              <motion.div key="empty" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mt-8 rounded-[1.75rem] border border-dashed border-white/12 bg-white/5 p-6 text-sm leading-7 text-slate-300">
                Pilih salah satu template di atas dulu. Setelah itu box form akan muncul di bawah dan default title seperti About, Services, Testimonials, Gallery, dan Contact akan langsung terisi.
              </motion.div>
            ) : (
              <motion.div key={selectedTemplate.key} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.28, ease: "easeOut" }} className="mt-8 space-y-8">
                {isAtelier ? (
                  <section className="grid gap-6 xl:grid-cols-[0.34fr_0.66fr]">
                    <div className="space-y-6">
                      <div className="overflow-hidden rounded-[2rem] border border-[#d4b089]/35 bg-[linear-gradient(180deg,rgba(244,234,216,0.98),rgba(238,224,203,0.96))] p-6 text-[#20352e] shadow-[0_24px_80px_rgba(12,30,24,0.14)]">
                        <p className="text-xs uppercase tracking-[0.3em] text-[#8c5b48]">Fixed layout template</p>
                        <h3 className="mt-4 font-display text-4xl font-semibold leading-[0.95] text-[#17312a]">Atelier Mosaic</h3>
                        <p className="mt-4 text-sm leading-7 text-[#425b53]">Form ini mengikuti layout editorial di frontend. Galeri wajib {selectedTemplateConfig?.fixedGalleryCount ?? 4} item dan testimoni wajib {selectedTemplateConfig?.fixedTestimonialCount ?? 3} item.</p>
                        <div className="mt-6 grid gap-3">
                          <TemplateStat label="Section" value="6 blok utama" />
                          <TemplateStat label="Galeri tetap" value={`${selectedTemplateConfig?.fixedGalleryCount ?? 4} frame`} />
                          <TemplateStat label="Testimoni tetap" value={`${selectedTemplateConfig?.fixedTestimonialCount ?? 3} quote`} />
                        </div>
                      </div>
                      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5">
                        <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/70">Template info</p>
                        <h4 className="mt-3 text-lg font-semibold text-white">{selectedTemplate.name}</h4>
                        <p className="mt-2 text-sm leading-6 text-slate-300">{selectedTemplate.description}</p>
                      </div>
                    </div>
                    <div className="space-y-8">
                      <Section title="Isi identitas utama dulu" eyebrow="Brand core" description="Atelier Mosaic memakai hero editorial, jadi nama, tagline, dan deskripsi sebaiknya lebih kuat." className="border-[#d4b089]/20 bg-white/6"><CoreFields draft={draft} updateField={updateField} /></Section>
                      <Section title="Default copy sudah terisi" eyebrow="Section copy" description="Header section di frontend sudah punya default. Client boleh ubah, tapi kalau dibiarkan kosong tetap aman." className="border-[#d4b089]/20 bg-white/6"><CopyFields draft={draft} updateField={updateField} /></Section>
                      <Section title="Layanan utama" eyebrow="Services"><ServicesEditorBlock services={draft.services} updateArrayItem={updateArrayItem} addArrayItem={addArrayItem} removeArrayItem={removeArrayItem} /></Section>
                      <Section title={`Wajib ${selectedTemplateConfig?.fixedTestimonialCount ?? 3} testimoni`} eyebrow="Testimonials" description="Jumlah testimoni dikunci agar ritme layout tetap stabil."><TestimonialsBlock testimonials={draft.testimonials} updateArrayItem={updateArrayItem} fixed /></Section>
                      <Section title={`Wajib ${selectedTemplateConfig?.fixedGalleryCount ?? 4} frame galeri`} eyebrow="Gallery" description="User tidak mengetik URL gambar. Upload saja, backend menyimpan path otomatis."><GalleryBlock galleryItems={draft.galleryItems} updateArrayItem={updateArrayItem} removeArrayItem={removeArrayItem} addArrayItem={addArrayItem} uploadImage={uploadImage} uploadTarget={uploadTarget} fixed /></Section>
                      <Section title="Kontak dan gambar utama" eyebrow="Contact and SEO" description="Field URL gambar sengaja disembunyikan. Hero dan OG image hanya lewat upload."><ContactBlock draft={draft} updateField={updateField} uploadImage={uploadImage} uploadTarget={uploadTarget} usesSupabaseStorage={usesSupabaseStorage} /></Section>
                    </div>
                  </section>
                ) : (
                  <>
                    <Section title={selectedTemplate.name} eyebrow="Template mode" description="Template ini memakai form generik. Fokusnya di isi konten, sementara karakter visual utama diatur oleh renderer template."><CoreFields draft={draft} updateField={updateField} /></Section>
                    <Section title="Copy per section" eyebrow="Section copy"><CopyFields draft={draft} updateField={updateField} /></Section>
                    <Section title="Layanan yang tampil di halaman" eyebrow="Services"><ServicesEditorBlock services={draft.services} updateArrayItem={updateArrayItem} addArrayItem={addArrayItem} removeArrayItem={removeArrayItem} /></Section>
                    <Section title="Testimoni pelanggan" eyebrow="Testimonials"><TestimonialsBlock testimonials={draft.testimonials} updateArrayItem={updateArrayItem} addArrayItem={addArrayItem} removeArrayItem={removeArrayItem} /></Section>
                    <Section title="Galeri visual" eyebrow="Gallery"><GalleryBlock galleryItems={draft.galleryItems} updateArrayItem={updateArrayItem} removeArrayItem={removeArrayItem} addArrayItem={addArrayItem} uploadImage={uploadImage} uploadTarget={uploadTarget} /></Section>
                    <Section title="Kontak, metadata, dan upload gambar" eyebrow="Contact and SEO"><ContactBlock draft={draft} updateField={updateField} uploadImage={uploadImage} uploadTarget={uploadTarget} usesSupabaseStorage={usesSupabaseStorage} /></Section>
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

function CoreFields({
  draft,
  updateField,
}: {
  draft: Business;
  updateField: <Key extends keyof Business>(key: Key, value: Business[Key]) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Field label="Business name" required><input value={draft.name} onChange={(event) => updateField("name", event.target.value)} className="input" /></Field>
      <Field label="Slug" required><input value={draft.slug} onChange={(event) => updateField("slug", event.target.value.toLowerCase())} className="input" /></Field>
      <Field label="Hero label"><input value={draft.heroLabel} onChange={(event) => updateField("heroLabel", event.target.value)} className="input" /></Field>
      <Field label="Tagline" required><input value={draft.tagline} onChange={(event) => updateField("tagline", event.target.value)} className="input" /></Field>
      <Field label="Hero CTA label"><input value={draft.heroCtaLabel} onChange={(event) => updateField("heroCtaLabel", event.target.value)} className="input" /></Field>
      <Field label="Hero CTA URL"><input value={draft.heroCtaUrl} onChange={(event) => updateField("heroCtaUrl", event.target.value)} className="input" /></Field>
      <Field label="Description" required className="md:col-span-2"><textarea value={draft.description} onChange={(event) => updateField("description", event.target.value)} className="input min-h-28" /></Field>
    </div>
  );
}

function CopyFields({
  draft,
  updateField,
}: {
  draft: Business;
  updateField: <Key extends keyof Business>(key: Key, value: Business[Key]) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Field label="About title"><input value={draft.aboutTitle} onChange={(event) => updateField("aboutTitle", event.target.value)} className="input" /></Field>
      <Field label="About intro"><textarea value={draft.aboutIntro} onChange={(event) => updateField("aboutIntro", event.target.value)} className="input min-h-24" /></Field>
      <Field label="Services title"><input value={draft.servicesTitle} onChange={(event) => updateField("servicesTitle", event.target.value)} className="input" /></Field>
      <Field label="Services intro"><textarea value={draft.servicesIntro} onChange={(event) => updateField("servicesIntro", event.target.value)} className="input min-h-24" /></Field>
      <Field label="Testimonials title"><input value={draft.testimonialsTitle} onChange={(event) => updateField("testimonialsTitle", event.target.value)} className="input" /></Field>
      <Field label="Testimonials intro"><textarea value={draft.testimonialsIntro} onChange={(event) => updateField("testimonialsIntro", event.target.value)} className="input min-h-24" /></Field>
      <Field label="Gallery title"><input value={draft.galleryTitle} onChange={(event) => updateField("galleryTitle", event.target.value)} className="input" /></Field>
      <Field label="Gallery intro"><textarea value={draft.galleryIntro} onChange={(event) => updateField("galleryIntro", event.target.value)} className="input min-h-24" /></Field>
      <Field label="Contact title"><input value={draft.contactTitle} onChange={(event) => updateField("contactTitle", event.target.value)} className="input" /></Field>
      <Field label="Contact intro"><textarea value={draft.contactIntro} onChange={(event) => updateField("contactIntro", event.target.value)} className="input min-h-24" /></Field>
    </div>
  );
}

function ServicesEditorBlock({
  services,
  updateArrayItem,
  addArrayItem,
  removeArrayItem,
}: {
  services: Service[];
  updateArrayItem: <T extends Service | Testimonial | GalleryItem>(key: ArrayFieldKey, index: number, patch: Partial<T>) => void;
  addArrayItem: (key: ArrayFieldKey) => void;
  removeArrayItem: (key: ArrayFieldKey, index: number) => void;
}) {
  return (
    <>
      <ArrayHeader title="Services" actionLabel="Add service" onClick={() => addArrayItem("services")} />
      {services.map((service, index) => (
        <ArrayCard key={`${service.id}-${index}`}>
          <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
            <Field label="Service name" required><input value={service.name} onChange={(event) => updateArrayItem<Service>("services", index, { name: event.target.value })} className="input" /></Field>
            <Field label="Icon key"><IconKeySelect value={service.icon} onChange={(value) => updateArrayItem<Service>("services", index, { icon: value })} /></Field>
            <DangerIconButton onClick={() => removeArrayItem("services", index)} />
          </div>
          <Field label="Description" required><textarea value={service.description} onChange={(event) => updateArrayItem<Service>("services", index, { description: event.target.value })} className="input min-h-24" /></Field>
        </ArrayCard>
      ))}
    </>
  );
}

function TestimonialsBlock({
  testimonials,
  updateArrayItem,
  addArrayItem,
  removeArrayItem,
  fixed = false,
}: {
  testimonials: Testimonial[];
  updateArrayItem: <T extends Service | Testimonial | GalleryItem>(key: ArrayFieldKey, index: number, patch: Partial<T>) => void;
  addArrayItem?: (key: ArrayFieldKey) => void;
  removeArrayItem?: (key: ArrayFieldKey, index: number) => void;
  fixed?: boolean;
}) {
  return (
    <>
      <ArrayHeader title="Testimonials" actionLabel={fixed ? `${testimonials.length} fixed items` : "Add testimonial"} onClick={() => addArrayItem?.("testimonials")} disabled={fixed} />
      {testimonials.map((item, index) => (
        <ArrayCard key={`${item.id}-${index}`}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-white">Testimonial {index + 1}</p>
            {fixed ? (
              <span className="rounded-full border border-[#d4b089]/25 bg-[#d4b089]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f2d6b8]">Fixed slot</span>
            ) : removeArrayItem ? (
              <DangerIconButton onClick={() => removeArrayItem("testimonials", index)} compact />
            ) : null}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Client name"><input value={item.name} onChange={(event) => updateArrayItem<Testimonial>("testimonials", index, { name: event.target.value })} className="input" /></Field>
            <Field label="Client role"><input value={item.role} onChange={(event) => updateArrayItem<Testimonial>("testimonials", index, { role: event.target.value })} className="input" /></Field>
          </div>
          <Field label="Quote"><textarea value={item.quote} onChange={(event) => updateArrayItem<Testimonial>("testimonials", index, { quote: event.target.value })} className="input min-h-24" /></Field>
        </ArrayCard>
      ))}
    </>
  );
}

function GalleryBlock({
  galleryItems,
  updateArrayItem,
  addArrayItem,
  removeArrayItem,
  uploadImage,
  uploadTarget,
  fixed = false,
}: {
  galleryItems: GalleryItem[];
  updateArrayItem: <T extends Service | Testimonial | GalleryItem>(key: ArrayFieldKey, index: number, patch: Partial<T>) => void;
  addArrayItem: (key: ArrayFieldKey) => void;
  removeArrayItem: (key: ArrayFieldKey, index: number) => void;
  uploadImage: (target: ImageTarget, file: File | null) => Promise<void>;
  uploadTarget: string | null;
  fixed?: boolean;
}) {
  return (
    <>
      <ArrayHeader title="Gallery items" actionLabel={fixed ? `${galleryItems.length} fixed items` : "Add gallery item"} onClick={() => addArrayItem("galleryItems")} disabled={fixed} />
      {galleryItems.map((item, index) => (
        <ArrayCard key={`${item.id}-${index}`}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-white">Gallery frame {index + 1}</p>
            {fixed ? (
              <span className="rounded-full border border-[#d4b089]/25 bg-[#d4b089]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f2d6b8]">Fixed slot</span>
            ) : (
              <DangerIconButton onClick={() => removeArrayItem("galleryItems", index)} compact />
            )}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Title"><input value={item.title} onChange={(event) => updateArrayItem<GalleryItem>("galleryItems", index, { title: event.target.value })} className="input" /></Field>
            <Field label="Caption"><textarea value={item.caption} onChange={(event) => updateArrayItem<GalleryItem>("galleryItems", index, { caption: event.target.value })} className="input min-h-24" /></Field>
          </div>
          <Field label="Upload gallery image">
            <input type="file" accept="image/*" onChange={(event) => void uploadImage(`gallery-${index}`, event.target.files?.[0] ?? null)} className="input file:mr-3 file:rounded-full file:border-0 file:bg-cyan-300 file:px-4 file:py-2 file:font-semibold file:text-slate-950" />
            <p className="mt-2 text-xs text-slate-400">{uploadTarget === `gallery-${index}` ? "Uploading gallery image..." : "URL gambar disembunyikan. Setelah upload, path disimpan otomatis di backend."}</p>
          </Field>
          <InlineImagePreview src={item.imageUrl || null} />
        </ArrayCard>
      ))}
    </>
  );
}

function ContactBlock({
  draft,
  updateField,
  uploadImage,
  uploadTarget,
  usesSupabaseStorage,
}: {
  draft: Business;
  updateField: <Key extends keyof Business>(key: Key, value: Business[Key]) => void;
  uploadImage: (target: ImageTarget, file: File | null) => Promise<void>;
  uploadTarget: string | null;
  usesSupabaseStorage: boolean;
}) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Phone" required><input value={draft.phone} onChange={(event) => updateField("phone", event.target.value)} className="input" /></Field>
        <Field label="WhatsApp" required><input value={draft.whatsapp} onChange={(event) => updateField("whatsapp", event.target.value)} className="input" /></Field>
        <Field label="Address"><textarea value={draft.address} onChange={(event) => updateField("address", event.target.value)} className="input min-h-24" /></Field>
        <Field label="Meta title"><input value={draft.metaTitle} onChange={(event) => updateField("metaTitle", event.target.value)} className="input" /></Field>
        <Field label="Meta description"><textarea value={draft.metaDescription} onChange={(event) => updateField("metaDescription", event.target.value)} className="input min-h-24" /></Field>
        <Field label="Upload hero image"><input type="file" accept="image/*" onChange={(event) => void uploadImage("heroImage", event.target.files?.[0] ?? null)} className="input file:mr-3 file:rounded-full file:border-0 file:bg-cyan-300 file:px-4 file:py-2 file:font-semibold file:text-slate-950" /><p className="mt-2 text-xs text-slate-400">{uploadTarget === "heroImage" ? "Uploading hero image..." : "Field URL gambar tidak ditampilkan. Upload saja."}</p></Field>
        <Field label="Upload OpenGraph image"><input type="file" accept="image/*" onChange={(event) => void uploadImage("ogImage", event.target.files?.[0] ?? null)} className="input file:mr-3 file:rounded-full file:border-0 file:bg-cyan-300 file:px-4 file:py-2 file:font-semibold file:text-slate-950" /><p className="mt-2 text-xs text-slate-400">{uploadTarget === "ogImage" ? "Uploading OpenGraph image..." : usesSupabaseStorage ? "Upload via Supabase Storage." : "Upload ke folder uploads."}</p></Field>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <ImagePreviewCard title="Hero Image Preview" src={draft.heroImage} onClear={() => updateField("heroImage", null)} />
        <ImagePreviewCard title="OpenGraph Preview" src={draft.ogImage} onClear={() => updateField("ogImage", null)} />
      </div>
    </>
  );
}

function Section({
  title,
  eyebrow,
  description,
  children,
  className = "",
}: {
  title: string;
  eyebrow?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={`rounded-[1.75rem] border border-white/10 bg-white/5 p-5 ${className}`}><p className="text-xs uppercase tracking-[0.22em] text-cyan-200/70">{eyebrow}</p><h3 className="mt-3 text-xl font-semibold text-white">{title}</h3>{description ? <p className="mt-2 text-sm leading-7 text-slate-400">{description}</p> : null}<div className="mt-4">{children}</div></section>;
}

function Field({ label, required = false, children, className = "" }: { label: string; required?: boolean; children: React.ReactNode; className?: string }) {
  return <label className={`block ${className}`}><span className="mb-2 block text-sm text-slate-300">{label}{required ? <span className="ml-1 text-rose-300">*</span> : null}</span>{children}</label>;
}

function ArrayHeader({ title, actionLabel, onClick, disabled = false }: { title: string; actionLabel: string; onClick: () => void; disabled?: boolean }) {
  return <div className="mb-4 flex items-center justify-between gap-3"><h4 className="text-lg font-semibold text-white">{title}</h4><button onClick={onClick} type="button" disabled={disabled} className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">{actionLabel}</button></div>;
}

function ArrayCard({ children }: { children: React.ReactNode }) {
  return <div className="mb-4 rounded-3xl border border-white/10 bg-slate-950/30 p-4">{children}</div>;
}

function DangerIconButton({ onClick, compact = false }: { onClick: () => void; compact?: boolean }) {
  return <button onClick={onClick} type="button" className={`flex items-center justify-center rounded-2xl border border-rose-300/20 bg-rose-400/10 text-rose-100 ${compact ? "h-11 w-11" : "mt-7 h-12 w-12"}`}><Trash2 className="h-4 w-4" /></button>;
}

function InfoCard({ label, title, description }: { label: string; title: string; description: string }) {
  return <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs uppercase tracking-[0.22em] text-cyan-200/70">{label}</p><p className="mt-3 text-lg font-semibold text-white">{title}</p><p className="mt-1 text-sm text-slate-400">{description}</p></div>;
}

function TemplateStat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-[1.4rem] border border-[#17312a]/10 bg-white/55 px-4 py-4"><p className="text-[11px] uppercase tracking-[0.28em] text-[#8c5b48]">{label}</p><p className="mt-2 text-lg font-semibold text-[#17312a]">{value}</p></div>;
}

function ImagePreviewCard({ title, src, onClear }: { title: string; src: string | null; onClear: () => void }) {
  return <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><div className="mb-3 flex items-center justify-between gap-3"><div><p className="text-sm font-semibold text-white">{title}</p><p className="text-xs text-slate-400">Preview ringan dari path file yang tersimpan.</p></div>{src ? <div className="flex gap-2"><a href={src} target="_blank" rel="noreferrer" className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-white"><span className="inline-flex items-center gap-1">Preview<ExternalLink className="h-3.5 w-3.5" /></span></a><button type="button" onClick={onClear} className="rounded-full border border-rose-300/20 px-3 py-1 text-xs font-semibold text-rose-100">Clear</button></div> : null}</div><div className="overflow-hidden rounded-[1.25rem] border border-white/10 bg-slate-950/45">{src ? <Image src={src} alt={title} width={960} height={540} unoptimized className="h-48 w-full object-cover" /> : <div className="flex h-48 items-center justify-center text-sm text-slate-500">Belum ada gambar.</div>}</div></div>;
}

function InlineImagePreview({ src }: { src: string | null }) {
  return <div className="mt-4 overflow-hidden rounded-[1.25rem] border border-white/10 bg-slate-950/45">{src ? <Image src={src} alt="Gallery preview" width={960} height={540} unoptimized className="h-44 w-full object-cover" /> : <div className="flex h-44 items-center justify-center text-sm text-slate-500">Belum ada gambar galeri.</div>}</div>;
}

function NoticeToast({ notice, onClose }: { notice: Notice; onClose: () => void }) {
  return <div className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-md"><div className={`rounded-[1.5rem] border px-4 py-3 shadow-[0_24px_60px_rgba(2,15,12,0.32)] backdrop-blur ${notice.type === "success" ? "border-emerald-300/25 bg-emerald-400/14 text-emerald-100" : notice.type === "error" ? "border-rose-300/25 bg-rose-400/14 text-rose-100" : "border-cyan-300/25 bg-cyan-400/14 text-cyan-100"}`}><div className="flex items-start justify-between gap-3"><p className="text-sm leading-6">{notice.message}</p><button type="button" onClick={onClose} className="shrink-0 rounded-full p-1"><X className="h-4 w-4" /></button></div></div></div>;
}

function IconKeySelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selectedOption = iconOptions.find((option) => option.key === value) ?? iconOptions[0];
  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return iconOptions;
    return iconOptions.filter((option) => option.label.toLowerCase().includes(normalizedQuery) || option.key.toLowerCase().includes(normalizedQuery));
  }, [query]);

  return (
    <div className="relative">
      <button type="button" onClick={() => setIsOpen((current) => !current)} className="input flex items-center justify-between gap-3 text-left">
        <span className="flex items-center gap-3"><selectedOption.Icon className="h-5 w-5 text-cyan-200" /><span><span className="block text-sm font-semibold text-white">{selectedOption.label}</span><span className="block text-xs text-slate-400">{selectedOption.key}</span></span></span>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen ? <div className="absolute z-30 mt-3 w-full rounded-[1.25rem] border border-white/10 bg-[#08231d] p-3 shadow-[0_24px_60px_rgba(2,15,12,0.35)]"><div className="mb-3 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2"><Search className="h-4 w-4 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari icon..." className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500" /></div><div className="max-h-64 space-y-2 overflow-y-auto pr-1">{filteredOptions.map((option) => <button key={option.key} type="button" onClick={() => { onChange(option.key); setIsOpen(false); setQuery(""); }} className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left ${option.key === value ? "bg-cyan-300/14 text-cyan-100" : "bg-white/4 text-slate-200 hover:bg-white/8"}`}><option.Icon className="h-5 w-5 shrink-0 text-cyan-200" /><span><span className="block text-sm font-semibold">{option.label}</span><span className="block text-xs text-slate-400">{option.key}</span></span></button>)}{filteredOptions.length === 0 ? <div className="rounded-2xl bg-white/4 px-3 py-3 text-sm text-slate-400">Icon tidak ditemukan.</div> : null}</div></div> : null}
    </div>
  );
}
