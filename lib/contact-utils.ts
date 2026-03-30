export function normalizePhoneNumber(value: string) {
  return value.replace(/\D/g, "");
}

export function isValidIndonesiaInternationalNumber(value: string) {
  return /^62\d{8,15}$/.test(normalizePhoneNumber(value));
}

export function buildWhatsAppHref(value: string) {
  const normalized = normalizePhoneNumber(value);
  return normalized ? `https://wa.me/${normalized}` : "#";
}
