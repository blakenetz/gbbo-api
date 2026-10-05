"use client";

import { Skeleton } from "@mantine/core";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getCategoryStyle, pastelVars } from "@/components/taxonomy";
import type { Category } from "@/types";
import { fetchFilters } from "@/util/api";
import { CHALLENGES } from "./challenges";
import SectionHeading from "./sectionHeading";
import styles from "./home.module.css";

export default function Collections() {
  const [collections, setCollections] = useState<Category[] | null>(null);

  useEffect(() => {
    fetchFilters()
      .then(({ categories }) =>
        setCollections(
          // The challenges have their own section above.
          categories.filter(({ name }) => !CHALLENGES.some((challenge) => challenge.name === name)),
        ),
      )
      .catch(() => setCollections([]));
  }, []);

  return (
    <section aria-labelledby="collections-title">
      <SectionHeading
        id="collections-title"
        title="Bakes for every occasion"
        description="From Christmas showstoppers to the classics your nan would approve of."
      />

      <div className={styles.collections}>
        {collections
          ? collections.map((collection) => {
              const { icon: Icon, color } = getCategoryStyle(collection.name);
              return (
                <Link
                  key={collection.id}
                  href={`/search?category_ids=${collection.id}`}
                  className={styles.collection}
                  style={pastelVars(color)}
                >
                  <span className={styles.collectionIcon}>
                    <Icon size={18} />
                  </span>
                  {collection.name}
                </Link>
              );
            })
          : Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} height={50} width={180} radius="xl" />
            ))}
      </div>
    </section>
  );
}
