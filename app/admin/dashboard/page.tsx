import { AdminAuthGuard } from "@/components/admin-auth-guard";
import { AdminDashboard } from "@/components/admin-dashboard";
import { getBusinesses, getTemplates } from "@/lib/api";

export default async function AdminDashboardPage() {
  const [businesses, templates] = await Promise.all([getBusinesses(), getTemplates()]);

  return (
    <AdminAuthGuard>
      <AdminDashboard businesses={businesses} templates={templates} />
    </AdminAuthGuard>
  );
}
