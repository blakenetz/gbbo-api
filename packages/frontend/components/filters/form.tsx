"use client";

import { Multiselect } from "@/components";
import { Baker, Diet } from "@/types";
import {
  ActionIcon,
  Avatar,
  Button,
  Checkbox,
  Flex,
  Group,
  Select,
  Slider,
  Switch,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { RotateCcw } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { submitFilters } from "./actions";

export default function FilterForm({
  bakers,
  diets,
}: {
  bakers: Baker[];
  diets: Diet[];
}) {
  const searchParams = useSearchParams();
  const [time, setTime] = useState(Number(searchParams.get("time")) || 0);

  const bakersWithIcons = bakers.map((baker) => ({
    ...baker,
    icon: <Avatar src={baker.img} alt={baker.name} size="sm" />,
  }));

  return (
    <Flex
      direction="column"
      gap="xl"
      mt="md"
      component="form"
      action={submitFilters}
    >
      <TextInput
        name="q"
        label="Recipe name"
        defaultValue={searchParams.get("q") ?? ""}
      />

      <Switch
        name="is_technical"
        label="Technical"
        defaultChecked={searchParams.get("is_technical") === "on"}
      />

      <Select
        defaultValue={searchParams.get("difficulty") ?? ""}
        label="Difficulty"
        name="difficulty"
        placeholder="Select difficulty"
        data={[
          { value: "1", label: "Easy" },
          { value: "2", label: "Medium" },
          { value: "3", label: "Hard" },
        ]}
        clearable
      />

      <Group>
        <Slider
          flex={1}
          name="time"
          label={null}
          max={240}
          value={time}
          onChange={setTime}
          marks={[
            { value: 60, label: "1h" },
            { value: 120, label: "2h" },
            { value: 180, label: "3h" },
            { value: 240, label: "4h" },
          ]}
        />
        <Tooltip label="Reset">
          <ActionIcon
            onClick={() => setTime(0)}
            variant="subtle"
            radius="xl"
            size="xs"
          >
            <RotateCcw />
          </ActionIcon>
        </Tooltip>
      </Group>

      <Checkbox.Group
        label="Diets"
        defaultValue={searchParams.get("diet_ids")?.split(",") ?? []}
      >
        <Group mt="xs">
          {diets.map((diet) => (
            <Checkbox
              key={diet.id}
              value={diet.id.toString()}
              label={diet.name}
              name="diets"
            />
          ))}
        </Group>
      </Checkbox.Group>

      <Multiselect
        data={bakersWithIcons}
        name="bakers"
        defaultValues={searchParams.get("baker_ids")?.split(",") ?? []}
      />

      <Button type="submit">Filter</Button>
    </Flex>
  );
}
