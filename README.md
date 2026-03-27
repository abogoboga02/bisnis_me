# bisnis_me

Project ini terdiri dari:

- frontend Next.js di root project
- backend Express di folder `backend/`
- database PostgreSQL untuk menyimpan templates, businesses, dan services
- session admin disimpan lewat cookie HTTP-only

## Konfigurasi PostgreSQL

1. Copy `.env.example` menjadi `.env`.
2. Isi salah satu format koneksi berikut:

```env
DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5432/bisnis_me
```

Atau gunakan variabel terpisah:

```env
APP_ORIGIN=http://localhost:3000
INTERNAL_API_KEY=ganti-dengan-random-string-panjang
ADMIN_SESSION_SECRET=ganti-dengan-secret-session-yang-berbeda
PGHOST=127.0.0.1
PGPORT=5432
PGUSER=postgres
PGPASSWORD=postgres
PGDATABASE=bisnis_me
PG_SSL=false
```

Backend akan membaca `.env`, `.env.local`, `backend/.env`, atau `backend/.env.local`.

## Menjalankan database

Pastikan PostgreSQL sudah aktif dan database `bisnis_me` sudah dibuat.

Lalu jalankan:

```bash
npm run db:init
```

Perintah ini akan membuat atau memperbarui tabel dari `backend/schema.sql`.

## Menjalankan aplikasi

Jalankan backend API:

```bash
npm run dev:api
```

Jalankan frontend Next.js:

```bash
npm run dev
```

Frontend akan mengakses backend di `http://localhost:5000` lewat `API_BASE_URL`.

## Admin login via database

Login admin sekarang membaca tabel `users` di PostgreSQL dan session disimpan via cookie HTTP-only. Tidak ada lagi fallback kredensial atau session `localStorage`.

Untuk membuat atau meng-update akun admin secara manual, jalankan:

```bash
npm run admin:sql -- --email=admin@bisnis.me --password=Admin#12345 --name="Admin Bisnis"
```

Perintah itu akan menghasilkan SQL `INSERT ... ON CONFLICT` yang bisa langsung dijalankan di PostgreSQL.

Jika akun admin belum ada di tabel `users`, halaman login akan menampilkan notifikasi bahwa akun admin tidak ditemukan.

`INTERNAL_API_KEY` wajib sama antara frontend Next.js dan backend Express karena dipakai untuk melindungi route admin/proxy internal.

## Endpoint backend

- `POST /api/admin/login`
- `GET /api/templates`
- `GET /api/businesses`
- `GET /api/business/:slug`
- `POST /api/business`
- `PUT /api/business/:id`
- `DELETE /api/business/:id`
