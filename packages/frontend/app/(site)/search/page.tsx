"use client";

import { Button, Pagination, SimpleGrid, Skeleton, Text, TextInput, Title } from "@mantine/core";
import { RotateCcw, Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Card } from "@/components";
import Logo from "@/components/logo/logo";
import type { Recipe } from "@/types";
import { paginationAmount } from "@/util";
import { fetchFilters, fetchRecipePage, SEARCH_FILTER_KEYS, type Filters } from "@/util/api";
import ActiveFilters from "./components/activeFilters";
import FilterBar from "./components/filterBar";
import { buildFilterDefinitions, getActiveFilters } from "./components/filterOptions";
import ResultsSkeleton, { RESULTS_COLUMNS } from "./components/resultsSkeleton";
import { useSearchUpdate } from "./components/useSearchUpdate";
import styles from "./components/search.module.css";

interface Results {
  /** The URL query these results belong to. */
  query: string;
  recipes: Recipe[];
  total: number;
}

// Filters whose single selected value makes a good page heading, e.g. "Cakes".
const HEADING_PARAMS: Record<string, true> = {
  bake_type_ids: true,
  category_ids: true,
  diet_ids: true,
};

export default function SearchPage() {
  const searchParams = useSearchParams();
  const update = useSearchUpdate();
  const query = searchParams.toString();
  const [filters, setFilters] = useState<Filters | null>(null);
  const [results, setResults] = useState<Results | null>(null);

  useEffect(() => {
    fetchFilters()
      .then(setFilters)
      .catch(() => setFilters({ bakers: [], diets: [], bakeTypes: [], categories: [] }));
  }, []);

  useEffect(() => {
    // Ignore responses for queries the user has already moved on from.
    let current = true;
    fetchRecipePage(new URLSearchParams(query))
      .then((page) => current && setResults({ query, ...page }))
      .catch(() => current && setResults({ query, recipes: [], total: 0 }));
    return () => {
      current = false;
    };
  }, [query]);

  const definitions = useMemo(() => (filters ? buildFilterDefinitions(filters) : []), [filters]);
  const active = getActiveFilters(searchParams, definitions);
  const q = searchParams.get("q");
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const loading = results?.query !== query;

  const heading = q
    ? `Results for “${q}”`
    : active.length === 1 && HEADING_PARAMS[active[0].param] === true
      ? active[0].label
      : active.length > 0
        ? "Your search"
        : "All recipes";

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    update({ q: String(new FormData(event.currentTarget).get("q") ?? "").trim() || null });
  }

  const first = (page - 1) * paginationAmount + 1;
  const last = Math.min(page * paginationAmount, results?.total ?? 0);

  return (
    <div className={styles.page}>
      <section className={styles.intro} aria-labelledby="search-title">
        <Title id="search-title" order={1} className={styles.title}>
          {heading}
        </Title>
        <Text c="dimmed" aria-live="polite">
          {results === null
            ? "Rummaging through the tent…"
            : `${results.total} ${results.total === 1 ? "recipe" : "recipes"}`}
        </Text>

        <search className={styles.search}>
          <form className={styles.searchForm} onSubmit={handleSearch}>
            <TextInput
              key={q ?? ""}
              name="q"
              defaultValue={q ?? ""}
              aria-label="Search recipes"
              placeholder="Search for a bake…"
              leftSection={<Search size={18} />}
              size="md"
              className={styles.searchInput}
            />
            <Button type="submit" size="md">
              Search
            </Button>
          </form>
        </search>

        {definitions.length > 0 ? (
          <FilterBar definitions={definitions} />
        ) : (
          <Skeleton height={36} radius="xl" />
        )}
        <ActiveFilters active={active} />
      </section>

      <section aria-label="Recipes" className={styles.results} data-loading={loading || undefined}>
        {results === null ? (
          <ResultsSkeleton />
        ) : results.recipes.length > 0 ? (
          <SimpleGrid cols={RESULTS_COLUMNS} spacing="lg">
            {results.recipes.map((recipe) => (
              <Card key={recipe.id} recipe={recipe} />
            ))}
          </SimpleGrid>
        ) : (
          <div className={styles.empty}>
            <Logo size={88} className={styles.sunkenLogo} />
            <Title order={2}>Soggy bottom!</Title>
            <Text c="dimmed" maw={420}>
              Nothing in the tent matches that. Try fewer filters or a different search.
            </Text>
            <Button
              variant="default"
              leftSection={<RotateCcw size={16} />}
              onClick={() => update(Object.fromEntries(SEARCH_FILTER_KEYS.map((key) => [key, null])))}
            >
              Clear filters
            </Button>
          </div>
        )}
      </section>

      {results !== null && results.total > paginationAmount && (
        <nav className={styles.pager} aria-label="Pages">
          <Text c="dimmed" size="sm">
            Showing {first}–{last} of {results.total}
          </Text>
          <Pagination
            total={Math.ceil(results.total / paginationAmount)}
            value={page}
            onChange={(next) => update({ page: next === 1 ? null : String(next) })}
          />
        </nav>
      )}
    </div>
  );
}
