import { Stowrage } from "../../mod.ts";
import { assertNotEquals } from "../devdeps.ts";

const data = new Stowrage<string>({
  name: "stowrage size",
});

Deno.test({
  name: "stowrage size",
  fn: () => {
    const before = data.totalEntries();
    data.add("something", "string");
    assertNotEquals(before, data.totalEntries());
  },
  sanitizeOps: true,
  sanitizeResources: true,
});
