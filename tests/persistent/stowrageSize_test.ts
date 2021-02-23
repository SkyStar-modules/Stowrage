import { Stowrage } from "../../mod.ts";
import { assertNotEquals } from "../devdeps.ts";

Deno.test({
  name: "stowrage size Save",
  fn: async() => {
    const data = new Stowrage<string>({
      name: "stowrage size",
      isPersistent: true,
    });
    
    await data.init();
    
    const before = data.totalEntries();
    data.add("something", "string");
    assertNotEquals(before, data.totalEntries());
    data.close();
  },
  sanitizeOps: true,
  sanitizeResources: true,
});
