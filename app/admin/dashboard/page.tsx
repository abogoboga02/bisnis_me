import { AdminDashboard } from "@/components/admin-dashboard";
import { requireAdminSession } from "@/lib/admin-session";
import { listBusinessesFromDatabase, listTemplatesFromDatabase } from "@/lib/business-store";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const admin = await requireAdminSession();
  const [businesses, templates] = await Promise.all([
    listBusinessesFromDatabase(admin),
    listTemplatesFromDatabase(admin),
  ]);

  return <AdminDashboard currentAdmin={admin} businesses={businesses} templates={templates} />;
}
