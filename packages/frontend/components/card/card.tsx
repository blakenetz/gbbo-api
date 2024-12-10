"use client";
import { Recipe } from "@/types";
import {
  Card as MantineCard,
  Image,
  Text,
  Flex,
  Badge,
  Avatar,
  Button,
} from "@mantine/core";
import styles from "./card.module.css";
import { Star } from "lucide-react";

interface CardProps {
  recipe: Recipe;
}

import { Diet } from "@/components";

export default function Card({ recipe }: CardProps) {
  return (
    <MantineCard shadow="sm" radius="md" className={styles.card} padding="xs">
      <MantineCard.Section className={styles.image}>
        <Image src={recipe.img} height={160} alt={recipe.title} />
        {recipe.baker?.id && (
          <Avatar src={recipe.baker.img} className={styles.avatar} />
        )}
      </MantineCard.Section>

      <MantineCard.Section className={styles.content}>
        <Text fw={500} className={styles.title}>
          {recipe.title}
        </Text>

        <Flex direction="column" gap="xs">
          <Flex gap="xs" align="center" justify="space-between" px="xs">
            <Flex>
              {recipe.difficulty &&
                Array.from({ length: 3 }, (_, index) => (
                  <Star
                    key={index}
                    className={styles.star}
                    data-filled={index <= (recipe.difficulty ?? 0)}
                  />
                ))}
            </Flex>

            {recipe.is_technical && (
              <Badge color="red" className={styles.badge}>
                Technical
              </Badge>
            )}

            {recipe.diet.length > 0 && (
              <Flex gap="xs">
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
            View recipe on GBBP
          </Button>
        </Flex>
      </MantineCard.Section>
    </MantineCard>
  );
}
