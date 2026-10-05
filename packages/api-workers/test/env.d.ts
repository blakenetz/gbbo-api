declare namespace Cloudflare {
  interface GlobalProps {
    // Types `exports` from "cloudflare:workers" as this worker's own module, as
    // `wrangler types` would generate.
    mainModule: typeof import("../src/index");
  }

  interface Env {
    DB: D1Database;
    // Defined in vitest.config.mts.
    TEST_MIGRATIONS: import("cloudflare:test").D1Migration[];
  }
}
