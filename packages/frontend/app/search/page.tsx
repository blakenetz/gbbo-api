import { SimpleGrid } from "@mantine/core";
import { fetchRecipeByQuery } from "./actions";
import { Card } from "@/components";
import { RecipeSearchParams } from "@/types";

interface SearchPageProps {
  searchParams: Promise<RecipeSearchParams>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const recipes = await fetchRecipeByQuery(params);

  return (
    <SimpleGrid
      cols={{ xs: 2, sm: 3, lg: 4 }}
      spacing="xs"
      p={{ base: 0, xs: "xs" }}
    >
      {recipes.map((recipe) => (
        <Card key={recipe.id} recipe={recipe} />
      ))}
    </SimpleGrid>
  );
}
