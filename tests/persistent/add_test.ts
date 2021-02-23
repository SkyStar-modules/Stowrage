import { Stowrage } from "../../mod.ts";
import { assertEquals } from "../devdeps.ts";

Deno.test({
  name: "add Save",
  fn: async() => {
    const data = new Stowrage<string>({
      name: "add",
      isPersistent: true,
    });
    
    await data.init();
    const before = data.totalEntries();
    data.add("something", "string");
    assertEquals(before + 1, data.totalEntries());
    data.close();
  },
  sanitizeOps: true,
  sanitizeResources: true,
});
