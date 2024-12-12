"use client";

import { Multiselect } from "@/components";
import { Baker, Diet } from "@/types";
import { Title, Button } from "@mantine/core";

export default function FilterForm({
  bakers,
  diets,
}: {
  bakers: Baker[];
  diets: Diet[];
}) {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const bakers = formData.get("bakers");
    const diets = formData.get("diets");
    console.log(formData);
    console.log(bakers);
    console.log(diets);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Title order={5} component="p">
        Bakers
      </Title>
      <Multiselect data={bakers} name="bakers" />
      <Title order={5} component="p">
        Diets
      </Title>
      <Multiselect data={diets} name="diets" />
      <Button type="submit">Submit</Button>
    </form>
  );
}
