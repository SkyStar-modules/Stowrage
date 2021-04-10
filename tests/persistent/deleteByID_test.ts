import { Stowrage } from "../../mod.ts";
import { assertEquals } from "../devdeps.ts";

Deno.test({
  name: "deleteByID Save",
  fn: async () => {
    const data = new Stowrage<string>({
      name: "deleteByID",
      persistent: true,
    });

    await data.init();

    data.add("something", "string");

    const before = data.totalEntries();
    data.deleteByID(0);
    assertEquals(before - 1, data.totalEntries());
    data.close();
  },
  sanitizeOps: true,
  sanitizeResources: true,
});
