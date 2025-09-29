import { scrape, type Helpers } from "./base";
import type { CheerioAPI } from "cheerio";
import type { ScrapedItem } from "../types";
import { getOne, runQuery } from "../utils/db";

async function extractRecipeItems(
	$: CheerioAPI,
	cards: any[],
	helpers: Helpers,
): Promise<ScrapedItem[]> {
	const results: ScrapedItem[] = [];
	// Build a baker index from the filter panel to normalize names/images
	const bakerIndex = new Map<
		string,
		{ name: string; img: string; season?: number }
	>();
	try {
		$(".recipes-filter--bakers .baker-avatars__group").each((_, group) => {
			const $group = $(group);
			const seasonText = $group
				.find(".baker-avatars__group__title")
				.first()
				.text()
				.trim();
			const m = /series\s*(\d+)/i.exec(seasonText || "");
			const season = m ? parseInt(m[1], 10) : undefined;
			$group.find(".baker-avatars__list__item").each((__, li) => {
				const $li = $(li);
				const $img = $li.find("img").first();
				const name = ($img.attr("alt") || $img.attr("title") || "").trim();
				const img = ($img.attr("src") || "").trim();
				if (name && img) bakerIndex.set(name, { name, img, season });
			});
		});
	} catch {}
	for (const card of cards) {
		const $card = $(card);
		try {
			const $imgEl = $card.find("figure img").first();
			if ($imgEl.length === 0) continue;

			const $content = $card.find(".recipes-loop__item__content").first();
			if ($content.length === 0) continue;

			const $h5 = $content.find("h5").first();
			if ($h5.length === 0) continue;

			const title = $h5.text().trim();
			const link = ($card.find("a").attr("href") || "").trim();
			const img = ($imgEl.attr("src") || "").trim();

			// Prefer baker thumbnail present at the card level; fallback to content area
			let $bakerImgEl = $card.find(".thumbnail-baker img").first();
			if ($bakerImgEl.length === 0) {
				$bakerImgEl = $content.find("img").first();
			}
			let baker: { name: string; img: string } | null = null;
			if ($bakerImgEl.length) {
				const rawName = ($bakerImgEl.attr("alt") || "").trim();
				const rawImg = ($bakerImgEl.attr("src") || "").trim();
				const normalized = bakerIndex.get(rawName);
				if (normalized) {
					baker = { name: normalized.name, img: normalized.img };
				} else if (rawName && rawImg) {
					baker = { name: rawName, img: rawImg };
				}
			}

			// Difficulty: derive from .difficulty-level ticks or aria-label
			let difficulty: number | null = null;

			// Try multiple selectors for difficulty information
			const difficultySelectors = [
				".difficulty-level",
				".difficulty",
				".recipe-difficulty",
				"[data-difficulty]",
			];

			for (const selector of difficultySelectors) {
				let $difficulty = $content.find(selector).first();
				if ($difficulty.length === 0) {
					$difficulty = $card.find(selector).first();
				}

				if ($difficulty.length) {
					// Try ticks first
					const enabled = $difficulty
						.find(".difficulty-level__tick")
						.toArray()
						.filter(
							(el: any) => !$(el).hasClass("difficulty-level__tick--disabled"),
						).length;
					if (enabled > 0) {
						difficulty = enabled; // 1-3
						break;
					}

					// Try aria-label
					const label = ($difficulty.attr("aria-label") || "").toLowerCase();
					if (label.includes("easy")) {
						difficulty = 1;
						break;
					} else if (
						label.includes("medium") ||
						label.includes("intermediate")
					) {
						difficulty = 2;
						break;
					} else if (label.includes("hard") || label.includes("difficult")) {
						difficulty = 3;
						break;
					}

					// Try data attribute
					const dataDiff = $difficulty.attr("data-difficulty");
					if (dataDiff) {
						const parsed = parseInt(dataDiff, 10);
						if (!isNaN(parsed) && parsed >= 1 && parsed <= 3) {
							difficulty = parsed;
							break;
						}
					}

					// Try text content
					const text = $difficulty.text().toLowerCase();
					if (text.includes("easy")) {
						difficulty = 1;
						break;
					} else if (text.includes("medium") || text.includes("intermediate")) {
						difficulty = 2;
						break;
					} else if (text.includes("hard") || text.includes("difficult")) {
						difficulty = 3;
						break;
					}
				}
			}

			const diets = Array.from(
				new Set(
					$card
						.find("[title]")
						.toArray()
						.map((el: any) => $(el).attr("title")?.trim())
						.filter(
							(v: string | undefined): v is string =>
								typeof v === "string" && v.toLowerCase() !== "all",
						),
				),
			);

			// Time: look in common meta areas within the card
			let timeText = "";

			// Try multiple selectors for time information
			const timeSelectors = [
				".recipes-loop__item__meta time",
				".recipes-loop__item__time",
				".recipes-loop__item__metaItem--time",
				".recipes-loop__item__meta",
				".recipe-time",
				".cooking-time",
				"time",
				"[datetime]",
			];

			for (const selector of timeSelectors) {
				const $timeEl = $content.find(selector).first();
				if ($timeEl.length) {
					// Try text content first
					timeText = $timeEl.text().trim();
					if (!timeText) {
						// Try datetime attribute
						timeText = $timeEl.attr("datetime") || "";
					}
					if (timeText) break;
				}
			}

			// If still no time found, try looking in the entire card
			if (!timeText) {
				const $allTime = $card.find("time, [datetime]");
				if ($allTime.length) {
					timeText =
						$allTime.first().text().trim() ||
						$allTime.first().attr("datetime") ||
						"";
				}
			}

			const time = helpers.parseTimeToMinutes(timeText);

			results.push({
				link,
				img,
				title,
				baker,
				difficulty,
				diets,
				time,
				bakerIndex,
			});
		} catch (e) {
			console.error("Error processing recipe card:", e);
			continue;
		}
	}
	return results;
}

async function saveRecipeItems(items: ScrapedItem[]): Promise<void> {
	// First, save all bakers found in the filter with their series information
	const bakerIndex = new Map<
		string,
		{ name: string; img: string; season?: number }
	>();

	// Extract baker index from the first item (they all have the same filter data)
	if (items.length > 0 && items[0].bakerIndex) {
		for (const [name, bakerData] of items[0].bakerIndex as Map<
			string,
			{ name: string; img: string; season?: number }
		>) {
			bakerIndex.set(name, bakerData);
		}
	}

	// Save all bakers from the filter to ensure we have complete data
	for (const [, bakerData] of bakerIndex) {
		await runQuery(
			"INSERT OR IGNORE INTO bakers(name, img, season) VALUES(?, ?, ?)",
			[bakerData.name, bakerData.img, bakerData.season ?? null],
		);
	}

	// Also collect all unique baker names from recipe titles to ensure they exist
	const bakerNamesFromTitles = new Set<string>();
	for (const result of items) {
		if (result.title) {
			const titleMatch = result.title.match(/^([^']+?)'s\s/);
			if (titleMatch) {
				bakerNamesFromTitles.add(titleMatch[1].trim());
			}
		}
	}

	// Ensure all baker names from titles exist in the database
	for (const bakerName of bakerNamesFromTitles) {
		const existing = await getOne<{ id: number }>(
			"SELECT id FROM bakers WHERE name = ?",
			[bakerName],
		);
		if (!existing) {
			// Create a basic baker entry if it doesn't exist
			await runQuery("INSERT INTO bakers(name, img, season) VALUES(?, ?, ?)", [
				bakerName,
				"",
				null,
			]);
		}
	}

	for (const result of items) {
		let bakerId: number | null = null;

		// Try to match baker from recipe title if no direct baker info
		let bakerName = result.baker?.name;
		if (!bakerName && result.title) {
			// Extract baker name from title (e.g., "Prue Leith's School Cake" -> "Prue Leith")
			const titleMatch = result.title.match(/^([^']+?)'s\s/);
			if (titleMatch) {
				bakerName = titleMatch[1].trim();
			}
		}

		if (bakerName) {
			// First try exact name match
			let row = await getOne<{ id: number }>(
				"SELECT id FROM bakers WHERE name = ? ORDER BY id DESC LIMIT 1",
				[bakerName],
			);

			// If no exact match, try partial matches (for cases like "Paul Hollywood" vs "Paul")
			if (!row) {
				row = await getOne<{ id: number }>(
					"SELECT id FROM bakers WHERE name LIKE ? OR ? LIKE '%' || name || '%' ORDER BY id DESC LIMIT 1",
					[`%${bakerName}%`, bakerName],
				);
			}

			if (row) {
				bakerId = row.id;
			} else if (result.baker?.img) {
				// Create new baker if we have image info
				const bakerFromIndex = bakerIndex.get(bakerName);
				const insert = await runQuery(
					"INSERT INTO bakers(name, img, season) VALUES(?, ?, ?)",
					[bakerName, result.baker.img, bakerFromIndex?.season ?? null],
				);
				bakerId = insert.lastID;
			}
		}

		await runQuery(
			`INSERT OR REPLACE INTO recipes(title, link, img, difficulty, time, baker_id)
         VALUES(?, ?, ?, ?, ?, ?)`,
			[
				result.title,
				result.link,
				result.img,
				result.difficulty ?? null,
				result.time ?? null,
				bakerId,
			],
		);

		const recipeRow = await getOne<{ id: number }>(
			"SELECT id FROM recipes WHERE link = ?",
			[result.link],
		);
		if (!recipeRow) continue;
		const recipeId = recipeRow.id;

		for (const diet of result.diets || []) {
			await runQuery("INSERT OR IGNORE INTO diets(name) VALUES(?)", [diet]);
			const d = await getOne<{ id: number }>(
				"SELECT id FROM diets WHERE name = ?",
				[diet],
			);
			if (d) {
				await runQuery(
					"INSERT OR IGNORE INTO recipe_diets(recipe_id, diet_id) VALUES(?, ?)",
					[recipeId, d.id],
				);
			}
		}
	}
}

function generateRecipePageUrl(pageNumber: number, baseUrl: string): string {
	return `${baseUrl}/page/${pageNumber}`;
}

export default async function scrapeRecipes(): Promise<void> {
	await scrape({
		baseUrl: "https://thegreatbritishbakeoff.co.uk/recipes/all",
		getCardSelector: () => ".recipes-loop__item",
		extractItems: extractRecipeItems,
		saveToDatabase: saveRecipeItems,
		generatePageUrl: generateRecipePageUrl,
	});
}
