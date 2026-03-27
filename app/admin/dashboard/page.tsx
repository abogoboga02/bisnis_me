import { AdminDashboard } from "@/components/admin-dashboard";
import { requireAdminSession } from "@/lib/admin-session";
import { getBusinesses, getTemplates } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await requireAdminSession();
  const [businesses, templates] = await Promise.all([getBusinesses(), getTemplates()]);

  return <AdminDashboard businesses={businesses} templates={templates} />;
}
