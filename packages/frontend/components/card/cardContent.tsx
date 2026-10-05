import { Recipe } from "@/types";
import { Anchor, Button, Flex, Text, ThemeIcon } from "@mantine/core";
import { Clock } from "lucide-react";
import { Diet } from "@/components";
import { difficulties, formatTime } from "../recipeMeta";
import { getCategoryStyle } from "../taxonomy";
import styles from "./card.module.css";
import Link from "next/link";

interface CardContentProps {
  recipe: Recipe;
}

function Difficulty({ recipe }: CardContentProps) {
  const difficulty = recipe.difficulty
    ? difficulties[recipe.difficulty - 1] // difficulty is 1-based
    : null;

  if (!difficulty) return <span />; // empty span to keep the justify-between consistent

  return (
    <Link href={`/search?difficulty=${recipe.difficulty}`}>
      <Anchor className={styles.link} component="span">
        <ThemeIcon color={difficulty.color} size="sm" variant="white">
          <difficulty.icon />
        </ThemeIcon>
        <Text c={difficulty.color}>{difficulty.label}</Text>
      </Anchor>
    </Link>
  );
}

function Diets({ recipe }: CardContentProps) {
  return (recipe.diets?.length ?? 0) > 0 ? (
    <Flex gap="xs" px="xs" className={styles.diet}>
      {(recipe.diets ?? []).map((diet) => (
        <Diet diet={diet} key={diet.id} />
      ))}
    </Flex>
  ) : null;
}

export default function CardContent({ recipe }: CardContentProps) {
  const time = formatTime(recipe.time);
  const category = recipe.categories?.find(({ id }) => id <= 4);
  const categoryColor = category && getCategoryStyle(category.name).color;

  // display in single line
  if (!category && !time) {
    return (
      <Flex gap="xs" align="center" justify="space-between" px="xs">
        <Difficulty recipe={recipe} />
        <Diets recipe={recipe} />
      </Flex>
    );
  }

  return (
    <>
      <Flex gap="xs" align="center" justify="space-between" px="xs">
        <Difficulty recipe={recipe} />

        {category && (
          <Link href={`/search?category_ids=${category.id}`}>
            <Button
              color={`${categoryColor}.1`}
              c={`${categoryColor}.9`}
              size="compact-sm"
              component="span"
            >
              {category.name}
            </Button>
          </Link>
        )}
      </Flex>

      <Flex gap="xs" align="center" justify="space-between" px="xs">
        {time ? (
          <Flex className={styles.link}>
            <ThemeIcon color="gray" size="sm" variant="white">
              <Clock />
            </ThemeIcon>
            <Text fz="xs" c="dimmed">
              {time}
            </Text>
          </Flex>
        ) : (
          <span /> // empty span to keep the justify-between consistent
        )}
        <Diets recipe={recipe} />
      </Flex>
    </>
  );
}
