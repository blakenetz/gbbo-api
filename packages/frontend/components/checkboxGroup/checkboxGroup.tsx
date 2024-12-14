"use client";

import { BaseModel } from "@/types";
import {
  Checkbox,
  Group,
  CheckboxGroupProps as MantineCheckboxGroupProps,
} from "@mantine/core";
import { useSearchParams } from "next/navigation";

interface CheckboxGroupProps
  extends Omit<MantineCheckboxGroupProps, "defaultValue" | "children"> {
  options: BaseModel[];
  name: string;
  searchParamName: string;
}

export default function CheckboxGroup({
  options,
  name: nameProp,
  searchParamName,
  ...props
}: CheckboxGroupProps) {
  const searchParams = useSearchParams();

  return (
    <Checkbox.Group
      {...props}
      defaultValue={searchParams.get(searchParamName)?.split(",") ?? []}
    >
      <Group mt="xs">
        {options.map(({ id, name }) => (
          <Checkbox
            key={id}
            value={id.toString()}
            label={name}
            name={nameProp}
          />
        ))}
      </Group>
    </Checkbox.Group>
  );
}
