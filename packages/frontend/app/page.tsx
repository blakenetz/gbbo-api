import { Card } from "@/components";
import { Flex, SimpleGrid, Text, Title } from "@mantine/core";
import { fetchRandomRecipe } from "./actions";
import { fetchFilters } from "./search/actions";
import styles from "./page.module.css";
import { Form } from "./components";
import QuickSearch from "./components/quickSearch";

export const dynamic = "force-dynamic";

const cols = 3;

export default async function Home() {
  const [recipes, filterData] = await Promise.all([
    fetchRandomRecipe(cols),
    fetchFilters()
  ]);

  return (
    <Flex
      className={styles.container}
      direction="column"
      gap="md"
      align="center"
      justify="center"
      mt="15dvh"
    >
      <Title>GBBO Search</Title>
      <Text>A new way to search for Great British Bake Off recipes</Text>

      <Form />

      <QuickSearch 
        categories={filterData.categories}
        diets={filterData.diets}
        bakeTypes={filterData.bakeTypes}
      />

      <Text>Need some inspiration...</Text>

      <SimpleGrid cols={{ base: 1, xs: 3 }} spacing="xs" mt="xl">
        {recipes.map((recipe) => (
          <Card key={recipe.id} recipe={recipe} />
        ))}
      </SimpleGrid>
    </Flex>
  );
}
