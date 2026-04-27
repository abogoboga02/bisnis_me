"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ChevronDown, ExternalLink, Search, Trash2, X } from "lucide-react";
import { ADMIN_UPLOAD_HELPER_TEXT } from "@/lib/admin-upload";
import { buildWhatsAppHref } from "@/lib/contact-utils";
import { iconOptions } from "@/lib/icon-map";
import { slugify, type ArrayFieldKey, type ImageTarget } from "@/lib/business-draft";
import type { Business, GalleryItem, Service, Testimonial } from "@/lib/types";

type Notice = { type: "success" | "error" | "info"; message: string };
type UpdateBusinessField = <Key extends keyof Business>(key: Key, value: Business[Key]) => void;
type UpdateBusinessArrayItem = <T extends Service | Testimonial | GalleryItem>(
  key: ArrayFieldKey,
  index: number,
  patch: Partial<T>,
) => void;

export function CoreFields({ draft, updateField }: { draft: Business; updateField: UpdateBusinessField }) {
  const suggestedSlug = slugify(draft.name);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Field label="Nama bisnis" required><input value={draft.name} onChange={(event) => updateField("name", event.target.value)} className="input" placeholder="Contoh: Studio Arunika" /></Field>
      <Field label="Tombol utama" required><input value={draft.heroCtaLabel} onChange={(event) => updateField("heroCtaLabel", event.target.value)} className="input" placeholder="Contoh: Hubungi Kami" /></Field>
      <Field label="Tagline singkat" required><input value={draft.tagline} onChange={(event) => updateField("tagline", event.target.value)} className="input" placeholder="Contoh: Konsultan brand dengan presentasi yang rapi dan premium." /></Field>
      <div className="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
        <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/70">Link halaman</p>
        <p className="mt-2 break-all font-semibold text-white">/{draft.slug || suggestedSlug || "nama-bisnis"}</p>
        <p className="mt-2 text-xs leading-6 text-slate-400">
          Link halaman dibuat otomatis dari nama bisnis agar pengguna tidak perlu mengatur slug manual.
        </p>
      </div>
      <Field label="Deskripsi bisnis" required className="md:col-span-2"><textarea value={draft.description} onChange={(event) => updateField("description", event.target.value)} className="input min-h-28" placeholder="Jelaskan bisnis, layanan utama, dan nilai yang ingin ditonjolkan." /></Field>
    </div>
  );
}

export function CopyFields({ draft, updateField }: { draft: Business; updateField: UpdateBusinessField }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <StaticSectionLabel label="Section Tentang Bisnis" />
      <Field label="Isi section Tentang Bisnis" required><textarea value={draft.aboutIntro} onChange={(event) => updateField("aboutIntro", event.target.value)} className="input min-h-24" /></Field>
      <StaticSectionLabel label="Section Layanan Utama" />
      <Field label="Isi section Layanan Utama" required><textarea value={draft.servicesIntro} onChange={(event) => updateField("servicesIntro", event.target.value)} className="input min-h-24" /></Field>
      <StaticSectionLabel label="Section Testimoni" />
      <Field label="Isi section Testimoni" required><textarea value={draft.testimonialsIntro} onChange={(event) => updateField("testimonialsIntro", event.target.value)} className="input min-h-24" /></Field>
      <StaticSectionLabel label="Section Galeri" />
      <Field label="Isi section Galeri" required><textarea value={draft.galleryIntro} onChange={(event) => updateField("galleryIntro", event.target.value)} className="input min-h-24" /></Field>
      <StaticSectionLabel label="Section Kontak" />
      <Field label="Isi section Kontak" required><textarea value={draft.contactIntro} onChange={(event) => updateField("contactIntro", event.target.value)} className="input min-h-24" /></Field>
    </div>
  );
}

export function BoardmemoFields({ draft, updateField }: { draft: Business; updateField: UpdateBusinessField }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Field label="Label kecil memo">
        <input
          value={draft.boardmemoLabel}
          onChange={(event) => updateField("boardmemoLabel", event.target.value)}
          className="input"
          placeholder="Contoh: Board Memo"
        />
        <p className="mt-2 text-xs text-slate-400">Kosongkan jika ingin memakai default template.</p>
      </Field>
      <Field label="Judul boardmemo">
        <input
          value={draft.boardmemoTitle}
          onChange={(event) => updateField("boardmemoTitle", event.target.value)}
          className="input"
          placeholder="Contoh: Structured direction for a sharper first impression."
        />
      </Field>
      <Field label="Isi boardmemo" className="md:col-span-2">
        <textarea
          value={draft.boardmemoBody}
          onChange={(event) => updateField("boardmemoBody", event.target.value)}
          className="input min-h-28"
          placeholder="Isi memo singkat yang akan tampil di panel hero Atelier Mosaic."
        />
      </Field>
    </div>
  );
}

export function ServicesEditorBlock({
  services,
  updateArrayItem,
  addArrayItem,
  removeArrayItem,
  fixed = false,
  minFilledCount = 1,
}: {
  services: Service[];
  updateArrayItem: UpdateBusinessArrayItem;
  addArrayItem?: (key: ArrayFieldKey) => void;
  removeArrayItem?: (key: ArrayFieldKey, index: number) => void;
  fixed?: boolean;
  minFilledCount?: number;
}) {
  return (
    <>
      <ArrayHeader
        title="Layanan"
        actionLabel={fixed ? `${services.length} slot tetap` : "Tambah layanan"}
        onClick={() => addArrayItem?.("services")}
        disabled={fixed}
      />
      {services.map((service, index) => (
        <ArrayCard key={`${service.id}-${index}`}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-white">
              Layanan {index + 1}
              {fixed && index >= minFilledCount ? " (opsional)" : ""}
            </p>
            {fixed ? (
              <FixedSlotBadge />
            ) : removeArrayItem ? (
              <DangerIconButton onClick={() => removeArrayItem("services", index)} compact />
            ) : null}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Nama layanan" required={fixed ? index < minFilledCount : true}><input value={service.name} onChange={(event) => updateArrayItem<Service>("services", index, { name: event.target.value })} className="input" /></Field>
            <Field label="Ikon layanan" required={fixed ? index < minFilledCount : true}><IconKeySelect value={service.icon} onChange={(value) => updateArrayItem<Service>("services", index, { icon: value })} /></Field>
          </div>
          <Field label="Deskripsi layanan" required={fixed ? index < minFilledCount : true}><textarea value={service.description} onChange={(event) => updateArrayItem<Service>("services", index, { description: event.target.value })} className="input min-h-24" /></Field>
        </ArrayCard>
      ))}
    </>
  );
}

export function TestimonialsBlock({
  testimonials,
  updateArrayItem,
  addArrayItem,
  removeArrayItem,
  fixed = false,
}: {
  testimonials: Testimonial[];
  updateArrayItem: UpdateBusinessArrayItem;
  addArrayItem?: (key: ArrayFieldKey) => void;
  removeArrayItem?: (key: ArrayFieldKey, index: number) => void;
  fixed?: boolean;
}) {
  return (
    <>
      <ArrayHeader title="Testimoni" actionLabel={fixed ? `${testimonials.length} slot tetap` : "Tambah testimoni"} onClick={() => addArrayItem?.("testimonials")} disabled={fixed} />
      {testimonials.map((item, index) => (
        <ArrayCard key={`${item.id}-${index}`}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-white">Testimoni {index + 1}</p>
            {fixed ? (
              <FixedSlotBadge />
            ) : removeArrayItem ? (
              <DangerIconButton onClick={() => removeArrayItem("testimonials", index)} compact />
            ) : null}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Nama pelanggan" required><input value={item.name} onChange={(event) => updateArrayItem<Testimonial>("testimonials", index, { name: event.target.value })} className="input" /></Field>
            <Field label="Peran atau jabatan" required><input value={item.role} onChange={(event) => updateArrayItem<Testimonial>("testimonials", index, { role: event.target.value })} className="input" /></Field>
          </div>
          <Field label="Isi testimoni" required><textarea value={item.quote} onChange={(event) => updateArrayItem<Testimonial>("testimonials", index, { quote: event.target.value })} className="input min-h-24" /></Field>
        </ArrayCard>
      ))}
    </>
  );
}

export function GalleryBlock({
  galleryItems,
  updateArrayItem,
  addArrayItem,
  removeArrayItem,
  uploadImage,
  uploadTarget,
  fixed = false,
}: {
  galleryItems: GalleryItem[];
  updateArrayItem: UpdateBusinessArrayItem;
  addArrayItem: (key: ArrayFieldKey) => void;
  removeArrayItem: (key: ArrayFieldKey, index: number) => void;
  uploadImage: (target: ImageTarget, file: File | null) => Promise<void>;
  uploadTarget: string | null;
  fixed?: boolean;
}) {
  return (
    <>
      <ArrayHeader title="Galeri" actionLabel={fixed ? `${galleryItems.length} slot tetap` : "Tambah gambar"} onClick={() => addArrayItem("galleryItems")} disabled={fixed} />
      {galleryItems.map((item, index) => (
        <ArrayCard key={`${item.id}-${index}`}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-white">Gambar galeri {index + 1}</p>
            {fixed ? <FixedSlotBadge /> : <DangerIconButton onClick={() => removeArrayItem("galleryItems", index)} compact />}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Judul gambar" required><input value={item.title} onChange={(event) => updateArrayItem<GalleryItem>("galleryItems", index, { title: event.target.value })} className="input" /></Field>
            <Field label="Keterangan" required><textarea value={item.caption} onChange={(event) => updateArrayItem<GalleryItem>("galleryItems", index, { caption: event.target.value })} className="input min-h-24" /></Field>
          </div>
          <UploadField
            label="Upload gambar galeri"
            required
            statusText={uploadTarget === `gallery-${index}` ? "Mengunggah gambar..." : ADMIN_UPLOAD_HELPER_TEXT}
            onChange={(event) => void uploadImage(`gallery-${index}`, event.target.files?.[0] ?? null)}
          />
          <ImagePreviewPanel emptyLabel="Belum ada gambar galeri." src={item.imageUrl || null} alt="Gallery preview" heightClassName="h-44" />
        </ArrayCard>
      ))}
    </>
  );
}

export function ContactBlock({
  draft,
  updateField,
  uploadImage,
  uploadTarget,
}: {
  draft: Business;
  updateField: UpdateBusinessField;
  uploadImage: (target: ImageTarget, file: File | null) => Promise<void>;
  uploadTarget: string | null;
}) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Telepon" required><input value={draft.phone} onChange={(event) => updateField("phone", event.target.value)} className="input" placeholder="6281234567890" inputMode="numeric" /><p className="mt-2 text-xs text-slate-400">Wajib diawali 62.</p></Field>
        <Field label="WhatsApp" required><input value={draft.whatsapp} onChange={(event) => updateField("whatsapp", event.target.value)} className="input" placeholder="6281234567890" inputMode="numeric" /><p className="mt-2 text-xs text-slate-400">Klik akan otomatis diarahkan ke {buildWhatsAppHref(draft.whatsapp || "62xxxxxxxxxx")}.</p></Field>
        <Field label="Alamat" required><textarea value={draft.address} onChange={(event) => updateField("address", event.target.value)} className="input min-h-24" /></Field>
        <UploadField
          label="Upload gambar utama"
          required
          statusText={uploadTarget === "heroImage" ? "Mengunggah gambar utama..." : ADMIN_UPLOAD_HELPER_TEXT}
          onChange={(event) => void uploadImage("heroImage", event.target.files?.[0] ?? null)}
        />
      </div>
      <div className="mt-6">
        <ImagePreviewCard
          title="Preview gambar utama"
          src={draft.heroImage}
          onClear={() => {
            updateField("heroImage", null);
            updateField("ogImage", null);
          }}
        />
      </div>
    </>
  );
}

export function Section({
  title,
  eyebrow,
  description,
  actions,
  children,
  className = "",
}: {
  title: string;
  eyebrow?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-[1.75rem] border border-white/10 bg-white/5 p-5 ${className}`}>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/70">{eyebrow}</p>
          <h3 className="mt-3 text-xl font-semibold text-white">{title}</h3>
          {description ? <p className="mt-2 text-sm leading-7 text-slate-400">{description}</p> : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function InfoCard({ label, title, description }: { label: string; title: string; description: string }) {
  return <div className="rounded-3xl border border-white/10 bg-white/5 p-4"><p className="text-xs uppercase tracking-[0.22em] text-cyan-200/70">{label}</p><p className="mt-3 text-lg font-semibold text-white">{title}</p><p className="mt-1 text-sm text-slate-400">{description}</p></div>;
}

export function TemplateStat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-[1.4rem] border border-[#17312a]/10 bg-white/55 px-4 py-4"><p className="text-[11px] uppercase tracking-[0.28em] text-[#8c5b48]">{label}</p><p className="mt-2 text-lg font-semibold text-[#17312a]">{value}</p></div>;
}

export function NoticeToast({ notice, onClose }: { notice: Notice; onClose: () => void }) {
  return <div className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-md"><div className={`rounded-[1.5rem] border px-4 py-3 shadow-[0_24px_60px_rgba(2,15,12,0.32)] backdrop-blur ${notice.type === "success" ? "border-emerald-300/25 bg-emerald-400/14 text-emerald-100" : notice.type === "error" ? "border-rose-300/25 bg-rose-400/14 text-rose-100" : "border-cyan-300/25 bg-cyan-400/14 text-cyan-100"}`}><div className="flex items-start justify-between gap-3"><p className="text-sm leading-6">{notice.message}</p><button type="button" onClick={onClose} className="shrink-0 rounded-full p-1"><X className="h-4 w-4" /></button></div></div></div>;
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

function FixedSlotBadge() {
  return <span className="rounded-full border border-[#d4b089]/25 bg-[#d4b089]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f2d6b8]">Fixed slot</span>;
}

function UploadField({
  label,
  required = false,
  statusText,
  onChange,
}: {
  label: string;
  required?: boolean;
  statusText: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
}) {
  return (
    <Field label={label} required={required}>
      <input type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={onChange} className="input file:mr-3 file:rounded-full file:border-0 file:bg-cyan-300 file:px-4 file:py-2 file:font-semibold file:text-slate-950" />
      <p className="mt-2 text-xs text-slate-400">{statusText}</p>
    </Field>
  );
}

function StaticSectionLabel({ label }: { label: string }) {
  return (
    <div className="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
      <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/70">Label section</p>
      <p className="mt-2 font-semibold text-white">{label}</p>
      <p className="mt-2 text-xs leading-6 text-slate-400">Judul section dikunci mengikuti template agar struktur halaman tetap konsisten.</p>
    </div>
  );
}

function ImagePreviewCard({ title, src, onClear }: { title: string; src: string | null; onClear: () => void }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="text-xs text-slate-400">Preview ringan dari path file yang tersimpan.</p>
        </div>
        {src ? (
          <div className="flex gap-2">
            <a href={src} target="_blank" rel="noreferrer" className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-white"><span className="inline-flex items-center gap-1">Preview<ExternalLink className="h-3.5 w-3.5" /></span></a>
            <button type="button" onClick={onClear} className="rounded-full border border-rose-300/20 px-3 py-1 text-xs font-semibold text-rose-100">Clear</button>
          </div>
        ) : null}
      </div>
      <ImagePreviewPanel emptyLabel="Belum ada gambar." src={src} alt={title} heightClassName="h-48" />
    </div>
  );
}

function ImagePreviewPanel({
  src,
  alt,
  emptyLabel,
  heightClassName,
}: {
  src: string | null;
  alt: string;
  emptyLabel: string;
  heightClassName: string;
}) {
  return (
    <div className="overflow-hidden rounded-[1.25rem] border border-white/10 bg-slate-950/45">
      {src ? (
        <Image src={src} alt={alt} width={960} height={540} loading="lazy" className={`${heightClassName} w-full object-cover`} />
      ) : (
        <div className={`flex items-center justify-center text-sm text-slate-500 ${heightClassName}`}>{emptyLabel}</div>
      )}
    </div>
  );
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
