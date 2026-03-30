"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, NotebookPen, RefreshCcw, Save } from "lucide-react";
import { saveBusiness } from "@/lib/client-api";
import type { Business } from "@/lib/types";

type Notice = {
  type: "success" | "error" | "info";
  message: string;
};

export function BoardmemoManager({ initialBusinesses }: { initialBusinesses: Business[] }) {
  const atelierBusinesses = useMemo(
    () => initialBusinesses.filter((business) => business.templateKey === "atelier-mosaic"),
    [initialBusinesses],
  );
  const availableBusinesses = atelierBusinesses.length > 0 ? atelierBusinesses : initialBusinesses;
  const [businesses, setBusinesses] = useState(availableBusinesses);
  const [selectedId, setSelectedId] = useState(availableBusinesses[0]?.id ?? 0);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const selectedBusiness = useMemo(
    () => businesses.find((business) => business.id === selectedId) ?? businesses[0] ?? null,
    [businesses, selectedId],
  );

  useEffect(() => {
    if (!notice) return undefined;
    const timeout = window.setTimeout(() => setNotice(null), 3500);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  function updateSelectedField<Key extends keyof Business>(key: Key, value: Business[Key]) {
    setBusinesses((current) =>
      current.map((business) => (business.id === selectedId ? { ...business, [key]: value } : business)),
    );
  }

  function resetBoardmemo() {
    if (!selectedBusiness) return;

    updateSelectedField("boardmemoLabel", "");
    updateSelectedField("boardmemoTitle", "");
    updateSelectedField("boardmemoBody", "");
    setNotice({ type: "info", message: "Field boardmemo dikosongkan. Simpan untuk memakai fallback default template." });
  }

  async function handleSave() {
    if (!selectedBusiness) return;

    setIsSaving(true);
    setNotice(null);

    try {
      const saved = await saveBusiness(selectedBusiness);
      setBusinesses((current) => current.map((business) => (business.id === saved.id ? saved : business)));
      setNotice({ type: "success", message: "Boardmemo berhasil disimpan ke database." });
    } catch (error) {
      setNotice({ type: "error", message: error instanceof Error ? error.message : "Gagal menyimpan boardmemo." });
    } finally {
      setIsSaving(false);
    }
  }

  if (businesses.length === 0) {
    return (
      <section className="glass-panel rounded-[2rem] p-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm leading-7 text-slate-300">
          Belum ada bisnis yang tersedia untuk diedit boardmemo-nya.
        </div>
      </section>
    );
  }

  return (
    <section className="glass-panel rounded-[2rem] p-6">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-200/70">Atelier Mosaic</p>
          <div className="mt-3 flex items-center gap-3">
            <div className="rounded-3xl border border-cyan-300/18 bg-cyan-300/10 p-4 text-cyan-100">
              <NotebookPen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white">Boardmemo Editor</h2>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                Edit panel boardmemo hero langsung dari dashboard. Data tersimpan ke tabel bisnis dan akan tampil di template Atelier Mosaic.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={resetBoardmemo}
            className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm font-semibold text-white"
          >
            <RefreshCcw className="h-4 w-4" />
            Clear
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isSaving ? "Saving..." : "Save Boardmemo"}
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-200">Pilih bisnis</span>
            <select
              value={selectedBusiness?.id ?? 0}
              onChange={(event) => setSelectedId(Number(event.target.value))}
              className="input"
            >
              {businesses.map((business) => (
                <option key={business.id} value={business.id}>
                  {business.name} (/{business.slug})
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-200">Label kecil</span>
            <input
              value={selectedBusiness?.boardmemoLabel ?? ""}
              onChange={(event) => updateSelectedField("boardmemoLabel", event.target.value)}
              className="input"
              placeholder="Board Memo"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-200">Judul memo</span>
            <input
              value={selectedBusiness?.boardmemoTitle ?? ""}
              onChange={(event) => updateSelectedField("boardmemoTitle", event.target.value)}
              className="input"
              placeholder="Structured direction for a sharper first impression."
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-200">Isi memo</span>
            <textarea
              value={selectedBusiness?.boardmemoBody ?? ""}
              onChange={(event) => updateSelectedField("boardmemoBody", event.target.value)}
              className="input min-h-32"
              placeholder="Isi ringkasan, arahan, atau positioning yang akan tampil di hero."
            />
          </label>

          {notice ? (
            <div
              className={`rounded-3xl border px-4 py-3 text-sm ${
                notice.type === "success"
                  ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-100"
                  : notice.type === "error"
                    ? "border-rose-400/25 bg-rose-400/10 text-rose-100"
                    : "border-cyan-300/25 bg-cyan-300/10 text-cyan-100"
              }`}
            >
              {notice.message}
            </div>
          ) : null}
        </div>

        <div className="rounded-[1.8rem] border border-white/10 bg-slate-950/35 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">Hero Preview</p>
              <p className="mt-2 text-lg font-semibold text-white">{selectedBusiness?.name}</p>
            </div>
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
              {selectedBusiness?.templateName ?? "No template"}
            </span>
          </div>

          <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-[#15203a]/10 bg-[#15203a] p-6 text-white shadow-[0_24px_60px_rgba(2,15,12,0.28)]">
            <p className="text-[11px] uppercase tracking-[0.32em] text-[#ff6a6f]">
              {selectedBusiness?.boardmemoLabel || "Board Memo"}
            </p>
            <h3 className="mt-4 text-2xl font-semibold leading-tight">
              {selectedBusiness?.boardmemoTitle || "Structured direction for a sharper first impression."}
            </h3>
            <p className="mt-4 text-sm leading-7 text-white/80">
              {selectedBusiness?.boardmemoBody ||
                "Gunakan boardmemo untuk menaruh ringkasan positioning, arahan presentasi, atau catatan formal yang mendukung panel hero tanpa memakan fokus gambar utama."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
