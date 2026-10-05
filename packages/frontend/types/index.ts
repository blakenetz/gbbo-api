export interface Recipe {
	id: number;
	title: string;
	link: string;
	img: string;
	difficulty: number | null;
	time: number | null;
	/** ISO 8601 timestamp the recipe was published on the GBBO site. */
	published_at: string | null;
	baker: Baker | null;
	diets: Diet[];
	bake_types: BakeType[];
	categories: Category[];
}

export interface BaseModel {
	id: number;
	name: string;
}

export interface Baker extends BaseModel {
	img: string;
	season: number | null;
}

export type Diet = BaseModel;

export type BakeType = BaseModel;

export type Category = BaseModel;
