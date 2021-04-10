import { Stowrage } from "../../mod.ts";
import { assertEquals } from "../devdeps.ts";

Deno.test({
  name: "deleteStowrage Save",
  fn: async () => {
    const data = new Stowrage<string>({
      name: "deleteStowrage",
      persistent: true,
    });

    await data.init();

    data.add("something", "string");

    assertEquals(1, data.totalEntries());
    data.deleteStowrage();
    assertEquals(0, data.totalEntries());
    data.close();
  },
  sanitizeOps: true,
  sanitizeResources: true,
});
