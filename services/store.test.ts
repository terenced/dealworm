import {
  beforeEach,
  describe,
  expect,
  it,
  run,
} from "https://deno.land/x/tincan@0.2.2/mod.ts";
import { faker } from "https://deno.land/x/deno_faker@v1.0.3/mod.ts";
import {
  getStore,
  pricedBooks,
  Store,
  StoreRecord,
  unpricedBooks,
} from "./store.ts";

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
});

run();
