"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

// The search URL after applying `updates`: keys set to null or "" are removed, and any
// change other than `page` itself returns to the first page of results.
export function buildSearchUrl(current: URLSearchParams, updates: Record<string, string | null>) {
  const next = new URLSearchParams(current);
  for (const [key, value] of Object.entries(updates)) {
    if (value) next.set(key, value);
    else next.delete(key);
  }
  if (!("page" in updates)) next.delete("page");

  const query = next.toString();
  return query ? `/search?${query}` : "/search";
}

// Updates the search page URL, which is the source of truth for filters and paging.
// Only paging scrolls back to the top.
export function useSearchUpdate() {
  const router = useRouter();
  const searchParams = useSearchParams();

  return useCallback(
    (updates: Record<string, string | null>) =>
      router.push(buildSearchUrl(new URLSearchParams(searchParams.toString()), updates), {
        scroll: "page" in updates,
      }),
    [router, searchParams],
  );
}
