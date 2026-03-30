CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name VARCHAR(120) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  key VARCHAR(120) NOT NULL UNIQUE,
  description TEXT,
  accent VARCHAR(20),
  category VARCHAR(80) NOT NULL DEFAULT 'jasa',
  category_label VARCHAR(120) NOT NULL DEFAULT 'Jasa',
  fit TEXT NOT NULL DEFAULT '',
  feature TEXT NOT NULL DEFAULT '',
  preview_image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS businesses (
  id SERIAL PRIMARY KEY,
  template_id INTEGER REFERENCES templates(id) ON DELETE SET NULL,
  slug VARCHAR(120) NOT NULL UNIQUE,
  name VARCHAR(160) NOT NULL,
  tagline TEXT,
  description TEXT,
  hero_label VARCHAR(120) NOT NULL DEFAULT 'Business template',
  hero_image TEXT,
  hero_cta_label VARCHAR(120),
  hero_cta_url TEXT,
  about_title VARCHAR(160) NOT NULL DEFAULT 'About',
  about_intro TEXT NOT NULL DEFAULT '',
  services_title VARCHAR(160) NOT NULL DEFAULT 'Services',
  services_intro TEXT NOT NULL DEFAULT '',
  testimonials_title VARCHAR(160) NOT NULL DEFAULT 'Testimonials',
  testimonials_intro TEXT NOT NULL DEFAULT '',
  gallery_title VARCHAR(160) NOT NULL DEFAULT 'Gallery',
  gallery_intro TEXT NOT NULL DEFAULT '',
  contact_title VARCHAR(160) NOT NULL DEFAULT 'Contact',
  contact_intro TEXT NOT NULL DEFAULT '',
  boardmemo_label VARCHAR(120) NOT NULL DEFAULT 'Board Memo',
  boardmemo_title VARCHAR(160) NOT NULL DEFAULT 'Structured direction for a sharper first impression.',
  boardmemo_body TEXT NOT NULL DEFAULT '',
  phone VARCHAR(40),
  whatsapp VARCHAR(40),
  address TEXT,
  meta_title VARCHAR(160),
  meta_description TEXT,
  og_image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_business_access (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, business_id)
);

CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name VARCHAR(160) NOT NULL,
  description TEXT,
  icon VARCHAR(80),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS testimonials (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name VARCHAR(160) NOT NULL,
  role VARCHAR(160) NOT NULL DEFAULT '',
  quote TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gallery_items (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  title VARCHAR(160) NOT NULL,
  caption TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
