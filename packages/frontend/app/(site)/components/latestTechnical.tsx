"use client";

import { Avatar, Badge, Button, Group, Image, Skeleton, Text, Title } from "@mantine/core";
import { Clock, ExternalLink, Timer } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { difficulties, formatTime } from "@/components/recipeMeta";
import { pastelVars } from "@/components/taxonomy";
import type { Recipe } from "@/types";
import { formatDate } from "@/util";
import { fetchFilters, fetchRecipes } from "@/util/api";
import styles from "./home.module.css";

interface Feature {
  recipe: Recipe;
  categoryId: number;
}

export default function LatestTechnical() {
  // undefined while loading; null when there is nothing to show.
  const [feature, setFeature] = useState<Feature | null | undefined>(undefined);

  useEffect(() => {
    async function load() {
      const { categories } = await fetchFilters();
      const technical = categories.find(({ name }) => name === "Technical");
      if (!technical) return setFeature(null);

      const [recipe] = await fetchRecipes({ category_ids: technical.id, sort: "recent", limit: 1 });
      setFeature(recipe ? { recipe, categoryId: technical.id } : null);
    }
    load().catch(() => setFeature(null));
  }, []);

  if (feature === undefined) return <Skeleton height={360} radius="xl" />;
  if (feature === null) return null;

  const { recipe, categoryId } = feature;
  const difficulty = recipe.difficulty ? difficulties[recipe.difficulty - 1] : undefined;
  const time = formatTime(recipe.time);

  return (
    <section
      className={styles.feature}
      style={pastelVars("duckegg")}
      aria-labelledby="latest-technical-title"
    >
      {/* Decorative duplicate of the "Get the recipe" link, hidden from assistive tech. */}
      <a
        href={recipe.link}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.polaroid}
        tabIndex={-1}
        aria-hidden="true"
      >
        <Image src={recipe.img} alt="" radius={2} />
        {recipe.published_at && (
          <span className={styles.polaroidCaption}>{formatDate(recipe.published_at)}</span>
        )}
      </a>

      <div className={styles.featureBody}>
        <Badge size="lg" color="duckegg.2" c="duckegg.9" leftSection={<Timer size={14} />}>
          Latest technical
        </Badge>

        <Title id="latest-technical-title" order={2} className={styles.featureTitle}>
          {recipe.title}
        </Title>

        <Text size="lg">
          The judges set it, the bakers attempt it blind. You, thankfully, get the whole method.
        </Text>

        <Group gap="lg" className={styles.featureMeta}>
          {recipe.baker && (
            <Group gap={8}>
              <Avatar src={recipe.baker.img} size="sm" alt="" />
              <Text fw={700}>Set by {recipe.baker.name}</Text>
            </Group>
          )}
          {difficulty && (
            <Group gap={6}>
              <difficulty.icon size={18} />
              <Text fw={700}>{difficulty.label}</Text>
            </Group>
          )}
          {time && (
            <Group gap={6}>
              <Clock size={18} />
              <Text fw={700}>{time}</Text>
            </Group>
          )}
        </Group>

        <Group gap="sm">
          <Button
            component="a"
            href={recipe.link}
            target="_blank"
            rel="noopener noreferrer"
            size="md"
            rightSection={<ExternalLink size={16} />}
          >
            Get the recipe
          </Button>
          <Button
            component={Link}
            href={`/search?category_ids=${categoryId}`}
            size="md"
            variant="default"
          >
            All technicals
          </Button>
        </Group>
      </div>
    </section>
  );
}
