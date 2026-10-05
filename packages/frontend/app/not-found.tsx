"use client";

import { Button, Group, Text, Title } from "@mantine/core";
import { BookOpen, Tent } from "lucide-react";
import Link from "next/link";
import Logo from "@/components/logo/logo";
import SiteShell from "@/components/siteShell/siteShell";
import styles from "./not-found.module.css";

// Rendered by the root layout only, so it wraps itself in the site shell.
export default function NotFound() {
  return (
    <SiteShell>
      <div className={styles.page}>
        <section className={styles.card} aria-labelledby="not-found-title">
          <Logo size={120} className={styles.logo} />
          <Text className={styles.code}>404</Text>
          <Title id="not-found-title" order={1} className={styles.title}>
            This page didn&apos;t rise
          </Title>
          <Text size="lg" c="dimmed" maw={460}>
            It may have been moved, eaten, or never made it out of the oven. Paul would not be
            offering a handshake.
          </Text>
          <Group justify="center" gap="sm">
            <Button component={Link} href="/" size="md" leftSection={<Tent size={18} />}>
              Back to the tent
            </Button>
            <Button
              component={Link}
              href="/search"
              size="md"
              variant="default"
              leftSection={<BookOpen size={18} />}
            >
              Browse all recipes
            </Button>
          </Group>
        </section>
      </div>
    </SiteShell>
  );
}
