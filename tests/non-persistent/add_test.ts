import { Stowrage } from "../../mod.ts";
import { assertEquals } from "../devdeps.ts";

const data = new Stowrage<string>({
  name: "add",
});

Deno.test({
  name: "add",
  fn: () => {
    const before = data.totalEntries();
    data.add("something", "string");
    assertEquals(before + 1, data.totalEntries());
  },
  sanitizeOps: true,
  sanitizeResources: true,
});
