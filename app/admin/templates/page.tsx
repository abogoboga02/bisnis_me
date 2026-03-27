import { TemplateGallery } from "@/components/template-gallery";
import { requireAdminSession } from "@/lib/admin-session";
import { listTemplatesFromDatabase } from "@/lib/business-store";

export const dynamic = "force-dynamic";

export default async function AdminTemplatesPage() {
  await requireAdminSession();
  const templates = await listTemplatesFromDatabase();

  return <TemplateGallery templates={templates} />;
}
