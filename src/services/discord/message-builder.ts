// Based off of https://github.com/LilSpoodermann/discord-ts-webhook/

const formatColor = (color: string | number) => {
  if (typeof color === "string" && color.startsWith("#")) {
    const rawHex = color.split("#")[1];

    return parseInt(rawHex, 16);
  } else {
    return Number(color);
  }
};

export type WebhookField = {
  name: string;
  value: string;
  inline?: boolean;
};

export type WebhookEmbed = {
  author?: {
    name?: string;
    url?: string;
    icon_url?: string;
  };
  title?: string;
  url?: string;
  thumbnail?: {
    url?: string;
  };
  image?: {
    url?: string;
  };
  timestamp?: Date;
  color?: number;
  description?: string;
  fields: WebhookField[];
  footer?: {
    text: string;
    icon_url?: string;
  };
};

export type WebhookPayload = {
  content: string;
  embeds: WebhookEmbed[];
};

export default class MessageBuilder {
  private payload: WebhookPayload;
  constructor() {
    this.payload = {
      embeds: [{ fields: [] }],
      content: "",
    };
  }

  getJSON() {
    return this.payload;
  }

  setText(text: string) {
    this.payload.content = text;

    return this;
  }

  setAuthor(author: string, authorImage?: string, authorUrl?: string) {
    this.payload.embeds[0].author = {
      name: author,
      url: authorUrl ?? "",
      icon_url: authorImage,
    };

    return this;
  }

  setTitle(title: string) {
    this.payload.embeds[0].title = title;

    return this;
  }

  setURL(url: string) {
    this.payload.embeds[0].url = url;

    return this;
  }

  setThumbnail(thumbnail: string) {
    this.payload.embeds[0].thumbnail = {};
    this.payload.embeds[0].thumbnail.url = thumbnail;

    return this;
  }

  setImage(image: string) {
    this.payload.embeds[0].image = {};
    this.payload.embeds[0].image.url = image;

    return this;
  }

  setTimestamp(date?: Date) {
    if (date) {
      this.payload.embeds[0].timestamp = date;
    } else {
      this.payload.embeds[0].timestamp = new Date();
    }

    return this;
  }

  setColor(color: string | number) {
    this.payload.embeds[0].color = formatColor(color);

    return this;
  }

  setDescription(description: string) {
    this.payload.embeds[0].description = description;

    return this;
  }

  addField(fieldName: string, fieldValue: string, inline = false) {
    this.payload.embeds[0].fields.push({
      name: fieldName,
      value: fieldValue,
      inline: inline,
    });

    return this;
  }

  setFooter(footer: string, footerImage = "") {
    this.payload.embeds[0].footer = {
      icon_url: footerImage,
      text: footer,
    };

    return this;
  }
}
