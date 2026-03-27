import { supabase } from "@/lib/supabase";

export default async function SupabasePage() {
  const { data, error } = await supabase.from("businesses").select("*");

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-10">
      <h1 className="text-3xl font-semibold">Data dari Supabase</h1>
      <p className="mt-3 text-sm opacity-75">
        Contoh query langsung ke tabel <code>businesses</code> melalui{" "}
        <code>@/lib/supabase</code>.
      </p>

      <section className="mt-8 rounded-2xl border p-5">
        <h2 className="text-lg font-medium">Hasil Query</h2>
        {error ? (
          <pre className="mt-4 overflow-x-auto rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {JSON.stringify(
              {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code,
              },
              null,
              2,
            )}
          </pre>
        ) : (
          <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-950 p-4 text-sm text-slate-100">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </section>
    </main>
  );
}
