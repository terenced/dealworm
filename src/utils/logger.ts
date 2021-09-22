import {
  getLogger as getDenoLogger,
  handlers,
  LogConfig,
  LogLevels,
  LogRecord,
  setup as setupLogger,
} from "log/mod.ts";
import { blue, bold, dim, red, yellow } from "fmt/colors.ts";
import { datetime } from "ptera";
import { join } from "path/mod.ts";

const formatter = (logRecord: LogRecord) => {
  const data = logRecord.args.map((arg) => Deno.inspect(arg)).join(" ");
  return `${logRecord.levelName} ${logRecord.msg} ${data}`;
};

export class DWConsoleHandler extends handlers.BaseHandler {
  format(logRecord: LogRecord): string {
    let prefix = logRecord.levelName;
    switch (logRecord.level) {
      case LogLevels.INFO:
        prefix = blue(prefix);
        break;
      case LogLevels.WARNING:
        prefix = yellow(prefix);
        break;
      case LogLevels.ERROR:
        prefix = red(prefix);
        break;
      case LogLevels.CRITICAL:
        prefix = bold(red(prefix));
        break;
      default:
        break;
    }
    const timestamp = datetime(logRecord.datetime).toISO();
    const args = logRecord.args.map((arg) => Deno.inspect(arg)).join(" ");
    return `[${timestamp}] ${prefix}: ${logRecord.msg} ${dim(args)}`;
  }

  log(msg: string): void {
    console.log(msg);
  }
}

export async function getLogger(verbose: boolean = false) {
  const filename = join(Deno.cwd(), ".data", "dealworm.log");
  const config: LogConfig = {
    handlers: {
      file: new handlers.FileHandler("INFO", { filename, formatter }),
    },

    loggers: {
      default: {
        level: "DEBUG",
        handlers: ["console", "file"],
      },

      tasks: {
        level: "ERROR",
        handlers: ["console"],
      },
    },
  };
  if (verbose && config.handlers) {
    config.handlers.console = new DWConsoleHandler("INFO");
  }
  await setupLogger(config);
  return getDenoLogger();
}
