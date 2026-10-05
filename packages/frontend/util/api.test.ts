import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchRecipePage } from "./api";

// Records every API request and answers with an empty page and a fixed total.
function stubApi(total = 60) {
  const requests: URL[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: string | URL) => {
      const url = new URL(String(input));
      requests.push(url);
      return Response.json(url.pathname.endsWith("/count") ? { count: total } : []);
    }),
  );
  const find = (pathname: string) => {
    const request = requests.find((url) => url.pathname === pathname);
    if (!request) throw new Error(`no request to ${pathname}`);
    return request;
  };
  return { list: () => find("/recipe"), count: () => find("/recipe/count") };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchRecipePage", () => {
  it("requests exactly one page of 25 at that page's offset", async () => {
    const api = stubApi();
    await fetchRecipePage(new URLSearchParams("page=3"));

    expect(api.list().searchParams.get("limit")).toBe("25");
    expect(api.list().searchParams.get("skip")).toBe("50");
  });

  it("treats a missing or invalid page as the first page", async () => {
    for (const query of ["", "page=0", "page=-2", "page=abc"]) {
      const api = stubApi();
      await fetchRecipePage(new URLSearchParams(query));
      expect(api.list().searchParams.get("skip"), query).toBe("0");
    }
  });

  it("sends only the filters that are set, never empty or undefined values", async () => {
    const api = stubApi();
    await fetchRecipePage(new URLSearchParams("q=&bake_type_ids=1,2&difficulty=2&utm_source=x"));

    const list = api.list().searchParams;
    expect(Object.fromEntries(list)).toEqual({
      bake_type_ids: "1,2",
      difficulty: "2",
      limit: "25",
      skip: "0",
    });
    expect(api.list().search).not.toContain("undefined");
  });

  it("counts with the same filters but without paging", async () => {
    const api = stubApi(166);
    const { total } = await fetchRecipePage(new URLSearchParams("bake_type_ids=1&page=2"));

    expect(total).toBe(166);
    expect(Object.fromEntries(api.count().searchParams)).toEqual({ bake_type_ids: "1" });
  });
});
