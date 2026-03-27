/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require("crypto");

const HASH_PREFIX = "scrypt";
const KEY_LENGTH = 64;

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const derivedKey = crypto.scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `${HASH_PREFIX}$${salt}$${derivedKey}`;
}

function verifyPassword(password, storedHash) {
  if (!storedHash || typeof storedHash !== "string") {
    return false;
  }

  const [algorithm, salt, expectedHash] = storedHash.split("$");
  if (algorithm !== HASH_PREFIX || !salt || !expectedHash) {
    return false;
  }

  const derivedKey = crypto.scryptSync(password, salt, KEY_LENGTH).toString("hex");
  const expectedBuffer = Buffer.from(expectedHash, "hex");
  const actualBuffer = Buffer.from(derivedKey, "hex");

  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
}

module.exports = {
  hashPassword,
  verifyPassword,
};
