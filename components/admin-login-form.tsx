"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Database, LockKeyhole } from "lucide-react";
import { loginAdmin } from "@/lib/client-api";

function getSafeRedirectPath(value: string | null) {
  if (!value) {
    return "/admin/dashboard";
  }

  return value.startsWith("/") && !value.startsWith("//") ? value : "/admin/dashboard";
}

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await loginAdmin(email, password);
      router.push(getSafeRedirectPath(searchParams.get("redirect")));
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Login admin gagal.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="glass-panel rounded-[2rem] p-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-cyan-100">
          <Database className="h-4 w-4" />
          Database-backed admin access
        </div>
        <h2 className="mt-6 font-display text-3xl font-bold text-white">Masuk dengan akun admin yang tersimpan di PostgreSQL.</h2>
        <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
          Hanya akun yang tersimpan di tabel <code>users</code> yang bisa masuk. Session disimpan lewat
          cookie HTTP-only agar tidak mudah dimanipulasi dari browser.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel rounded-[2rem] p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-2xl bg-cyan-300/15 p-3 text-cyan-200">
            <LockKeyhole className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">Sign in</h3>
            <p className="text-sm text-slate-400">Gunakan email dan password admin dari database.</p>
          </div>
        </div>
        <div className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none transition focus:border-cyan-300/40"
              placeholder="admin@domain.com"
              autoComplete="email"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none transition focus:border-cyan-300/40"
              placeholder="Masukkan password"
              autoComplete="current-password"
            />
          </label>
        </div>
        {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
        <button
          disabled={isSubmitting}
          className="glow-ring mt-6 w-full rounded-2xl bg-cyan-300 px-4 py-3 font-semibold text-slate-950 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Memproses login..." : "Continue to dashboard"}
        </button>
      </form>
    </div>
  );
}
