// Database types
export interface Baker {
  id?: number;
  name: string;
  image_url: string;
  bio: string;
  series: number;
}

export interface Recipe {
  id?: number;
  title: string;
  description: string;
  image_url: string;
  prep_time: number;
  cook_time: number;
  serves: string;
  difficulty: string;
  url: string;
  series: number;
  episode: number;
  baker_id?: number;
  baker_name?: string;
  signature_dish: boolean;
  technical_challenge: boolean;
  showstopper: boolean;
}

export interface ScraperOptions {
  maxPage?: number;
  maxWorkers?: number;
}

// Web scraping types
export interface ScrapedItem {
  [key: string]: any;
}

export type ScraperCallback = (items: ScrapedItem[]) => Promise<void>;

// Database result type
export interface QueryResult {
  lastID: number;
  changes: number;
}
