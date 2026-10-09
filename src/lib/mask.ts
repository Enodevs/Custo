/**
 * Best-effort PII masking utility.
 * This is NOT comprehensive - it's a regex-based baseline.
 */

export function maskPII(text: string): string {
  return text
    .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, "[email]")
    .replace(/(?:\+?234|0)[789][01]\d{8}\b/g, "[phone]")
    .replace(/\b\d{13,19}\b/g, "[card]")
    .replace(/\b\d{11}\b/g, "[id]")
    .replace(/\b\d{10}\b/g, "[account]");
}
