/* eslint-disable @typescript-eslint/no-require-imports */
const express = require("express");
const cors = require("cors");
const { pool, isDatabaseAvailable } = require("./db");
const { cloneSampleBusinesses, cloneSampleTemplates } = require("./data/sample-data");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

const memoryStore = {
  templates: cloneSampleTemplates(),
  businesses: cloneSampleBusinesses(),
};

function mapBusinessRow(row, services = []) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline,
    description: row.description,
    heroImage: row.hero_image,
    heroCtaLabel: row.hero_cta_label,
    heroCtaUrl: row.hero_cta_url,
    phone: row.phone,
    whatsapp: row.whatsapp,
    address: row.address,
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
    ogImage: row.og_image,
    templateId: row.template_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    services,
  };
}

async function listTemplates() {
  if (await isDatabaseAvailable()) {
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

  return memoryStore.templates;
}

async function listBusinesses() {
  if (await isDatabaseAvailable()) {
    const { rows } = await pool.query(`
      SELECT b.*, COALESCE(json_agg(
        json_build_object(
          'id', s.id,
          'businessId', s.business_id,
          'name', s.name,
          'description', s.description,
          'icon', s.icon
        )
      ) FILTER (WHERE s.id IS NOT NULL), '[]') AS services
      FROM businesses b
      LEFT JOIN services s ON s.business_id = b.id
      GROUP BY b.id
      ORDER BY b.id ASC
    `);

    return rows.map((row) => mapBusinessRow(row, row.services));
  }

  return memoryStore.businesses;
}

async function getBusinessBySlug(slug) {
  if (await isDatabaseAvailable()) {
    const { rows } = await pool.query(
      `
      SELECT b.*, COALESCE(json_agg(
        json_build_object(
          'id', s.id,
          'businessId', s.business_id,
          'name', s.name,
          'description', s.description,
          'icon', s.icon
        )
      ) FILTER (WHERE s.id IS NOT NULL), '[]') AS services
      FROM businesses b
      LEFT JOIN services s ON s.business_id = b.id
      WHERE b.slug = $1
      GROUP BY b.id
      LIMIT 1
      `,
      [slug],
    );

    if (!rows[0]) {
      return null;
    }

    return mapBusinessRow(rows[0], rows[0].services);
  }

  return memoryStore.businesses.find((business) => business.slug === slug) || null;
}

function normalizePayload(payload) {
  return {
    slug: payload.slug,
    name: payload.name,
    tagline: payload.tagline || "",
    description: payload.description || "",
    heroImage: payload.heroImage || null,
    heroCtaLabel: payload.heroCtaLabel || "Contact Us",
    heroCtaUrl: payload.heroCtaUrl || "#contact",
    phone: payload.phone || "",
    whatsapp: payload.whatsapp || "",
    address: payload.address || "",
    metaTitle: payload.metaTitle || payload.name,
    metaDescription: payload.metaDescription || payload.description || "",
    ogImage: payload.ogImage || payload.heroImage || null,
    templateId: payload.templateId || null,
    services: Array.isArray(payload.services)
      ? payload.services.map((service, index) => ({
          id: service.id || Date.now() + index,
          name: service.name,
          description: service.description || "",
          icon: service.icon || "sparkles",
        }))
      : [],
  };
}

async function createBusiness(payload) {
  const normalized = normalizePayload(payload);

  if (await isDatabaseAvailable()) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const businessResult = await client.query(
        `
        INSERT INTO businesses (
          template_id, slug, name, tagline, description, hero_image, hero_cta_label, hero_cta_url,
          phone, whatsapp, address, meta_title, meta_description, og_image
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *
        `,
        [
          normalized.templateId,
          normalized.slug,
          normalized.name,
          normalized.tagline,
          normalized.description,
          normalized.heroImage,
          normalized.heroCtaLabel,
          normalized.heroCtaUrl,
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
      throw error;
    } finally {
      client.release();
    }
  }

  const nextId = Math.max(...memoryStore.businesses.map((item) => item.id), 0) + 1;
  const created = {
    id: nextId,
    ...normalized,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    services: normalized.services.map((service, index) => ({
      ...service,
      id: nextId * 100 + index + 1,
      businessId: nextId,
    })),
  };
  memoryStore.businesses.push(created);
  return created;
}

async function updateBusiness(id, payload) {
  const normalized = normalizePayload(payload);

  if (await isDatabaseAvailable()) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const businessResult = await client.query(
        `
        UPDATE businesses
        SET template_id = $2, slug = $3, name = $4, tagline = $5, description = $6, hero_image = $7,
            hero_cta_label = $8, hero_cta_url = $9, phone = $10, whatsapp = $11, address = $12,
            meta_title = $13, meta_description = $14, og_image = $15, updated_at = NOW()
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
          normalized.heroImage,
          normalized.heroCtaLabel,
          normalized.heroCtaUrl,
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
      throw error;
    } finally {
      client.release();
    }
  }

  const index = memoryStore.businesses.findIndex((business) => business.id === Number(id));
  if (index === -1) {
    return null;
  }

  const updated = {
    ...memoryStore.businesses[index],
    ...normalized,
    id: Number(id),
    updatedAt: new Date().toISOString(),
    services: normalized.services.map((service, serviceIndex) => ({
      ...service,
      id: Number(id) * 100 + serviceIndex + 1,
      businessId: Number(id),
    })),
  };
  memoryStore.businesses[index] = updated;
  return updated;
}

async function deleteBusiness(id) {
  if (await isDatabaseAvailable()) {
    const { rowCount } = await pool.query("DELETE FROM businesses WHERE id = $1", [id]);
    return rowCount > 0;
  }

  const index = memoryStore.businesses.findIndex((business) => business.id === Number(id));
  if (index === -1) {
    return false;
  }

  memoryStore.businesses.splice(index, 1);
  return true;
}

app.get("/", (_req, res) => {
  res.json({
    ok: true,
    message: "Business builder API is running.",
    mode: process.env.DATABASE_URL ? "postgres-preferred" : "memory-fallback",
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

app.post("/api/business", async (req, res) => {
  try {
    const created = await createBusiness(req.body);
    res.status(201).json({ data: created });
  } catch {
    res.status(500).json({ error: "Failed to create business." });
  }
});

app.put("/api/business/:id", async (req, res) => {
  try {
    const updated = await updateBusiness(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: "Business not found." });
    }

    return res.json({ data: updated });
  } catch {
    return res.status(500).json({ error: "Failed to update business." });
  }
});

app.delete("/api/business/:id", async (req, res) => {
  try {
    const removed = await deleteBusiness(req.params.id);
    if (!removed) {
      return res.status(404).json({ error: "Business not found." });
    }

    return res.status(204).send();
  } catch {
    return res.status(500).json({ error: "Failed to delete business." });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
