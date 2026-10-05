import { describe, expect, it } from "vitest";
import { parseTimeToMinutes } from "./base";

describe("parseTimeToMinutes", () => {
  it("adds up hours and minutes in the site's formats", () => {
    expect(parseTimeToMinutes("1h 30m")).toBe(90);
    expect(parseTimeToMinutes("2 hours 15 mins")).toBe(135);
    expect(parseTimeToMinutes("45 minutes")).toBe(45);
    expect(parseTimeToMinutes("1 day")).toBe(1440);
  });

  it("returns 0 when there is no time to read", () => {
    expect(parseTimeToMinutes("")).toBe(0);
    expect(parseTimeToMinutes("Easy")).toBe(0);
  });
});
