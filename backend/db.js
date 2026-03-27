/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

const ENV_FILES = [".env", ".env.local", path.join("backend", ".env"), path.join("backend", ".env.local")];

let envLoaded = false;

function parseEnvValue(value) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

function loadEnvironmentFiles() {
  if (envLoaded) {
    return;
  }

  const projectRoot = path.resolve(__dirname, "..");

  for (const relativeFile of ENV_FILES) {
    const envPath = path.join(projectRoot, relativeFile);
    if (!fs.existsSync(envPath)) {
      continue;
    }

    const fileContents = fs.readFileSync(envPath, "utf8");
    const lines = fileContents.split(/\r?\n/);

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const separatorIndex = trimmed.indexOf("=");
      if (separatorIndex === -1) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      if (!key || Object.prototype.hasOwnProperty.call(process.env, key)) {
        continue;
      }

      process.env[key] = parseEnvValue(trimmed.slice(separatorIndex + 1));
    }
  }

  envLoaded = true;
}

function buildPoolConfig() {
  loadEnvironmentFiles();

  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.PG_SSL === "true" ? { rejectUnauthorized: false } : false,
    };
  }

  if (process.env.PGHOST && process.env.PGUSER && process.env.PGDATABASE) {
    return {
      host: process.env.PGHOST,
      port: Number(process.env.PGPORT || 5432),
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD || "",
      database: process.env.PGDATABASE,
      ssl: process.env.PG_SSL === "true" ? { rejectUnauthorized: false } : false,
    };
  }

  throw new Error("Konfigurasi PostgreSQL tidak lengkap. Isi DATABASE_URL atau PGHOST/PGPORT/PGUSER/PGPASSWORD/PGDATABASE.");
}

const pool = new Pool(buildPoolConfig());

async function initializeDatabase() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query("SELECT 1");

    const schemaPath = path.join(__dirname, "schema.sql");
    const schemaSql = fs.readFileSync(schemaPath, "utf8");
    await client.query(schemaSql);

    await client.query("COMMIT");
    return {
      configured: true,
      ready: true,
      mode: "postgres",
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  pool,
  initializeDatabase,
  loadEnvironmentFiles,
};
