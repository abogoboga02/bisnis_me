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
  const business = await getBusinessBySlugFromDatabase(slug);

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
  const business = await getBusinessBySlugFromDatabase(slug);

  if (!business) {
    notFound();
  }

  return <LandingPage business={business} />;
}
