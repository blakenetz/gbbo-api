import { load } from "cheerio";
import { describe, expect, it } from "vitest";
import { extractPublishedAt } from "./published";

// Recipe pages carry JSON-LD blocks shaped like the GBBO site's: a WebPage node in a
// @graph with a full timestamp, and a Recipe node with only the date.
function page(...jsonLdBlocks: string[]) {
  return load(
    `<html><head>${jsonLdBlocks
      .map((block) => `<script type="application/ld+json">${block}</script>`)
      .join("")}</head><body></body></html>`,
  );
}

const webPage = JSON.stringify({
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "WebSite", name: "The Great British Bake Off" },
    { "@type": "WebPage", datePublished: "2025-10-14T19:37:56+00:00" },
  ],
});
const recipe = JSON.stringify({ "@type": "Recipe", datePublished: "2025-10-14" });

describe("extractPublishedAt", () => {
  it("prefers the WebPage timestamp over the Recipe date and returns UTC ISO", () => {
    expect(extractPublishedAt(page(recipe, webPage))).toBe("2025-10-14T19:37:56.000Z");
  });

  it("falls back to a date-only value", () => {
    expect(extractPublishedAt(page(recipe))).toBe("2025-10-14T00:00:00.000Z");
  });

  it("skips malformed JSON-LD blocks", () => {
    expect(extractPublishedAt(page("{ not json", webPage))).toBe("2025-10-14T19:37:56.000Z");
  });

  it("returns null when there is no usable date", () => {
    expect(extractPublishedAt(page())).toBeNull();
    expect(extractPublishedAt(page(JSON.stringify({ "@type": "Recipe" })))).toBeNull();
    expect(extractPublishedAt(page(JSON.stringify({ datePublished: "soon" })))).toBeNull();
  });
});
