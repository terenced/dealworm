import { Command } from "cliffy/mod.ts";
import { destoryCommand } from "./destory.ts";
import { listCommand } from "./list.ts";
import { priceCommand } from "./price.ts";
import { syncCommand } from "./sync.ts";
import { redditCommand } from "./reddit.ts";
import { messageCommand } from "./message.ts";

export function initCommands(): Command {
  const program = new Command()
    .name("dealworm")
    .option("--debug [type:boolean]", "Display debug logs", {
      default: false,
      global: true,
    })
    .option(
      "--verbose [type:boolean]",
      "Verbose logging to console",
      {
        default: false,
        global: true,
      },
    )
    .option(
      "--silent [type:boolean]",
      "Silence all output execpt direct print output (list cmd)",
      {
        default: true,
        global: true,
      },
    );
  program.command("destory", destoryCommand);
  program.command("list", listCommand);
  program.command("message", messageCommand);
  program.command("price", priceCommand);
  program.command("reddit", redditCommand);
  program.command("sync", syncCommand);
  return program;
}
