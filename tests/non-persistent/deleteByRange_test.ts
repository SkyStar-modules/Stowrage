import { Stowrage } from "../../mod.ts";
import { assertEquals, assertNotEquals } from "../devdeps.ts";

const data = new Stowrage<string>({
  name: "deleteByRange",
});

data.add("something", "string");
data.add("something2", "string2");

Deno.test({
  name: "deleteByRange",
  fn: () => {
    const before = data.fetchByRange(0, 1);
    assertEquals(2, data.totalEntries());
    data.deleteByRange(0, 1);
    assertNotEquals(before, data.fetchByRange(0, 1));
  },
  sanitizeOps: true,
  sanitizeResources: true,
});
