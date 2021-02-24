import { Stowrage } from "../../mod.ts";
import { assertEquals } from "../devdeps.ts";

const data = new Stowrage<string>({
  name: "deleteStowrage",
});

data.add("something", "string");

Deno.test({
  name: "deleteStowrage",
  fn: () => {
    assertEquals(1, data.totalEntries());
    data.deleteStowrage();
    assertEquals(0, data.totalEntries());
  },
  sanitizeOps: true,
  sanitizeResources: true,
});
