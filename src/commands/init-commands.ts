import { Command } from "../deps/cliffy.ts";
import { destoryCommand } from "./destory.ts";
import { listCommand } from "./list.ts";
import { priceCommand } from "./price.ts";
import { syncCommand } from "./sync.ts";

export function initCommands(): Command {
  const program = new Command()
    .name("dealworm")
    .option("--debug [boolean:boolean]", "Display debug logs", {
      default: false,
      global: true,
    })
    .option(
      "--verbose [boolean:boolean]",
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
  return program;
}
