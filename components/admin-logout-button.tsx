"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { logoutAdmin } from "@/lib/client-api";

export function AdminLogoutButton({
  className = "",
  label = "Logout",
}: {
  className?: string;
  label?: string;
}) {
  const router = useRouter();

  async function handleLogout() {
    try {
      await logoutAdmin();
    } finally {
      router.replace("/admin/login");
      router.refresh();
    }
  }

  return (
    <button type="button" onClick={() => void handleLogout()} className={className}>
      <span className="inline-flex items-center gap-2">
        <LogOut className="h-4 w-4" />
        {label}
      </span>
    </button>
  );
}
