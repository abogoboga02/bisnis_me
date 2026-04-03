"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, LayoutTemplate, MonitorPlay, Sparkles, X } from "lucide-react";
import { resolveTemplatePreviewImage } from "@/lib/template-preview-image";
import type { Template } from "@/lib/types";

export function TemplateCatalogBrowser({ templates }: { templates: Template[] }) {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [activeTemplate, setActiveTemplate] = useState<Template | null>(null);
  const filterOptions = useMemo(
    () => [
      { label: "Semua", value: "all" },
      ...templates.reduce<Array<{ label: string; value: string }>>((result, template) => {
        if (!template.category) {
          return result;
        }

        if (result.some((item) => item.value === template.category)) {
          return result;
        }

        result.push({
          label: template.categoryLabel || template.category,
          value: template.category,
        });
        return result;
      }, []),
    ],
    [templates],
  );

  const filteredTemplates = useMemo(() => {
    if (activeFilter === "all") {
      return templates;
    }

    return templates.filter((template) => template.category === activeFilter);
  }, [activeFilter, templates]);
  const activePreviewImage = activeTemplate
    ? resolveTemplatePreviewImage(activeTemplate.key, activeTemplate.previewImage)
    : null;

  useEffect(() => {
    if (!activeTemplate) {
      document.body.style.removeProperty("overflow");
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActiveTemplate(null);
      }
    }

    window.addEventListener("keydown", handleKeydown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeydown);
    };
  }, [activeTemplate]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-3">
        {filterOptions.map((option) => {
          const isActive = option.value === activeFilter;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setActiveFilter(option.value)}
              className={`rounded-[14px] border px-4 py-2.5 text-sm font-semibold transition ${
                isActive
                  ? "border-[#e3ef26]/32 bg-[linear-gradient(135deg,rgba(226,251,206,0.22),rgba(227,239,38,0.12),rgba(7,102,83,0.26))] text-[#fffdee] shadow-[0_18px_40px_rgba(227,239,38,0.08)]"
                  : "premium-pill text-[#fffdee]/72 hover:-translate-y-1.5 hover:border-[#e3ef26]/30 hover:text-[#fffdee]"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredTemplates.map((template) => {
          const previewImage = resolveTemplatePreviewImage(template.key, template.previewImage);

          return (
            <article
              key={template.id}
              className="premium-card rounded-[1.75rem] p-5"
            >
              <div className="overflow-hidden rounded-[1.4rem] border border-[#e3ef26]/14 bg-[linear-gradient(135deg,rgba(226,251,206,0.18),rgba(227,239,38,0.14),rgba(7,102,83,0.2),rgba(6,35,29,0.72))]">
                {previewImage ? (
                  <Image src={previewImage} alt={template.name} width={1200} height={720} loading="lazy" className="aspect-video w-full object-cover" />
                ) : (
                  <div className="flex aspect-video items-center justify-center text-sm text-[#fffdee]/62">Preview Image</div>
                )}
              </div>

              <div className="mt-5 flex items-center justify-between gap-3">
                <span className="premium-kicker rounded-[14px] px-3 py-1.5 text-[11px] font-semibold text-[#06231d]" style={{ backgroundImage: `linear-gradient(135deg, ${template.accent ?? "#67e8f9"}, #E3EF26)` }}>
                  {template.categoryLabel || template.category}
                </span>
                <LayoutTemplate className="h-5 w-5 text-[#e3ef26]" />
              </div>

              <h3 className="mt-5 text-[26px] font-semibold text-[#fffdee]">{template.name}</h3>

              <p className="mt-4 text-sm text-[#fffdee]/52">Cocok untuk bisnis</p>
              <p className="mt-1 text-sm leading-7 text-[#fffdee]/80">{template.fit}</p>

              <p className="mt-4 text-sm text-[#fffdee]/52">Fitur utama</p>
              <p className="mt-1 text-sm leading-7 text-[#fffdee]/80">{template.feature}</p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTemplate(template)}
                  className="glow-ring premium-button inline-flex items-center gap-2 rounded-[14px] px-4 py-2.5 text-sm font-semibold"
                >
                  <MonitorPlay className="h-4 w-4" />
                  Preview Interaktif
                </button>
                <Link
                  href={`/templates/${template.key}`}
                  className="premium-button-secondary inline-flex items-center gap-2 rounded-[14px] px-4 py-2.5 text-sm font-semibold"
                >
                  Halaman Detail
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          );
        })}
      </div>

      {activeTemplate ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#041712]/84 p-4 backdrop-blur-md">
          <div className="relative flex h-[92vh] w-full max-w-7xl flex-col overflow-hidden rounded-[2rem] border border-[#e3ef26]/16 bg-[#08231d] shadow-[0_40px_120px_rgba(2,15,12,0.45)]">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 px-5 py-4 md:px-6">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#e3ef26]/20 bg-[#e3ef26]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#e3ef26]">
                  <Sparkles className="h-3.5 w-3.5" />
                  Preview Interaktif
                </div>
                <h3 className="mt-3 text-2xl font-semibold text-[#fffdee] md:text-3xl">{activeTemplate.name}</h3>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-[#fffdee]/70">{activeTemplate.description}</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/templates/${activeTemplate.key}`}
                  className="premium-button-secondary inline-flex items-center gap-2 rounded-[14px] px-4 py-2.5 text-sm font-semibold"
                >
                  Buka Halaman Detail
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => setActiveTemplate(null)}
                  className="inline-flex items-center gap-2 rounded-[14px] border border-white/12 bg-white/6 px-4 py-2.5 text-sm font-semibold text-[#fffdee]"
                >
                  <X className="h-4 w-4" />
                  Tutup
                </button>
              </div>
            </div>

            <div className="grid min-h-0 flex-1 gap-0 lg:grid-cols-[0.3fr_0.7fr]">
              <aside className="border-b border-white/10 bg-[linear-gradient(180deg,rgba(255,253,238,0.05),rgba(255,253,238,0.02))] p-5 lg:border-b-0 lg:border-r lg:p-6">
                <div className="overflow-hidden rounded-[1.4rem] border border-[#e3ef26]/14 bg-[linear-gradient(135deg,rgba(226,251,206,0.18),rgba(227,239,38,0.14),rgba(7,102,83,0.2),rgba(6,35,29,0.72))]">
                  {activePreviewImage ? (
                    <Image src={activePreviewImage} alt={activeTemplate.name} width={1200} height={720} loading="lazy" className="aspect-video w-full object-cover" />
                  ) : (
                    <div className="flex aspect-video items-center justify-center text-sm text-[#fffdee]/62">Preview Image</div>
                  )}
                </div>

                <div className="mt-5 space-y-5">
                  <InfoBlock label="Kategori" value={activeTemplate.categoryLabel || activeTemplate.category} />
                  <InfoBlock label="Cocok untuk" value={activeTemplate.fit} />
                  <InfoBlock label="Fitur utama" value={activeTemplate.feature} />
                </div>
              </aside>

              <div className="min-h-0 bg-[#02100d]">
                <iframe
                  key={activeTemplate.key}
                  src={`/templates/${activeTemplate.key}`}
                  title={`Preview ${activeTemplate.name}`}
                  className="h-full min-h-[60vh] w-full border-0 bg-white"
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#e3ef26]">{label}</p>
      <p className="mt-3 text-sm leading-7 text-[#fffdee]/76">{value}</p>
    </div>
  );
}
