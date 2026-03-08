"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import type { Business, Service, Template } from "@/lib/types";
import { deleteBusinessById, saveBusiness } from "@/lib/client-api";

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

export function BusinessManager({
  initialBusinesses,
  templates,
}: {
  initialBusinesses: Business[];
  templates: Template[];
}) {
  const [businesses, setBusinesses] = useState(initialBusinesses);
  const [selectedId, setSelectedId] = useState(initialBusinesses[0]?.id ?? 0);
  const [draft, setDraft] = useState<Business>(
    initialBusinesses[0] ? structuredClone(initialBusinesses[0]) : emptyBusiness(),
  );
  const [status, setStatus] = useState("");

  function selectBusiness(id: number) {
    setSelectedId(id);
    const target = businesses.find((business) => business.id === id);
    if (target) {
      setDraft(structuredClone(target));
    }
  }

  function startCreate() {
    setSelectedId(0);
    setDraft(emptyBusiness());
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
    const saved = await saveBusiness(draft);
    const nextBusinesses = businesses.some((item) => item.id === saved.id)
      ? businesses.map((item) => (item.id === saved.id ? saved : item))
      : [saved, ...businesses];
    setBusinesses(nextBusinesses);
    setSelectedId(saved.id);
    setDraft(structuredClone(saved));
    setStatus("Business saved.");
  }

  async function handleDelete() {
    if (!draft.id) {
      startCreate();
      return;
    }

    await deleteBusinessById(draft.id);
    const nextBusinesses = businesses.filter((business) => business.id !== draft.id);
    setBusinesses(nextBusinesses);
    if (nextBusinesses[0]) {
      setSelectedId(nextBusinesses[0].id);
      setDraft(structuredClone(nextBusinesses[0]));
    } else {
      startCreate();
    }
    setStatus("Business deleted.");
  }

  function handleHeroImageUpload(file: File | null) {
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      updateField("heroImage", String(reader.result));
    };
    reader.readAsDataURL(file);
  }

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
                <p className="font-semibold text-white">{business.name}</p>
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
              <p className="text-sm text-slate-400">Hero content, services, contacts, SEO, and template assignment.</p>
            </div>
            <div className="flex gap-3">
              {draft.slug ? (
                <Link href={`/${draft.slug}`} className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm font-semibold text-white">
                  Preview page
                </Link>
              ) : null}
              <button onClick={handleDelete} type="button" className="rounded-full border border-rose-400/25 bg-rose-400/10 px-4 py-2 text-sm font-semibold text-rose-100">
                Delete
              </button>
              <button onClick={handleSave} type="button" className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950">
                Save business
              </button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Business name">
              <input value={draft.name} onChange={(event) => updateField("name", event.target.value)} className="input" />
            </Field>
            <Field label="Slug">
              <input value={draft.slug} onChange={(event) => updateField("slug", event.target.value)} className="input" />
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
                <option value="">No template</option>
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
                onChange={(event) => handleHeroImageUpload(event.target.files?.[0] ?? null)}
                className="input file:mr-3 file:rounded-full file:border-0 file:bg-cyan-300 file:px-4 file:py-2 file:font-semibold file:text-slate-950"
              />
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
              <button onClick={addService} type="button" className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm font-semibold text-white">
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
                      <input
                        value={service.icon}
                        onChange={(event) => updateService(index, "icon", event.target.value)}
                        className="input"
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

          {status ? <p className="mt-6 text-sm text-cyan-100">{status}</p> : null}
        </section>
      </div>
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
