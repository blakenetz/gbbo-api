"use client";

import { SimpleGrid, Skeleton, Text, Title } from "@mantine/core";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getCategoryStyle, pastelVars } from "@/components/taxonomy";
import { fetchFilters, fetchRecipeCount } from "@/util/api";
import SectionHeading from "./sectionHeading";
import styles from "./home.module.css";

// The three challenges of every episode, in running order. Names match the API's categories.
export const CHALLENGES = [
  {
    name: "Signature",
    blurb: "The bakers' tried-and-tested favourites, each with a personal twist.",
  },
  {
    name: "Technical",
    blurb: "The judges' own recipes. Unlike the bakers, you get the full method.",
  },
  {
    name: "Showstopper",
    blurb: "Go big or go home. Ideally both, with a sugar-work swan on top.",
  },
];

interface ChallengeCard {
  name: string;
  blurb: string;
  categoryId: number;
  count: number;
}

export default function Challenges() {
  const [cards, setCards] = useState<ChallengeCard[] | null>(null);

  useEffect(() => {
    async function load() {
      const { categories } = await fetchFilters();
      const found = CHALLENGES.flatMap((challenge) => {
        const category = categories.find(({ name }) => name === challenge.name);
        return category ? [{ ...challenge, categoryId: category.id }] : [];
      });
      const counts = await Promise.all(
        found.map(({ categoryId }) => fetchRecipeCount({ category_ids: categoryId })),
      );
      setCards(found.map((card, i) => ({ ...card, count: counts[i] })));
    }
    load().catch(() => setCards([]));
  }, []);

  return (
    <section aria-labelledby="challenges-title">
      <SectionHeading
        id="challenges-title"
        title="Take on a challenge"
        description="Three challenges every week in the tent. Pick your poison."
      />

      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
        {cards
          ? cards.map((card) => {
              const { icon: Icon, color } = getCategoryStyle(card.name);
              return (
                <Link
                  key={card.name}
                  href={`/search?category_ids=${card.categoryId}`}
                  className={styles.challenge}
                  style={pastelVars(color)}
                >
                  <span className={styles.challengeIcon}>
                    <Icon size={26} />
                  </span>
                  <Title order={3}>{card.name}</Title>
                  <Text>{card.blurb}</Text>
                  <span className={styles.challengeMeta}>
                    {card.count} recipes
                    <ArrowRight size={18} />
                  </span>
                </Link>
              );
            })
          : CHALLENGES.map(({ name }) => (
              <Skeleton key={name} height={236} radius="xl" />
            ))}
      </SimpleGrid>
    </section>
  );
}
