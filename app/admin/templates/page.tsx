import { TemplateGallery } from "@/components/template-gallery";
import { requireAdminSession } from "@/lib/admin-session";
import { listTemplatesFromDatabase } from "@/lib/business-store";

export const dynamic = "force-dynamic";

export default async function AdminTemplatesPage() {
  const admin = await requireAdminSession();
  const templates = await listTemplatesFromDatabase(admin);

  return <TemplateGallery currentAdmin={admin} templates={templates} />;
}
