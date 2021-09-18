import Webhook from "src/services/discord/webhook.ts";
import MessageBuilder from "src/services/discord/message-builder.ts";

import "https://deno.land/x/dotenv@v3.0.0/load.ts";
export const createHook = () => {
  const hookUrl = Deno.env.get("DISCORD_WEBHOOK");
  if (!hookUrl) throw Error("No discord URL set");
  return new Webhook(hookUrl);
};

try {
  const hook = createHook();
  const embed = new MessageBuilder()
    .setTitle("Hello text")
    .setAuthor(
      "Book Deals Bot",
      "https://cdn.discordapp.com/embed/avatars/0.png",
    )
    // @ts-ignore
    .setURL("https://www.google.com")
    .addField("First field", "this is inline", true)
    .addField("Second field", "this is not inline")
    // .setColor("#00b0f4")
    .setThumbnail("https://cdn.discordapp.com/embed/avatars/0.png")
    .setDescription(`Hello ${Date.now()}`)
    .setImage("https://cdn.discordapp.com/embed/avatars/0.png")
    .setFooter(
      "Hey its a footer",
      "https://cdn.discordapp.com/embed/avatars/0.png",
    )
    .setTimestamp();

  await hook.send(embed);
} catch (error) {
  console.error(error);
}
