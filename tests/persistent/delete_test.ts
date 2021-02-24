import { Stowrage } from "../../mod.ts";
import { assertEquals } from "../devdeps.ts";

Deno.test({
  name: "delete Save",
  fn: async() => {
    const data = new Stowrage<string>({
      name: "delete",
      persistent: true,
    });
    
    await data.init();
    
    data.add("something", "string");
    
    const before = data.totalEntries();
    data.delete("something");
    assertEquals(before - 1, data.totalEntries());
    data.close();
  },
  sanitizeOps: true,
  sanitizeResources: true,
});
