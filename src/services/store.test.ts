import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  run,
} from "https://deno.land/x/tincan@0.2.2/mod.ts";
import { faker } from "https://deno.land/x/deno_faker@v1.0.3/mod.ts";
import {
  getStore,
  lastestUnpricedBooks,
  pricedBooks,
  Store,
  StoreRecord,
  unpricedBooks,
} from "./store.ts";

import { differenceInHours } from "../deps/date_fns.ts";
import { subHours } from "../deps/date_fns.ts";

const fakeBook = (overrides: Partial<StoreRecord> = {}) => {
  return {
    isbn: faker.random.uuid(),
    "description": faker.lorem.sentence(),
    "imageUrl": faker.random.image(),
    "published": faker.date.past(),
    "title": faker.lorem.sentence(),
    "url": faker.internet.url(),
    ...overrides,
  } as StoreRecord;
};

describe("get functions", () => {
  let priced: StoreRecord[];
  let unpriced: StoreRecord[];
  let allBooks: StoreRecord[];
  let store: Store<StoreRecord>;

  beforeEach(() => {
    priced = Array.from({ length: 5 }).map(() =>
      fakeBook({ price: faker.random.number(), updated: faker.date.recent() })
    );
    unpriced = Array.from({ length: 5 }).map(() => fakeBook());
    allBooks = [...priced, ...unpriced];
    store = getStore(false);
    allBooks.forEach((b) => store.add(b.isbn, b));
  });

  afterEach(() => store.clear());

  describe("pricedBooks", () => {
    it("should only get items with prices", () => {
      const items = pricedBooks(store);
      expect(items).toEqual(priced);
    });
  });

  describe("unpricedBooks", () => {
    it("should only get items without prices", () => {
      const items = unpricedBooks(store);
      expect(items[0]).toEqual(unpriced[0]);
    });
  });

  describe("lastestUnpricedBooks", () => {
    let older: StoreRecord[];
    let yonger: StoreRecord[];
    let all: StoreRecord[];
    let otherStore: Store<StoreRecord>;

    beforeEach(() => {
      otherStore = getStore(false);
      const sixHoursAgo = subHours(Date.now(), 7).toString();
      const twoHoursAgo = subHours(Date.now(), 2).toString();
      older = [fakeBook({ updated: sixHoursAgo })];
      yonger = [fakeBook({ updated: twoHoursAgo })];
      all = [...older, ...yonger];
      all.forEach((b) => otherStore.add(b.isbn, b));
    });

    afterEach(() => otherStore.clear());

    it.only("should return book that are older than 6 hours", () => {
      const result = lastestUnpricedBooks(otherStore);
      expect(result).toEqual(older);
    });
  });
});

run();
