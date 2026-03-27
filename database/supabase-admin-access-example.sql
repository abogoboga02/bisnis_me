-- Jalankan setelah database/supabase-content-role-upgrade.sql

-- Pastikan akun utama menjadi owner.
UPDATE bisnis_me.users
SET role = 'owner',
    updated_at = NOW()
WHERE email = 'admin@bisnis.me';

-- Contoh membuat akun admin biasa.
-- Ganti email, password_hash, dan name sesuai kebutuhan.
INSERT INTO bisnis_me.users (email, password_hash, name, role, created_at, updated_at)
VALUES (
  'editor@bisnis.me',
  'ganti_dengan_hash_password_asli',
  'Editor Website',
  'admin',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE
SET name = EXCLUDED.name,
    role = EXCLUDED.role,
    updated_at = NOW();

-- Contoh memberi akses admin biasa ke bisnis tertentu berdasarkan slug.
INSERT INTO bisnis_me.user_business_access (user_id, business_id, created_at)
SELECT u.id, b.id, NOW()
FROM bisnis_me.users u
JOIN bisnis_me.businesses b ON b.slug IN ('atelier-rupa-studio', 'sofyan-ganteng-25')
WHERE u.email = 'editor@bisnis.me'
ON CONFLICT (user_id, business_id) DO NOTHING;

-- Cek hasil role dan scope akses.
SELECT id, email, name, role
FROM bisnis_me.users
ORDER BY id;

SELECT u.email, b.slug, b.name
FROM bisnis_me.user_business_access uba
JOIN bisnis_me.users u ON u.id = uba.user_id
JOIN bisnis_me.businesses b ON b.id = uba.business_id
ORDER BY u.email, b.slug;
