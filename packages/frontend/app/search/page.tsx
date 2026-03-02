"use client";
import { Text } from "@mantine/core";
import { fetchRecipeByQuery, fetchFilters } from "./actions";
import { Card } from "@/components";
import { RecipeSearchParams } from "@/types";
import { AppShellClient } from "./components";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [filterProps, setFilterProps] = useState<any>({});

  useEffect(() => {
    async function loadData() {
      const params: RecipeSearchParams = {
        q: searchParams.get("q") ?? undefined,
        difficulty: searchParams.get("difficulty") ?? undefined,
        time: searchParams.get("time") ?? undefined,
        season: searchParams.get("season") ?? undefined,
        baker_ids: searchParams.get("baker_ids") ?? undefined,
        diet_ids: searchParams.get("diet_ids") ?? undefined,
        category_ids: searchParams.get("category_ids") ?? undefined,
        bake_type_ids: searchParams.get("bake_type_ids") ?? undefined,
        page: searchParams.get("page") ?? undefined,
      };

      const [recipesData, filterDataResult] = await Promise.all([
        fetchRecipeByQuery(params),
        fetchFilters(),
      ]);

      setRecipes(recipesData.recipes);
      setTotal(recipesData.total);
      setFilterProps(filterDataResult);
    }
    loadData();
  }, [searchParams]);

  return (
    <AppShellClient paginationProps={{ total }} filterProps={filterProps}>
      {recipes.length ? (
        recipes.map((recipe) => <Card key={recipe.id} recipe={recipe} />)
      ) : (
        <Text>No recipes found</Text>
      )}
    </AppShellClient>
  );
}
