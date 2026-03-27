/* eslint-disable @typescript-eslint/no-require-imports */
const { pool } = require("./db");
const { seedBusinesses, seedTemplates } = require("./data/seed-content");

async function upsertTemplates(client) {
  const templateIdByKey = new Map();

  for (const template of seedTemplates) {
    const result = await client.query(
      `
      INSERT INTO templates (name, key, description, accent)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (key) DO UPDATE
      SET name = EXCLUDED.name,
          description = EXCLUDED.description,
          accent = EXCLUDED.accent,
          updated_at = NOW()
      RETURNING id, key
      `,
      [template.name, template.key, template.description, template.accent],
    );

    templateIdByKey.set(result.rows[0].key, result.rows[0].id);
  }

  return templateIdByKey;
}

async function upsertBusinesses(client, templateIdByKey) {
  for (const business of seedBusinesses) {
    const templateId = templateIdByKey.get(business.templateKey) || null;
    const businessResult = await client.query(
      `
      INSERT INTO businesses (
        template_id, slug, name, tagline, description, hero_image, hero_cta_label, hero_cta_url,
        phone, whatsapp, address, meta_title, meta_description, og_image
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      ON CONFLICT (slug) DO UPDATE
      SET template_id = EXCLUDED.template_id,
          name = EXCLUDED.name,
          tagline = EXCLUDED.tagline,
          description = EXCLUDED.description,
          hero_image = EXCLUDED.hero_image,
          hero_cta_label = EXCLUDED.hero_cta_label,
          hero_cta_url = EXCLUDED.hero_cta_url,
          phone = EXCLUDED.phone,
          whatsapp = EXCLUDED.whatsapp,
          address = EXCLUDED.address,
          meta_title = EXCLUDED.meta_title,
          meta_description = EXCLUDED.meta_description,
          og_image = EXCLUDED.og_image,
          updated_at = NOW()
      RETURNING id
      `,
      [
        templateId,
        business.slug,
        business.name,
        business.tagline,
        business.description,
        business.heroImage,
        business.heroCtaLabel,
        business.heroCtaUrl,
        business.phone,
        business.whatsapp,
        business.address,
        business.metaTitle,
        business.metaDescription,
        business.ogImage,
      ],
    );

    const businessId = businessResult.rows[0].id;
    await client.query("DELETE FROM services WHERE business_id = $1", [businessId]);

    for (let index = 0; index < business.services.length; index += 1) {
      const service = business.services[index];
      await client.query(
        `
        INSERT INTO services (business_id, name, description, icon, sort_order)
        VALUES ($1, $2, $3, $4, $5)
        `,
        [businessId, service.name, service.description, service.icon, index],
      );
    }
  }
}

async function main() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const templateIdByKey = await upsertTemplates(client);
    await upsertBusinesses(client, templateIdByKey);
    await client.query("COMMIT");
    console.log(`Seeded ${seedTemplates.length} templates and ${seedBusinesses.length} businesses.`);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Failed to seed content.", error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
