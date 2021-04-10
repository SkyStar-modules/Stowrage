import { Stowrage } from "../../mod.ts";
import { assertEquals, assertNotEquals } from "../devdeps.ts";

Deno.test({
  name: "deleteByRange Save",
  fn: async () => {
    const data = new Stowrage<string>({
      name: "deleteByRange",
      persistent: true,
    });

    await data.init();

    data.add("something", "string");
    data.add("something2", "strin2g");

    const before = data.fetchByRange(0, 1);
    assertEquals(2, data.totalEntries());
    data.deleteByRange(0, 1);
    assertNotEquals(before, data.fetchByRange(0, 1));
    data.close();
  },
  sanitizeOps: true,
  sanitizeResources: true,
});
