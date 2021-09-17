import { Command } from "cliffy/mod.ts";

import { getStore } from "src/services/store.ts";
export const destoryCommand = new Command().action(() => getStore().destory());
