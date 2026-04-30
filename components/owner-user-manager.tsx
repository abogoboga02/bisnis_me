"use client";

import { useEffect, useEffectEvent, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import Link from "next/link";
import {
  Blocks,
  Building2,
  FolderKanban,
  Loader2,
  PencilLine,
  Plus,
  ShieldPlus,
  Trash2,
  type LucideIcon,
  UserCog,
  Users2,
  X,
} from "lucide-react";
import { AdminLogoutButton } from "@/components/admin-logout-button";
import { DEFAULT_ADMIN_AI_CREDITS_TENTHS, formatAiCredits } from "@/lib/ai-business-content";
import {
  createManagedUser,
  deleteManagedUser,
  topUpManagedUserAiCredits,
  updateManagedUser,
} from "@/lib/client-api";
import type { AdminIdentity, Business, ManagedUser } from "@/lib/types";

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

function compareBusinessAge(left: Business, right: Business) {
  const leftCreatedAt = Date.parse(left.createdAt);
  const rightCreatedAt = Date.parse(right.createdAt);
  const leftHasDate = !Number.isNaN(leftCreatedAt);
  const rightHasDate = !Number.isNaN(rightCreatedAt);

  if (leftHasDate && rightHasDate && leftCreatedAt !== rightCreatedAt) {
    return leftCreatedAt - rightCreatedAt;
  }

  if (leftHasDate !== rightHasDate) {
    return leftHasDate ? -1 : 1;
  }

  return left.id - right.id;
}

function getPrimaryScopedBusiness(user: ManagedUser, businessById: Map<number, Business>) {
  return (
    user.businessIds
      .map((assignedBusinessId) => businessById.get(assignedBusinessId))
      .filter((business): business is Business => Boolean(business))
      .sort(compareBusinessAge)[0] ?? null
  );
}

export function OwnerUserManager({
  currentAdmin,
  businesses,
  initialUsers,
}: {
  currentAdmin: AdminIdentity;
  businesses: Business[];
  initialUsers: ManagedUser[];
}) {
  const [users, setUsers] = useState(initialUsers);
  const [notice, setNotice] = useState<Notice | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"owner" | "admin">("admin");
  const [businessId, setBusinessId] = useState("");
  const [aiCreditsInput, setAiCreditsInput] = useState<string>(formatAiCredits(DEFAULT_ADMIN_AI_CREDITS_TENTHS));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editCurrentPassword, setEditCurrentPassword] = useState("");
  const [editNewPassword, setEditNewPassword] = useState("");
  const [editNewPasswordConfirmation, setEditNewPasswordConfirmation] = useState("");
  const [editAiCreditsInput, setEditAiCreditsInput] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const [toppingUserId, setToppingUserId] = useState<number | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);

  const businessById = new Map(businesses.map((business) => [business.id, business]));
  const ownerCount = users.filter((user) => user.role === "owner").length;
  const adminCount = users.filter((user) => user.role === "admin").length;

  const handleEscapeClose = useEffectEvent(() => {
    if (editingUser) {
      closeEditDialog();
      return;
    }

    if (isCreateDialogOpen) {
      closeCreateDialog();
    }
  });

  useEffect(() => {
    if (!isCreateDialogOpen && !editingUser) {
      return undefined;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleEscapeClose();
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [editingUser, isCreateDialogOpen]);

  function resetCreateForm() {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setRole("admin");
    setBusinessId("");
    setAiCreditsInput(formatAiCredits(DEFAULT_ADMIN_AI_CREDITS_TENTHS));
  }

  function resetEditForm() {
    setEditName("");
    setEditEmail("");
    setEditCurrentPassword("");
    setEditNewPassword("");
    setEditNewPasswordConfirmation("");
    setEditAiCreditsInput("");
  }

  function openCreateDialog() {
    resetCreateForm();
    setNotice(null);
    setIsCreateDialogOpen(true);
  }

  function closeCreateDialog() {
    resetCreateForm();
    setNotice(null);
    setIsCreateDialogOpen(false);
  }

  function openEditDialog(user: ManagedUser) {
    setNotice(null);
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditCurrentPassword("");
    setEditNewPassword("");
    setEditNewPasswordConfirmation("");
    setEditAiCreditsInput(user.aiCreditsTenths === null ? "" : formatAiCredits(user.aiCreditsTenths));
  }

  function closeEditDialog() {
    resetEditForm();
    setNotice(null);
    setEditingUser(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);

    if (password !== confirmPassword) {
      setNotice({ type: "error", message: "Konfirmasi password harus sama dengan password awal." });
      return;
    }

    const requestedAiCredits = Number(aiCreditsInput);
    if (role === "admin" && (!Number.isFinite(requestedAiCredits) || requestedAiCredits < 0)) {
      setNotice({ type: "error", message: "Token awal AI admin wajib berupa angka nol atau lebih." });
      return;
    }

    setIsSubmitting(true);

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
      closeCreateDialog();
      setNotice({ type: "success", message: "User baru berhasil ditambahkan." });
    } catch (error) {
      setNotice({ type: "error", message: error instanceof Error ? error.message : "Gagal menambah user." });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleEditSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingUser) {
      return;
    }

    setNotice(null);

    const wantsPasswordChange = Boolean(
      editCurrentPassword.trim() || editNewPassword.trim() || editNewPasswordConfirmation.trim(),
    );

    if (wantsPasswordChange && editNewPassword !== editNewPasswordConfirmation) {
      setNotice({ type: "error", message: "Konfirmasi pass baru harus sama dengan password baru." });
      return;
    }

    if (editingUser.role === "admin") {
      const parsedCredits = Number(editAiCreditsInput);
      if (!Number.isFinite(parsedCredits) || parsedCredits < 0) {
        setNotice({ type: "error", message: "Token AI admin wajib berupa angka nol atau lebih." });
        return;
      }
    }

    setIsUpdating(true);

    try {
      const updated = await updateManagedUser(editingUser.id, {
        email: editEmail,
        name: editName,
        currentPassword: editCurrentPassword,
        newPassword: editNewPassword,
        newPasswordConfirmation: editNewPasswordConfirmation,
        aiCreditsTenths: editingUser.role === "admin" ? Math.round(Number(editAiCreditsInput) * 10) : null,
      });

      setUsers((current) =>
        current
          .map((user) => (user.id === updated.id ? updated : user))
          .sort((left, right) => left.id - right.id),
      );
      closeEditDialog();
      setNotice({ type: "success", message: "User berhasil diperbarui." });
    } catch (error) {
      setNotice({ type: "error", message: error instanceof Error ? error.message : "Gagal memperbarui user." });
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleDelete(user: ManagedUser) {
    const confirmed = window.confirm(`Hapus user "${user.name}"? Tindakan ini tidak bisa dibatalkan.`);

    if (!confirmed) {
      return;
    }

    setNotice(null);
    setDeletingUserId(user.id);

    try {
      await deleteManagedUser(user.id);
      setUsers((current) => current.filter((item) => item.id !== user.id));
      if (editingUser?.id === user.id) {
        closeEditDialog();
      }
      setNotice({ type: "success", message: "User berhasil dihapus." });
    } catch (error) {
      setNotice({ type: "error", message: error instanceof Error ? error.message : "Gagal menghapus user." });
    } finally {
      setDeletingUserId(null);
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
    <main className="admin-grid min-h-screen px-4 py-6 md:px-8 md:py-8">
      <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="glass-panel self-start rounded-[2rem] p-5 xl:sticky xl:top-6">
          <div className="rounded-[1.7rem] border border-white/10 bg-[#071d18]/80 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-lime-100/70">Kelola akses user</p>
            <h1 className="mt-3 font-sans text-2xl font-semibold tracking-[-0.03em] text-white">Owner workspace</h1>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Halaman ini khusus untuk owner agar pengelolaan akun tidak menumpuk di dashboard utama.
            </p>
          </div>

          <div className="mt-5 rounded-[1.7rem] border border-white/10 bg-white/5 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Signed in</p>
            <p className="mt-3 font-sans text-lg font-semibold text-white">{currentAdmin.name}</p>
            <p className="mt-1 text-sm text-slate-400">{currentAdmin.email}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-lime-300/20 bg-lime-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-lime-100">
                {currentAdmin.role}
              </span>
              <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                {users.length} user
              </span>
            </div>
          </div>

          <nav className="mt-5 space-y-2" aria-label="Navigasi admin">
            <SidebarLink
              href="/admin/dashboard"
              label="Dashboard overview"
              description="Ringkasan cepat dan metrik utama."
              icon={Building2}
            />
            <SidebarLink
              href="/admin/business"
              label="Kelola bisnis"
              description="Pusat registry bisnis dan editor landing page."
              icon={FolderKanban}
            />
            <SidebarLink
              href="/admin/templates"
              label="Template library"
              description="Lihat katalog template yang tersedia."
              icon={Blocks}
            />
            <SidebarLink
              href="/admin/user"
              label="Kelola akses user"
              description="Tabel user, akses website, dan pembuatan akun baru."
              icon={Users2}
              active
            />
          </nav>

          <div className="mt-5 rounded-[1.7rem] border border-white/10 bg-slate-950/35 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Access policy</p>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Owner bisa membuat akun owner atau admin. Admin dapat diberi satu website pertama dan token AI awal saat
              akun dibuat.
            </p>
            <div className="mt-4 grid gap-3">
              <MiniInfoCard label="Owner" value={ownerCount} icon={ShieldPlus} />
              <MiniInfoCard label="Admin" value={adminCount} icon={UserCog} />
            </div>
          </div>

          <AdminLogoutButton
            className="mt-5 inline-flex w-full items-center justify-center rounded-[1.15rem] border border-white/12 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            label="Keluar dari admin"
          />
        </aside>

        <div className="space-y-6">
          <section className="glass-panel rounded-[2rem] p-6 md:p-8">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-3xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-lime-100/70">User roster</p>
                <h2 className="mt-3 font-sans text-3xl font-semibold tracking-[-0.04em] text-white">
                  Semua akses user dipusatkan dalam satu tabel
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  Dashboard utama sekarang tetap rapi. Halaman ini menampung roster user, role, website pertama, token
                  AI, dan tombol cepat untuk menambah akun baru.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-lime-300/20 bg-lime-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-lime-100">
                  {users.length} user
                </span>
                <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                  {businesses.length} bisnis
                </span>
                <button
                  type="button"
                  onClick={openCreateDialog}
                  className="inline-flex items-center gap-2 rounded-[1rem] bg-lime-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5"
                >
                  <Plus className="h-4 w-4" />
                  Tambah user
                </button>
              </div>
            </div>
          </section>

          {notice && (!isCreateDialogOpen && !editingUser || notice.type === "success") ? (
            <NoticeBanner notice={notice} />
          ) : null}

          <section className="glass-panel rounded-[2rem] p-6">
            {users.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-white/12 bg-white/5 p-5 text-sm leading-7 text-slate-300">
                Belum ada user yang tercatat. Gunakan tombol tambah user untuk membuat akun owner atau admin baru.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full table-fixed border-separate border-spacing-0 text-left">
                  <colgroup>
                    <col className="w-auto" />
                    <col className="w-[110px]" />
                    <col className="w-[120px]" />
                    <col className="w-[120px]" />
                    <col className="w-[280px]" />
                  </colgroup>
                  <thead>
                    <tr className="border-b border-white/10 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                      <HeaderCell>User</HeaderCell>
                      <HeaderCell align="center">Role</HeaderCell>
                      <HeaderCell align="center">Token AI</HeaderCell>
                      <HeaderCell align="center">Dibuat</HeaderCell>
                      <HeaderCell align="right">Aksi</HeaderCell>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => {
                      const primaryBusiness = getPrimaryScopedBusiness(user, businessById);

                      return (
                        <tr key={user.id} className="border-b border-white/10 align-top">
                          <BodyCell>
                            <div className="min-w-[280px] py-5">
                              <p className="font-sans text-base font-semibold text-white">{user.name}</p>
                              <p className="mt-1 text-sm text-slate-400">{user.email}</p>
                              <div className="mt-3">
                                {user.role === "owner" ? (
                                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                                    Akses semua website
                                  </span>
                                ) : primaryBusiness ? (
                                  <Link
                                    href={`/${primaryBusiness.slug}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 rounded-full border border-lime-300/20 bg-lime-300/10 px-3 py-1 text-xs font-semibold text-lime-100 transition hover:border-lime-200/40 hover:text-white"
                                  >
                                    <span>{primaryBusiness.name}</span>
                                    <span className="text-lime-100/70">/{primaryBusiness.slug}</span>
                                  </Link>
                                ) : (
                                  <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs text-amber-100">
                                    Belum punya website
                                  </span>
                                )}
                              </div>
                            </div>
                          </BodyCell>
                          <BodyCell align="center">
                            <div className="flex justify-center py-5">
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
                          </BodyCell>
                          <BodyCell align="center">
                            <div className="py-5 text-sm font-medium tabular-nums text-slate-200">
                              {user.aiCreditsTenths === null ? "Unlimited" : formatAiCredits(user.aiCreditsTenths)}
                            </div>
                          </BodyCell>
                          <BodyCell align="center">
                            <div className="py-5 text-sm leading-6 text-slate-300">{formatDateLabel(user.createdAt)}</div>
                          </BodyCell>
                          <BodyCell align="right">
                            <div className="ml-auto grid w-full max-w-[260px] grid-cols-2 gap-2 py-5">
                              {user.role === "admin" ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => void handleTopUp(user.id, 10)}
                                    disabled={toppingUserId === user.id || deletingUserId === user.id}
                                    className="inline-flex w-full items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-300/16 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    {toppingUserId === user.id ? "Memproses..." : "+1.0 token"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => void handleTopUp(user.id, 30)}
                                    disabled={toppingUserId === user.id || deletingUserId === user.id}
                                    className="inline-flex w-full items-center justify-center rounded-full border border-lime-300/20 bg-lime-300/10 px-3 py-2 text-xs font-semibold text-lime-100 transition hover:bg-lime-300/16 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    {toppingUserId === user.id ? "Memproses..." : "+3.0 token"}
                                  </button>
                                </>
                              ) : null}
                              <button
                                type="button"
                                onClick={() => openEditDialog(user)}
                                disabled={deletingUserId === user.id}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <PencilLine className="h-3.5 w-3.5" />
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleDelete(user)}
                                disabled={deletingUserId === user.id || currentAdmin.id === user.id}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-rose-400/25 bg-rose-400/10 px-3 py-2 text-xs font-semibold text-rose-100 transition hover:bg-rose-400/16 disabled:cursor-not-allowed disabled:opacity-60"
                                title={currentAdmin.id === user.id ? "Akun yang sedang dipakai tidak bisa dihapus." : undefined}
                              >
                                {deletingUserId === user.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5" />
                                )}
                                Hapus
                              </button>
                            </div>
                          </BodyCell>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>

      {isCreateDialogOpen ? (
        <ModalShell
          title="Tambah user baru"
          eyebrow="Create account"
          description="Isi detail akun, lalu pastikan password dan konfirmasi password sama sebelum menyimpan."
          dialogId="create-user-title"
          onClose={closeCreateDialog}
        >
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
                      setAiCreditsInput(formatAiCredits(DEFAULT_ADMIN_AI_CREDITS_TENTHS));
                    }
                  }}
                  className="input"
                  required
                >
                  <option value="admin">Admin</option>
                  <option value="owner">Owner</option>
                </select>
              </Field>

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
            </div>

            <div className="grid gap-5 md:grid-cols-2">
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

              <Field label="Konfirmasi password" required>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="input"
                  placeholder="Ulangi password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </Field>
            </div>

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
                Default {formatAiCredits(DEFAULT_ADMIN_AI_CREDITS_TENTHS)} token untuk admin baru. Owner otomatis
                memakai akses global tanpa batas token.
              </p>
            </Field>

            {notice?.type === "error" ? <NoticeBanner notice={notice} /> : null}

            <div className="flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={closeCreateDialog}
                className="rounded-[1rem] border border-white/12 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-[1rem] bg-lime-300 px-5 py-3 font-semibold text-slate-950 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {isSubmitting ? "Menyimpan user..." : "Simpan user"}
              </button>
            </div>
          </form>
        </ModalShell>
      ) : null}

      {editingUser ? (
        <ModalShell
          title={`Edit ${editingUser.name}`}
          eyebrow="Edit user"
          description="Form edit dibatasi ke nama, email, password lama, password baru, konfirmasi pass baru, dan token."
          dialogId="edit-user-title"
          onClose={closeEditDialog}
        >
          <form onSubmit={handleEditSubmit} className="mt-6 space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Nama user" required>
                <input
                  value={editName}
                  onChange={(event) => setEditName(event.target.value)}
                  className="input"
                  placeholder="Nama user"
                  required
                />
              </Field>

              <Field label="Email login" required>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(event) => setEditEmail(event.target.value)}
                  className="input"
                  placeholder="admin@domain.com"
                  autoComplete="email"
                  required
                />
              </Field>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Password lama">
                <input
                  type="password"
                  value={editCurrentPassword}
                  onChange={(event) => setEditCurrentPassword(event.target.value)}
                  className="input"
                  placeholder="Isi jika ingin ganti password"
                  autoComplete="current-password"
                />
              </Field>

              <Field label="Password baru">
                <input
                  type="password"
                  value={editNewPassword}
                  onChange={(event) => setEditNewPassword(event.target.value)}
                  className="input"
                  placeholder="Minimal 8 karakter"
                  autoComplete="new-password"
                  minLength={8}
                />
              </Field>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Konfirmasi pass baru">
                <input
                  type="password"
                  value={editNewPasswordConfirmation}
                  onChange={(event) => setEditNewPasswordConfirmation(event.target.value)}
                  className="input"
                  placeholder="Ulangi password baru"
                  autoComplete="new-password"
                  minLength={8}
                />
              </Field>

              <Field label="Token">
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={editAiCreditsInput}
                  onChange={(event) => setEditAiCreditsInput(event.target.value)}
                  className="input"
                  disabled={editingUser.role !== "admin"}
                  placeholder={editingUser.role === "admin" ? "Mis. 3.0" : "Unlimited"}
                />
                <p className="mt-2 text-xs text-slate-400">
                  {editingUser.role === "admin"
                    ? "Token admin bisa diubah langsung di form edit ini."
                    : "Akun owner selalu unlimited sehingga field token tidak bisa diubah."}
                </p>
              </Field>
            </div>

            {notice?.type === "error" ? <NoticeBanner notice={notice} /> : null}

            <div className="flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={closeEditDialog}
                className="rounded-[1rem] border border-white/12 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isUpdating}
                className="inline-flex items-center gap-2 rounded-[1rem] bg-lime-300 px-5 py-3 font-semibold text-slate-950 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <PencilLine className="h-4 w-4" />}
                {isUpdating ? "Menyimpan perubahan..." : "Simpan perubahan"}
              </button>
            </div>
          </form>
        </ModalShell>
      ) : null}
    </main>
  );
}

function SidebarLink({
  href,
  label,
  description,
  icon: Icon,
  active = false,
}: {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`block rounded-[1.35rem] border p-4 transition ${
        active ? "border-lime-300/20 bg-lime-300/10" : "border-white/10 bg-white/5 hover:bg-white/8"
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`rounded-[1rem] p-2 ${
            active ? "bg-lime-300/12 text-lime-100" : "bg-slate-950/35 text-slate-300"
          }`}
        >
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-semibold text-white">{label}</p>
          <p className="mt-1 text-xs leading-5 text-slate-400">{description}</p>
        </div>
      </div>
    </Link>
  );
}

function MiniInfoCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
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

function NoticeBanner({ notice }: { notice: Notice }) {
  return (
    <div
      className={`rounded-[1.35rem] border px-4 py-3 text-sm ${
        notice.type === "success"
          ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-100"
          : "border-rose-400/25 bg-rose-400/10 text-rose-100"
      }`}
    >
      {notice.message}
    </div>
  );
}

function HeaderCell({
  children,
  align = "left",
}: {
  children: ReactNode;
  align?: "left" | "center" | "right";
}) {
  return (
    <th
      className={`px-0 py-4 pr-6 font-semibold ${
        align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

function BodyCell({
  children,
  align = "left",
}: {
  children: ReactNode;
  align?: "left" | "center" | "right";
}) {
  return (
    <td
      className={`px-0 pr-6 align-top ${
        align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </td>
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

function ModalShell({
  title,
  eyebrow,
  description,
  dialogId,
  onClose,
  children,
}: {
  title: string;
  eyebrow: string;
  description: string;
  dialogId: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 px-4 py-6">
      <button type="button" aria-label="Tutup dialog" className="absolute inset-0 cursor-default" onClick={onClose} />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={dialogId}
        className="glass-panel relative z-10 w-full max-w-3xl rounded-[2rem] p-6 md:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-lime-100/70">{eyebrow}</p>
            <h3 id={dialogId} className="mt-2 font-sans text-2xl font-semibold tracking-[-0.03em] text-white">
              {title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/12 bg-white/5 p-2 text-white transition hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {children}
      </div>
    </div>
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
