import { Recipe } from "@/types";
import {
  Card as MantineCard,
  Image,
  Text,
  Flex,
  Badge,
  Avatar,
  Button,
  MantineColor,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import styles from "./card.module.css";
import { CakeSlice, Croissant, Cake, LucideIcon, Clock } from "lucide-react";

interface CardProps {
  recipe: Recipe;
}

import { Diet } from "@/components";

const difficulties: { icon: LucideIcon; label: string; color: MantineColor }[] =
  [
    { icon: CakeSlice, label: "Easy", color: "green.9" },
    { icon: Cake, label: "Medium", color: "yellow.9" },
    { icon: Croissant, label: "Hard", color: "red.9" },
  ];

function formatTime(minutes: number | null) {
  if (minutes === null) return null;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (!hours) return `${mins} minutes`;
  if (!mins) return `${hours} hours`;
  return `${hours} hours and ${mins} minutes`;
}

export default function Card({ recipe }: CardProps) {
  const difficulty = recipe.difficulty ? difficulties[recipe.difficulty] : null;
  const time = formatTime(recipe.time);

  return (
    <MantineCard shadow="sm" radius="md" className={styles.card} padding={0}>
      <div className={styles.image}>
        <Image src={recipe.img} height={160} alt={recipe.title} />
        {recipe.baker?.id && (
          <Tooltip label={recipe.baker.name} position="bottom">
            <Avatar
              src={recipe.baker.img}
              className={styles.avatar}
              component="a"
              href={`/search?baker_ids=${recipe.baker.id}`}
            />
          </Tooltip>
        )}
      </div>

      <div className={styles.content}>
        <Text fw={500} className={styles.title} px="xs">
          {recipe.title}
        </Text>

        <Flex direction="column" gap="xs">
          <Flex gap="xs" align="center" justify="space-between" px="xs">
            {difficulty ? (
              <Flex align="center" className={styles.xxsGap}>
                <ThemeIcon color={difficulty.color} size="sm" variant="white">
                  <difficulty.icon />
                </ThemeIcon>
                <Text c={difficulty.color}>{difficulty.label}</Text>
              </Flex>
            ) : (
              <span /> // empty span to keep the justify-between consistent
            )}

            {recipe.is_technical && (
              <Badge
                color="orange"
                size="lg"
                variant="gradient"
                gradient={{ from: "indigo", to: "grape", deg: 330 }}
                radius="xs"
              >
                Technical
              </Badge>
            )}
          </Flex>

          <Flex gap="xs" align="center" justify="space-between" px="xs">
            {time ? (
              <Flex align="center" className={styles.xxsGap}>
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
            {recipe.diet.length > 0 && (
              <Flex gap="xs" px="xs" className={styles.diet}>
                {recipe.diet.map((diet) => (
                  <Diet diet={diet} key={diet.id} />
                ))}
              </Flex>
            )}
          </Flex>

          <Button
            component="a"
            size="sm"
            href={recipe.link}
            target="_blank"
            rel="noopener noreferrer"
            radius={0}
            fullWidth
            color="gray"
          >
            View recipe on GBBO
          </Button>
        </Flex>
      </div>
    </MantineCard>
  );
}
