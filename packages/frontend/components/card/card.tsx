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
import { CakeSlice, Croissant, Cake, LucideIcon } from "lucide-react";

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

export default function Card({ recipe }: CardProps) {
  const difficulty = recipe.difficulty ? difficulties[recipe.difficulty] : null;

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
        <Text fw={500} className={styles.title}>
          {recipe.title}
        </Text>

        <Flex direction="column" gap="xs">
          <Flex gap="xs" align="center" justify="space-between" px="xs">
            {difficulty ? (
              <Flex align="center" gap="xs">
                <ThemeIcon color={difficulty.color} size="sm" variant="white">
                  <difficulty.icon />
                </ThemeIcon>
                <Text c={difficulty.color}>{difficulty.label}</Text>
              </Flex>
            ) : (
              <span />
            )}

            {recipe.is_technical && (
              <Badge
                color="orange"
                size="lg"
                variant="gradient"
                gradient={{ from: "yellow", to: "red", deg: 330 }}
                radius="xs"
              >
                Technical
              </Badge>
            )}
          </Flex>

          {recipe.diet.length > 0 && (
            <Flex gap="xs" px="xs">
              {recipe.diet.map((diet) => (
                <Diet diet={diet} key={diet.id} />
              ))}
            </Flex>
          )}

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
