import { fetchFilters } from "./actions";
import FilterForm from "./form";

export default async function Filters() {
  const { bakers, diets, bakeTypes, categories } = await fetchFilters();

  return (
    <FilterForm
      bakers={bakers}
      diets={diets}
      bakeTypes={bakeTypes}
      categories={categories}
    />
  );
}
