"use client";

import { useMemo, useState } from "react";
import { LayoutTemplate } from "lucide-react";
import type { MarketingTemplate, TemplateCategory } from "@/lib/marketing-content";

const filterOptions: Array<{ label: string; value: TemplateCategory | "all" }> = [
  { label: "Semua", value: "all" },
  { label: "Company Profile", value: "company-profile" },
  { label: "Travel", value: "travel" },
  { label: "Restoran", value: "restoran" },
  { label: "Jasa", value: "jasa" },
  { label: "Toko Online", value: "toko-online" },
  { label: "Personal Brand", value: "personal-brand" },
];

export function TemplateCatalogBrowser({ templates }: { templates: MarketingTemplate[] }) {
  const [activeFilter, setActiveFilter] = useState<TemplateCategory | "all">("all");

  const filteredTemplates = useMemo(() => {
    if (activeFilter === "all") {
      return templates;
    }

    return templates.filter((template) => template.category === activeFilter);
  }, [activeFilter, templates]);

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
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                isActive
                  ? "border-cyan-300/30 bg-cyan-300/12 text-cyan-100"
                  : "border-white/10 bg-white/5 text-slate-300 hover:border-cyan-300/25 hover:bg-white/8"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredTemplates.map((template) => (
          <article
            key={template.name}
            className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 transition hover:-translate-y-1 hover:border-cyan-300/25 hover:bg-white/8"
          >
            <div className="flex items-center justify-between gap-3">
              <span
                className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-950"
                style={{ backgroundColor: template.accent }}
              >
                {template.categoryLabel}
              </span>
              <LayoutTemplate className="h-5 w-5 text-cyan-300" />
            </div>

            <h3 className="mt-5 text-2xl font-semibold text-white">{template.name}</h3>

            <p className="mt-4 text-sm text-slate-400">Cocok untuk bisnis</p>
            <p className="mt-1 text-sm leading-7 text-slate-200">{template.fit}</p>

            <p className="mt-4 text-sm text-slate-400">Fitur utama</p>
            <p className="mt-1 text-sm leading-7 text-slate-200">{template.feature}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
