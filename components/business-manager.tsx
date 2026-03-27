"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, ExternalLink, Plus, Search, Trash2, X } from "lucide-react";
import { AdminLogoutButton } from "@/components/admin-logout-button";
import type { AdminIdentity, Business, GalleryItem, Service, Template, Testimonial } from "@/lib/types";
import { deleteBusinessById, saveBusiness, uploadAdminImage } from "@/lib/client-api";
import { iconOptions } from "@/lib/icon-map";

type Notice = { type: "success" | "error" | "info"; message: string };

const emptyService = (): Service => ({ id: Date.now(), businessId: 0, name: "", description: "", icon: "sparkles" });
const emptyTestimonial = (): Testimonial => ({ id: Date.now(), businessId: 0, name: "", role: "", quote: "", sortOrder: 0 });
const emptyGalleryItem = (): GalleryItem => ({ id: Date.now(), businessId: 0, title: "", caption: "", imageUrl: "", sortOrder: 0 });

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

function validateDraft(draft: Business) {
  const errors: string[] = [];
  if (!draft.name.trim()) errors.push("Nama bisnis wajib diisi.");
  if (!draft.slug.trim() || !/^[a-z0-9-]+$/.test(draft.slug.trim())) errors.push("Slug wajib diisi dan hanya boleh huruf kecil, angka, atau tanda hubung.");
  if (!draft.tagline.trim()) errors.push("Tagline wajib diisi.");
  if (!draft.description.trim()) errors.push("Deskripsi bisnis wajib diisi.");
  if (!draft.templateId) errors.push("Template wajib dipilih.");
  if (!draft.phone.trim()) errors.push("Nomor telepon wajib diisi.");
  if (!draft.whatsapp.trim()) errors.push("Nomor WhatsApp wajib diisi.");
  if (draft.services.length === 0) errors.push("Minimal harus ada satu layanan.");
  draft.services.forEach((service, index) => {
    if (!service.name.trim()) errors.push(`Nama layanan ke-${index + 1} wajib diisi.`);
    if (!service.description.trim()) errors.push(`Deskripsi layanan ke-${index + 1} wajib diisi.`);
  });
  draft.testimonials.forEach((item, index) => {
    if ((item.name.trim() || item.role.trim() || item.quote.trim()) && (!item.name.trim() || !item.quote.trim())) {
      errors.push(`Testimoni ke-${index + 1} wajib punya nama dan kutipan.`);
    }
  });
  draft.galleryItems.forEach((item, index) => {
    if ((item.title.trim() || item.caption.trim() || item.imageUrl.trim()) && (!item.title.trim() || !item.imageUrl.trim())) {
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
  const [businesses, setBusinesses] = useState(initialBusinesses);
  const [selectedId, setSelectedId] = useState(initialBusinesses[0]?.id ?? 0);
  const [draft, setDraft] = useState<Business>(initialBusinesses[0] ? structuredClone(initialBusinesses[0]) : emptyBusiness());
  const [notice, setNotice] = useState<Notice | null>(null);
  const [uploadTarget, setUploadTarget] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const canCreate = currentAdmin.role === "owner";
  const canDelete = currentAdmin.role === "owner" && Boolean(draft.id);
  const usesSupabaseStorage = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const selectedTemplate = templates.find((template) => template.id === draft.templateId) ?? null;

  useEffect(() => {
    if (!notice) return undefined;
    const timeout = window.setTimeout(() => setNotice(null), 3500);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  function updateField<Key extends keyof Business>(key: Key, value: Business[Key]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function updateArrayItem<T extends Service | Testimonial | GalleryItem>(
    key: "services" | "testimonials" | "galleryItems",
    index: number,
    patch: Partial<T>,
  ) {
    setDraft((current) => ({
      ...current,
      [key]: current[key].map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
    }));
  }

  function addArrayItem(key: "services" | "testimonials" | "galleryItems") {
    const next = key === "services" ? emptyService() : key === "testimonials" ? emptyTestimonial() : emptyGalleryItem();
    setDraft((current) => ({ ...current, [key]: [...current[key], next] }));
  }

  function removeArrayItem(key: "services" | "testimonials" | "galleryItems", index: number) {
    setDraft((current) => ({ ...current, [key]: current[key].filter((_, itemIndex) => itemIndex !== index) }));
  }

  function selectBusiness(id: number) {
    setSelectedId(id);
    const target = businesses.find((item) => item.id === id);
    if (target) setDraft(structuredClone(target));
  }

  function startCreate() {
    if (!canCreate) return setNotice({ type: "info", message: "Akun admin biasa tidak bisa membuat bisnis baru." });
    setSelectedId(0);
    setDraft(emptyBusiness());
  }

  async function handleSave() {
    const errors = validateDraft(draft);
    if (errors.length > 0) return setNotice({ type: "error", message: errors[0] });
    setIsSaving(true);
    try {
      const saved = await saveBusiness(draft);
      const nextBusinesses = businesses.some((item) => item.id === saved.id) ? businesses.map((item) => (item.id === saved.id ? saved : item)) : [saved, ...businesses];
      setBusinesses(nextBusinesses);
      setSelectedId(saved.id);
      setDraft(structuredClone(saved));
      setNotice({ type: "success", message: draft.id ? "Perubahan bisnis berhasil disimpan." : "Bisnis baru berhasil dibuat." });
    } catch (error) {
      setNotice({ type: "error", message: error instanceof Error ? error.message : "Failed to save business." });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!canDelete) return setNotice({ type: "info", message: currentAdmin.role === "owner" ? "Pilih bisnis yang akan dihapus." : "Hanya owner yang bisa menghapus bisnis." });
    if (!window.confirm(`Hapus bisnis "${draft.name}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    setIsDeleting(true);
    try {
      await deleteBusinessById(draft.id);
      const nextBusinesses = businesses.filter((item) => item.id !== draft.id);
      setBusinesses(nextBusinesses);
      if (nextBusinesses[0]) {
        setSelectedId(nextBusinesses[0].id);
        setDraft(structuredClone(nextBusinesses[0]));
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

  async function uploadImage(target: "heroImage" | "ogImage" | `gallery-${number}`, file: File | null) {
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
              <p className="text-sm text-slate-400">{currentAdmin.role === "owner" ? "Owner bisa membuat dan menghapus semua website." : "Admin hanya bisa edit website yang diberi akses."}</p>
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
            {businesses.length === 0 ? <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm leading-7 text-slate-300">Belum ada bisnis dalam scope akun ini.</div> : businesses.map((business) => (
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
              <p className="text-sm text-slate-400">Semua field section, testimonial, galeri, dan kontak disimpan ke database.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {draft.slug ? <Link href={`/${draft.slug}`} className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm font-semibold text-white">Preview page</Link> : null}
              <button onClick={handleDelete} type="button" disabled={isDeleting || !canDelete} className="rounded-full border border-rose-400/25 bg-rose-400/10 px-4 py-2 text-sm font-semibold text-rose-100 disabled:opacity-60">{isDeleting ? "Deleting..." : "Delete"}</button>
              <button onClick={handleSave} type="button" disabled={isSaving} className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60">{isSaving ? "Saving..." : draft.id ? "Save changes" : "Save business"}</button>
            </div>
          </div>

          <div className="mb-6 grid gap-4 md:grid-cols-2">
            <InfoCard label="Template active" title={selectedTemplate?.name ?? "Belum dipilih"} description={selectedTemplate?.description ?? "Pilih template agar output halaman mengikuti visual yang sesuai."} />
            <InfoCard label="Storage strategy" title={usesSupabaseStorage ? "Supabase Storage + URL in database" : "File path only in database"} description={usesSupabaseStorage ? "File di-upload ke Supabase Storage, database hanya menyimpan URL publik." : "File disimpan ke public/uploads/businesses, database hanya menyimpan path."} />
          </div>

          <Section title="Business core">
            <Grid>
              <Field label="Business name" required><input value={draft.name} onChange={(event) => updateField("name", event.target.value)} className="input" /></Field>
              <Field label="Slug" required><input value={draft.slug} onChange={(event) => updateField("slug", event.target.value.toLowerCase())} className="input" /></Field>
              <Field label="Template" required><select value={draft.templateId ?? ""} onChange={(event) => updateField("templateId", event.target.value ? Number(event.target.value) : null)} className="input"><option value="">Pilih template</option>{templates.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}</select></Field>
              <Field label="Hero label"><input value={draft.heroLabel} onChange={(event) => updateField("heroLabel", event.target.value)} className="input" /></Field>
              <Field label="Tagline" required><input value={draft.tagline} onChange={(event) => updateField("tagline", event.target.value)} className="input" /></Field>
              <Field label="Hero CTA label"><input value={draft.heroCtaLabel} onChange={(event) => updateField("heroCtaLabel", event.target.value)} className="input" /></Field>
              <Field label="Hero CTA URL"><input value={draft.heroCtaUrl} onChange={(event) => updateField("heroCtaUrl", event.target.value)} className="input" /></Field>
              <Field label="Description" required><textarea value={draft.description} onChange={(event) => updateField("description", event.target.value)} className="input min-h-24" /></Field>
            </Grid>
          </Section>

          <Section title="Section copy">
            <Grid>
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
            </Grid>
          </Section>

          <Section title="Services">
            <ArrayHeader title="Services" actionLabel="Add service" onClick={() => addArrayItem("services")} />
            {draft.services.map((service, index) => <ArrayCard key={`${service.id}-${index}`}><Grid three><Field label="Service name" required><input value={service.name} onChange={(event) => updateArrayItem<Service>("services", index, { name: event.target.value })} className="input" /></Field><Field label="Icon key"><IconKeySelect value={service.icon} onChange={(value) => updateArrayItem<Service>("services", index, { icon: value })} /></Field><DangerIconButton onClick={() => removeArrayItem("services", index)} /></Grid><Field label="Description" required><textarea value={service.description} onChange={(event) => updateArrayItem<Service>("services", index, { description: event.target.value })} className="input min-h-24" /></Field></ArrayCard>)}
          </Section>

          <Section title="Testimonials">
            <ArrayHeader title="Testimonials" actionLabel="Add testimonial" onClick={() => addArrayItem("testimonials")} />
            {draft.testimonials.map((item, index) => <ArrayCard key={`${item.id}-${index}`}><Grid three><Field label="Client name"><input value={item.name} onChange={(event) => updateArrayItem<Testimonial>("testimonials", index, { name: event.target.value })} className="input" /></Field><Field label="Client role"><input value={item.role} onChange={(event) => updateArrayItem<Testimonial>("testimonials", index, { role: event.target.value })} className="input" /></Field><DangerIconButton onClick={() => removeArrayItem("testimonials", index)} /></Grid><Field label="Quote"><textarea value={item.quote} onChange={(event) => updateArrayItem<Testimonial>("testimonials", index, { quote: event.target.value })} className="input min-h-24" /></Field></ArrayCard>)}
          </Section>

          <Section title="Gallery">
            <ArrayHeader title="Gallery items" actionLabel="Add gallery item" onClick={() => addArrayItem("galleryItems")} />
            {draft.galleryItems.map((item, index) => <ArrayCard key={`${item.id}-${index}`}><Grid three><Field label="Title"><input value={item.title} onChange={(event) => updateArrayItem<GalleryItem>("galleryItems", index, { title: event.target.value })} className="input" /></Field><Field label="Image URL / path"><input value={item.imageUrl} onChange={(event) => updateArrayItem<GalleryItem>("galleryItems", index, { imageUrl: event.target.value })} className="input" /></Field><DangerIconButton onClick={() => removeArrayItem("galleryItems", index)} /></Grid><Grid><Field label="Caption"><textarea value={item.caption} onChange={(event) => updateArrayItem<GalleryItem>("galleryItems", index, { caption: event.target.value })} className="input min-h-24" /></Field><Field label="Upload gallery image"><input type="file" accept="image/*" onChange={(event) => void uploadImage(`gallery-${index}`, event.target.files?.[0] ?? null)} className="input file:mr-3 file:rounded-full file:border-0 file:bg-cyan-300 file:px-4 file:py-2 file:font-semibold file:text-slate-950" /><p className="mt-2 text-xs text-slate-400">{uploadTarget === `gallery-${index}` ? "Uploading gallery image..." : "Upload aman, database hanya menyimpan path/URL."}</p></Field></Grid><InlineImagePreview src={item.imageUrl || null} /></ArrayCard>)}
          </Section>

          <Section title="Contact and SEO">
            <Grid>
              <Field label="Phone" required><input value={draft.phone} onChange={(event) => updateField("phone", event.target.value)} className="input" /></Field>
              <Field label="WhatsApp" required><input value={draft.whatsapp} onChange={(event) => updateField("whatsapp", event.target.value)} className="input" /></Field>
              <Field label="Address"><textarea value={draft.address} onChange={(event) => updateField("address", event.target.value)} className="input min-h-24" /></Field>
              <Field label="Meta title"><input value={draft.metaTitle} onChange={(event) => updateField("metaTitle", event.target.value)} className="input" /></Field>
              <Field label="Meta description"><textarea value={draft.metaDescription} onChange={(event) => updateField("metaDescription", event.target.value)} className="input min-h-24" /></Field>
              <Field label="Hero image URL"><input value={draft.heroImage ?? ""} onChange={(event) => updateField("heroImage", event.target.value || null)} className="input" /></Field>
              <Field label="Upload hero image"><input type="file" accept="image/*" onChange={(event) => void uploadImage("heroImage", event.target.files?.[0] ?? null)} className="input file:mr-3 file:rounded-full file:border-0 file:bg-cyan-300 file:px-4 file:py-2 file:font-semibold file:text-slate-950" /><p className="mt-2 text-xs text-slate-400">{uploadTarget === "heroImage" ? "Uploading hero image..." : "Upload aman, database hanya menyimpan path/URL."}</p></Field>
              <Field label="OpenGraph image URL"><input value={draft.ogImage ?? ""} onChange={(event) => updateField("ogImage", event.target.value || null)} className="input" /></Field>
              <Field label="Upload OpenGraph image"><input type="file" accept="image/*" onChange={(event) => void uploadImage("ogImage", event.target.files?.[0] ?? null)} className="input file:mr-3 file:rounded-full file:border-0 file:bg-cyan-300 file:px-4 file:py-2 file:font-semibold file:text-slate-950" /><p className="mt-2 text-xs text-slate-400">{uploadTarget === "ogImage" ? "Uploading OpenGraph image..." : usesSupabaseStorage ? "Upload via Supabase Storage." : "Upload ke public/uploads/businesses."}</p></Field>
            </Grid>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <ImagePreviewCard title="Hero Image Preview" src={draft.heroImage} onClear={() => updateField("heroImage", null)} />
              <ImagePreviewCard title="OpenGraph Preview" src={draft.ogImage} onClear={() => updateField("ogImage", null)} />
            </div>
          </Section>
        </section>
      </div>

      {notice ? <NoticeToast notice={notice} onClose={() => setNotice(null)} /> : null}
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="mt-8 rounded-[1.75rem] border border-white/10 bg-white/5 p-5"><h3 className="text-xl font-semibold text-white">{title}</h3><div className="mt-4">{children}</div></section>;
}

function Grid({ children, three = false }: { children: React.ReactNode; three?: boolean }) {
  return <div className={`grid gap-4 ${three ? "md:grid-cols-[1fr_1fr_auto]" : "md:grid-cols-2"}`}>{children}</div>;
}

function Field({ label, required = false, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 block text-sm text-slate-300">{label}{required ? <span className="ml-1 text-rose-300">*</span> : null}</span>{children}</label>;
}

function ArrayHeader({ title, actionLabel, onClick }: { title: string; actionLabel: string; onClick: () => void }) {
  return <div className="mb-4 flex items-center justify-between"><h4 className="text-lg font-semibold text-white">{title}</h4><button onClick={onClick} type="button" className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm font-semibold text-white">{actionLabel}</button></div>;
}

function ArrayCard({ children }: { children: React.ReactNode }) {
  return <div className="mb-4 rounded-3xl border border-white/10 bg-slate-950/30 p-4">{children}</div>;
}

function DangerIconButton({ onClick }: { onClick: () => void }) {
  return <button onClick={onClick} type="button" className="mt-7 flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-300/20 bg-rose-400/10 text-rose-100"><Trash2 className="h-4 w-4" /></button>;
}

function InfoCard({ label, title, description }: { label: string; title: string; description: string }) {
  return <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs uppercase tracking-[0.22em] text-cyan-200/70">{label}</p><p className="mt-3 text-lg font-semibold text-white">{title}</p><p className="mt-1 text-sm text-slate-400">{description}</p></div>;
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
