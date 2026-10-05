"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

// Updates the search page URL, which is the source of truth for filters and paging.
// Keys set to null or "" are removed. Any change other than `page` returns to page 1.
export function useSearchUpdate() {
  const router = useRouter();
  const searchParams = useSearchParams();

  return useCallback(
    (updates: Record<string, string | null>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) next.set(key, value);
        else next.delete(key);
      }

      const isPaging = "page" in updates;
      if (!isPaging) next.delete("page");

      const query = next.toString();
      router.push(query ? `/search?${query}` : "/search", { scroll: isPaging });
    },
    [router, searchParams],
  );
}
