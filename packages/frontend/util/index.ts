export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

export const paginationAmount = 25;

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

// e.g. "23 September 2025"
export function formatDate(isoDate: string): string {
  return dateFormat.format(new Date(isoDate));
}
