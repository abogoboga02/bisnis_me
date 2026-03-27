"use client";

import { useMemo, useState } from "react";
import { LayoutTemplate } from "lucide-react";
import type { MarketingTemplate, TemplateCategory } from "@/lib/marketing-content";

export function TemplateCatalogBrowser({ templates }: { templates: MarketingTemplate[] }) {
  const [activeFilter, setActiveFilter] = useState<TemplateCategory | "all">("all");
  const filterOptions: Array<{ label: string; value: TemplateCategory | "all" }> = [
    { label: "Semua", value: "all" },
    { label: "Company Profile", value: "company-profile" },
    { label: "Travel", value: "travel" },
    { label: "Restoran", value: "restoran" },
    { label: "Jasa", value: "jasa" },
    { label: "Toko Online", value: "toko-online" },
    { label: "Personal Brand", value: "personal-brand" },
  ];

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
        {filteredTemplates.map((template) => (
          <article
            key={template.name}
            className="premium-card rounded-[1.75rem] p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <span
                className="premium-kicker rounded-[14px] px-3 py-1.5 text-[11px] font-semibold text-[#06231d]"
                style={{ backgroundImage: `linear-gradient(135deg, ${template.accent}, #E3EF26)` }}
              >
                {template.categoryLabel}
              </span>
              <LayoutTemplate className="h-5 w-5 text-[#e3ef26]" />
            </div>

            <h3 className="mt-5 text-[26px] font-semibold text-[#fffdee]">{template.name}</h3>

            <p className="mt-4 text-sm text-[#fffdee]/52">Cocok untuk bisnis</p>
            <p className="mt-1 text-sm leading-7 text-[#fffdee]/80">{template.fit}</p>

            <p className="mt-4 text-sm text-[#fffdee]/52">Fitur utama</p>
            <p className="mt-1 text-sm leading-7 text-[#fffdee]/80">{template.feature}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
