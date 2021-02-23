import { Stowrage } from "../../mod.ts";
import { assertEquals, assertNotEquals } from "../devdeps.ts";

const data = new Stowrage<string>({
  name: "totalEntries",
  isPersistent: true,
});

await data.init();

Deno.test({
  name: "totalEntries Save",
  fn: () => {
    const empty = data.totalEntries();
    assertEquals(0, empty);
    data.add("ree", "digi");
    const singleEntry = data.totalEntries();
    assertNotEquals(empty, singleEntry);
  },
  sanitizeOps: true,
  sanitizeResources: true,
});
