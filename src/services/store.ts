import * as Fae from "fae";
import { join } from "path/mod.ts";
import { existsSync } from "fs/mod.ts";
import differenceInHours from "date_fns/differenceInHours";

import { Book } from "src/models/book.ts";
import { UNKNOWN_PRICE } from "src/models/searchResult.ts";

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
  return new Store<Book>({ name: "books", persisted });
}

export function allBooks(store = getStore()): Book[] {
  return store.all();
}

export function unpricedBooks(store: Store<Book>): Book[] {
  return store.all((b) => !b.price || b.price === UNKNOWN_PRICE);
}

export function lastestUnpricedBooks(store: Store<Book>): Book[] {
  return unpricedBooks(store)
    .filter((book) => !book.updated || isOld(book.updated));
}

const hoursFromNow = (date?: number | Date) =>
  differenceInHours(Date.now(), new Date(date ?? ""));

const isOld = (date?: number | Date) => hoursFromNow(date) > 6;

const updatedCompare = (a: Book, b: Book) => {
  if (!a.updated) return true;
  if (!b.updated) return false;
  if (hoursFromNow(a.updated) >= hoursFromNow(b.updated)) return true;
  return a.updated >= b.updated;
};

const sortByUpdated = (items: Book[]) =>
  Fae.sort(Fae.comparator(updatedCompare), items);

export function orderedUnpricedBooks(store = getStore()): Book[] {
  return sortByUpdated(unpricedBooks(store));
}

export function pricedBooks(store: Store<Book>): Book[] {
  return store.all((b) => Boolean(b.price));
}
