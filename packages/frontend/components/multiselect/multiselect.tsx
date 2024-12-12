"use client";

import { useState } from "react";
import {
  Combobox,
  ComboboxProps,
  Pill,
  PillsInput,
  useCombobox,
  Group,
  Text,
} from "@mantine/core";
import { BaseModel } from "@/types";
import { capitalize } from "lodash";
import classes from "./multiselect.module.css";

interface SearchableMultiSelectProps {
  data: (BaseModel & { icon: React.ReactNode })[];
  name: string;
  defaultValues?: string[];
}

/**
 * Copied from Mantine's example page
 * @see https://mantine.dev/combobox/?e=SearchableMultiSelect
 * */
export default function SearchableMultiSelect({
  data,
  name,
  defaultValues = [],
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
  const { Pills, Options } = data.reduce<
    Record<"Pills" | "Options", React.ReactNode[]>
  >(
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
      else if (item.name.toLowerCase().includes(search.trim().toLowerCase())) {
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
