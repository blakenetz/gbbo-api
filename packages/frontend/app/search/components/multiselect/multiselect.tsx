"use client";

import { useState } from "react";
import {
  Combobox,
  Pill,
  PillsInput,
  useCombobox,
  Group,
  Text,
} from "@mantine/core";
import type { ComboboxProps } from "@mantine/core";
import type { BaseModel } from "@/types";
import { capitalize } from "lodash";
import classes from "./multiselect.module.css";

interface BakerWithIcon extends BaseModel {
  icon: React.ReactNode;
  season?: number | null;
}

interface SearchableMultiSelectProps {
  data: BakerWithIcon[];
  name: string;
  defaultValues?: string[];
  grouped?: boolean;
}

/**
 * Copied from Mantine's example page
 * @see https://mantine.dev/combobox/?e=SearchableMultiSelect
 * */
export default function SearchableMultiSelect({
  data,
  name,
  defaultValues = [],
  grouped = false,
}: SearchableMultiSelectProps) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => combobox.updateSelectedOptionIndex("active"),
  });

  const [search, setSearch] = useState("");
  const [values, setValues] = useState<string[]>(defaultValues); // list of selected ids

  const handleValueSelect: ComboboxProps["onOptionSubmit"] = (val) => {
    setValues((c) =>
      c.includes(val) ? c.filter((v) => v !== val) : [...c, val]
    );
  };

  const handleValueRemove = (id: string) => {
    setValues((current) => current.filter((v) => v !== id));
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    combobox.updateSelectedOptionIndex();
    setSearch(event.currentTarget.value);
  };

  const handleSearchKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Backspace" && search.length === 0) {
      event.preventDefault();
      handleValueRemove(values[values.length - 1]);
    }
  };

  // break data into Pill and Combobox.Option elements
  const { Pills, Options } = (() => {
    if (grouped) {
      // Group bakers by season for grouped display
      const groupedData = data.reduce((acc, item) => {
        const season = item.season || "Unknown";
        if (!acc[season]) {
          acc[season] = [];
        }
        acc[season].push(item);
        return acc;
      }, {} as Record<string, BakerWithIcon[]>);

      // Sort seasons numerically from most recent first, with "Unknown" at the end
      const sortedSeasons = Object.keys(groupedData).sort((a, b) => {
        if (a === "Unknown") return 1;
        if (b === "Unknown") return -1;
        return Number(b) - Number(a);
      });

      const pills: React.ReactNode[] = [];
      const options: React.ReactNode[] = [];

      // Process each season group
      sortedSeasons.forEach((season) => {
        const seasonItems = groupedData[season];

        // Add season header if there are matching items
        const hasMatchingItems = seasonItems.some((item) =>
          item.name.toLowerCase().includes(search.trim().toLowerCase())
        );

        if (hasMatchingItems) {
          options.push(
            <Combobox.Group label={`Season ${season}`} key={`header-${season}`}>
              {seasonItems.map((item) => {
                const id = `${item.id}`;

                if (values.includes(id)) {
                  pills.push(
                    <Pill
                      key={id}
                      withRemoveButton
                      onRemove={() => handleValueRemove(id)}
                    >
                      {item.name}
                    </Pill>
                  );
                  return null;
                }

                if (
                  item.name.toLowerCase().includes(search.trim().toLowerCase())
                ) {
                  return (
                    <Combobox.Option value={id} key={id}>
                      <Group>
                        {item.icon}
                        <Text size="sm">{item.name}</Text>
                      </Group>
                    </Combobox.Option>
                  );
                }
                return null;
              })}
            </Combobox.Group>
          );
        }
      });

      return { Pills: pills, Options: options };
    } else {
      // Original non-grouped logic
      return data.reduce<Record<"Pills" | "Options", React.ReactNode[]>>(
        (acc, item) => {
          const id = `${item.id}`;

          if (values.includes(id))
            acc.Pills.push(
              <Pill
                key={id}
                withRemoveButton
                onRemove={() => handleValueRemove(id)}
              >
                {item.name}
              </Pill>
            );
          else if (
            item.name.toLowerCase().includes(search.trim().toLowerCase())
          ) {
            acc.Options.push(
              <Combobox.Option value={id} key={id}>
                <Group>
                  {item.icon}
                  <Text size="sm">{item.name}</Text>
                </Group>
              </Combobox.Option>
            );
          }

          return acc;
        },
        { Pills: [], Options: [] }
      );
    }
  })();

  return (
    <Combobox
      store={combobox}
      onOptionSubmit={handleValueSelect}
      withinPortal={false}
    >
      <input type="hidden" name={name} value={values} />
      <Combobox.DropdownTarget>
        <PillsInput
          onClick={() => combobox.openDropdown()}
          label={capitalize(name)}
        >
          <Pill.Group>
            {Pills}
            <Combobox.EventsTarget>
              <PillsInput.Field
                onFocus={() => combobox.openDropdown()}
                onBlur={() => combobox.closeDropdown()}
                value={search}
                placeholder={`Search ${name}`}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
                name={`${name}-search`}
              />
            </Combobox.EventsTarget>
          </Pill.Group>
        </PillsInput>
      </Combobox.DropdownTarget>

      <Combobox.Dropdown className={classes.dropdown}>
        <Combobox.Options>
          {Options.length > 0 ? (
            Options
          ) : (
            <Combobox.Empty>Nothing found...</Combobox.Empty>
          )}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
