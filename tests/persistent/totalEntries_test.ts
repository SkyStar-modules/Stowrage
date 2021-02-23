import { Stowrage } from "../../mod.ts";
import { assertEquals, assertNotEquals } from "../devdeps.ts";

Deno.test({
  name: "totalEntries Save",
  fn: async() => {
    const data = new Stowrage<string>({
      name: "totalEntries",
      isPersistent: true,
    });
    
    await data.init();

    const empty = data.totalEntries();
    assertEquals(0, empty);
    data.add("ree", "digi");
    const singleEntry = data.totalEntries();
    assertNotEquals(empty, singleEntry);
    data.close();
  },
  sanitizeOps: true,
  sanitizeResources: true,
});
