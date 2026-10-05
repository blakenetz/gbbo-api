"use client";

import { SimpleGrid, Skeleton, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import { Card } from "@/components";
import type { Recipe } from "@/types";
import { fetchRecipes } from "@/util/api";
import SectionHeading from "./sectionHeading";

const NEWEST = 6;

export default function FreshBakes() {
  const [recipes, setRecipes] = useState<Recipe[] | null>(null);

  useEffect(() => {
    fetchRecipes({ sort: "recent", limit: NEWEST })
      .then(setRecipes)
      .catch(() => setRecipes([]));
  }, []);

  return (
    <section aria-labelledby="fresh-bakes-title">
      <SectionHeading
        id="fresh-bakes-title"
        title="Fresh out of the oven"
        description="The newest recipes to land on the Bake Off website."
      />

      {recipes?.length === 0 ? (
        <Text c="dimmed">The oven&apos;s empty right now. Check back in a moment.</Text>
      ) : (
        <SimpleGrid cols={{ base: 1, xs: 2, lg: 3 }} spacing="lg">
          {recipes
            ? recipes.map((recipe) => <Card key={recipe.id} recipe={recipe} showPublished />)
            : Array.from({ length: NEWEST }, (_, i) => (
                <Skeleton key={i} height={340} radius="lg" />
              ))}
        </SimpleGrid>
      )}
    </section>
  );
}
