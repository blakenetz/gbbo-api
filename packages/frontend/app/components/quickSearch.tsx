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
    <Flex direction="column" gap="md" align="center" mt="xl">
      <Title order={3}>Quick Search</Title>
      <Text size="sm" c="dimmed">
        Browse recipes by category, diet, or bake type
      </Text>

      <Flex direction="column" gap="lg" w="100%" maw={800}>
        {/* Categories */}
        <Flex direction="column" gap="xs">
          <Text fw={500} size="sm">
            Categories
          </Text>
          <Flex wrap="wrap" gap="xs" style={{ minWidth: 0 }}>
            {categories.slice(0, 6).map((category) => (
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
        <Flex direction="column" gap="xs">
          <Text fw={500} size="sm">
            Diets
          </Text>
          <Flex wrap="wrap" gap="xs" style={{ minWidth: 0 }}>
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
        <Flex direction="column" gap="xs">
          <Text fw={500} size="sm">
            Bake Types
          </Text>
          <Flex wrap="wrap" gap="xs" style={{ minWidth: 0 }}>
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
    </Flex>
  );
}
