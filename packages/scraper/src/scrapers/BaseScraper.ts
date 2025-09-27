import { JSDOM } from 'jsdom';
import { ScrapedItem, ScraperOptions } from '../types';

export default abstract class BaseScraper {
  protected baseUrl: string;
  protected maxPage: number;
  protected options: Required<ScraperOptions>;
  protected requestDelay: number;

  constructor(options: ScraperOptions = {}) {
    this.options = {
      maxPage: options.maxPage || 100,
      maxWorkers: options.maxWorkers || 4,
    };
    this.maxPage = this.options.maxPage;
    this.baseUrl = 'https://thegreatbritishbakeoff.co.uk/recipes/all';
    this.requestDelay = 1000; // 1 second delay between requests
  }

  protected abstract getCardSelector(): string;
  protected abstract extractItems(cards: Element[]): Promise<ScrapedItem[]>;
  protected abstract saveToDatabase(items: ScrapedItem[]): Promise<void>;

  protected async fetchPage(url: string): Promise<Document> {
    try {
      console.debug(`Fetching page: ${url}`);
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
      }
      const html = await res.text();
      const { document } = new JSDOM(html).window;
      return document;
    } catch (error) {
      console.error(`Error fetching page ${url}:`, error);
      throw error;
    }
  }

  protected async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  protected async processPage(pageNumber: number): Promise<ScrapedItem[]> {
    const url = this.generatePageUrl(pageNumber);
    const document = await this.fetchPage(url);
    const cards = Array.from(document.querySelectorAll(this.getCardSelector()));
    
    if (cards.length === 0) {
      console.warn(`No cards found on page ${pageNumber}`);
      return [];
    }

    return this.extractItems(cards);
  }

  protected generatePageUrl(pageNumber: number): string {
    return `${this.baseUrl}?page=${pageNumber}`;
  }

  public async scrape(): Promise<void> {
    console.info('Starting scraping process');
    const allItems: ScrapedItem[] = [];
    
    for (let page = 1; page <= this.maxPage; page++) {
      try {
        console.info(`Processing page ${page} of ${this.maxPage}`);
        const items = await this.processPage(page);
        
        if (items.length === 0) {
          console.info(`No more items found on page ${page}, ending scrape`);
          break;
        }
        
        allItems.push(...items);
        await this.delay(this.requestDelay);
        
      } catch (error) {
        console.error(`Error processing page ${page}:`, error);
        break;
      }
    }

    if (allItems.length > 0) {
      console.info(`Saving ${allItems.length} items to database`);
      await this.saveToDatabase(allItems);
    } else {
      console.warn('No items were scraped');
    }
  }

  // Helper method to safely get text content from an element
  protected getTextContent(
    element: Element | null,
    selector: string,
    defaultValue: string = ""
  ): string {
    const el = selector ? element?.querySelector(selector) : element;
    return el?.textContent?.trim() || defaultValue;
  }

  // Helper method to safely get attribute value from an element
  protected getAttribute(
    element: Element | null,
    selector: string,
    attribute: string,
    defaultValue: string = ""
  ): string {
    const el = selector ? element?.querySelector(selector) : element;
    return el?.getAttribute(attribute)?.trim() || defaultValue;
  }

  // Helper method to parse time strings (e.g., "1h 30m") into minutes
  protected parseTimeToMinutes(timeStr: string): number {
    if (!timeStr) return 0;

    const timePattern = /(?:\d+\s*(?:d|h|m|min|mins|hour|hours|day|days))/gi;
    const matches = timeStr.match(timePattern) || [];

    return matches.reduce((total, match) => {
      const value = parseInt(match.replace(/\D/g, ""));

      if (match.includes("d")) return total + value * 24 * 60; // days to minutes
      if (match.includes("h")) return total + value * 60; // hours to minutes
      return total + value; // minutes
    }, 0);
  }
}
