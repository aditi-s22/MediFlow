export default function formatDoctorName(name) {
  if (!name) return "";
  const trimmed = name.trim();
  if (/^dr\b/i.test(trimmed)) {
    const rest = trimmed.replace(/^dr\.?\s*/i, "");
    return `Dr. ${rest}`;
  }
  return `Dr. ${trimmed}`;
}
