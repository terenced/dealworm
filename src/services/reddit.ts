const REGEX = /(.*)(\sby\s)(.*)(\sis)(.*sale.*)/;

export interface Deal {
  title?: string;
  author?: string;
  text: string;
}

export const parseDeal = (
  { title, created }: { title: string; created: number },
) => {
  const regex = new RegExp(REGEX);
  const matches = regex.exec(title);
  if (matches) {
    return {
      title: matches[1],
      author: matches[3],
      text: title,
      updated: new Date(created * 1000),
    };
  }
  return { text: title };
};

export async function getDeals() {
  const feed = await fetch(
    "https://www.reddit.com/r/fantasy/new.json?sort=top&t=all&limit=5000",
  );
  const parsedJson = await feed.json();

  return parsedJson.data.children
    .filter((d: any) => d?.data?.title?.match(/sale/))
    .map((i: any) => parseDeal(i.data));
}
