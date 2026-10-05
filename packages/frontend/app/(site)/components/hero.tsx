"use client";

import { Badge, Button, Group, Text, TextInput, Title } from "@mantine/core";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { fetchRecipeCount } from "@/util/api";
import styles from "./home.module.css";

const SUGGESTIONS = ["chocolate", "tart", "raspberry", "caramel", "lemon"];

export default function Hero() {
  const router = useRouter();
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    fetchRecipeCount()
      .then(setTotal)
      .catch(() => setTotal(null));
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = String(new FormData(event.currentTarget).get("q") ?? "").trim();
    if (query) router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <Badge size="lg" color="blush.1" c="blush.9" leftSection={<Sparkles size={14} />}>
        {total ? `${total} bakes and counting` : "Fresh from the tent"}
      </Badge>

      <Title id="hero-title" order={1} className={styles.heroTitle}>
        On your marks, get set… <span className={styles.accent}>search!</span>
      </Title>

      <Text size="lg" className={styles.lead}>
        Every recipe from the Great British Bake Off tent, from the judges&apos;
        technicals to the bakers&apos; showstoppers. No soggy bottoms, we promise.
      </Text>

      <form role="search" className={styles.searchForm} onSubmit={handleSubmit}>
        <TextInput
          name="q"
          size="lg"
          aria-label="Search recipes"
          placeholder="Search for a bake…"
          leftSection={<Search size={20} />}
          className={styles.searchInput}
        />
        <Button type="submit" size="lg" rightSection={<ArrowRight size={18} />}>
          Let&apos;s bake
        </Button>
      </form>

      <Group gap={6} justify="center">
        <Text size="sm" c="dimmed" mr={4}>
          Feeling peckish? Try
        </Text>
        {SUGGESTIONS.map((term) => (
          <Button
            key={term}
            component={Link}
            href={`/search?q=${term}`}
            size="compact-sm"
            variant="default"
          >
            {term}
          </Button>
        ))}
      </Group>
    </section>
  );
}
