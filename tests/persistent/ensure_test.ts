import { Stowrage } from "../../mod.ts";
import { assertEquals } from "../devdeps.ts";

Deno.test({
  name: "ensure Save",
  fn: async() => {
    const data = new Stowrage<string>({
      name: "ensure",
      persistent: true,
    });
    
    await data.init();
    
    const before = data.totalEntries();
    const ensure = data.ensure("something", "string");
    assertEquals(before + 1, data.totalEntries());
    assertEquals(ensure, data.fetchByID(0));
    data.close();
  },
  sanitizeOps: true,
  sanitizeResources: true,
});
