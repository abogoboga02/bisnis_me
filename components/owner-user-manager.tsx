"use client";

import { useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Loader2, ShieldPlus, UserRoundPlus } from "lucide-react";
import { createManagedUser } from "@/lib/client-api";
import type { Business, ManagedUser } from "@/lib/types";

type Notice = {
  type: "success" | "error";
  message: string;
};

export function OwnerUserManager({
  businesses,
  initialUsers,
}: {
  businesses: Business[];
  initialUsers: ManagedUser[];
}) {
  const [users, setUsers] = useState(initialUsers);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"owner" | "admin">("admin");
  const [businessId, setBusinessId] = useState<string>("");
  const [notice, setNotice] = useState<Notice | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const businessNameById = useMemo(
    () => new Map(businesses.map((business) => [business.id, `${business.name} (/${business.slug})`])),
    [businesses],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);
    setIsSubmitting(true);

    try {
      const created = await createManagedUser({
        email,
        name,
        password,
        role,
        businessId: role === "admin" && businessId ? Number(businessId) : null,
      });

      setUsers((current) => [...current, created].sort((left, right) => left.id - right.id));
      setEmail("");
      setName("");
      setPassword("");
      setRole("admin");
      setBusinessId("");
      setNotice({ type: "success", message: "User baru berhasil ditambahkan." });
    } catch (error) {
      setNotice({ type: "error", message: error instanceof Error ? error.message : "Gagal menambah user." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
      <div className="glass-panel rounded-[2rem] p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-3xl border border-cyan-300/18 bg-cyan-300/10 p-4 text-cyan-100">
            <ShieldPlus className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-200/70">Owner only</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">Add User</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">
              Tambahkan akun baru langsung ke tabel `users`. Jika role `admin`, owner juga bisa langsung memberi scope
              website pertama lewat `user_business_access`.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <Field label="Nama user" required>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="input"
              placeholder="Mis. Admin Cabang Bandung"
              required
            />
          </Field>

          <Field label="Email login" required>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="input"
              placeholder="admin@domain.com"
              autoComplete="email"
              required
            />
          </Field>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Role user" required>
              <select
                value={role}
                onChange={(event) => {
                  const nextRole = event.target.value === "owner" ? "owner" : "admin";
                  setRole(nextRole);
                  if (nextRole === "owner") {
                    setBusinessId("");
                  }
                }}
                className="input"
                required
              >
                <option value="admin">Admin</option>
                <option value="owner">Owner</option>
              </select>
            </Field>

            <Field label="Password awal" required>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="input"
                placeholder="Minimal 8 karakter"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </Field>
          </div>

          <Field label="Assign website pertama">
            <select
              value={businessId}
              onChange={(event) => setBusinessId(event.target.value)}
              className="input"
              disabled={role !== "admin"}
            >
              <option value="">Belum di-assign</option>
              {businesses.map((business) => (
                <option key={business.id} value={business.id}>
                  {business.name} (/{business.slug})
                </option>
              ))}
            </select>
          </Field>

          {notice ? (
            <div
              className={`rounded-3xl border px-4 py-3 text-sm ${
                notice.type === "success"
                  ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-100"
                  : "border-rose-400/25 bg-rose-400/10 text-rose-100"
              }`}
            >
              {notice.message}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-5 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserRoundPlus className="h-4 w-4" />}
            {isSubmitting ? "Menyimpan user..." : "Tambah user"}
          </button>
        </form>
      </div>

      <div className="glass-panel rounded-[2rem] p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">User terdaftar</h2>
            <p className="mt-2 text-sm leading-7 text-slate-400">
              Data di bawah ditarik dari database dan menampilkan role serta scope bisnis untuk setiap akun.
            </p>
          </div>
          <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
            {users.length} user
          </span>
        </div>

        <div className="mt-6 space-y-4">
          {users.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm leading-7 text-slate-300">
              Belum ada user yang tercatat.
            </div>
          ) : (
            users.map((user) => (
              <article key={user.id} className="rounded-3xl border border-white/10 bg-slate-950/35 p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-white">{user.name}</p>
                    <p className="mt-1 text-sm text-slate-400">{user.email}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
                      {user.role}
                    </span>
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
                      ID {user.id}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {user.role === "owner" ? (
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                      Akses semua website
                    </span>
                  ) : user.businessIds.length > 0 ? (
                    user.businessIds.map((assignedBusinessId) => (
                      <span
                        key={assignedBusinessId}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300"
                      >
                        {businessNameById.get(assignedBusinessId) ?? `Business ID ${assignedBusinessId}`}
                      </span>
                    ))
                  ) : (
                    <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs text-amber-100">
                      Belum punya scope bisnis
                    </span>
                  )}
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  children,
  required = false,
}: {
  label: string;
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-200">
        {label}
        {required ? <span className="text-cyan-200"> *</span> : null}
      </span>
      {children}
    </label>
  );
}
