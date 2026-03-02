import { API_URL, cacheConfig } from "@/util";

export async function fetchRandomRecipe(quantity: number = 3) {
	const response = await fetch(`${API_URL}/recipe/count`, cacheConfig);
	const data = await response.json();
	const max =
		typeof data === "object" && data !== null && "count" in data
			? data.count
			: 0;

	if (max === 0) return [];

	return Promise.all(
		Array.from({ length: quantity }, async () => {
			const id = Math.floor(Math.random() * max) + 1;
			const res = await fetch(`${API_URL}/recipe/${id}`, cacheConfig);
			if (!res.ok) return null;
			return res.json();
		}),
	).then((results) => results.filter((r): r is NonNullable<typeof r> => r != null));
}
