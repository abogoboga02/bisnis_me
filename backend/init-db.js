/* eslint-disable @typescript-eslint/no-require-imports */
const { initializeDatabase } = require("./db");

async function main() {
  await initializeDatabase();
  console.log("Database ready. Schema verified.");
}

main().catch((error) => {
  console.error("Database initialization failed.", error);
  process.exit(1);
});
