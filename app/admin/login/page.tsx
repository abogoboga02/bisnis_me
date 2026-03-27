import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin-login-form";
import { getAdminSession } from "@/lib/admin-session";

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) {
    redirect("/admin/dashboard");
  }

  return (
    <main className="admin-grid min-h-screen px-6 py-10 md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.28em] text-cyan-200/70">Admin access</p>
          <h1 className="mt-3 font-display text-4xl font-bold text-white md:text-5xl">
            Manage business landing pages
          </h1>
        </div>
        <Suspense fallback={<div className="glass-panel rounded-[2rem] p-8 text-slate-300">Loading admin form...</div>}>
          <AdminLoginForm />
        </Suspense>
      </div>
    </main>
  );
}
