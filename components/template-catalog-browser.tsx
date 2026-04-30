"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, LayoutTemplate } from "lucide-react";
import { resolveTemplatePreviewImage } from "@/lib/template-preview-image";
import type { Template } from "@/lib/types";

export function TemplateCatalogBrowser({ templates }: { templates: Template[] }) {
  const [activeFilter, setActiveFilter] = useState<string>("all");

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
            <article key={template.id} className="premium-card rounded-[1.75rem] p-5">
              <div className="overflow-hidden rounded-[1.4rem] border border-[#e3ef26]/14 bg-[linear-gradient(135deg,rgba(226,251,206,0.18),rgba(227,239,38,0.14),rgba(7,102,83,0.2),rgba(6,35,29,0.72))]">
                {previewImage ? (
                  <Image
                    src={previewImage}
                    alt={template.name}
                    width={1200}
                    height={720}
                    loading="lazy"
                    className="aspect-video w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-video items-center justify-center text-sm text-[#fffdee]/62">
                    Preview image
                  </div>
                )}
              </div>

              <div className="mt-5 flex items-center justify-between gap-3">
                <span
                  className="premium-kicker rounded-[14px] px-3 py-1.5 text-[11px] font-semibold text-[#06231d]"
                  style={{ backgroundImage: `linear-gradient(135deg, ${template.accent ?? "#67e8f9"}, #E3EF26)` }}
                >
                  {template.categoryLabel || template.category}
                </span>
                <LayoutTemplate className="h-5 w-5 text-[#e3ef26]" />
              </div>

              <h3 className="mt-5 text-[26px] font-semibold text-[#fffdee]">{template.name}</h3>
              <p className="mt-4 text-sm leading-7 text-[#fffdee]/78">{template.description}</p>

              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-sm text-[#fffdee]/52">Cocok untuk bisnis</p>
                  <p className="mt-1 text-sm leading-7 text-[#fffdee]/80">{template.fit}</p>
                </div>
                <div>
                  <p className="text-sm text-[#fffdee]/52">Fitur utama</p>
                  <p className="mt-1 text-sm leading-7 text-[#fffdee]/80">{template.feature}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={`/templates/${template.key}`}
                  target="_blank"
                  rel="noreferrer"
                  className="premium-button-secondary inline-flex items-center gap-2 rounded-[14px] px-4 py-2.5 text-sm font-semibold"
                >
                  Preview template
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
