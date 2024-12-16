export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const paginationAmount = 25;

export const cacheConfig: RequestInit = {
  cache: "force-cache",
  next: {
    revalidate: 60 * 60, // 1 hour
  },
};
