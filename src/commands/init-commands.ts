import { Command } from "../deps/cliffy.ts";
import { destoryCommand } from "./destory.ts";
import { listCommand } from "./list.ts";
import { priceCommand } from "./price.ts";
import { syncCommand } from "./sync.ts";
import { redditCommand } from "./reddit.ts";

export function initCommands(): Command {
  const program = new Command()
    .name("dealworm")
    .option("--debug [type:boolean]", "Display debug logs", {
      default: false,
      global: true,
    })
    .option(
      "--verbose [type:boolean]",
      "Display underlying individual cloud CLI commands",
      {
        default: false,
        global: true,
      },
    );
  program.command("destory", destoryCommand);
  program.command("list", listCommand);
  program.command("price", priceCommand);
  program.command("sync", syncCommand);
  program.command("reddit", redditCommand);
  return program;
}
