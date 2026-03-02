import { Hono } from "hono";
import { cors } from "hono/cors";
import * as recipeService from "./services/recipe.js";
import * as genericService from "./services/generic.js";

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  ...(process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(",").map((s) => s.trim()) : []),
];

const app = new Hono()
  .use(
    "*",
    cors({
      origin: (origin) => (ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]),
      allowMethods: ["GET", "OPTIONS"],
      allowHeaders: ["*"],
      credentials: true,
    })
  )
  .get("/recipe", async (c) => {
    const limit = c.req.query("limit");
    const skip = c.req.query("skip");
    const q = c.req.query("q");
    const difficulty = c.req.query("difficulty");
    const time = c.req.query("time");
    const season = c.req.query("season");
    const bakerIds = c.req.query("baker_ids");
    const dietIds = c.req.query("diet_ids");
    const categoryIds = c.req.query("category_ids");
    const bakeTypeIds = c.req.query("bake_type_ids");

    const filters: recipeService.RecipeFilters = {
      limit: limit ? parseInt(limit, 10) : 50,
      skip: skip ? parseInt(skip, 10) : 0,
      q: q || undefined,
      difficulty: difficulty ? parseInt(difficulty, 10) : undefined,
      time: time ? parseInt(time, 10) : undefined,
      season: season ? parseInt(season, 10) : undefined,
      baker_ids: bakerIds ? bakerIds.split(",").map((id) => parseInt(id.trim(), 10)).filter(Boolean) : undefined,
      diet_ids: dietIds ? dietIds.split(",").map((id) => parseInt(id.trim(), 10)).filter(Boolean) : undefined,
      category_ids: categoryIds ? categoryIds.split(",").map((id) => parseInt(id.trim(), 10)).filter(Boolean) : undefined,
      bake_type_ids: bakeTypeIds ? bakeTypeIds.split(",").map((id) => parseInt(id.trim(), 10)).filter(Boolean) : undefined,
    };

    const recipes = await recipeService.getRecipes(filters);
    const rows = recipes.map((r) => ({
      id: r.id,
      title: r.title,
      link: r.link,
      img: r.img,
      difficulty: r.difficulty,
      time: r.time,
      baker: r.baker,
      diets: r.diets,
      categories: r.categories,
      bake_types: r.bake_types,
    }));
    return c.json(rows);
  })
  .get("/recipe/count", async (c) => {
    const q = c.req.query("q");
    const difficulty = c.req.query("difficulty");
    const time = c.req.query("time");
    const season = c.req.query("season");
    const bakerIds = c.req.query("baker_ids");
    const dietIds = c.req.query("diet_ids");
    const categoryIds = c.req.query("category_ids");
    const bakeTypeIds = c.req.query("bake_type_ids");

    const filters = {
      q: q || undefined,
      difficulty: difficulty ? parseInt(difficulty, 10) : undefined,
      time: time ? parseInt(time, 10) : undefined,
      season: season ? parseInt(season, 10) : undefined,
      baker_ids: bakerIds ? bakerIds.split(",").map((id) => parseInt(id.trim(), 10)).filter(Boolean) : undefined,
      diet_ids: dietIds ? dietIds.split(",").map((id) => parseInt(id.trim(), 10)).filter(Boolean) : undefined,
      category_ids: categoryIds ? categoryIds.split(",").map((id) => parseInt(id.trim(), 10)).filter(Boolean) : undefined,
      bake_type_ids: bakeTypeIds ? bakeTypeIds.split(",").map((id) => parseInt(id.trim(), 10)).filter(Boolean) : undefined,
    };

    const count = await recipeService.getRecipeCount(filters);
    return c.json(count);
  })
  .get("/recipe/:id", async (c) => {
    const id = parseInt(c.req.param("id"), 10);
    if (Number.isNaN(id)) return c.json({ detail: "Invalid recipe id" }, 400);
    const recipe = await recipeService.getRecipeById(id);
    if (!recipe) return c.json({ detail: "No recipe found" }, 404);
    return c.json({
      id: recipe.id,
      title: recipe.title,
      link: recipe.link,
      img: recipe.img,
      difficulty: recipe.difficulty,
      time: recipe.time,
      baker: recipe.baker,
      diets: recipe.diets,
      categories: recipe.categories,
      bake_types: recipe.bake_types,
    });
  })
  .get("/baker", async (c) => {
    const items = await genericService.getItems("bakers", c.req.query("q"));
    return c.json(items);
  })
  .get("/baker/count", async (c) => {
    const count = await genericService.getItemCount("bakers");
    return c.json(count);
  })
  .get("/baker/:id", async (c) => {
    const id = parseInt(c.req.param("id"), 10);
    if (Number.isNaN(id)) return c.json({ detail: "Invalid baker id" }, 400);
    const item = await genericService.getItemById("bakers", id);
    if (!item) return c.json({ detail: "No baker found" }, 404);
    return c.json(item);
  })
  .get("/diet", async (c) => {
    const items = await genericService.getItems("diets", c.req.query("q"));
    return c.json(items);
  })
  .get("/diet/count", async (c) => {
    const count = await genericService.getItemCount("diets");
    return c.json(count);
  })
  .get("/diet/:id", async (c) => {
    const id = parseInt(c.req.param("id"), 10);
    if (Number.isNaN(id)) return c.json({ detail: "Invalid diet id" }, 400);
    const item = await genericService.getItemById("diets", id);
    if (!item) return c.json({ detail: "No diet found" }, 404);
    return c.json(item);
  })
  .get("/category", async (c) => {
    const items = await genericService.getItems("categories", c.req.query("q"));
    return c.json(items);
  })
  .get("/category/count", async (c) => {
    const count = await genericService.getItemCount("categories");
    return c.json(count);
  })
  .get("/category/:id", async (c) => {
    const id = parseInt(c.req.param("id"), 10);
    if (Number.isNaN(id)) return c.json({ detail: "Invalid category id" }, 400);
    const item = await genericService.getItemById("categories", id);
    if (!item) return c.json({ detail: "No category found" }, 404);
    return c.json(item);
  })
  .get("/bake_type", async (c) => {
    const items = await genericService.getItems("bake_types", c.req.query("q"));
    return c.json(items);
  })
  .get("/bake_type/count", async (c) => {
    const count = await genericService.getItemCount("bake_types");
    return c.json(count);
  })
  .get("/bake_type/:id", async (c) => {
    const id = parseInt(c.req.param("id"), 10);
    if (Number.isNaN(id)) return c.json({ detail: "Invalid bake_type id" }, 400);
    const item = await genericService.getItemById("bake_types", id);
    if (!item) return c.json({ detail: "No bake_type found" }, 404);
    return c.json(item);
  })
  .get("/", (c) => c.json({ title: "GBBO Recipe API", version: "0.1.0" }));

export default app;
