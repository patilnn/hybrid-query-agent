export function sanitizeInput(value) {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).join(", ");
  }
  return String(value).trim();
}
