import { Recipe } from "@/types";
import {
  Avatar,
  Button,
  Flex,
  Image,
  Card as MantineCard,
  Text,
  Tooltip,
} from "@mantine/core";
import styles from "./card.module.css";

interface CardProps {
  recipe: Recipe;
}

import Link from "next/link";
import CardContent from "./cardContent";

export default function Card({ recipe }: CardProps) {
  return (
    <MantineCard shadow="sm" radius="md" className={styles.card} padding={0}>
      <div className={styles.image}>
        <Image src={recipe.img} height={160} alt={recipe.title} />
        {recipe.baker?.id && (
          <Tooltip label={recipe.baker.name} position="bottom">
            <Avatar
              src={recipe.baker.img}
              className={styles.avatar}
              component={Link}
              href={`/search?baker_ids=${recipe.baker.id}`}
              variant="outline"
            />
          </Tooltip>
        )}
      </div>

      <div className={styles.content}>
        <Text fw={500} className={styles.title} px="xs">
          {recipe.title}
        </Text>

        <Flex direction="column" gap="xs">
          <CardContent recipe={recipe} />

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
