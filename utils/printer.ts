import { ICell, IRow, Table } from "../deps/table.ts";

import { chalkin } from "../deps/chalkin.ts";
import { formatDistanceToNow } from "../deps/date_fns.ts";

import { StoreRecord } from "../services/store.ts";

const formatUrls = (record: StoreRecord) => {
  if (record.url && record.storeUrl) {
    return [record.url, record.storeUrl].map((url) => chalkin.cyan.dim(url))
      .join(
        "\n",
      );
  }
  return chalkin.cyan.dim(record.url ?? record.storeUrl);
};

const formatPrice = (record: StoreRecord) => {
  if (!record?.price) {
    return "";
  }
  const priceStr = record.price.toLocaleString("en-CA", {
    style: "currency",
    currency: "CDN",
  });

  if (record.onSale) {
    return `${chalkin.bold.green(priceStr)}`;
  }
  return chalkin.yellow.dim(priceStr);
};

const formatUpdated = (updated?: number) =>
  updated
    ? chalkin.white.italic(
      formatDistanceToNow(new Date(updated), { addSuffix: true }),
    )
    : "";

export function printRecords(records: StoreRecord[]) {
  const body = records.map(
    (
      b,
    ) => ([
      formatPrice(b),
      chalkin.dim(b.isbn),
      chalkin.magenta(b.title),
      formatUpdated(b.updated),
      formatUrls(b),
    ] as IRow<ICell>),
  );
  new Table().body(body).border(true).render();
}
