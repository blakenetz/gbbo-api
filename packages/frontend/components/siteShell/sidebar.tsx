"use client";

import { Anchor, NavLink, ScrollArea, Skeleton, Text, Title } from "@mantine/core";
import { BookOpen, Leaf, Tent } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { BakeType, Diet } from "@/types";
import { fetchFilters } from "@/util/api";
import Logo from "../logo/logo";
import { dietIcons, getBakeTypeStyle } from "../taxonomy";
import styles from "./siteShell.module.css";

interface SidebarProps {
  onNavigate: () => void;
}

interface SidebarTaxonomy {
  bakeTypes: BakeType[];
  diets: Diet[];
}

function LinkSkeletons({ count }: { count: number }) {
  return Array.from({ length: count }, (_, i) => (
    <Skeleton key={i} height={34} radius="xl" my={4} />
  ));
}

export default function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const [taxonomy, setTaxonomy] = useState<SidebarTaxonomy | null>(null);

  useEffect(() => {
    fetchFilters()
      .then(({ bakeTypes, diets }) => setTaxonomy({ bakeTypes, diets }))
      .catch(() => setTaxonomy({ bakeTypes: [], diets: [] }));
  }, []);

  const linkProps = { component: Link, className: styles.navLink, onClick: onNavigate };

  return (
    <div className={styles.panel}>
      <Link href="/" className={styles.brand} onClick={onNavigate}>
        <span className={styles.logo}>
          <Logo size={40} />
        </span>
        <span>
          <Title order={2} className={styles.brandName}>
            GBBO Recipes
          </Title>
          <Text size="xs" c="dimmed">
            The unofficial recipe tent
          </Text>
        </span>
      </Link>

      <ScrollArea className={styles.links} type="scroll" scrollbarSize={6}>
        <NavLink
          {...linkProps}
          href="/"
          label="Home"
          leftSection={<Tent size={18} />}
          active={pathname === "/"}
        />
        <NavLink
          {...linkProps}
          href="/search"
          label="All recipes"
          leftSection={<BookOpen size={18} />}
          active={pathname.startsWith("/search")}
        />

        <Text component="h3" className={styles.sectionLabel}>
          Bake types
        </Text>
        {taxonomy ? (
          taxonomy.bakeTypes.map((bakeType) => {
            const { icon: Icon } = getBakeTypeStyle(bakeType.name);
            return (
              <NavLink
                {...linkProps}
                key={bakeType.id}
                href={`/search?bake_type_ids=${bakeType.id}`}
                label={bakeType.name}
                leftSection={<Icon size={18} />}
              />
            );
          })
        ) : (
          <LinkSkeletons count={6} />
        )}

        <Text component="h3" className={styles.sectionLabel}>
          Free-from
        </Text>
        {taxonomy ? (
          taxonomy.diets.map((diet) => {
            const Icon = dietIcons[diet.name]?.Icon ?? Leaf;
            return (
              <NavLink
                {...linkProps}
                key={diet.id}
                href={`/search?diet_ids=${diet.id}`}
                label={diet.name}
                leftSection={<Icon size={18} />}
              />
            );
          })
        ) : (
          <LinkSkeletons count={4} />
        )}
      </ScrollArea>

      <Text size="xs" c="dimmed" className={styles.credit}>
        An unofficial fan project. Recipes and photos belong to{" "}
        <Anchor
          href="https://thegreatbritishbakeoff.co.uk"
          target="_blank"
          rel="noopener noreferrer"
          inherit
        >
          The Great British Bake Off
        </Anchor>
        .
      </Text>
    </div>
  );
}
