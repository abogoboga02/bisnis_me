/* eslint-disable @typescript-eslint/no-require-imports */
const { Pool } = require("pg");

function createPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return null;
  }

  return new Pool({
    connectionString,
    ssl: process.env.PG_SSL === "true" ? { rejectUnauthorized: false } : false,
  });
}

const pool = createPool();

async function isDatabaseAvailable() {
  if (!pool) {
    return false;
  }

  try {
    await pool.query("SELECT 1");
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  pool,
  isDatabaseAvailable,
};
