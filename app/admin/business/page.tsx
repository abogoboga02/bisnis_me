import { BusinessManager } from "@/components/business-manager";
import { requireAdminSession } from "@/lib/admin-session";
import { listBusinessesFromDatabase, listTemplatesFromDatabase } from "@/lib/business-store";

export const dynamic = "force-dynamic";

export default async function AdminBusinessPage() {
  await requireAdminSession();
  const [businesses, templates] = await Promise.all([
    listBusinessesFromDatabase(),
    listTemplatesFromDatabase(),
  ]);

  return <BusinessManager initialBusinesses={businesses} templates={templates} />;
}
