"use client";
import { Button, Flex, Text, Title } from "@mantine/core";
import { useRouter } from "next/navigation";
import type { Category, Diet, BakeType } from "@/types";

interface QuickSearchProps {
  categories: Category[];
  diets: Diet[];
  bakeTypes: BakeType[];
}

export default function QuickSearch({
  categories,
  diets,
  bakeTypes,
}: QuickSearchProps) {
  const router = useRouter();

  const handleQuickSearch = (type: string, id: number) => {
    const searchParams = new URLSearchParams();
    searchParams.append(`${type}_ids`, id.toString());
    router.push(`/search?${searchParams.toString()}`);
  };

  return (
    <Flex
      direction="column"
      gap="xs"
      justify="center"
      align="center"
      component="section"
    >
      <Title order={2} size="h4">
        Quick Filters
      </Title>

      {/* Categories */}
      <Flex direction="column" align="flex-start">
        <Text fw={500} size="sm" c="dimmed">
          Categories
        </Text>
        <Flex
          wrap="wrap"
          gap="xs"
          justify="flex-start"
          align="flex-start"
          w="100%"
        >
          {categories.map((category) => (
            <Button
              key={category.id}
              variant="light"
              size="sm"
              onClick={() => handleQuickSearch("category", category.id)}
              style={{ flexShrink: 0 }}
            >
              {category.name}
            </Button>
          ))}
        </Flex>
      </Flex>

      {/* Diets */}
      <Flex direction="column" align="flex-start">
        <Text fw={500} size="sm" c="dimmed">
          Diets
        </Text>
        <Flex
          wrap="wrap"
          gap="xs"
          justify="flex-start"
          align="flex-start"
          w="100%"
        >
          {diets.map((diet) => (
            <Button
              key={diet.id}
              variant="light"
              size="sm"
              onClick={() => handleQuickSearch("diet", diet.id)}
              style={{ flexShrink: 0 }}
            >
              {diet.name}
            </Button>
          ))}
        </Flex>
      </Flex>

      {/* Bake Types */}
      <Flex direction="column" align="flex-start" w="100%">
        <Text fw={500} size="sm" c="dimmed">
          Bake Types
        </Text>
        <Flex
          wrap="wrap"
          gap="xs"
          justify="flex-start"
          align="flex-start"
          w="100%"
        >
          {bakeTypes.map((bakeType) => (
            <Button
              key={bakeType.id}
              variant="light"
              size="sm"
              onClick={() => handleQuickSearch("bake_type", bakeType.id)}
              style={{ flexShrink: 0 }}
            >
              {bakeType.name}
            </Button>
          ))}
        </Flex>
      </Flex>
    </Flex>
  );
}
