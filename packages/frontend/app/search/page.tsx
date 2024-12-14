import { Text } from "@mantine/core";
import { fetchRecipeByQuery } from "./actions";
import { Card } from "@/components";
import { RecipeSearchParams } from "@/types";
import { AppShell, Pagination } from "./components";

interface SearchPageProps {
  searchParams: Promise<RecipeSearchParams>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const { recipes, total } = await fetchRecipeByQuery(params);

  if (!recipes.length) {
    return <Text>No recipes found</Text>;
  }
  return (
    <AppShell filters={null} pagination={<Pagination total={total} />}>
      {recipes.map((recipe) => (
        <Card key={recipe.id} recipe={recipe} />
      ))}
    </AppShell>
  );
}
