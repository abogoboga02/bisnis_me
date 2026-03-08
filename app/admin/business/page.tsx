import { AdminAuthGuard } from "@/components/admin-auth-guard";
import { BusinessManager } from "@/components/business-manager";
import { getBusinesses, getTemplates } from "@/lib/api";

export default async function AdminBusinessPage() {
  const [businesses, templates] = await Promise.all([getBusinesses(), getTemplates()]);

  return (
    <AdminAuthGuard>
      <BusinessManager initialBusinesses={businesses} templates={templates} />
    </AdminAuthGuard>
  );
}
