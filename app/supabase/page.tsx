import { supabase } from "@/lib/supabase";

export default async function SupabasePage() {
  let data: unknown = null;
  let errorPayload: { message: string; details?: string; hint?: string; code?: string } | null = null;

  try {
    const result = await supabase.from("businesses").select("*");
    data = result.data;

    if (result.error) {
      errorPayload = {
        message: result.error.message,
        details: result.error.details,
        hint: result.error.hint,
        code: result.error.code,
      };
    }
  } catch (error) {
    errorPayload = {
      message: error instanceof Error ? error.message : "Unknown Supabase error.",
    };
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-10">
      <h1 className="text-3xl font-semibold">Data dari Supabase</h1>
      <p className="mt-3 text-sm opacity-75">
        Contoh query langsung ke tabel <code>businesses</code> melalui{" "}
        <code>@/lib/supabase</code>.
      </p>

      <section className="mt-8 rounded-2xl border p-5">
        <h2 className="text-lg font-medium">Hasil Query</h2>
        {errorPayload ? (
          <pre className="mt-4 overflow-x-auto rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {JSON.stringify(errorPayload, null, 2)}
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
