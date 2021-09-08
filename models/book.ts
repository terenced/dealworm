import { toBook } from "../models/mappers.ts";
import { GoodReadsFeedEntry } from "../models/goodreads.ts";

export interface BookRecord {
  title: string;
  imageUrl: string;
  description: string;
  isbn: string;
  published: string;
  url: string;
  price?: number;
  created?: number;
  processOn?: number;
  storeUrl?: string;
}
export class Book implements BookRecord {
  created?: number;
  processOn?: number;
  price?: number;
  storeUrl?: string;

  constructor(
    public isbn: string,
    public description: string = "",
    public imageUrl: string = "",
    public published: string = "",
    public title: string = "",
    public url: string = "",
  ) {
    this.created = Date.now();
  }

  static fromGoodReadsFeedEntry(entry: GoodReadsFeedEntry) {
    return toBook(entry);
  }

  updateStoreValues(price: number, storeUrl: string) {
    this.price = price;
    this.storeUrl = storeUrl;
    this.processOn = Date.now();
  }
}
