ALTER TABLE bisnis_me.users
ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'admin';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'users_role_check'
  ) THEN
    ALTER TABLE bisnis_me.users
    ADD CONSTRAINT users_role_check CHECK (role IN ('owner', 'admin'));
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS bisnis_me.user_business_access (
  user_id INTEGER NOT NULL REFERENCES bisnis_me.users(id) ON DELETE CASCADE,
  business_id INTEGER NOT NULL REFERENCES bisnis_me.businesses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, business_id)
);

ALTER TABLE bisnis_me.templates
ADD COLUMN IF NOT EXISTS category VARCHAR(80) NOT NULL DEFAULT 'jasa',
ADD COLUMN IF NOT EXISTS category_label VARCHAR(120) NOT NULL DEFAULT 'Jasa',
ADD COLUMN IF NOT EXISTS fit TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS feature TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS preview_image TEXT;

ALTER TABLE bisnis_me.businesses
ADD COLUMN IF NOT EXISTS hero_label VARCHAR(120) NOT NULL DEFAULT 'Business template',
ADD COLUMN IF NOT EXISTS about_title VARCHAR(160) NOT NULL DEFAULT 'About',
ADD COLUMN IF NOT EXISTS about_intro TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS services_title VARCHAR(160) NOT NULL DEFAULT 'Services',
ADD COLUMN IF NOT EXISTS services_intro TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS testimonials_title VARCHAR(160) NOT NULL DEFAULT 'Testimonials',
ADD COLUMN IF NOT EXISTS testimonials_intro TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS gallery_title VARCHAR(160) NOT NULL DEFAULT 'Gallery',
ADD COLUMN IF NOT EXISTS gallery_intro TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS contact_title VARCHAR(160) NOT NULL DEFAULT 'Contact',
ADD COLUMN IF NOT EXISTS contact_intro TEXT NOT NULL DEFAULT '';

UPDATE bisnis_me.businesses
SET hero_label = COALESCE(NULLIF(hero_label, ''), 'Business template'),
    about_title = COALESCE(NULLIF(about_title, ''), 'Tentang bisnis'),
    about_intro = COALESCE(NULLIF(about_intro, ''), description, ''),
    services_title = COALESCE(NULLIF(services_title, ''), 'Layanan'),
    services_intro = COALESCE(NULLIF(services_intro, ''), 'Ringkasan layanan yang ditawarkan bisnis ini.'),
    testimonials_title = COALESCE(NULLIF(testimonials_title, ''), 'Testimoni'),
    testimonials_intro = COALESCE(NULLIF(testimonials_intro, ''), 'Ulasan pelanggan dan social proof bisnis.'),
    gallery_title = COALESCE(NULLIF(gallery_title, ''), 'Galeri'),
    gallery_intro = COALESCE(NULLIF(gallery_intro, ''), 'Cuplikan visual, hasil kerja, dan suasana brand.'),
    contact_title = COALESCE(NULLIF(contact_title, ''), 'Hubungi Kami'),
    contact_intro = COALESCE(NULLIF(contact_intro, ''), 'Hubungi bisnis melalui telepon, WhatsApp, atau alamat yang tersedia.');

CREATE TABLE IF NOT EXISTS bisnis_me.testimonials (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL REFERENCES bisnis_me.businesses(id) ON DELETE CASCADE,
  name VARCHAR(160) NOT NULL,
  role VARCHAR(160) NOT NULL DEFAULT '',
  quote TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bisnis_me.gallery_items (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL REFERENCES bisnis_me.businesses(id) ON DELETE CASCADE,
  title VARCHAR(160) NOT NULL,
  caption TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

SELECT setval(
  pg_get_serial_sequence('bisnis_me.users', 'id'),
  COALESCE((SELECT MAX(id) FROM bisnis_me.users), 0) + 1,
  false
);

SELECT setval(
  pg_get_serial_sequence('bisnis_me.templates', 'id'),
  COALESCE((SELECT MAX(id) FROM bisnis_me.templates), 0) + 1,
  false
);

SELECT setval(
  pg_get_serial_sequence('bisnis_me.businesses', 'id'),
  COALESCE((SELECT MAX(id) FROM bisnis_me.businesses), 0) + 1,
  false
);

SELECT setval(
  pg_get_serial_sequence('bisnis_me.services', 'id'),
  COALESCE((SELECT MAX(id) FROM bisnis_me.services), 0) + 1,
  false
);

SELECT setval(
  pg_get_serial_sequence('bisnis_me.testimonials', 'id'),
  COALESCE((SELECT MAX(id) FROM bisnis_me.testimonials), 0) + 1,
  false
);

SELECT setval(
  pg_get_serial_sequence('bisnis_me.gallery_items', 'id'),
  COALESCE((SELECT MAX(id) FROM bisnis_me.gallery_items), 0) + 1,
  false
);

UPDATE bisnis_me.users
SET role = 'owner',
    updated_at = NOW()
WHERE email = 'admin@bisnis.me';

INSERT INTO bisnis_me.templates (
  name,
  key,
  description,
  accent,
  category,
  category_label,
  fit,
  feature,
  preview_image,
  created_at,
  updated_at
)
VALUES (
  'Atelier Mosaic',
  'atelier-mosaic',
  'Editorial storytelling layout with testimonials, gallery, and golden-ratio rhythm.',
  '#c86f4d',
  'personal-brand',
  'Personal Brand',
  'Personal brand premium, studio kreatif, brand consultant, boutique service',
  'Hero editorial, about spread, service narrative, testimoni, galeri, dan contact finale.',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (key) DO UPDATE
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    accent = EXCLUDED.accent,
    category = EXCLUDED.category,
    category_label = EXCLUDED.category_label,
    fit = EXCLUDED.fit,
    feature = EXCLUDED.feature,
    preview_image = EXCLUDED.preview_image,
    updated_at = NOW();

INSERT INTO bisnis_me.templates (
  name,
  key,
  description,
  accent,
  category,
  category_label,
  fit,
  feature,
  preview_image,
  created_at,
  updated_at
)
VALUES
  (
    'Signal Frame',
    'signal-frame',
    'Swiss-grid business template with bold hierarchy, sharp geometry, and premium CTA flow.',
    '#d63f24',
    'company-profile',
    'Company Profile',
    'Konsultan, B2B service, agency, kontraktor, bisnis profesional yang ingin tampil tegas',
    'Poster-style hero, capability matrix, proof strip, dan contact grid yang sangat rapi.',
    '/uploads/seed/signal-frame.svg',
    NOW(),
    NOW()
  ),
  (
    'Noir Grid',
    'noir-grid',
    'Dark command-center aesthetic with neon accents, terminal grids, and a strict modular rhythm.',
    '#d4ff47',
    'jasa',
    'Jasa',
    'Tech service, security, modern workshop, operations-heavy business, brand dengan tone futuristik',
    'Hero terminal, protocol narrative, stacked modules, signal feed, dan contact command block.',
    '/uploads/seed/noir-grid.svg',
    NOW(),
    NOW()
  ),
  (
    'Prism Riot',
    'prism-riot',
    'Angular campaign template with radical shapes, color collisions, and experimental storytelling.',
    '#215cff',
    'personal-brand',
    'Creative Brand',
    'Studio kreatif, art director, campaign brand, boutique launch, fashion-forward service',
    'Scene-zero hero, atlas narrative, service totems, collage proof, dan dock CTA yang sangat unik.',
    '/uploads/seed/prism-riot.svg',
    NOW(),
    NOW()
  ),
  (
    'Harbor Ledger',
    'harbor-ledger',
    'Blueprint-inspired corporate template with ledger lines, premium calm, and formal structure.',
    '#bf7953',
    'company-profile',
    'Corporate Service',
    'Konsultan, logistik, konstruksi, legal service, corporate operations, bisnis formal',
    'Manifest hero, business ledger, blueprint services, project proof, dan structured contact panel.',
    '/uploads/seed/harbor-ledger.svg',
    NOW(),
    NOW()
  )
ON CONFLICT (key) DO UPDATE
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    accent = EXCLUDED.accent,
    category = EXCLUDED.category,
    category_label = EXCLUDED.category_label,
    fit = EXCLUDED.fit,
    feature = EXCLUDED.feature,
    preview_image = EXCLUDED.preview_image,
    updated_at = NOW();
