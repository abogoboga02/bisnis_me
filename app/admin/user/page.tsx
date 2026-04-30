import { redirect } from "next/navigation";
import { OwnerUserManager } from "../../../components/owner-user-manager";
import { requireAdminSession } from "@/lib/admin-session";
import { listBusinessesFromDatabase, listManagedUsersFromDatabase } from "@/lib/business-store";

export const dynamic = "force-dynamic";

export default async function AdminUserPage() {
  const admin = await requireAdminSession();

  if (admin.role !== "owner") {
    redirect("/admin/dashboard");
  }

  const [businesses, users] = await Promise.all([
    listBusinessesFromDatabase(admin),
    listManagedUsersFromDatabase(admin),
  ]);

  return <OwnerUserManager currentAdmin={admin} businesses={businesses} initialUsers={users} />;
}
