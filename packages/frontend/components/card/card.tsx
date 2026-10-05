import { Recipe } from "@/types";
import {
  Avatar,
  Badge,
  Button,
  Flex,
  Image,
  Card as MantineCard,
  Text,
  Tooltip,
} from "@mantine/core";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/util";
import CardContent from "./cardContent";
import styles from "./card.module.css";

interface CardProps {
  recipe: Recipe;
  /** Shows when the recipe was published, for recency-ordered lists. */
  showPublished?: boolean;
}

export default function Card({ recipe, showPublished = false }: CardProps) {
  return (
    <MantineCard withBorder className={styles.card} padding={0}>
      <div className={styles.image}>
        <Image src={recipe.img} height={160} alt={recipe.title} />
        {showPublished && recipe.published_at && (
          <Badge className={styles.published} color="butter.1" c="butter.9">
            Added {formatDate(recipe.published_at)}
          </Badge>
        )}
        {recipe.baker?.id && (
          <Tooltip label={recipe.baker.name} position="bottom">
            <Link href={`/search?baker_ids=${recipe.baker.id}`}>
              <Avatar
                src={recipe.baker.img}
                className={styles.avatar}
                variant="outline"
              />
            </Link>
          </Tooltip>
        )}
      </div>

      <div className={styles.content}>
        <Text className={styles.title} px="xs">
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
            color="mint.1"
            c="mint.9"
            rightSection={<ExternalLink size={14} />}
          >
            View recipe on GBBO
          </Button>
        </Flex>
      </div>
    </MantineCard>
  );
}
