import { AdminDashboard } from "@/components/admin-dashboard";
import { requireAdminSession } from "@/lib/admin-session";
import { listBusinessesFromDatabase, listManagedUsersFromDatabase, listTemplatesFromDatabase } from "@/lib/business-store";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const admin = await requireAdminSession();
  const [businesses, templates, users] = await Promise.all([
    listBusinessesFromDatabase(admin),
    listTemplatesFromDatabase(admin),
    admin.role === "owner" ? listManagedUsersFromDatabase(admin) : Promise.resolve([]),
  ]);

  return <AdminDashboard currentAdmin={admin} businesses={businesses} templates={templates} users={users} />;
}
