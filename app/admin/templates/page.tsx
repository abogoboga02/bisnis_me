import { TemplateGallery } from "@/components/template-gallery";
import { requireAdminSession } from "@/lib/admin-session";
import { getTemplates } from "@/lib/api";

export default async function AdminTemplatesPage() {
  await requireAdminSession();
  const templates = await getTemplates();

  return <TemplateGallery templates={templates} />;
}
