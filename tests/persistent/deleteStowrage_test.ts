import { Stowrage } from "../../mod.ts";
import { assertEquals, assertNotEquals } from "../devdeps.ts";

const data = new Stowrage<string>({
  name: "deleteStowrage",
  isPersistent: true,
});

await data.init();

data.add("something", "string");

Deno.test({
  name: "deleteStowrage Save",
  fn: () => {
    assertEquals(1, data.totalEntries());
    data.deleteStowrage();
    assertEquals(0, data.totalEntries());
  },
  sanitizeOps: true,
  sanitizeResources: true,
});
