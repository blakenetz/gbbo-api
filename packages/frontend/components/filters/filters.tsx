import { Title } from "@mantine/core";
import { fetchFilters } from "./actions";
import FilterForm from "./form";

export default async function Filters() {
  const { bakers, diets, bakeTypes, categories } = await fetchFilters();

  return (
    <>
      <Title order={4} component="p">
        Filter by
      </Title>
      <FilterForm
        bakers={bakers}
        diets={diets}
        bakeTypes={bakeTypes}
        categories={categories}
      />
    </>
  );
}
