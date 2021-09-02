import { toRecord } from "../models/mappers.ts";
import { GoodReadsFeedEntry } from "../models/goodreads.ts";

export interface Record {
  title: string;
  imageUrl: string;
  description: string;
  isbn: string;
  published: string;
  url: string;
  price?: number;
  created?: number;
  processOn?: number;
}
export class SearchRecord implements Record {
  created?: number;
  processOn?: number;
  price?: number;

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
    return toRecord(entry);
  }

  updateStoreValues(price: number) {
    this.price = price;
    this.processOn = Date.now();
  }
}
