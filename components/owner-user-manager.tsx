"use client";

import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { BriefcaseBusiness, Loader2, ShieldPlus, UserCog, UserRoundPlus, Users2 } from "lucide-react";
import { DEFAULT_ADMIN_AI_CREDITS_TENTHS, formatAiCredits } from "@/lib/ai-business-content";
import { createManagedUser, topUpManagedUserAiCredits } from "@/lib/client-api";
import type { Business, ManagedUser } from "@/lib/types";

const adminDateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Bangkok",
});

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
  const [aiCreditsInput, setAiCreditsInput] = useState<string>(formatAiCredits(DEFAULT_ADMIN_AI_CREDITS_TENTHS));
  const [notice, setNotice] = useState<Notice | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toppingUserId, setToppingUserId] = useState<number | null>(null);

  const businessNameById = new Map(
    businesses.map((business) => [business.id, `${business.name} (/${business.slug})`]),
  );
  const ownerCount = users.filter((user) => user.role === "owner").length;
  const adminCount = users.filter((user) => user.role === "admin").length;
  const unassignedAdminCount = users.filter((user) => user.role === "admin" && user.businessIds.length === 0).length;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);
    setIsSubmitting(true);
    const requestedAiCredits = Number(aiCreditsInput);

    try {
      const created = await createManagedUser({
        email,
        name,
        password,
        role,
        businessId: role === "admin" && businessId ? Number(businessId) : null,
        aiCreditsTenths:
          role === "admin"
            ? Number.isFinite(requestedAiCredits)
              ? Math.max(0, Math.round(requestedAiCredits * 10))
              : DEFAULT_ADMIN_AI_CREDITS_TENTHS
            : DEFAULT_ADMIN_AI_CREDITS_TENTHS,
      });

      setUsers((current) => [...current, created].sort((left, right) => left.id - right.id));
      setEmail("");
      setName("");
      setPassword("");
      setRole("admin");
      setBusinessId("");
      setAiCreditsInput(formatAiCredits(DEFAULT_ADMIN_AI_CREDITS_TENTHS));
      setNotice({ type: "success", message: "User baru berhasil ditambahkan." });
    } catch (error) {
      setNotice({ type: "error", message: error instanceof Error ? error.message : "Gagal menambah user." });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleTopUp(userId: number, deltaTenths: number) {
    setNotice(null);
    setToppingUserId(userId);

    try {
      const updatedUser = await topUpManagedUserAiCredits(userId, deltaTenths);
      setUsers((current) =>
        current
          .map((user) => (user.id === updatedUser.id ? updatedUser : user))
          .sort((left, right) => left.id - right.id),
      );
      setNotice({
        type: "success",
        message: `Token AI user berhasil ditambah ${formatAiCredits(deltaTenths)}.`,
      });
    } catch (error) {
      setNotice({ type: "error", message: error instanceof Error ? error.message : "Gagal menambah token AI user." });
    } finally {
      setToppingUserId(null);
    }
  }

  return (
    <section id="owner-access" className="space-y-6">
      <div className="glass-panel rounded-[2rem] p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-lime-100/70">Owner access</p>
            <h2 className="mt-3 font-sans text-3xl font-semibold tracking-[-0.04em] text-white">
              Manajemen user yang lebih mudah dipindai
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Owner bisa membuat akun baru langsung dari dashboard, lalu memeriksa siapa yang punya akses global dan
              siapa yang masih perlu diberi scope website.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <SummaryTile label="Owner" value={ownerCount} icon={ShieldPlus} />
            <SummaryTile label="Admin" value={adminCount} icon={UserCog} />
            <SummaryTile label="Belum di-assign" value={unassignedAdminCount} icon={BriefcaseBusiness} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="glass-panel rounded-[2rem] p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-[1.15rem] border border-lime-300/18 bg-lime-300/10 p-3 text-lime-100">
              <UserRoundPlus className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-lime-100/70">Create account</p>
              <h3 className="mt-2 font-sans text-2xl font-semibold tracking-[-0.03em] text-white">Tambah user baru</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Buat akun owner atau admin tanpa keluar dari dashboard. Role owner otomatis punya akses ke semua
                website.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
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
            </div>

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

            <Field label="Token awal AI">
              <input
                type="number"
                min={0}
                step={0.1}
                value={aiCreditsInput}
                onChange={(event) => setAiCreditsInput(event.target.value)}
                className="input"
                disabled={role !== "admin"}
              />
              <p className="mt-2 text-xs text-slate-400">
                Default {formatAiCredits(DEFAULT_ADMIN_AI_CREDITS_TENTHS)} token untuk admin baru. Sistem akan menyimpan angka ini dengan presisi 0.1 token.
              </p>
            </Field>

            <div className="rounded-[1.2rem] border border-white/10 bg-slate-950/35 p-4 text-sm leading-6 text-slate-300">
              Admin bisa langsung diberi website pertama agar setelah login mereka tidak mendarat di dashboard kosong.
            </div>

            {notice ? (
              <div
                className={`rounded-[1.2rem] border px-4 py-3 text-sm ${
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
              className="inline-flex w-full items-center justify-center gap-2 rounded-[1rem] bg-lime-300 px-5 py-3 font-semibold text-slate-950 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserRoundPlus className="h-4 w-4" />}
              {isSubmitting ? "Menyimpan user..." : "Tambah user"}
            </button>
          </form>
        </div>

        <div className="glass-panel rounded-[2rem] p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-lime-100/70">User roster</p>
              <h3 className="mt-2 font-sans text-2xl font-semibold tracking-[-0.03em] text-white">
                Akses user yang sudah terdaftar
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Daftar ini membantu owner mengecek role, ID, dan scope bisnis tanpa membuka halaman terpisah.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-lime-300/20 bg-lime-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-lime-100">
                {users.length} user
              </span>
              <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                {businesses.length} bisnis
              </span>
            </div>
          </div>

          {users.length === 0 ? (
            <div className="mt-6 rounded-[1.5rem] border border-dashed border-white/12 bg-white/5 p-5 text-sm leading-7 text-slate-300">
              Belum ada user yang tercatat.
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {users.map((user) => (
                <article key={user.id} className="rounded-[1.5rem] border border-white/10 bg-slate-950/35 p-5">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-sans text-lg font-semibold text-white">{user.name}</p>
                        <span
                          className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                            user.role === "owner"
                              ? "border-lime-300/20 bg-lime-300/10 text-lime-100"
                              : "border-cyan-300/20 bg-cyan-300/10 text-cyan-100"
                          }`}
                        >
                          {user.role}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-400">{user.email}</p>
                      {user.createdAt ? (
                        <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-500">
                          Dibuat {formatDateLabel(user.createdAt)}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                        ID {user.id}
                      </span>
                      <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                        {user.role === "owner" ? "Akses global" : `${user.businessIds.length} website`}
                      </span>
                      <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                        Token AI {user.aiCreditsTenths === null ? "Unlimited" : formatAiCredits(user.aiCreditsTenths)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {user.role === "owner" ? (
                      <AccessPill>Melihat semua website</AccessPill>
                    ) : user.businessIds.length > 0 ? (
                      user.businessIds.map((assignedBusinessId) => (
                        <AccessPill key={assignedBusinessId}>
                          {businessNameById.get(assignedBusinessId) ?? `Business ID ${assignedBusinessId}`}
                        </AccessPill>
                      ))
                    ) : (
                      <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs text-amber-100">
                        Belum punya scope bisnis
                      </span>
                    )}
                  </div>
                  {user.role === "admin" ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => void handleTopUp(user.id, 10)}
                        disabled={toppingUserId === user.id}
                        className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-300/16 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {toppingUserId === user.id ? "Memproses..." : "+1.0 token"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleTopUp(user.id, 30)}
                        disabled={toppingUserId === user.id}
                        className="rounded-full border border-lime-300/20 bg-lime-300/10 px-3 py-2 text-xs font-semibold text-lime-100 transition hover:bg-lime-300/16 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {toppingUserId === user.id ? "Memproses..." : "+3.0 token"}
                      </button>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function SummaryTile({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof Users2;
}) {
  return (
    <div className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
          <p className="mt-2 font-sans text-2xl font-semibold text-white">{value}</p>
        </div>
        <span className="rounded-[0.9rem] bg-lime-300/10 p-2 text-lime-100">
          <Icon className="h-4 w-4" />
        </span>
      </div>
    </div>
  );
}

function AccessPill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">{children}</span>
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
        {required ? <span className="text-lime-200"> *</span> : null}
      </span>
      {children}
    </label>
  );
}

function formatDateLabel(value: string | undefined) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return adminDateFormatter.format(date);
}
