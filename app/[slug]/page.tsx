import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LandingPage } from "@/components/landing-page";
import { getBusinessBySlug } from "@/lib/api";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const business = await getBusinessBySlug(slug);

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
  const business = await getBusinessBySlug(slug);

  if (!business) {
    notFound();
  }

  return <LandingPage business={business} />;
}
