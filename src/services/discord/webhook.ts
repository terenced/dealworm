import MessageBuilder, { WebhookPayload } from "./message-builder.ts";
export type WebhookOptions = {
  url: string;
  throwErrors?: boolean;
  retryOnLimit?: boolean;
};

export const createHook = () => {
  const hookUrl = Deno.env.get("DISCORD_WEBHOOK");
  if (!hookUrl) throw Error("No discord URL set");
  return new Webhook(hookUrl);
};

export default class Webhook {
  private url: string;
  private throwErrors?: boolean;
  private retryOnLimit?: boolean;
  private payload: any = {};

  constructor(options: string | WebhookOptions) {
    this.payload = {};

    if (typeof options == "string") {
      this.url = options;
      this.throwErrors = true;
      this.retryOnLimit = true;
    } else {
      this.url = options.url;
      this.throwErrors = options.throwErrors == undefined
        ? true
        : options.throwErrors;
      this.retryOnLimit = options.retryOnLimit == undefined
        ? true
        : options.retryOnLimit;
    }
  }

  setUsername(username: string) {
    this.payload.username = username;

    return this;
  }

  setAvatar(avatarURL: string) {
    this.payload.avatar_url = avatarURL;

    return this;
  }

  private async post(payload: WebhookPayload) {
    return await fetch(this.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  }

  async send(content: MessageBuilder | string) {
    let payload: WebhookPayload;

    if (typeof content === "string") {
      payload = new MessageBuilder().setText(content).getJSON();
    } else {
      payload = content.getJSON();
    }

    try {
      const res = await this.post(payload);

      if (res.status === 429 && this.retryOnLimit) {
        const body = await res.json();
        const waitUntil = body["retry_after"];

        setTimeout(() => this.post(payload), waitUntil);
      } else if (res.status != 204) {
        throw new Error(
          `Error sending webhook: ${res.status} status code. Response: ${await res
            .text()}`,
        );
      }
    } catch (err) {
      if (this.throwErrors) throw new Error(err.message);
    }
  }
}
