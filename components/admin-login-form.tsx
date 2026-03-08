"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LockKeyhole, Sparkles } from "lucide-react";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("admin@bisnis.me");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (email === "admin@bisnis.me" && password === "admin123") {
      window.localStorage.setItem("admin-session", "active");
      router.push(searchParams.get("redirect") || "/admin/dashboard");
      return;
    }

    setError("Use admin@bisnis.me / admin123 for the demo admin login.");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="glass-panel rounded-[2rem] p-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-cyan-100">
          <Sparkles className="h-4 w-4" />
          Demo credentials enabled
        </div>
        <h2 className="mt-6 font-display text-3xl font-bold text-white">Fast access for content admins.</h2>
        <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
          This dashboard demo uses a local session token so you can manage business records immediately.
          Wire it to your preferred auth provider later without changing the content model.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel rounded-[2rem] p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-2xl bg-cyan-300/15 p-3 text-cyan-200">
            <LockKeyhole className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">Sign in</h3>
            <p className="text-sm text-slate-400">Email: admin@bisnis.me, Password: admin123</p>
          </div>
        </div>
        <div className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Email</span>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none transition focus:border-cyan-300/40"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none transition focus:border-cyan-300/40"
            />
          </label>
        </div>
        {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
        <button className="glow-ring mt-6 w-full rounded-2xl bg-cyan-300 px-4 py-3 font-semibold text-slate-950 transition hover:-translate-y-0.5">
          Continue to dashboard
        </button>
      </form>
    </div>
  );
}
