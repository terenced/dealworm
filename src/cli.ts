import { Command } from "./deps/cliffy.ts";
import { chalkin } from "./deps/chalkin.ts";
import { initCommands } from "./commands/init-commands.ts";

import "https://deno.land/x/dotenv@v3.0.0/load.ts";

let program: Command;

try {
  program = initCommands();
} catch (e) {
  console.error(e);
  Deno.exit(1);
}

try {
  const hasArgs = Deno.args.length > 0;
  if (!hasArgs) {
    program.showHelp();
    Deno.exit(0);
  }
  await program.parse(Deno.args);
} catch (e) {
  if (e instanceof Error) {
    console.error(chalkin.red(e.stack || ""));
  }

  program.showHelp();
  Deno.exit(1);
}
