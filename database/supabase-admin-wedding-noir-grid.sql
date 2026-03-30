-- Jalankan setelah database/supabase-content-role-upgrade.sql
-- Akun ini dibuat sebagai admin biasa, bukan owner.
--
-- Login default:
-- email    : wedding.noir.admin@bisnis.me
-- password : WeddingAdmin#2026

BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM bisnis_me.templates
    WHERE key = 'noir-grid'
  ) THEN
    RAISE EXCEPTION 'Template noir-grid belum tersedia. Jalankan seed template terlebih dulu.';
  END IF;
END $$;

INSERT INTO bisnis_me.users (
  email,
  password_hash,
  name,
  role,
  created_at,
  updated_at
)
VALUES (
  'wedding.noir.admin@bisnis.me',
  'scrypt$5e9c5ea1a1775cd8f32be75150f3e8c3$890d5a94e7f4988b4c6103425261240ff42439e1c8b5c77948639cfc4b1fc0c9132d969ccbc926615f42adcedc1e4f3327e465e22f9ffb4e0542cb578e40ec33',
  'Wedding Noir Admin',
  'admin',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE
SET password_hash = EXCLUDED.password_hash,
    name = EXCLUDED.name,
    role = 'admin',
    updated_at = NOW();

WITH noir_template AS (
  SELECT id
  FROM bisnis_me.templates
  WHERE key = 'noir-grid'
  LIMIT 1
),
upsert_business AS (
  INSERT INTO bisnis_me.businesses (
    template_id,
    slug,
    name,
    tagline,
    description,
    hero_label,
    hero_image,
    hero_cta_label,
    hero_cta_url,
    about_title,
    about_intro,
    services_title,
    services_intro,
    testimonials_title,
    testimonials_intro,
    gallery_title,
    gallery_intro,
    contact_title,
    contact_intro,
    boardmemo_label,
    boardmemo_title,
    boardmemo_body,
    phone,
    whatsapp,
    address,
    meta_title,
    meta_description,
    og_image,
    created_at,
    updated_at
  )
  SELECT
    noir_template.id,
    'noir-vow-studio',
    'Noir Vow Studio',
    'Wedding planner dan stylist dengan presentasi gelap, tegas, dan terasa premium sejak first click.',
    'Kami membantu pasangan menyiapkan wedding concept, styling, koordinasi acara, dan eksekusi hari-H dengan ritme kerja yang rapi dan pengalaman yang lebih tenang.',
    'Noir Grid',
    '/uploads/seed/noir-grid.svg',
    'Reservasi Konsultasi',
    '#contact',
    'Wedding Profile',
    'Noir Vow Studio membangun pengalaman wedding yang lebih terarah lewat konsep visual yang matang, timeline yang jelas, dan eksekusi yang terasa profesional.',
    'Wedding Services',
    'Tiga layanan utama ini dirancang untuk membantu pasangan bergerak dari ide, koordinasi, sampai eksekusi hari-H tanpa terasa kacau.',
    'Client Notes',
    'Potongan testimoni klien dipakai untuk menunjukkan rasa tenang, presisi, dan kualitas eksekusi selama proses wedding.',
    'Wedding Gallery',
    'Dokumentasi visual digunakan untuk memperlihatkan atmosfer event, styling detail, dan hasil akhir yang konsisten.',
    'Book The Date',
    'Hubungi kami untuk cek tanggal, diskusi konsep wedding, dan jadwalkan sesi konsultasi awal.',
    'System Note',
    'A dark wedding experience with cleaner coordination.',
    'Setiap detail dijalankan dengan ritme kerja yang lebih tertata agar pasangan bisa fokus menikmati momen pentingnya.',
    '+62 812-7777-1122',
    '6281277771122',
    'Jl. Senopati No. 18, Jakarta Selatan',
    'Noir Vow Studio',
    'Wedding business template dengan gaya Noir Grid untuk planner, stylist, dan event coordination premium.',
    '/uploads/seed/noir-grid.svg',
    NOW(),
    NOW()
  FROM noir_template
  ON CONFLICT (slug) DO UPDATE
  SET template_id = EXCLUDED.template_id,
      name = EXCLUDED.name,
      tagline = EXCLUDED.tagline,
      description = EXCLUDED.description,
      hero_label = EXCLUDED.hero_label,
      hero_image = EXCLUDED.hero_image,
      hero_cta_label = EXCLUDED.hero_cta_label,
      hero_cta_url = EXCLUDED.hero_cta_url,
      about_title = EXCLUDED.about_title,
      about_intro = EXCLUDED.about_intro,
      services_title = EXCLUDED.services_title,
      services_intro = EXCLUDED.services_intro,
      testimonials_title = EXCLUDED.testimonials_title,
      testimonials_intro = EXCLUDED.testimonials_intro,
      gallery_title = EXCLUDED.gallery_title,
      gallery_intro = EXCLUDED.gallery_intro,
      contact_title = EXCLUDED.contact_title,
      contact_intro = EXCLUDED.contact_intro,
      boardmemo_label = EXCLUDED.boardmemo_label,
      boardmemo_title = EXCLUDED.boardmemo_title,
      boardmemo_body = EXCLUDED.boardmemo_body,
      phone = EXCLUDED.phone,
      whatsapp = EXCLUDED.whatsapp,
      address = EXCLUDED.address,
      meta_title = EXCLUDED.meta_title,
      meta_description = EXCLUDED.meta_description,
      og_image = EXCLUDED.og_image,
      updated_at = NOW()
  RETURNING id
)
INSERT INTO bisnis_me.user_business_access (user_id, business_id, created_at)
SELECT u.id, b.id, NOW()
FROM bisnis_me.users u
CROSS JOIN upsert_business b
WHERE u.email = 'wedding.noir.admin@bisnis.me'
ON CONFLICT (user_id, business_id) DO NOTHING;

DELETE FROM bisnis_me.services
WHERE business_id = (
  SELECT id
  FROM bisnis_me.businesses
  WHERE slug = 'noir-vow-studio'
);

INSERT INTO bisnis_me.services (business_id, name, description, icon, sort_order, created_at, updated_at)
SELECT b.id, service_name, service_description, service_icon, sort_order, NOW(), NOW()
FROM bisnis_me.businesses b
CROSS JOIN (
  VALUES
    ('Concept Styling', 'Susun moodboard, warna, dekor, dan arah visual wedding agar seluruh vendor bergerak dalam satu bahasa presentasi.', 'sparkles', 0),
    ('Vendor Coordination', 'Bantu shortlist vendor, susun timeline kerja, dan koordinasikan kebutuhan teknis sebelum hari acara.', 'layout-template', 1),
    ('Wedding Day Control', 'Pantau ritme rundown, eksekusi detail, dan alur komunikasi agar hari-H berjalan lebih tenang dan presisi.', 'phone-call', 2)
) AS service_data(service_name, service_description, service_icon, sort_order)
WHERE b.slug = 'noir-vow-studio';

DELETE FROM bisnis_me.testimonials
WHERE business_id = (
  SELECT id
  FROM bisnis_me.businesses
  WHERE slug = 'noir-vow-studio'
);

INSERT INTO bisnis_me.testimonials (business_id, name, role, quote, sort_order, created_at, updated_at)
SELECT b.id, customer_name, customer_role, customer_quote, sort_order, NOW(), NOW()
FROM bisnis_me.businesses b
CROSS JOIN (
  VALUES
    ('Nadia & Arga', 'Wedding Couple', 'Timeline-nya rapi, komunikasinya tenang, dan kami merasa semua detail penting benar-benar terjaga.', 0),
    ('Vina Pradipta', 'Bride', 'Styling acaranya terasa elegan dan proses koordinasinya jauh lebih ringan dibanding yang kami bayangkan.', 1),
    ('Fajar Hadi', 'Groom', 'Tim Noir Vow sigap, jelas, dan sangat membantu kami tetap fokus menikmati acara tanpa panik.', 2)
) AS testimonial_data(customer_name, customer_role, customer_quote, sort_order)
WHERE b.slug = 'noir-vow-studio';

DELETE FROM bisnis_me.gallery_items
WHERE business_id = (
  SELECT id
  FROM bisnis_me.businesses
  WHERE slug = 'noir-vow-studio'
);

INSERT INTO bisnis_me.gallery_items (business_id, title, caption, image_url, sort_order, created_at, updated_at)
SELECT
  b.id,
  gallery_data.gallery_title,
  gallery_data.gallery_caption,
  gallery_data.gallery_image,
  gallery_data.sort_order,
  NOW(),
  NOW()
FROM bisnis_me.businesses b
CROSS JOIN (
  VALUES
    ('Reception Concept', 'Preview area resepsi dengan styling premium dan lighting yang lebih dramatis.', '/uploads/seed/noir-grid.svg', 0),
    ('Bridal Detail', 'Detail dekor, florist, dan stationery yang disusun untuk menjaga identitas visual acara.', '/uploads/seed/noir-grid.svg', 1),
    ('Ceremony Flow', 'Dokumentasi transisi acara agar pasangan bisa melihat ritme keseluruhan wedding day.', '/uploads/seed/noir-grid.svg', 2),
    ('Final Atmosphere', 'Frame penutup yang menunjukkan hasil akhir event dengan nuansa yang tetap konsisten.', '/uploads/seed/noir-grid.svg', 3)
) AS gallery_data(gallery_title, gallery_caption, gallery_image, sort_order)
WHERE b.slug = 'noir-vow-studio';

COMMIT;

-- Cek hasil akhir.
SELECT id, email, name, role
FROM bisnis_me.users
WHERE email = 'wedding.noir.admin@bisnis.me';

SELECT b.id, b.slug, b.name, t.name AS template_name
FROM bisnis_me.businesses b
LEFT JOIN bisnis_me.templates t ON t.id = b.template_id
WHERE b.slug = 'noir-vow-studio';

SELECT u.email, b.slug, b.name
FROM bisnis_me.user_business_access uba
JOIN bisnis_me.users u ON u.id = uba.user_id
JOIN bisnis_me.businesses b ON b.id = uba.business_id
WHERE u.email = 'wedding.noir.admin@bisnis.me';
