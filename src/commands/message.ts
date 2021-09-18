import { Command } from "cliffy/mod.ts";

import { createHook } from "src/services/discord/webhook.ts";
import MessageBuilder from "src/services/discord/message-builder.ts";

export const messageCommand = new Command()
  .arguments("<message>")
  .action(async (_, message) => {
    try {
      const hook = createHook();
      const embed = new MessageBuilder()
        .setTitle("Dealworm CLI Message")
        .setURL("https://github.com/terenced/dealworm")
        .setColor("#00b0f4")
        .setText(message)
        .setTimestamp();

      await hook.send(embed);
    } catch (error) {
      console.error(error);
    }
  });
