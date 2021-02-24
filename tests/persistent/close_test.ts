import { Stowrage } from "../../mod.ts";

Deno.test({
  name: "close",
  fn: async() => {
    const data = new Stowrage<string>({
      name: "close",
      persistent: true
    });
    await data.init();
    data.close();
  },
  sanitizeOps: true,
  sanitizeResources: true,
});
