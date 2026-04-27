import { BusinessManager } from "@/components/business-manager";
import { requireAdminSession } from "@/lib/admin-session";
import { getAdminAiQuota, listBusinessesFromDatabase, listTemplatesFromDatabase } from "@/lib/business-store";

export const dynamic = "force-dynamic";

export default async function AdminBusinessPage() {
  const admin = await requireAdminSession();
  const [businesses, templates, aiQuota] = await Promise.all([
    listBusinessesFromDatabase(admin),
    listTemplatesFromDatabase(admin),
    getAdminAiQuota(admin),
  ]);

  return <BusinessManager currentAdmin={admin} initialBusinesses={businesses} templates={templates} initialAiQuota={aiQuota} />;
}
