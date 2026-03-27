import { BusinessManager } from "@/components/business-manager";
import { requireAdminSession } from "@/lib/admin-session";
import { getBusinesses, getTemplates } from "@/lib/api";

export default async function AdminBusinessPage() {
  await requireAdminSession();
  const [businesses, templates] = await Promise.all([getBusinesses(), getTemplates()]);

  return <BusinessManager initialBusinesses={businesses} templates={templates} />;
}
