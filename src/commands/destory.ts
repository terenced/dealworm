import { Command } from "../deps/cliffy.ts";

import { getStore } from "../services/store.ts";
export const destoryCommand = new Command().action(() => getStore().destory());
