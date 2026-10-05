import { describe, expect, it } from "vitest";
import { buildSearchUrl } from "./useSearchUpdate";

const current = (query: string) => new URLSearchParams(query);

describe("buildSearchUrl", () => {
  it("returns to the first page when a filter changes", () => {
    expect(buildSearchUrl(current("q=cake&page=3"), { bake_type_ids: "1" })).toBe(
      "/search?q=cake&bake_type_ids=1",
    );
  });

  it("keeps the filters when paging", () => {
    expect(buildSearchUrl(current("q=cake&page=3"), { page: "4" })).toBe("/search?q=cake&page=4");
  });

  it("removes keys set to null or empty", () => {
    expect(buildSearchUrl(current("q=cake&diet_ids=1,2"), { diet_ids: "", q: null })).toBe("/search");
  });

  it("drops the page when paging back to the first page", () => {
    expect(buildSearchUrl(current("q=cake&page=3"), { page: null })).toBe("/search?q=cake");
  });
});
