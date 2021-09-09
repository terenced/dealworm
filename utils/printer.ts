import {
  ICell,
  IRow,
  Table,
} from "https://deno.land/x/cliffy@v0.19.5/table/mod.ts";

import chalkin from "https://deno.land/x/chalkin@v0.1.3/mod.ts";
import formatDistanceToNow from "https://deno.land/x/date_fns@v2.22.1/formatDistanceToNow/index.js";

import { Record } from "../services/store.ts";

const formatUrls = (record: Record) => {
  return [record.url, record.storeUrl].map((url) => chalkin.dim(url)).join(
    "\n",
  );
};

const formatPrice = (record: Record) => {
  if (!record?.price) {
    return "⁇";
  }
  const priceStr = record.price.toLocaleString("en-CA", {
    style: "currency",
    currency: "CDN",
  });

  if (record.onSale) {
    return `${chalkin.bold.green(priceStr)}`;
  }
  return priceStr;
};

const formatUpdated = (updated?: number) =>
  updated
    ? chalkin.italic(
      formatDistanceToNow(new Date(updated), { addSuffix: true }),
    )
    : "";

export function printRecords(records: Record[]) {
  const body = records.map(
    (
      b,
    ) => ([
      formatPrice(b),
      chalkin.dim(b.isbn),
      b.title,
      formatUpdated(b.updated),
      formatUrls(b),
    ] as IRow<ICell>),
  );
  console.log();
  new Table().body(body).render();
}
