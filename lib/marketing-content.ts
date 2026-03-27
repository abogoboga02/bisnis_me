import type { LucideIcon } from "lucide-react";
import {
  BadgeDollarSign,
  CheckCircle2,
  Clock3,
  FileText,
  Globe,
  Layers3,
  LayoutTemplate,
  MonitorSmartphone,
  MousePointerClick,
  Rocket,
  Search,
  Send,
  Store,
  Wifi,
} from "lucide-react";

export type TemplateCategory =
  | "company-profile"
  | "travel"
  | "restoran"
  | "jasa"
  | "toko-online"
  | "personal-brand";

export type MarketingTemplate = {
  name: string;
  category: TemplateCategory;
  categoryLabel: string;
  fit: string;
  feature: string;
  accent: string;
};

export const heroBenefits = [
  "Template profesional untuk UMKM, travel, jasa, dan bisnis lokal.",
  "Buat website lebih cepat tanpa mulai dari nol atau coding rumit.",
  "Tampilan modern, responsif, dan siap dipakai untuk promosi bisnis.",
];

export const commonProblems = [
  {
    title: "Bisnis terlihat kurang meyakinkan",
    copy: "Banyak calon pelanggan ragu karena bisnis belum punya website resmi yang menampilkan profil, layanan, dan kontak dengan jelas.",
  },
  {
    title: "Promosi hanya bergantung pada media sosial",
    copy: "Konten cepat tenggelam di timeline, sehingga informasi penting sering tidak ditemukan saat calon pelanggan ingin mencari detail bisnis.",
  },
  {
    title: "Pembuatan website terasa rumit",
    copy: "Banyak pemilik bisnis mengira website butuh proses teknis yang sulit, lama, dan harus dikerjakan oleh developer dari nol.",
  },
  {
    title: "Biaya dianggap terlalu mahal",
    copy: "Karena belum tahu ada opsi yang praktis, banyak bisnis menunda punya website karena khawatir harus keluar biaya besar di awal.",
  },
];

export const solutionBenefits: Array<{ icon: LucideIcon; title: string; copy: string }> = [
  {
    icon: Clock3,
    title: "Cepat",
    copy: "Pilih template dan susun website bisnis dalam waktu singkat tanpa proses panjang.",
  },
  {
    icon: BadgeDollarSign,
    title: "Murah",
    copy: "Lebih hemat dibanding membuat website custom dari nol untuk kebutuhan bisnis sederhana.",
  },
  {
    icon: MousePointerClick,
    title: "Mudah digunakan",
    copy: "Cukup isi informasi bisnis, ubah konten penting, lalu sesuaikan tampilan yang dibutuhkan.",
  },
  {
    icon: Wifi,
    title: "Langsung online",
    copy: "Setelah informasi lengkap, website siap dipublikasikan dan langsung bisa dibagikan ke pelanggan.",
  },
];

export const howItWorks: Array<{ icon: LucideIcon; title: string; copy: string; idea: string }> = [
  {
    icon: LayoutTemplate,
    title: "Pilih template",
    copy: "Tentukan desain yang paling sesuai dengan jenis bisnis dan gaya promosi Anda.",
    idea: "Ide icon: layout template atau grid tampilan website.",
  },
  {
    icon: FileText,
    title: "Isi informasi bisnis",
    copy: "Masukkan nama bisnis, layanan, kontak, deskripsi, dan CTA agar pelanggan langsung paham penawaran Anda.",
    idea: "Ide icon: form, dokumen, atau edit content.",
  },
  {
    icon: Send,
    title: "Website langsung online",
    copy: "Begitu konten siap, website bisa langsung tayang dan dipakai untuk promosi maupun menerima leads.",
    idea: "Ide icon: publish, roket launch, atau sinyal online.",
  },
];

export const templateCatalog: MarketingTemplate[] = [
  {
    name: "Company Profile Prime",
    category: "company-profile",
    categoryLabel: "Company Profile",
    fit: "Perusahaan kecil, konsultan, kontraktor, agency",
    feature: "Profil perusahaan, layanan utama, portofolio, dan CTA kontak.",
    accent: "#67e8f9",
  },
  {
    name: "Travel Booking Flow",
    category: "travel",
    categoryLabel: "Travel",
    fit: "Travel agent, tour organizer, rental wisata",
    feature: "Paket perjalanan, itinerary singkat, galeri destinasi, dan tombol WhatsApp.",
    accent: "#38bdf8",
  },
  {
    name: "Resto Menu Story",
    category: "restoran",
    categoryLabel: "Restoran",
    fit: "Restoran, cafe, kuliner lokal, catering",
    feature: "Daftar menu unggulan, jam operasional, promo, dan reservasi cepat.",
    accent: "#f59e0b",
  },
  {
    name: "Service Pro Launch",
    category: "jasa",
    categoryLabel: "Jasa",
    fit: "Bisnis jasa, servis, cleaning, maintenance",
    feature: "Penjelasan layanan, area jangkauan, testimoni, dan form pemesanan.",
    accent: "#34d399",
  },
  {
    name: "Shop Catalog Lite",
    category: "toko-online",
    categoryLabel: "Toko Online",
    fit: "Toko online, retail, penjual produk lokal",
    feature: "Katalog produk, highlight promo, CTA pembelian, dan link marketplace.",
    accent: "#fb7185",
  },
  {
    name: "Personal Brand Signature",
    category: "personal-brand",
    categoryLabel: "Personal Brand",
    fit: "Konsultan, trainer, freelancer, public figure",
    feature: "Profil personal, layanan, pencapaian, dan ajakan booking konsultasi.",
    accent: "#a78bfa",
  },
  {
    name: "Atelier Mosaic Story",
    category: "personal-brand",
    categoryLabel: "Personal Brand",
    fit: "Personal brand premium, studio kreatif, brand consultant, boutique service",
    feature: "Hero editorial, about spread, service narrative, testimoni, galeri, dan contact finale.",
    accent: "#c86f4d",
  },
];

export const platformFeatures: Array<{ icon: LucideIcon; title: string; copy: string }> = [
  {
    icon: MonitorSmartphone,
    title: "Mobile Friendly",
    copy: "Tampilan website tetap rapi dan nyaman dibuka di ponsel, tablet, maupun desktop.",
  },
  {
    icon: Search,
    title: "SEO Friendly",
    copy: "Struktur halaman dirancang agar lebih mudah ditemukan calon pelanggan melalui mesin pencari.",
  },
  {
    icon: Send,
    title: "Integrasi WhatsApp",
    copy: "Pengunjung bisa langsung menghubungi bisnis melalui tombol CTA yang terhubung ke WhatsApp.",
  },
  {
    icon: Layers3,
    title: "Hosting Included",
    copy: "Website siap tayang tanpa perlu repot mengurus teknis hosting secara terpisah.",
  },
  {
    icon: Globe,
    title: "Custom Domain",
    copy: "Gunakan domain bisnis sendiri agar brand terlihat lebih profesional dan terpercaya.",
  },
  {
    icon: Rocket,
    title: "Cepat Diakses",
    copy: "Halaman dibuat ringan agar website lebih cepat dibuka dan tidak membuat calon pelanggan menunggu.",
  },
];

export const showcaseSites = [
  {
    name: "Aurora Travel",
    type: "Travel Agent",
    url: "https://auroratravel.bisnis.me",
  },
  {
    name: "Saji Rasa Nusantara",
    type: "Restoran",
    url: "https://sajirasa.bisnis.me",
  },
  {
    name: "Prima Teknik Service",
    type: "Jasa Servis",
    url: "https://primateknik.bisnis.me",
  },
  {
    name: "Ruang Lokal Store",
    type: "Toko Online",
    url: "https://ruanglokal.bisnis.me",
  },
  {
    name: "Nadia Pratama",
    type: "Personal Brand",
    url: "https://nadiapratama.bisnis.me",
  },
];

export const socialProofStats = [
  {
    value: "1.250+",
    label: "Website dibuat",
  },
  {
    value: "800+",
    label: "Bisnis aktif",
  },
  {
    value: "99.9%",
    label: "Uptime server",
  },
  {
    value: "4.9/5",
    label: "Kepuasan pengguna",
  },
];

export const pricingPlans = [
  {
    name: "FREE",
    badge: "Mulai dari sini",
    description: "Cocok untuk mencoba platform dan membuat website bisnis pertama tanpa biaya awal.",
    features: [
      "Akses template dasar untuk website bisnis",
      "Edit informasi bisnis, layanan, dan kontak",
      "Website mobile friendly",
      "Tombol CTA dan integrasi WhatsApp dasar",
    ],
    limits: [
      "Pilihan template terbatas",
      "Menggunakan subdomain platform",
      "Fitur penyesuaian lanjutan belum tersedia",
      "Cocok untuk kebutuhan trial dan validasi awal",
    ],
    cta: "Coba Paket Gratis",
    highlight: true,
  },
  {
    name: "PRO",
    badge: "Untuk bisnis berkembang",
    description: "Cocok untuk bisnis yang ingin tampilan lebih serius, fleksibel, dan siap dipakai untuk promosi penuh.",
    features: [
      "Akses lebih banyak template premium",
      "Custom domain untuk branding bisnis",
      "Hosting included dan performa lebih stabil",
      "Fitur website lebih lengkap untuk promosi dan leads",
    ],
    limits: [
      "Memerlukan biaya berlangganan",
      "Penggunaan untuk bisnis yang sudah siap scale up",
      "Setup domain mengikuti kebutuhan brand",
      "Lebih cocok setelah website gratis mulai menunjukkan hasil",
    ],
    cta: "Lihat Paket Pro",
    highlight: false,
  },
];

export const testimonials = [
  {
    name: "Rina Saputra",
    role: "Owner travel agency",
    quote: "Sebelumnya kami hanya promosi lewat media sosial. Setelah punya website, calon pelanggan jadi lebih yakin dan lebih mudah menghubungi kami.",
  },
  {
    name: "Dimas Kurniawan",
    role: "Pemilik bisnis jasa",
    quote: "Prosesnya jauh lebih sederhana dari yang saya bayangkan. Tinggal pilih template, isi informasi, lalu website bisa langsung dipakai untuk promosi.",
  },
  {
    name: "Maya Lestari",
    role: "Pemilik UMKM kuliner",
    quote: "Template-nya sudah rapi, tampil profesional di HP, dan sangat membantu bisnis saya terlihat lebih serius di mata pelanggan baru.",
  },
];

export const faqItems = [
  {
    question: "Apakah benar bisa mulai gratis?",
    answer: "Ya. Anda bisa mencoba paket gratis untuk membuat website bisnis pertama, mengenal alur platform, dan melihat hasilnya sebelum memutuskan upgrade.",
  },
  {
    question: "Apakah saya bisa pakai domain sendiri?",
    answer: "Bisa. Untuk kebutuhan branding yang lebih profesional, platform menyediakan opsi custom domain pada paket yang lebih lengkap.",
  },
  {
    question: "Apakah website bisa diedit kapan saja?",
    answer: "Bisa. Anda dapat mengubah informasi bisnis, layanan, deskripsi, dan CTA kapan pun sesuai kebutuhan promosi.",
  },
  {
    question: "Apakah website yang dibuat mobile friendly?",
    answer: "Ya. Template dirancang agar tetap nyaman dilihat di ponsel, tablet, dan desktop sehingga pengunjung mendapatkan pengalaman yang konsisten.",
  },
  {
    question: "Apakah saya perlu bisa coding?",
    answer: "Tidak perlu. Platform ini dibuat untuk pemilik bisnis yang ingin cepat online tanpa harus memahami teknis coding.",
  },
  {
    question: "Apakah website bisa langsung online setelah selesai?",
    answer: "Bisa. Setelah template dipilih dan informasi bisnis dilengkapi, website dapat langsung dipublikasikan dan dibagikan ke pelanggan.",
  },
];

export const finalCta = {
  headline: "Coba gratis dan lihat secepat apa website bisnis Anda bisa online",
  subheadline:
    "Mulai dari template yang sudah siap pakai, isi informasi bisnis Anda, lalu publikasikan website profesional tanpa proses yang rumit.",
  primaryLabel: "Mulai Free Trial",
  primaryHref: "/admin/business",
};

export const blogIdeas = [
  {
    title: "Cara Membuat Website Bisnis untuk Pemula Tanpa Coding",
    keyword: "cara membuat website bisnis",
  },
  {
    title: "Langkah Praktis Membuat Website untuk UMKM agar Terlihat Profesional",
    keyword: "website untuk UMKM",
  },
  {
    title: "Panduan Membuat Website Company Profile yang Meyakinkan Calon Klien",
    keyword: "website company profile",
  },
  {
    title: "Rekomendasi Website Bisnis Murah untuk Usaha Kecil",
    keyword: "website bisnis murah",
  },
  {
    title: "Kenapa UMKM Perlu Punya Website Sendiri, Bukan Hanya Media Sosial",
    keyword: "website untuk UMKM",
  },
  {
    title: "Berapa Biaya Membuat Website Bisnis dan Apa Saja yang Perlu Disiapkan",
    keyword: "website bisnis murah",
  },
  {
    title: "Contoh Struktur Website Company Profile yang Efektif untuk Bisnis",
    keyword: "website company profile",
  },
  {
    title: "Cara Membuat Website Bisnis Cepat dengan Template Siap Pakai",
    keyword: "cara membuat website bisnis",
  },
  {
    title: "Website untuk UMKM: Fitur Wajib agar Mudah Mendatangkan Pelanggan",
    keyword: "website untuk UMKM",
  },
  {
    title: "Tips Memilih Platform Website Bisnis Murah tapi Tetap Profesional",
    keyword: "website bisnis murah",
  },
  {
    title: "Cara Menulis Konten Website Company Profile agar Lebih Meyakinkan",
    keyword: "website company profile",
  },
  {
    title: "Kesalahan Umum Saat Membuat Website Bisnis Pertama",
    keyword: "cara membuat website bisnis",
  },
  {
    title: "Panduan Website untuk UMKM Kuliner, Jasa, dan Travel",
    keyword: "website untuk UMKM",
  },
  {
    title: "Website Bisnis Murah vs Website Custom, Mana yang Lebih Cocok?",
    keyword: "website bisnis murah",
  },
  {
    title: "Checklist Website Company Profile untuk Perusahaan Kecil",
    keyword: "website company profile",
  },
  {
    title: "Cara Membuat Website Bisnis yang Mobile Friendly dan Cepat Dibuka",
    keyword: "cara membuat website bisnis",
  },
  {
    title: "Strategi SEO Dasar untuk Website UMKM yang Baru Online",
    keyword: "website untuk UMKM",
  },
  {
    title: "Kapan Bisnis Perlu Upgrade dari Website Gratis ke Website Pro",
    keyword: "website bisnis murah",
  },
  {
    title: "Contoh Halaman Website Company Profile yang Paling Penting",
    keyword: "website company profile",
  },
  {
    title: "Cara Membuat Website Bisnis Murah yang Tetap Terlihat Premium",
    keyword: "website bisnis murah",
  },
];

export const productLinks = [
  { label: "Homepage", href: "/" },
  { label: "Templates", href: "/templates" },
  { label: "Pricing", href: "/pricing" },
  { label: "Examples", href: "/examples" },
  { label: "Blog", href: "/blog" },
  { label: "Login", href: "/login" },
];

export const problemIcon = Store;
export const pricingIcon = BadgeDollarSign;
export const faqIcon = CheckCircle2;
