/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require("crypto");
const express = require("express");
const cors = require("cors");
const { verifyPassword } = require("./auth");
const { initializeDatabase, pool } = require("./db");

const app = express();
const port = process.env.PORT || 5000;
const appOrigin = process.env.APP_ORIGIN || "http://localhost:3000";

app.use(
  cors({
    origin: appOrigin,
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));

function mapBusinessRow(row, services = []) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline,
    description: row.description,
    heroLabel: row.hero_label,
    heroImage: row.hero_image,
    heroCtaLabel: row.hero_cta_label,
    heroCtaUrl: row.hero_cta_url,
    aboutTitle: row.about_title,
    aboutIntro: row.about_intro,
    servicesTitle: row.services_title,
    servicesIntro: row.services_intro,
    testimonialsTitle: row.testimonials_title,
    testimonialsIntro: row.testimonials_intro,
    galleryTitle: row.gallery_title,
    galleryIntro: row.gallery_intro,
    contactTitle: row.contact_title,
    contactIntro: row.contact_intro,
    boardmemoLabel: row.boardmemo_label,
    boardmemoTitle: row.boardmemo_title,
    boardmemoBody: row.boardmemo_body,
    phone: row.phone,
    whatsapp: row.whatsapp,
    address: row.address,
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
    ogImage: row.og_image,
    templateId: row.template_id,
    templateKey: row.template_key,
    templateName: row.template_name,
    templateAccent: row.template_accent,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    services,
  };
}

function createHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function compareSecrets(expected, provided) {
  const expectedBuffer = Buffer.from(expected || "", "utf8");
  const providedBuffer = Buffer.from(provided || "", "utf8");

  if (expectedBuffer.length === 0 || expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, providedBuffer);
}

function assertInternalRequest(req) {
  const configuredKey = process.env.INTERNAL_API_KEY;
  if (!configuredKey) {
    throw createHttpError(500, "INTERNAL_API_KEY belum dikonfigurasi.");
  }

  const providedKey = req.get("x-internal-api-key");
  if (!compareSecrets(configuredKey, providedKey)) {
    throw createHttpError(403, "Forbidden.");
  }
}

async function listTemplates() {
  const { rows } = await pool.query(
    "SELECT id, name, key, description, accent, created_at, updated_at FROM templates ORDER BY id ASC",
  );

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    key: row.key,
    description: row.description,
    accent: row.accent,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

async function listBusinesses() {
  const { rows } = await pool.query(`
    SELECT
      b.*,
      t.key AS template_key,
      t.name AS template_name,
      t.accent AS template_accent,
      COALESCE(json_agg(
      json_build_object(
        'id', s.id,
        'businessId', s.business_id,
        'name', s.name,
        'description', s.description,
        'icon', s.icon
      )
      ORDER BY s.sort_order ASC, s.id ASC
    ) FILTER (WHERE s.id IS NOT NULL), '[]') AS services
    FROM businesses b
    LEFT JOIN templates t ON t.id = b.template_id
    LEFT JOIN services s ON s.business_id = b.id
    GROUP BY b.id, t.id
    ORDER BY b.id ASC
  `);

  return rows.map((row) => mapBusinessRow(row, row.services));
}

async function getBusinessBySlug(slug) {
  const { rows } = await pool.query(
    `
    SELECT
      b.*,
      t.key AS template_key,
      t.name AS template_name,
      t.accent AS template_accent,
      COALESCE(json_agg(
      json_build_object(
        'id', s.id,
        'businessId', s.business_id,
        'name', s.name,
        'description', s.description,
        'icon', s.icon
      )
      ORDER BY s.sort_order ASC, s.id ASC
    ) FILTER (WHERE s.id IS NOT NULL), '[]') AS services
    FROM businesses b
    LEFT JOIN templates t ON t.id = b.template_id
    LEFT JOIN services s ON s.business_id = b.id
    WHERE b.slug = $1
    GROUP BY b.id, t.id
    LIMIT 1
    `,
    [slug],
  );

  if (!rows[0]) {
    return null;
  }

  return mapBusinessRow(rows[0], rows[0].services);
}

function normalizePayload(payload) {
  return {
    slug: payload.slug,
    name: payload.name,
    tagline: payload.tagline || "",
    description: payload.description || "",
    heroLabel: payload.heroLabel || "Business template",
    heroImage: payload.heroImage || null,
    heroCtaLabel: payload.heroCtaLabel || "Contact Us",
    heroCtaUrl: payload.heroCtaUrl || "#contact",
    aboutTitle: payload.aboutTitle || "About",
    aboutIntro: payload.aboutIntro || payload.description || "",
    servicesTitle: payload.servicesTitle || "Services",
    servicesIntro: payload.servicesIntro || payload.tagline || "",
    testimonialsTitle: payload.testimonialsTitle || "Testimonials",
    testimonialsIntro: payload.testimonialsIntro || "",
    galleryTitle: payload.galleryTitle || "Gallery",
    galleryIntro: payload.galleryIntro || "",
    contactTitle: payload.contactTitle || "Contact",
    contactIntro: payload.contactIntro || "",
    boardmemoLabel: payload.boardmemoLabel || "Board Memo",
    boardmemoTitle: payload.boardmemoTitle || "Structured direction for a sharper first impression.",
    boardmemoBody: payload.boardmemoBody || "",
    phone: payload.phone || "",
    whatsapp: payload.whatsapp || "",
    address: payload.address || "",
    metaTitle: payload.metaTitle || payload.name,
    metaDescription: payload.metaDescription || payload.description || "",
    ogImage: payload.ogImage || payload.heroImage || null,
    templateId: payload.templateId || null,
    services: Array.isArray(payload.services)
      ? payload.services.map((service) => ({
          name: service.name,
          description: service.description || "",
          icon: service.icon || "sparkles",
        }))
      : [],
  };
}

function validateBusinessPayload(payload) {
  if (!payload.slug || !payload.name) {
    throw createHttpError(400, "Slug dan nama bisnis wajib diisi.");
  }

  if (!/^[a-z0-9-]+$/.test(payload.slug)) {
    throw createHttpError(400, "Slug hanya boleh huruf kecil, angka, dan tanda hubung.");
  }

  if (!payload.tagline || !payload.description) {
    throw createHttpError(400, "Tagline dan deskripsi bisnis wajib diisi.");
  }

  if (!payload.templateId) {
    throw createHttpError(400, "Template bisnis wajib dipilih.");
  }

  if (!payload.phone || !payload.whatsapp) {
    throw createHttpError(400, "Nomor telepon dan WhatsApp wajib diisi.");
  }

  if (!Array.isArray(payload.services)) {
    throw createHttpError(400, "Format layanan tidak valid.");
  }

  for (const service of payload.services) {
    if (!service.name) {
      throw createHttpError(400, "Nama layanan wajib diisi.");
    }

    if (!service.description) {
      throw createHttpError(400, "Deskripsi layanan wajib diisi.");
    }
  }
}

async function createBusiness(payload) {
  const normalized = normalizePayload(payload);
  validateBusinessPayload(normalized);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const businessResult = await client.query(
      `
      INSERT INTO businesses (
        template_id, slug, name, tagline, description, hero_label, hero_image, hero_cta_label, hero_cta_url,
        about_title, about_intro, services_title, services_intro, testimonials_title, testimonials_intro,
        gallery_title, gallery_intro, contact_title, contact_intro, boardmemo_label, boardmemo_title, boardmemo_body,
        phone, whatsapp, address, meta_title, meta_description, og_image
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28)
      RETURNING *
      `,
      [
        normalized.templateId,
        normalized.slug,
        normalized.name,
        normalized.tagline,
        normalized.description,
        normalized.heroLabel,
        normalized.heroImage,
        normalized.heroCtaLabel,
        normalized.heroCtaUrl,
        normalized.aboutTitle,
        normalized.aboutIntro,
        normalized.servicesTitle,
        normalized.servicesIntro,
        normalized.testimonialsTitle,
        normalized.testimonialsIntro,
        normalized.galleryTitle,
        normalized.galleryIntro,
        normalized.contactTitle,
        normalized.contactIntro,
        normalized.boardmemoLabel,
        normalized.boardmemoTitle,
        normalized.boardmemoBody,
        normalized.phone,
        normalized.whatsapp,
        normalized.address,
        normalized.metaTitle,
        normalized.metaDescription,
        normalized.ogImage,
      ],
    );

    const createdBusiness = businessResult.rows[0];
    const services = [];
    for (let index = 0; index < normalized.services.length; index += 1) {
      const service = normalized.services[index];
      const serviceResult = await client.query(
        `
        INSERT INTO services (business_id, name, description, icon, sort_order)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, business_id, name, description, icon
        `,
        [createdBusiness.id, service.name, service.description, service.icon, index],
      );
      services.push({
        id: serviceResult.rows[0].id,
        businessId: serviceResult.rows[0].business_id,
        name: serviceResult.rows[0].name,
        description: serviceResult.rows[0].description,
        icon: serviceResult.rows[0].icon,
      });
    }

    await client.query("COMMIT");
    return mapBusinessRow(createdBusiness, services);
  } catch (error) {
    await client.query("ROLLBACK");
    if (error.code === "23505") {
      throw createHttpError(409, "Slug bisnis sudah digunakan.");
    }

    throw error;
  } finally {
    client.release();
  }
}

async function updateBusiness(id, payload) {
  const normalized = normalizePayload(payload);
  validateBusinessPayload(normalized);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const businessResult = await client.query(
      `
      UPDATE businesses
      SET template_id = $2, slug = $3, name = $4, tagline = $5, description = $6, hero_label = $7, hero_image = $8,
          hero_cta_label = $9, hero_cta_url = $10, about_title = $11, about_intro = $12, services_title = $13,
          services_intro = $14, testimonials_title = $15, testimonials_intro = $16, gallery_title = $17, gallery_intro = $18,
          contact_title = $19, contact_intro = $20, boardmemo_label = $21, boardmemo_title = $22, boardmemo_body = $23,
          phone = $24, whatsapp = $25, address = $26, meta_title = $27, meta_description = $28, og_image = $29, updated_at = NOW()
      WHERE id = $1
      RETURNING *
      `,
      [
        id,
        normalized.templateId,
        normalized.slug,
        normalized.name,
        normalized.tagline,
        normalized.description,
        normalized.heroLabel,
        normalized.heroImage,
        normalized.heroCtaLabel,
        normalized.heroCtaUrl,
        normalized.aboutTitle,
        normalized.aboutIntro,
        normalized.servicesTitle,
        normalized.servicesIntro,
        normalized.testimonialsTitle,
        normalized.testimonialsIntro,
        normalized.galleryTitle,
        normalized.galleryIntro,
        normalized.contactTitle,
        normalized.contactIntro,
        normalized.boardmemoLabel,
        normalized.boardmemoTitle,
        normalized.boardmemoBody,
        normalized.phone,
        normalized.whatsapp,
        normalized.address,
        normalized.metaTitle,
        normalized.metaDescription,
        normalized.ogImage,
      ],
    );

    if (!businessResult.rows[0]) {
      await client.query("ROLLBACK");
      return null;
    }

    await client.query("DELETE FROM services WHERE business_id = $1", [id]);
    const services = [];
    for (let index = 0; index < normalized.services.length; index += 1) {
      const service = normalized.services[index];
      const serviceResult = await client.query(
        `
        INSERT INTO services (business_id, name, description, icon, sort_order)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, business_id, name, description, icon
        `,
        [id, service.name, service.description, service.icon, index],
      );
      services.push({
        id: serviceResult.rows[0].id,
        businessId: serviceResult.rows[0].business_id,
        name: serviceResult.rows[0].name,
        description: serviceResult.rows[0].description,
        icon: serviceResult.rows[0].icon,
      });
    }

    await client.query("COMMIT");
    return mapBusinessRow(businessResult.rows[0], services);
  } catch (error) {
    await client.query("ROLLBACK");
    if (error.code === "23505") {
      throw createHttpError(409, "Slug bisnis sudah digunakan.");
    }

    throw error;
  } finally {
    client.release();
  }
}

async function deleteBusiness(id) {
  const { rowCount } = await pool.query("DELETE FROM businesses WHERE id = $1", [id]);
  return rowCount > 0;
}

async function authenticateAdmin(email, password) {
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  const normalizedPassword = typeof password === "string" ? password : "";

  if (!normalizedEmail || !normalizedPassword) {
    throw createHttpError(400, "Email dan password wajib diisi.");
  }

  const { rows } = await pool.query(
    `
    SELECT id, email, password_hash, name
    FROM users
    WHERE LOWER(email) = $1
    LIMIT 1
    `,
    [normalizedEmail],
  );

  if (!rows[0]) {
    throw createHttpError(404, "Akun admin tidak ditemukan.");
  }

  if (!verifyPassword(normalizedPassword, rows[0].password_hash)) {
    throw createHttpError(401, "Email atau password salah.");
  }

  return {
    id: rows[0].id,
    email: rows[0].email,
    name: rows[0].name,
  };
}

app.get("/", (_req, res) => {
  res.json({
    ok: true,
    message: "Business builder API is running.",
    mode: "postgres",
  });
});

app.get("/api/templates", async (_req, res) => {
  try {
    const templates = await listTemplates();
    res.json({ data: templates });
  } catch {
    res.status(500).json({ error: "Failed to fetch templates." });
  }
});

app.get("/api/businesses", async (_req, res) => {
  try {
    const businesses = await listBusinesses();
    res.json({ data: businesses });
  } catch {
    res.status(500).json({ error: "Failed to fetch businesses." });
  }
});

app.get("/api/business/:slug", async (req, res) => {
  try {
    const business = await getBusinessBySlug(req.params.slug);
    if (!business) {
      return res.status(404).json({ error: "Business not found." });
    }

    return res.json({ data: business });
  } catch {
    return res.status(500).json({ error: "Failed to fetch business." });
  }
});

app.post("/api/admin/login", async (req, res) => {
  try {
    assertInternalRequest(req);
    const admin = await authenticateAdmin(req.body.email, req.body.password);
    return res.json({ data: { admin } });
  } catch (error) {
    return res.status(error.status || 500).json({
      error: error.message || "Login admin gagal.",
    });
  }
});

app.post("/api/business", async (req, res) => {
  try {
    assertInternalRequest(req);
    const created = await createBusiness(req.body);
    res.status(201).json({ data: created });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || "Failed to create business." });
  }
});

app.put("/api/business/:id", async (req, res) => {
  try {
    assertInternalRequest(req);
    const updated = await updateBusiness(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: "Business not found." });
    }

    return res.json({ data: updated });
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message || "Failed to update business." });
  }
});

app.delete("/api/business/:id", async (req, res) => {
  try {
    assertInternalRequest(req);
    const removed = await deleteBusiness(req.params.id);
    if (!removed) {
      return res.status(404).json({ error: "Business not found." });
    }

    return res.status(204).send();
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message || "Failed to delete business." });
  }
});

async function startServer() {
  try {
    await initializeDatabase();
    console.log("PostgreSQL connected.");
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to initialize PostgreSQL connection.", error);
    process.exit(1);
  }
}

startServer();
