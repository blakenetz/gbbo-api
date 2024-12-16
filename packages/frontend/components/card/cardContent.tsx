import { Recipe } from "@/types";
import {
  Anchor,
  Button,
  Flex,
  MantineColor,
  MantineGradient,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { Cake, CakeSlice, Clock, Croissant, LucideIcon } from "lucide-react";
import { Diet } from "@/components";
import styles from "./card.module.css";
import Link from "next/link";

interface CardContentProps {
  recipe: Recipe;
}

const difficulties: { icon: LucideIcon; label: string; color: MantineColor }[] =
  [
    { icon: CakeSlice, label: "Easy", color: "green.9" },
    { icon: Cake, label: "Medium", color: "yellow.9" },
    { icon: Croissant, label: "Hard", color: "red.9" },
  ];

const categoryColors: Record<number, MantineGradient> = {
  1: { from: "orange.4", to: "pink.4" },
  2: { from: "yellow.4", to: "orange.4" },
  3: { from: "indigo.4", to: "grape.4" },
  4: { from: "green.5", to: "teal.4" },
};

function formatTime(minutes: number | null) {
  if (minutes === null) return null;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (!hours) return `${mins} minutes`;
  if (!mins) return `${hours} hours`;
  return `${hours} hours and ${mins} minutes`;
}

function Difficulty({ recipe }: CardContentProps) {
  const difficulty = recipe.difficulty
    ? difficulties[recipe.difficulty - 1] // difficulty is 1-based
    : null;

  if (!difficulty) return <span />; // empty span to keep the justify-between consistent

  return (
    <Anchor
      className={styles.link}
      component={Link}
      href={`/search?difficulty=${recipe.difficulty}`}
    >
      <ThemeIcon color={difficulty.color} size="sm" variant="white">
        <difficulty.icon />
      </ThemeIcon>
      <Text c={difficulty.color}>{difficulty.label}</Text>
    </Anchor>
  );
}

function Diets({ recipe }: CardContentProps) {
  return recipe.diets.length > 0 ? (
    <Flex gap="xs" px="xs" className={styles.diet}>
      {recipe.diets.map((diet) => (
        <Diet diet={diet} key={diet.id} />
      ))}
    </Flex>
  ) : null;
}

export default function CardContent({ recipe }: CardContentProps) {
  const time = formatTime(recipe.time);
  const category = recipe.categories.find(({ id }) => id <= 4);

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
          <Button
            variant="gradient"
            gradient={{ ...categoryColors[category.id], deg: 330 }}
            size="compact-sm"
            radius="xs"
            component={Link}
            href={`/search?category_ids=${category.id}`}
            autoContrast
          >
            {category.name}
          </Button>
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
