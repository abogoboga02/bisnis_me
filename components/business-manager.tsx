"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, ExternalLink, Plus, Search, Trash2, X } from "lucide-react";
import type { Business, Service, Template } from "@/lib/types";
import { deleteBusinessById, saveBusiness, uploadAdminImage } from "@/lib/client-api";
import { iconOptions } from "@/lib/icon-map";

type Notice = {
  type: "success" | "error" | "info";
  message: string;
};

const REQUIRED_FIELD_MESSAGES = {
  name: "Nama bisnis wajib diisi.",
  slug: "Slug wajib diisi dan hanya boleh huruf kecil, angka, atau tanda hubung.",
  tagline: "Tagline wajib diisi.",
  description: "Deskripsi bisnis wajib diisi.",
  templateId: "Template wajib dipilih.",
  phone: "Nomor telepon wajib diisi.",
  whatsapp: "Nomor WhatsApp wajib diisi.",
};

const emptyService = (): Service => ({
  id: Date.now(),
  businessId: 0,
  name: "",
  description: "",
  icon: "sparkles",
});

const emptyBusiness = (): Business => ({
  id: 0,
  slug: "",
  name: "",
  tagline: "",
  description: "",
  heroImage: null,
  heroCtaLabel: "Contact Us",
  heroCtaUrl: "#contact",
  phone: "",
  whatsapp: "",
  address: "",
  metaTitle: "",
  metaDescription: "",
  ogImage: null,
  templateId: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  services: [emptyService()],
});

function validateDraft(draft: Business) {
  const errors: string[] = [];

  if (!draft.name.trim()) {
    errors.push(REQUIRED_FIELD_MESSAGES.name);
  }

  if (!draft.slug.trim() || !/^[a-z0-9-]+$/.test(draft.slug.trim())) {
    errors.push(REQUIRED_FIELD_MESSAGES.slug);
  }

  if (!draft.tagline.trim()) {
    errors.push(REQUIRED_FIELD_MESSAGES.tagline);
  }

  if (!draft.description.trim()) {
    errors.push(REQUIRED_FIELD_MESSAGES.description);
  }

  if (!draft.templateId) {
    errors.push(REQUIRED_FIELD_MESSAGES.templateId);
  }

  if (!draft.phone.trim()) {
    errors.push(REQUIRED_FIELD_MESSAGES.phone);
  }

  if (!draft.whatsapp.trim()) {
    errors.push(REQUIRED_FIELD_MESSAGES.whatsapp);
  }

  if (draft.services.length === 0) {
    errors.push("Minimal harus ada satu layanan.");
  }

  draft.services.forEach((service, index) => {
    if (!service.name.trim()) {
      errors.push(`Nama layanan ke-${index + 1} wajib diisi.`);
    }

    if (!service.description.trim()) {
      errors.push(`Deskripsi layanan ke-${index + 1} wajib diisi.`);
    }
  });

  return errors;
}

export function BusinessManager({
  initialBusinesses,
  templates,
}: {
  initialBusinesses: Business[];
  templates: Template[];
}) {
  const usesSupabaseStorage = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const [businesses, setBusinesses] = useState(initialBusinesses);
  const [selectedId, setSelectedId] = useState(initialBusinesses[0]?.id ?? 0);
  const [draft, setDraft] = useState<Business>(
    initialBusinesses[0] ? structuredClone(initialBusinesses[0]) : emptyBusiness(),
  );
  const [notice, setNotice] = useState<Notice | null>(null);
  const [uploadTarget, setUploadTarget] = useState<"heroImage" | "ogImage" | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!notice) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setNotice(null), 3500);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  function showNotice(type: Notice["type"], message: string) {
    setNotice({ type, message });
  }

  function selectBusiness(id: number) {
    setSelectedId(id);
    const target = businesses.find((business) => business.id === id);
    if (target) {
      setDraft(structuredClone(target));
      setNotice(null);
    }
  }

  function startCreate() {
    setSelectedId(0);
    setDraft(emptyBusiness());
    setNotice({ type: "info", message: "Mode create aktif. Lengkapi field penting lalu simpan." });
  }

  function updateField<Key extends keyof Business>(key: Key, value: Business[Key]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function updateService(index: number, key: keyof Service, value: string) {
    setDraft((current) => ({
      ...current,
      services: current.services.map((service, serviceIndex) =>
        serviceIndex === index ? { ...service, [key]: value } : service,
      ),
    }));
  }

  function addService() {
    setDraft((current) => ({ ...current, services: [...current.services, emptyService()] }));
  }

  function removeService(index: number) {
    setDraft((current) => ({
      ...current,
      services: current.services.filter((_, serviceIndex) => serviceIndex !== index),
    }));
  }

  async function handleSave() {
    const validationErrors = validateDraft(draft);
    if (validationErrors.length > 0) {
      showNotice("error", validationErrors[0]);
      return;
    }

    setIsSaving(true);
    setNotice(null);

    try {
      const saved = await saveBusiness(draft);
      const nextBusinesses = businesses.some((item) => item.id === saved.id)
        ? businesses.map((item) => (item.id === saved.id ? saved : item))
        : [saved, ...businesses];

      setBusinesses(nextBusinesses);
      setSelectedId(saved.id);
      setDraft(structuredClone(saved));
      showNotice("success", draft.id ? "Perubahan bisnis berhasil disimpan." : "Bisnis baru berhasil dibuat.");
    } catch (error) {
      showNotice("error", error instanceof Error ? error.message : "Failed to save business.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!draft.id) {
      startCreate();
      return;
    }

    if (!window.confirm(`Hapus bisnis "${draft.name}"? Tindakan ini tidak bisa dibatalkan.`)) {
      return;
    }

    setIsDeleting(true);
    setNotice(null);

    try {
      await deleteBusinessById(draft.id);
      const nextBusinesses = businesses.filter((business) => business.id !== draft.id);
      setBusinesses(nextBusinesses);
      if (nextBusinesses[0]) {
        setSelectedId(nextBusinesses[0].id);
        setDraft(structuredClone(nextBusinesses[0]));
      } else {
        startCreate();
      }
      showNotice("success", "Bisnis berhasil dihapus.");
    } catch (error) {
      showNotice("error", error instanceof Error ? error.message : "Failed to delete business.");
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleImageUpload(field: "heroImage" | "ogImage", file: File | null) {
    if (!file) {
      return;
    }

    setNotice(null);
    setUploadTarget(field);

    try {
      const uploadedPath = await uploadAdminImage(file);
      updateField(field, uploadedPath);
      showNotice("success", `${field === "heroImage" ? "Hero image" : "OpenGraph image"} berhasil di-upload.`);
    } catch (uploadError) {
      showNotice("error", uploadError instanceof Error ? uploadError.message : "Failed to upload image.");
    } finally {
      setUploadTarget(null);
    }
  }

  const selectedTemplate = templates.find((template) => template.id === draft.templateId) ?? null;
  const isBusy = isSaving || isDeleting || uploadTarget !== null;

  return (
    <main className="admin-grid min-h-screen px-6 py-10 md:px-10">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.34fr_0.66fr]">
        <aside className="glass-panel rounded-[2rem] p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold text-white">Businesses</h1>
              <p className="text-sm text-slate-400">Create and manage slug-based pages.</p>
            </div>
            <button
              onClick={startCreate}
              className="rounded-full bg-cyan-300 p-2 text-slate-950"
              type="button"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
          <div className="space-y-3">
            {businesses.map((business) => (
              <button
                key={business.id}
                onClick={() => selectBusiness(business.id)}
                type="button"
                className={`w-full rounded-3xl border p-4 text-left transition ${
                  selectedId === business.id
                    ? "border-cyan-300/35 bg-cyan-300/10"
                    : "border-white/10 bg-white/5 hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-white">{business.name}</p>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
                    Edit
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-400">/{business.slug}</p>
              </button>
            ))}
          </div>
        </aside>

        <section className="glass-panel rounded-[2rem] p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {draft.id ? `Edit ${draft.name}` : "Create new business"}
              </h2>
              <p className="text-sm text-slate-400">
                Hero content, services, contacts, SEO, template assignment, and image files.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {draft.slug ? (
                <Link
                  href={`/${draft.slug}`}
                  className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm font-semibold text-white"
                >
                  Preview page
                </Link>
              ) : null}
              <button
                onClick={handleDelete}
                type="button"
                disabled={isBusy}
                className="rounded-full border border-rose-400/25 bg-rose-400/10 px-4 py-2 text-sm font-semibold text-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
              <button
                onClick={handleSave}
                type="button"
                disabled={isBusy}
                className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "Saving..." : draft.id ? "Save changes" : "Save business"}
              </button>
            </div>
          </div>

          <div className="mb-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/70">Template Active</p>
              <p className="mt-3 text-lg font-semibold text-white">{selectedTemplate?.name ?? "Belum dipilih"}</p>
              <p className="mt-1 text-sm text-slate-400">{selectedTemplate?.description ?? "Pilih template agar output halaman mengikuti visual yang sesuai."}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/70">Storage Strategy</p>
              <p className="mt-3 text-lg font-semibold text-white">
                {usesSupabaseStorage ? "Supabase Storage + URL in database" : "File path only in database"}
              </p>
              <p className="mt-1 text-sm text-slate-400">
                {usesSupabaseStorage
                  ? "Di Vercel gambar akan di-upload ke Supabase Storage, lalu database hanya menyimpan URL publiknya."
                  : "Di lokal gambar disimpan ke folder public/uploads/businesses, database hanya menyimpan path."}
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Business name">
              <input value={draft.name} onChange={(event) => updateField("name", event.target.value)} className="input" />
            </Field>
            <Field label="Slug">
              <input value={draft.slug} onChange={(event) => updateField("slug", event.target.value.toLowerCase())} className="input" />
            </Field>
            <Field label="Tagline">
              <input value={draft.tagline} onChange={(event) => updateField("tagline", event.target.value)} className="input" />
            </Field>
            <Field label="Template">
              <select
                value={draft.templateId ?? ""}
                onChange={(event) => updateField("templateId", event.target.value ? Number(event.target.value) : null)}
                className="input"
              >
                <option value="">Pilih template</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Description">
            <textarea
              value={draft.description}
              onChange={(event) => updateField("description", event.target.value)}
              className="input min-h-28"
            />
          </Field>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Field label="Hero CTA label">
              <input value={draft.heroCtaLabel} onChange={(event) => updateField("heroCtaLabel", event.target.value)} className="input" />
            </Field>
            <Field label="Hero CTA URL">
              <input value={draft.heroCtaUrl} onChange={(event) => updateField("heroCtaUrl", event.target.value)} className="input" />
            </Field>
            <Field label="Phone">
              <input value={draft.phone} onChange={(event) => updateField("phone", event.target.value)} className="input" />
            </Field>
            <Field label="WhatsApp">
              <input value={draft.whatsapp} onChange={(event) => updateField("whatsapp", event.target.value)} className="input" />
            </Field>
          </div>

          <Field label="Address">
            <textarea
              value={draft.address}
              onChange={(event) => updateField("address", event.target.value)}
              className="input min-h-24"
            />
          </Field>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Field label="Hero image URL">
              <input
                value={draft.heroImage ?? ""}
                onChange={(event) => updateField("heroImage", event.target.value || null)}
                className="input"
              />
            </Field>
            <Field label="Upload hero image">
              <input
                type="file"
                accept="image/*"
                onChange={(event) => void handleImageUpload("heroImage", event.target.files?.[0] ?? null)}
                className="input file:mr-3 file:rounded-full file:border-0 file:bg-cyan-300 file:px-4 file:py-2 file:font-semibold file:text-slate-950"
              />
              <p className="mt-2 text-xs text-slate-400">
                {uploadTarget === "heroImage"
                  ? "Uploading hero image..."
                  : usesSupabaseStorage
                    ? "Upload via AJAX aman, file disimpan ke Supabase Storage."
                    : "Upload via AJAX aman, file disimpan ke public/uploads/businesses."}
              </p>
            </Field>
            <Field label="Meta title">
              <input value={draft.metaTitle} onChange={(event) => updateField("metaTitle", event.target.value)} className="input" />
            </Field>
            <Field label="OpenGraph image">
              <input
                value={draft.ogImage ?? ""}
                onChange={(event) => updateField("ogImage", event.target.value || null)}
                className="input"
              />
            </Field>
            <Field label="Upload OpenGraph image">
              <input
                type="file"
                accept="image/*"
                onChange={(event) => void handleImageUpload("ogImage", event.target.files?.[0] ?? null)}
                className="input file:mr-3 file:rounded-full file:border-0 file:bg-cyan-300 file:px-4 file:py-2 file:font-semibold file:text-slate-950"
              />
              <p className="mt-2 text-xs text-slate-400">
                {uploadTarget === "ogImage" ? "Uploading OpenGraph image..." : "Gunakan file khusus untuk thumbnail sosial bila perlu."}
              </p>
            </Field>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <ImagePreviewCard
              title="Hero Image Preview"
              src={draft.heroImage}
              onClear={() => updateField("heroImage", null)}
            />
            <ImagePreviewCard
              title="OpenGraph Preview"
              src={draft.ogImage}
              onClear={() => updateField("ogImage", null)}
            />
          </div>

          <Field label="Meta description">
            <textarea
              value={draft.metaDescription}
              onChange={(event) => updateField("metaDescription", event.target.value)}
              className="input min-h-24"
            />
          </Field>

          <div className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Services</h3>
              <button
                onClick={addService}
                type="button"
                className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm font-semibold text-white"
              >
                Add service
              </button>
            </div>
            <div className="space-y-4">
              {draft.services.map((service, index) => (
                <div key={`${service.id}-${index}`} className="rounded-3xl border border-white/10 bg-slate-950/30 p-4">
                  <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
                    <Field label="Service name">
                      <input
                        value={service.name}
                        onChange={(event) => updateService(index, "name", event.target.value)}
                        className="input"
                      />
                    </Field>
                    <Field label="Icon key">
                      <IconKeySelect
                        value={service.icon}
                        onChange={(value) => updateService(index, "icon", value)}
                      />
                    </Field>
                    <button
                      onClick={() => removeService(index)}
                      type="button"
                      className="mt-7 flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-300/20 bg-rose-400/10 text-rose-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <Field label="Description">
                    <textarea
                      value={service.description}
                      onChange={(event) => updateService(index, "description", event.target.value)}
                      className="input mt-3 min-h-24"
                    />
                  </Field>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {notice ? (
        <div className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-md">
          <div
            className={`rounded-[1.5rem] border px-4 py-3 shadow-[0_24px_60px_rgba(2,15,12,0.32)] backdrop-blur ${
              notice.type === "success"
                ? "border-emerald-300/25 bg-emerald-400/14 text-emerald-100"
                : notice.type === "error"
                  ? "border-rose-300/25 bg-rose-400/14 text-rose-100"
                  : "border-cyan-300/25 bg-cyan-400/14 text-cyan-100"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm leading-6">{notice.message}</p>
              <button type="button" onClick={() => setNotice(null)} className="shrink-0 rounded-full p-1">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mt-4 block">
      <span className="mb-2 block text-sm text-slate-300">{label}</span>
      {children}
    </label>
  );
}

function ImagePreviewCard({
  title,
  src,
  onClear,
}: {
  title: string;
  src: string | null;
  onClear: () => void;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="text-xs text-slate-400">Preview ringan dari path file yang tersimpan.</p>
        </div>
        {src ? (
          <div className="flex gap-2">
            <a
              href={src}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-white"
            >
              <span className="inline-flex items-center gap-1">
                Preview
                <ExternalLink className="h-3.5 w-3.5" />
              </span>
            </a>
            <button
              type="button"
              onClick={onClear}
              className="rounded-full border border-rose-300/20 px-3 py-1 text-xs font-semibold text-rose-100"
            >
              Clear
            </button>
          </div>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-[1.25rem] border border-white/10 bg-slate-950/45">
        {src ? (
          <Image
            src={src}
            alt={title}
            width={960}
            height={540}
            unoptimized
            className="h-48 w-full object-cover"
          />
        ) : (
          <div className="flex h-48 items-center justify-center text-sm text-slate-500">
            Belum ada gambar.
          </div>
        )}
      </div>
    </div>
  );
}

function IconKeySelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selectedOption = iconOptions.find((option) => option.key === value) ?? iconOptions[0];
  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return iconOptions;
    }

    return iconOptions.filter(
      (option) =>
        option.label.toLowerCase().includes(normalizedQuery) ||
        option.key.toLowerCase().includes(normalizedQuery),
    );
  }, [query]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="input flex items-center justify-between gap-3 text-left"
      >
        <span className="flex items-center gap-3">
          <selectedOption.Icon className="h-5 w-5 text-cyan-200" />
          <span>
            <span className="block text-sm font-semibold text-white">{selectedOption.label}</span>
            <span className="block text-xs text-slate-400">{selectedOption.key}</span>
          </span>
        </span>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen ? (
        <div className="absolute z-30 mt-3 w-full rounded-[1.25rem] border border-white/10 bg-[#08231d] p-3 shadow-[0_24px_60px_rgba(2,15,12,0.35)]">
          <div className="mb-3 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari icon..."
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            />
          </div>

          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {filteredOptions.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => {
                  onChange(option.key);
                  setIsOpen(false);
                  setQuery("");
                }}
                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left transition ${
                  option.key === value
                    ? "bg-cyan-300/14 text-cyan-100"
                    : "bg-white/4 text-slate-200 hover:bg-white/8"
                }`}
              >
                <option.Icon className="h-5 w-5 shrink-0 text-cyan-200" />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{option.label}</span>
                  <span className="block text-xs text-slate-400">{option.key}</span>
                </span>
              </button>
            ))}

            {filteredOptions.length === 0 ? (
              <div className="rounded-2xl bg-white/4 px-3 py-3 text-sm text-slate-400">
                Icon tidak ditemukan.
              </div>
            ) : null}
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>{filteredOptions.length} icon</span>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setQuery("");
              }}
              className="rounded-full border border-white/10 px-3 py-1 text-slate-300"
            >
              Tutup
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
