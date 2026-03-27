/* eslint-disable @typescript-eslint/no-require-imports */
const { hashPassword } = require("./auth");

function parseArguments(argv) {
  const args = {
    name: "Admin Bisnis",
    email: "admin@bisnis.me",
    password: "Admin#12345",
  };

  for (const entry of argv) {
    const [key, ...valueParts] = entry.replace(/^--/, "").split("=");
    const value = valueParts.join("=");

    if (!value) {
      continue;
    }

    if (key === "name" || key === "email" || key === "password") {
      args[key] = value;
    }
  }

  return args;
}

function escapeSql(value) {
  return value.replace(/'/g, "''");
}

function main() {
  const { name, email, password } = parseArguments(process.argv.slice(2));
  const passwordHash = hashPassword(password);

  const sql = `
INSERT INTO users (email, password_hash, name)
VALUES ('${escapeSql(email)}', '${passwordHash}', '${escapeSql(name)}')
ON CONFLICT (email) DO UPDATE
SET password_hash = EXCLUDED.password_hash,
    name = EXCLUDED.name,
    updated_at = NOW();
`.trim();

  console.log(sql);
}

main();
