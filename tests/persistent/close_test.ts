import { Stowrage } from "../../mod.ts";
import { assertEquals } from "../devdeps.ts";

Deno.test({
  name: "close",
  fn: async() => {
    const data = new Stowrage<string>({
      name: "close",
      isPersistent: true
    });
    await data.init();
    data.close();
  },
  sanitizeOps: true,
  sanitizeResources: true,
});
