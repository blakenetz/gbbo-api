"use client";

import {
  Avatar,
  Badge,
  Button,
  Checkbox,
  Group,
  MultiSelect,
  Popover,
  Radio,
  Stack,
  Text,
  VisuallyHidden,
  type ComboboxItem,
  type ComboboxItemGroup,
} from "@mantine/core";
import { ChevronDown } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { getSelectedValues, type FilterDefinition, type FilterOption } from "./filterOptions";
import { useSearchUpdate } from "./useSearchUpdate";
import styles from "./search.module.css";

function OptionLabel({ option }: { option: FilterOption }) {
  const Icon = option.icon;
  return (
    <Group gap={8} wrap="nowrap">
      {Icon && <Icon size={16} className={styles.optionIcon} />}
      {option.label}
    </Group>
  );
}

interface BakerSelectProps {
  options: FilterOption[];
  value: string[];
  onChange: (value: string[]) => void;
}

function BakerSelect({ options, value, onChange }: BakerSelectProps) {
  // Options arrive sorted by series, so each group is contiguous.
  const { groups, images } = useMemo(() => {
    const grouped: ComboboxItemGroup<ComboboxItem>[] = [];
    for (const option of options) {
      const group = option.group ?? "";
      if (grouped.at(-1)?.group !== group) grouped.push({ group, items: [] });
      grouped.at(-1)?.items.push({ value: option.value, label: option.label });
    }
    return { groups: grouped, images: new Map(options.map((option) => [option.value, option.image])) };
  }, [options]);

  return (
    <MultiSelect
      data={groups}
      value={value}
      onChange={onChange}
      searchable
      clearable
      aria-label="Bakers"
      placeholder="Search bakers"
      nothingFoundMessage="No baker by that name"
      maxDropdownHeight={280}
      // Render inside the popover so picking a baker doesn't count as a click outside it.
      comboboxProps={{ withinPortal: false }}
      renderOption={({ option }) => (
        <Group gap="sm" wrap="nowrap">
          <Avatar src={images.get(option.value)} size="sm" alt="" />
          <Text size="sm">{option.label}</Text>
        </Group>
      )}
    />
  );
}

export default function FilterBar({ definitions }: { definitions: FilterDefinition[] }) {
  const searchParams = useSearchParams();
  const update = useSearchUpdate();

  return (
    <fieldset className={styles.filterBar}>
      <VisuallyHidden component="legend">Filters</VisuallyHidden>
      {definitions.map((definition) => {
        const selected = getSelectedValues(searchParams, definition.param);
        const setSelected = (values: string[]) =>
          update({ [definition.param]: values.join(",") || null });
        const Icon = definition.icon;
        const active = selected.length > 0;

        return (
          <Popover
            key={definition.param}
            position="bottom-start"
            shadow="md"
            radius="lg"
            trapFocus
          >
            <Popover.Target>
              <Button
                variant={active ? "filled" : "default"}
                color={active ? "blush.1" : undefined}
                c={active ? "blush.9" : undefined}
                leftSection={<Icon size={16} />}
                rightSection={
                  active ? (
                    <Badge size="sm" circle color="blush.8">
                      {selected.length}
                    </Badge>
                  ) : (
                    <ChevronDown size={14} />
                  )
                }
              >
                {definition.label}
              </Button>
            </Popover.Target>

            <Popover.Dropdown className={styles.dropdown}>
              {definition.param === "baker_ids" ? (
                <BakerSelect options={definition.options} value={selected} onChange={setSelected} />
              ) : definition.multiple ? (
                <Checkbox.Group value={selected} onChange={setSelected} label={definition.label}>
                  <Stack gap="xs" mt="xs">
                    {definition.options.map((option) => (
                      <Checkbox
                        key={option.value}
                        value={option.value}
                        label={<OptionLabel option={option} />}
                      />
                    ))}
                  </Stack>
                </Checkbox.Group>
              ) : (
                <Radio.Group
                  value={selected[0] ?? ""}
                  onChange={(value) => setSelected(value ? [value] : [])}
                  label={definition.label}
                >
                  <Stack gap="xs" mt="xs">
                    <Radio value="" label="Any" />
                    {definition.options.map((option) => (
                      <Radio
                        key={option.value}
                        value={option.value}
                        label={<OptionLabel option={option} />}
                      />
                    ))}
                  </Stack>
                </Radio.Group>
              )}
            </Popover.Dropdown>
          </Popover>
        );
      })}
    </fieldset>
  );
}
