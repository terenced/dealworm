import {
  Color,
  ConsoleTransport,
  FileTransport,
  Format,
  Houston,
  ITransport,
  LogLevel,
  LogLevelDisplay,
  TimePrefix,
} from "houston";

import { join } from "path/mod.ts";

const config = {
  format: Format.text,
  prefix: new TimePrefix(),
  logLevelDisplay: LogLevelDisplay.Text,
  logColors: {
    [LogLevel.Info]: Color.White,
    [LogLevel.Success]: Color.Green,
    [LogLevel.Warning]: Color.Yellow,
    [LogLevel.Error]: Color.Red,
  },
};

export function getLogger(verbose: boolean = false) {
  const path = join(Deno.cwd(), ".data", "logs");
  const transports: ITransport[] = [new FileTransport(path)];
  if (verbose) {
    transports.push(new ConsoleTransport());
  }
  return new Houston(transports, config);
}
