import { Text } from "@mantine/core";
import { fetchRecipeByQuery, fetchFilters } from "./actions";
import { Card } from "@/components";
import { RecipeSearchParams } from "@/types";
import { AppShellClient } from "./components";

interface SearchPageProps {
  searchParams: Promise<RecipeSearchParams>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const { recipes, total } = await fetchRecipeByQuery(params);
  const filterProps = await fetchFilters();

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
