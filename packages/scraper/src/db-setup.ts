import { initializeDatabase } from "./utils/db";

async function main() {
  try {
    const drop = process.env.DROP === "true" || process.argv.includes("--drop");
    console.info(
      `Initializing database${drop ? " (drop and recreate)" : ""}...`
    );
    await initializeDatabase(drop);
    console.info("Database setup complete");
  } catch (e) {
    console.error("DB setup failed:", e);
    process.exit(1);
  }
}

main();
