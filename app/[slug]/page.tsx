import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBusinessBySlugFromDatabase } from "@/lib/business-store";
import { LandingPage } from "@/components/landing-page";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  let business = null;

  try {
    business = await getBusinessBySlugFromDatabase(slug);
  } catch {
    return {
      title: "Database belum siap",
      description: "Schema database production belum sinkron dengan aplikasi.",
    };
  }

  if (!business) {
    return {
      title: "Business not found",
      description: "The requested business page could not be found.",
    };
  }

  return {
    title: business.metaTitle,
    description: business.metaDescription,
    openGraph: {
      title: business.metaTitle,
      description: business.metaDescription,
      images: business.ogImage ? [{ url: business.ogImage }] : [],
    },
  };
}

export default async function BusinessSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let business = null;

  try {
    business = await getBusinessBySlugFromDatabase(slug);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal memuat data bisnis.";
    return (
      <main className="nature-stage min-h-screen px-6 py-8 md:px-10 lg:px-16">
        <section className="glass-panel mx-auto max-w-4xl rounded-[2rem] border border-amber-200/20 bg-amber-100/10 p-8 text-amber-100">
          <h1 className="font-display text-3xl font-semibold">Database belum siap</h1>
          <p className="mt-4 text-base leading-7">{message}</p>
        </section>
      </main>
    );
  }

  if (!business) {
    notFound();
  }

  return <LandingPage business={business} />;
}
