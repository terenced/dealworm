import * as Fae from "https://deno.land/x/fae@v0.6.2/mod.ts";
import { join } from "https://deno.land/std/path/mod.ts";
import { existsSync } from "https://deno.land/std/fs/mod.ts";
import { differenceInHours } from "../deps/date_fns.ts";

import { Book } from "../models/book.ts";
import { SearchResult } from "../models/searchResult.ts";

export type StoreRecord = SearchResult & Book;

interface KeyValue<T> {
  [key: string]: T;
}

interface StoreOptions {
  persisted?: boolean;
  path?: string;
  name?: string;
}

export class Store<T> {
  protected data: KeyValue<T>;

  private name: string;
  private path: string;
  private persisted: boolean;

  private initData() {
    if (!this.persisted) return;
    if (!existsSync(this.path)) {
      Deno.writeTextFileSync(this.path, JSON.stringify(this.data), {
        create: true,
      });
    }
    this.data = JSON.parse(Deno.readTextFileSync(this.path));
  }

  constructor(options?: StoreOptions) {
    this.name = options?.name ?? "store";
    this.path = options?.path ?? join(Deno.cwd(), ".data", `${this.name}.json`);
    this.persisted = options?.persisted ?? true;
    this.data = {};
    this.initData();
  }

  has(key: string) {
    return key in this.data;
  }

  get(key: string): T | undefined {
    return this.data[key];
  }

  add(key: string, value: T) {
    this.data[key] = value;
  }

  update(key: string, value: T) {
    this.data[key] = value;
  }

  updateAndCommit(key: string, value: T) {
    this.update(key, value);
    this.save();
  }

  get isPersisted() {
    return this.persisted;
  }

  all(filter?: (item: T) => boolean): T[] {
    const values = Object.values(this.data);
    return filter ? values.filter(filter) : values;
  }

  save() {
    return Deno.writeTextFile(this.path, JSON.stringify(this.data));
  }

  destory() {
    return Deno.removeSync(this.path);
  }

  clear() {
    this.data = {};
  }

  get count() {
    return Object.entries(this.data).length;
  }
}

export function getStore(persisted = true) {
  return new Store<StoreRecord>({ name: "books", persisted });
}

export function allBooks(store = getStore()) {
  return store.all();
}

export function unpricedBooks(store: Store<StoreRecord>) {
  return store.all((b) => !b.price);
}

export function lastestUnpricedBooks(store: Store<StoreRecord>): StoreRecord[] {
  return unpricedBooks(store)
    .filter((book) => !book.updated || isOld(book.updated));
}

const hoursFromNow = (date?: number | Date) =>
  differenceInHours(Date.now(), new Date(date ?? ""));

const isOld = (date?: number | Date) => hoursFromNow(date) > 6;

const updatedCompare = (a: StoreRecord, b: StoreRecord) => {
  if (!a.updated) return true;
  if (!b.updated) return false;
  if (hoursFromNow(a.updated) >= hoursFromNow(b.updated)) return true;
  return a.updated >= b.updated;
};

const updatedSort = Fae.comparator(updatedCompare);
export function orderedUnpricedBooks(store = getStore()) {
  return Fae.sort(updatedSort, unpricedBooks(store));
}

export function pricedBooks(store: Store<StoreRecord>) {
  return store.all((b) => Boolean(b.price));
}
