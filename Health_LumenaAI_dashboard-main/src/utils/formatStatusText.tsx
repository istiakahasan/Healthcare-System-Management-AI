export function formatStatusText(text?: string | null) {
  if (!text) return "";

  return text
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
