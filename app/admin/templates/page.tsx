import { AdminAuthGuard } from "@/components/admin-auth-guard";
import { TemplateGallery } from "@/components/template-gallery";
import { getTemplates } from "@/lib/api";

export default async function AdminTemplatesPage() {
  const templates = await getTemplates();

  return (
    <AdminAuthGuard>
      <TemplateGallery templates={templates} />
    </AdminAuthGuard>
  );
}
