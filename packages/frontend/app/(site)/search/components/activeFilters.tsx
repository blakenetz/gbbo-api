"use client";

import { Button, Group, Pill } from "@mantine/core";
import { RotateCcw } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { SEARCH_FILTER_KEYS } from "@/util/api";
import { getSelectedValues, type ActiveFilter } from "./filterOptions";
import { useSearchUpdate } from "./useSearchUpdate";
import styles from "./search.module.css";

export default function ActiveFilters({ active }: { active: ActiveFilter[] }) {
  const searchParams = useSearchParams();
  const update = useSearchUpdate();

  if (active.length === 0) return null;

  function remove({ param, value }: ActiveFilter) {
    const remaining = getSelectedValues(searchParams, param).filter((v) => v !== value);
    update({ [param]: param === "q" ? null : remaining.join(",") || null });
  }

  return (
    <Group gap="xs" className={styles.activeFilters}>
      {active.map((filter) => (
        <Pill
          key={`${filter.param}:${filter.value}`}
          size="lg"
          withRemoveButton
          onRemove={() => remove(filter)}
          removeButtonProps={{ "aria-label": `Remove ${filter.label}` }}
          className={styles.chip}
        >
          {filter.label}
        </Pill>
      ))}
      <Button
        variant="subtle"
        size="compact-sm"
        leftSection={<RotateCcw size={14} />}
        onClick={() => update(Object.fromEntries(SEARCH_FILTER_KEYS.map((key) => [key, null])))}
      >
        Clear all
      </Button>
    </Group>
  );
}
