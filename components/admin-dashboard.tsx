import Link from "next/link";
import {
  ArrowRight,
  Blocks,
  Building2,
  Eye,
  FolderKanban,
  type LucideIcon,
  MessageCircleMore,
  ShieldCheck,
  Sparkles,
  Users2,
} from "lucide-react";
import { AdminLogoutButton } from "@/components/admin-logout-button";
import { OwnerUserManager } from "@/components/owner-user-manager";
import type { AdminIdentity, Business, ManagedUser, Template } from "@/lib/types";

const adminDateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Bangkok",
});

type DashboardMetric = {
  label: string;
  value: number | string;
  description: string;
  icon: LucideIcon;
};

type QuickAction = {
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
  tone: "brand" | "neutral";
};

export function AdminDashboard({
  currentAdmin,
  businesses,
  templates,
  users,
}: {
  currentAdmin: AdminIdentity;
  businesses: Business[];
  templates: Template[];
  users: ManagedUser[];
}) {
  const totalServices = businesses.reduce((total, business) => total + business.services.length, 0);
  const totalTestimonials = businesses.reduce((total, business) => total + business.testimonials.length, 0);
  const totalGalleryItems = businesses.reduce((total, business) => total + business.galleryItems.length, 0);
  const businessesWithTemplate = businesses.filter((business) => business.templateId).length;
  const businessesWithTestimonials = businesses.filter((business) => business.testimonials.length > 0).length;
  const businessesWithGallery = businesses.filter((business) => business.galleryItems.length > 0).length;
  const templateCoverage = businesses.length > 0 ? Math.round((businessesWithTemplate / businesses.length) * 100) : 0;
  const testimonialCoverage = businesses.length > 0 ? Math.round((businessesWithTestimonials / businesses.length) * 100) : 0;
  const galleryCoverage = businesses.length > 0 ? Math.round((businessesWithGallery / businesses.length) * 100) : 0;
  const previewHref = businesses[0] ? `/${businesses[0].slug}` : "/";
  const visibleTemplateCategories = Array.from(
    new Set(templates.map((template) => template.categoryLabel || template.category)),
  ).slice(0, 4);

  const metrics: DashboardMetric[] = [
    {
      label: "Website",
      value: businesses.length,
      description: currentAdmin.role === "owner" ? "Seluruh bisnis yang bisa dikelola dari akun owner." : "Website yang menjadi scope akun ini.",
      icon: Building2,
    },
    {
      label: "Template",
      value: templates.length,
      description: "Template yang tampil di dashboard sesuai izin akun.",
      icon: Blocks,
    },
    {
      label: "Layanan",
      value: totalServices,
      description: "Total service card yang sudah tersimpan di semua bisnis yang terlihat.",
      icon: ShieldCheck,
    },
    {
      label: "Testimoni",
      value: totalTestimonials,
      description: "Jumlah testimoni yang ikut membentuk kredibilitas landing page.",
      icon: MessageCircleMore,
    },
  ];

  const quickActions: QuickAction[] = [
    {
      label: "Buka editor bisnis",
      description: "Masuk ke halaman kerja utama untuk menambah, mengubah, dan menyimpan landing page.",
      href: "/admin/business",
      icon: FolderKanban,
      tone: "brand",
    },
    {
      label: "Lihat katalog template",
      description: "Bandingkan template yang tersedia sebelum menentukan identitas visual website.",
      href: "/admin/templates",
      icon: Sparkles,
      tone: "neutral",
    },
    {
      label: currentAdmin.role === "owner" ? "Kelola akses user" : "Lihat scope akun",
      description:
        currentAdmin.role === "owner"
          ? "Owner dapat membuat akun baru dan memberi akses bisnis dari satu tempat."
          : "Ringkasan bisnis di bawah menunjukkan website yang bisa Anda kelola sekarang.",
      href: currentAdmin.role === "owner" ? "#owner-access" : "#scope-summary",
      icon: Users2,
      tone: "neutral",
    },
  ];

  return (
    <main className="admin-grid min-h-screen px-4 py-6 md:px-8 md:py-8">
      <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="glass-panel self-start rounded-[2rem] p-5 xl:sticky xl:top-6">
          <div className="rounded-[1.7rem] border border-white/10 bg-[#071d18]/80 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-lime-100/70">Bisnis.me admin</p>
            <h1 className="mt-3 font-sans text-2xl font-semibold tracking-[-0.03em] text-white">Workspace</h1>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Dashboard operasional yang merangkum website, template, dan hak akses tanpa membuat admin tersesat.
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
                {businesses.length} website
              </span>
            </div>
          </div>

          <nav className="mt-5 space-y-2" aria-label="Navigasi admin">
            <SidebarLink
              href="/admin/dashboard"
              label="Dashboard overview"
              description="Ringkasan cepat untuk mengambil keputusan harian."
              icon={Building2}
              active
            />
            <SidebarLink
              href="/admin/business"
              label="Business manager"
              description="Kelola isi landing page, gambar, dan konten tiap bisnis."
              icon={FolderKanban}
            />
            <SidebarLink
              href="/admin/templates"
              label="Template library"
              description="Lihat opsi template dan identitas visual yang tersedia."
              icon={Sparkles}
            />
          </nav>

          <div className="mt-5 rounded-[1.7rem] border border-white/10 bg-slate-950/35 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Access scope</p>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              {currentAdmin.role === "owner"
                ? "Owner dapat melihat semua bisnis, semua template, dan panel manajemen user."
                : "Admin hanya melihat bisnis dan template yang memang dipetakan ke akun ini."}
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <MiniInfoCard label="Coverage template" value={`${templateCoverage}%`} />
              <MiniInfoCard label="Item galeri" value={totalGalleryItems} />
            </div>
          </div>

          <AdminLogoutButton
            className="mt-5 inline-flex w-full items-center justify-center rounded-[1.15rem] border border-white/12 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            label="Keluar dari admin"
          />
        </aside>

        <div className="space-y-6">
          <section className="glass-panel relative overflow-hidden rounded-[2rem] p-6 md:p-8">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime-200/50 to-transparent" />
            <div className="pointer-events-none absolute -right-12 top-0 h-40 w-40 rounded-full bg-lime-300/12 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-10 left-0 h-36 w-36 rounded-full bg-cyan-300/10 blur-3xl" />

            <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-3xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-lime-100/72">Admin dashboard</p>
                <h2 className="mt-4 font-sans text-3xl font-semibold tracking-[-0.04em] text-white md:text-4xl">
                  Panel kerja yang lebih rapi, cepat dibaca, dan nyaman dipakai tiap hari.
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  Struktur halaman ini mengambil pola admin panel yang familiar: aksi utama ada di atas, angka penting
                  terlihat langsung, dan daftar bisnis dipresentasikan seperti workspace operasional, bukan seperti
                  landing page.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/admin/business"
                  className="inline-flex items-center gap-2 rounded-[1rem] bg-lime-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5"
                >
                  Kelola bisnis
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/admin/templates"
                  className="inline-flex items-center gap-2 rounded-[1rem] border border-white/12 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Lihat template
                </Link>
                {businesses[0] ? (
                  <Link
                    href={previewHref}
                    className="inline-flex items-center gap-2 rounded-[1rem] border border-white/12 bg-slate-950/35 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    <Eye className="h-4 w-4" />
                    Preview situs
                  </Link>
                ) : null}
              </div>
            </div>

            <div className="relative mt-6 grid gap-4 lg:grid-cols-3">
              {quickActions.map((action) => (
                <QuickActionCard key={action.label} {...action} />
              ))}
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
            {metrics.map((metric) => (
              <MetricCard key={metric.label} {...metric} />
            ))}
          </section>

          <section className="grid gap-6 2xl:grid-cols-[1.45fr_0.95fr]">
            <section id="scope-summary" className="glass-panel rounded-[2rem] p-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-lime-100/70">Business registry</p>
                  <h3 className="mt-2 font-sans text-2xl font-semibold tracking-[-0.03em] text-white">
                    Website yang masuk ke workspace Anda
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Setiap baris memudahkan admin memindai slug, template aktif, jumlah konten, dan pintasan aksi.
                  </p>
                </div>
                <span className="inline-flex w-fit items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                  {businesses.length} bisnis
                </span>
              </div>

              {businesses.length === 0 ? (
                <div className="mt-5 rounded-[1.5rem] border border-dashed border-white/12 bg-white/5 p-5 text-sm leading-7 text-slate-300">
                  Belum ada bisnis yang bisa diakses oleh akun ini. Jika Anda owner, buka editor bisnis untuk membuat
                  website pertama.
                </div>
              ) : (
                <div className="mt-5 space-y-3">
                  {businesses.map((business) => (
                    <article
                      key={business.id}
                      className="rounded-[1.5rem] border border-white/10 bg-slate-950/35 p-4 transition hover:border-lime-300/18"
                    >
                      <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-center 2xl:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-sans text-lg font-semibold text-white">{business.name}</h4>
                            <span
                              className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                                business.templateName
                                  ? "border-lime-300/20 bg-lime-300/10 text-lime-100"
                                  : "border-amber-300/20 bg-amber-300/10 text-amber-100"
                              }`}
                            >
                              {business.templateName ?? "Belum ada template"}
                            </span>
                          </div>
                          <p className="mt-1 font-mono text-xs text-slate-400">/{business.slug}</p>
                          <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">
                            Diupdate {formatDateLabel(business.updatedAt)}
                          </p>
                        </div>

                        <div className="grid gap-2 sm:grid-cols-3 2xl:min-w-[320px]">
                          <CountPill label="Layanan" value={business.services.length} />
                          <CountPill label="Testimoni" value={business.testimonials.length} />
                          <CountPill label="Galeri" value={business.galleryItems.length} />
                        </div>

                        <div className="flex flex-wrap gap-2 2xl:justify-end">
                          <Link
                            href={`/${business.slug}`}
                            className="inline-flex items-center gap-2 rounded-[0.95rem] border border-white/12 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                          >
                            <Eye className="h-4 w-4" />
                            Preview
                          </Link>
                          <Link
                            href="/admin/business"
                            className="inline-flex items-center gap-2 rounded-[0.95rem] border border-lime-300/20 bg-lime-300/10 px-4 py-2 text-sm font-semibold text-lime-100 transition hover:bg-lime-300/16"
                          >
                            <FolderKanban className="h-4 w-4" />
                            Buka editor
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <div className="space-y-6">
              <section className="glass-panel rounded-[2rem] p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-lime-100/70">Operational snapshot</p>
                <h3 className="mt-2 font-sans text-2xl font-semibold tracking-[-0.03em] text-white">Kesiapan konten</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Panel ini membantu admin melihat apakah setiap website sudah punya fondasi konten dasar.
                </p>

                <div className="mt-5 space-y-4">
                  <CoverageBar
                    label="Template sudah terpasang"
                    value={`${businessesWithTemplate}/${businesses.length || 0}`}
                    progress={templateCoverage}
                  />
                  <CoverageBar
                    label="Website dengan testimoni"
                    value={`${businessesWithTestimonials}/${businesses.length || 0}`}
                    progress={testimonialCoverage}
                  />
                  <CoverageBar
                    label="Website dengan galeri"
                    value={`${businessesWithGallery}/${businesses.length || 0}`}
                    progress={galleryCoverage}
                  />
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <MiniInfoCard label="Total galeri" value={totalGalleryItems} />
                  <MiniInfoCard label="Role aktif" value={currentAdmin.role} />
                  <MiniInfoCard label="User terlihat" value={currentAdmin.role === "owner" ? users.length : "Scoped"} />
                </div>
              </section>

              <section id="template-visibility" className="glass-panel rounded-[2rem] p-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-lime-100/70">Template visibility</p>
                    <h3 className="mt-2 font-sans text-2xl font-semibold tracking-[-0.03em] text-white">
                      Template yang bisa dipakai sekarang
                    </h3>
                  </div>
                  <Link href="/admin/templates" className="inline-flex items-center gap-2 text-sm font-semibold text-lime-100">
                    Buka katalog
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {visibleTemplateCategories.map((category) => (
                    <span
                      key={category}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300"
                    >
                      {category}
                    </span>
                  ))}
                </div>

                <div className="mt-5 space-y-3">
                  {templates.length === 0 ? (
                    <div className="rounded-[1.5rem] border border-dashed border-white/12 bg-white/5 p-5 text-sm leading-7 text-slate-300">
                      Belum ada template yang masuk ke scope akun ini.
                    </div>
                  ) : (
                    templates.slice(0, 5).map((template) => (
                      <article key={template.id} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                        <div className="flex items-start gap-3">
                          <span
                            className="mt-1 inline-flex h-3 w-3 shrink-0 rounded-full"
                            style={{ backgroundColor: template.accent ?? "#c7f36c" }}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="font-sans text-base font-semibold text-white">{template.name}</p>
                              <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                                {template.categoryLabel || template.category}
                              </span>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-slate-300">{template.description}</p>
                            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
                              <span className="rounded-full border border-white/10 bg-slate-950/35 px-3 py-1">
                                Fit: {template.fit}
                              </span>
                              <span className="rounded-full border border-white/10 bg-slate-950/35 px-3 py-1">
                                Feature: {template.feature}
                              </span>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </section>
            </div>
          </section>

          {currentAdmin.role === "owner" ? <OwnerUserManager businesses={businesses} initialUsers={users} /> : null}
        </div>
      </div>
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
      className={`flex items-start gap-3 rounded-[1.2rem] border px-4 py-3 transition ${
        active
          ? "border-lime-300/20 bg-lime-300/10 text-lime-100"
          : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
      }`}
    >
      <span className={`rounded-[0.9rem] p-2 ${active ? "bg-lime-300/14" : "bg-slate-950/35"}`}>
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold">{label}</span>
        <span className={`mt-1 block text-xs leading-5 ${active ? "text-lime-100/78" : "text-slate-400"}`}>
          {description}
        </span>
      </span>
    </Link>
  );
}

function QuickActionCard({ label, description, href, icon: Icon, tone }: QuickAction) {
  return (
    <Link
      href={href}
      className={`rounded-[1.5rem] border p-5 transition hover:-translate-y-0.5 ${
        tone === "brand"
          ? "border-lime-300/18 bg-lime-300/10 text-lime-100"
          : "border-white/10 bg-white/5 text-white hover:bg-white/8"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-sans text-lg font-semibold">{label}</p>
          <p className={`mt-2 text-sm leading-6 ${tone === "brand" ? "text-lime-100/80" : "text-slate-300"}`}>
            {description}
          </p>
        </div>
        <span className={`rounded-[1rem] p-3 ${tone === "brand" ? "bg-lime-300/14" : "bg-slate-950/35"}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold">
        Buka panel
        <ArrowRight className="h-4 w-4" />
      </div>
    </Link>
  );
}

function MetricCard({ label, value, description, icon: Icon }: DashboardMetric) {
  return (
    <article className="glass-panel rounded-[1.7rem] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-lime-100/70">{label}</p>
          <p className="mt-3 font-sans text-3xl font-semibold tracking-[-0.03em] text-white">{value}</p>
        </div>
        <span className="rounded-[1rem] bg-lime-300/10 p-3 text-lime-100">
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-400">{description}</p>
    </article>
  );
}

function MiniInfoCard({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-[1.15rem] border border-white/10 bg-white/5 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 font-sans text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function CountPill({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-[1rem] border border-white/10 bg-white/5 px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-1 font-sans text-base font-semibold text-white">{value}</p>
    </div>
  );
}

function CoverageBar({
  label,
  value,
  progress,
}: {
  label: string;
  value: string;
  progress: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-slate-300">{label}</span>
        <span className="font-semibold text-white">{value}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/8">
        <div
          className="h-full rounded-full bg-gradient-to-r from-lime-300 via-cyan-300 to-emerald-300"
          style={{ width: `${Math.max(0, Math.min(progress, 100))}%` }}
        />
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
