import { Stowrage } from "../../mod.ts";
import { assertEquals } from "../devdeps.ts";

Deno.test({
  name: "deleteByID",
  fn: () => {
    const data = new Stowrage<string>({
      name: "deleteByID",
    });

    data.add("something", "string");

    const before = data.totalEntries();
    data.deleteByID(0);
    assertEquals(before - 1, data.totalEntries());
  },
  sanitizeOps: true,
  sanitizeResources: true,
});
