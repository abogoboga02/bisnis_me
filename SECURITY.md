# Security Notes

Dokumen ini merangkum proteksi utama yang sudah aktif di aplikasi dan beberapa langkah operasional yang tetap perlu dijaga di level deployment.

## Proteksi yang Sudah Aktif

- Admin session disimpan di cookie `HttpOnly`, `Secure` saat production, `SameSite=Strict`, dan `priority=high`.
- Route admin/write sekarang memeriksa `Origin` atau `Referer` agar request lintas situs tidak bisa menembak endpoint sensitif dengan mudah.
- Login admin, upload, create/update/delete bisnis, logout, dan pembuatan user sudah diberi rate limit dasar di server.
- Upload gambar hanya menerima `JPG`, `PNG`, dan `WEBP`, dibatasi `2 MB`, dan file signature diperiksa sebelum disimpan.
- URL yang masuk ke field CTA atau media sekarang disaring agar tidak menerima skema berbahaya seperti `javascript:` atau `data:`.
- Header browser security sudah ditambahkan global lewat Next.js:
  - `Content-Security-Policy`
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy`

## Ancaman yang Sudah Dikurangi

- Brute-force login admin
- CSRF pada endpoint admin dan write action
- Upload file palsu yang menyamar sebagai gambar
- Stored XSS lewat URL CTA/gambar berbahaya
- Clickjacking dan embedding halaman admin di iframe pihak ketiga

## Rekomendasi Deployment

- Simpan `ADMIN_SESSION_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, dan secret lain hanya di environment server, jangan di client bundle.
- Gunakan HTTPS penuh di production.
- Batasi akses dashboard admin dengan akun yang benar-benar diperlukan saja.
- Rotasi password admin dan secret session secara berkala.
- Aktifkan log audit di deployment platform atau reverse proxy untuk memantau percobaan login berulang.
- Jika trafik mulai tinggi, pindahkan rate limiting ke Redis atau edge store agar tidak bergantung pada memori proses tunggal.
- Pastikan bucket Supabase Storage memakai policy yang sesuai kebutuhan publik/pribadi.

## Catatan Repo

- Folder SQL Supabase tidak dihapus dalam cleanup ini karena masih dipakai untuk setup, upgrade schema, dan recovery environment baru.
- Cache build lokal seperti `.next/` aman dihapus kapan saja karena akan dibuat ulang saat development atau build berikutnya.
