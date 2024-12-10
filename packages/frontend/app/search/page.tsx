import { SimpleGrid } from "@mantine/core";
import { fetchRecipeByQuery } from "./actions";
import { Card } from "@/components";
export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q: string };
}) {
  const recipes = await fetchRecipeByQuery(searchParams.q);

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
