import { describe, expect, it } from "vitest";
import type { Filters } from "@/util/api";
import { buildFilterDefinitions, getActiveFilters } from "./filterOptions";

const filters: Filters = {
  bakeTypes: [
    { id: 1, name: "Cakes" },
    { id: 3, name: "Bread" },
  ],
  categories: [{ id: 3, name: "Technical" }],
  diets: [{ id: 2, name: "Vegan" }],
  bakers: [
    { id: 181, name: "Aaron", img: "a12.jpg", season: 12 },
    { id: 278, name: "Aaron", img: "a16.jpg", season: 16 },
    { id: 9, name: "Prue Leith", img: "prue.jpg", season: null },
    { id: 270, name: "Zoe", img: "z16.jpg", season: 16 },
  ],
};

const definitions = buildFilterDefinitions(filters);
const options = (param: string) =>
  definitions.find((definition) => definition.param === param)?.options ?? [];

describe("buildFilterDefinitions", () => {
  it("lists series newest first", () => {
    expect(options("season").map(({ label }) => label)).toEqual(["Series 16", "Series 12"]);
  });

  it("groups bakers by series, newest first, with judges and guests last", () => {
    expect(options("baker_ids").map(({ value, group }) => [value, group])).toEqual([
      ["278", "Series 16"],
      ["270", "Series 16"],
      ["181", "Series 12"],
      ["9", "Judges & guests"],
    ]);
  });
});

describe("getActiveFilters", () => {
  it("labels applied filters, with the text query first", () => {
    const active = getActiveFilters(
      new URLSearchParams("bake_type_ids=1,3&difficulty=2&q=lemon"),
      definitions,
    );
    expect(active.map(({ label }) => label)).toEqual(["“lemon”", "Cakes", "Bread", "Medium"]);
  });

  it("tells bakers with the same name apart by series", () => {
    const active = getActiveFilters(new URLSearchParams("baker_ids=181,278,9"), definitions);
    expect(active.map(({ label }) => label)).toEqual([
      "Aaron · Series 12",
      "Aaron · Series 16",
      "Prue Leith",
    ]);
  });

  it("falls back to the raw value for ids it doesn't know", () => {
    const active = getActiveFilters(new URLSearchParams("diet_ids=99"), definitions);
    expect(active).toEqual([{ param: "diet_ids", value: "99", label: "99" }]);
  });
});
