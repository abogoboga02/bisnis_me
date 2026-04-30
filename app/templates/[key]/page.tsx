import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import { LandingPage } from "@/components/landing-page";
import { getCachedPublicTemplates } from "@/lib/business-store";
import { buildTemplatePreviewBusiness } from "@/lib/template-preview-data";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ key: string }>;
}): Promise<Metadata> {
  const { key } = await params;

  try {
    const templates = await getCachedPublicTemplates();
    const template = templates.find((item) => item.key === key);

    if (!template) {
      return {
        title: "Template Preview Not Found",
      };
    }

    return {
      title: `${template.name} Preview`,
      description: template.description,
    };
  } catch {
    return {
      title: "Template Preview",
      description: "Preview template bisnis.",
    };
  }
}

export default async function TemplatePreviewPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const templates = await getCachedPublicTemplates();
  const template = templates.find((item) => item.key === key);

  if (!template) {
    notFound();
  }

  const previewBusiness = buildTemplatePreviewBusiness(template);

  return (
    <div className="relative">
      <div className="fixed right-4 top-4 z-[60] flex flex-wrap items-center gap-3">
        <Link
          href="/templates"
          className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/86 px-4 py-2 text-sm font-semibold text-slate-900 shadow-[0_18px_40px_rgba(15,23,42,0.12)] backdrop-blur"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Templates
        </Link>
        <a
          href={`/${previewBusiness.slug}`}
          className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/86 px-4 py-2 text-sm font-semibold text-slate-900 shadow-[0_18px_40px_rgba(15,23,42,0.12)] backdrop-blur"
        >
          Live Style
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
      <LandingPage business={previewBusiness} />
    </div>
  );
}
